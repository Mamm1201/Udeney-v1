"""
Sistema de métricas de rendimiento para Eduney
"""
import json
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from django.conf import settings
from django.core.cache import cache
from django.db import connection

# Optional import of psutil
try:
    import psutil

    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False


class MetricsCollector:
    """
    Colector principal de métricas del sistema
    """

    def __init__(self):
        self._metrics = defaultdict(deque)
        self._counters = defaultdict(int)
        self._timers = {}
        self._lock = threading.Lock()
        self.max_history = 1000  # Mantener últimas 1000 entradas por métrica

    def increment(self, metric_name: str, value: int = 1, tags: Dict = None):
        """
        Incrementar contador de métrica
        """
        with self._lock:
            full_name = self._build_metric_name(metric_name, tags)
            self._counters[full_name] += value

            # Agregar al historial con timestamp
            self._metrics[full_name].append(
                {
                    "timestamp": datetime.now(),
                    "value": self._counters[full_name],
                    "increment": value,
                }
            )

            # Mantener solo el historial reciente
            while len(self._metrics[full_name]) > self.max_history:
                self._metrics[full_name].popleft()

    def timing(self, metric_name: str, duration: float, tags: Dict = None):
        """
        Registrar tiempo de ejecución
        """
        with self._lock:
            full_name = self._build_metric_name(metric_name, tags)

            self._metrics[full_name].append(
                {"timestamp": datetime.now(), "duration": duration, "type": "timing"}
            )

            while len(self._metrics[full_name]) > self.max_history:
                self._metrics[full_name].popleft()

    def gauge(self, metric_name: str, value: float, tags: Dict = None):
        """
        Registrar valor de gauge (valor actual)
        """
        with self._lock:
            full_name = self._build_metric_name(metric_name, tags)

            self._metrics[full_name].append(
                {"timestamp": datetime.now(), "value": value, "type": "gauge"}
            )

            while len(self._metrics[full_name]) > self.max_history:
                self._metrics[full_name].popleft()

    def _build_metric_name(self, name: str, tags: Dict = None):
        """
        Construir nombre completo de métrica con tags
        """
        if not tags:
            return name

        tag_str = "_".join(f"{k}:{v}" for k, v in sorted(tags.items()))
        return f"{name}_{tag_str}"

    def get_metrics(self, metric_name: str = None, since: datetime = None) -> Dict:
        """
        Obtener métricas filtradas
        """
        with self._lock:
            if metric_name:
                # Buscar métricas que coincidan con el nombre (puede incluir tags)
                matching_metrics = {
                    k: v for k, v in self._metrics.items() if k.startswith(metric_name)
                }
            else:
                matching_metrics = dict(self._metrics)

            # Filtrar por timestamp si se especifica
            if since:
                filtered_metrics = {}
                for name, data in matching_metrics.items():
                    filtered_data = deque(
                        [entry for entry in data if entry["timestamp"] >= since]
                    )
                    if filtered_data:
                        filtered_metrics[name] = filtered_data
                matching_metrics = filtered_metrics

            # Convertir deque a lista para serialización
            return {name: list(data) for name, data in matching_metrics.items()}

    def get_summary(self, hours: int = 1) -> Dict:
        """
        Obtener resumen de métricas de las últimas horas
        """
        since = datetime.now() - timedelta(hours=hours)
        metrics = self.get_metrics(since=since)

        summary = {}

        for metric_name, data in metrics.items():
            if not data:
                continue

            # Detectar tipo de métrica
            sample_entry = data[0]

            if "duration" in sample_entry:
                # Métrica de timing
                durations = [entry["duration"] for entry in data]
                summary[metric_name] = {
                    "type": "timing",
                    "count": len(durations),
                    "avg": sum(durations) / len(durations),
                    "min": min(durations),
                    "max": max(durations),
                    "total": sum(durations),
                }
            elif "increment" in sample_entry:
                # Métrica de contador
                total_increment = sum(entry.get("increment", 0) for entry in data)
                summary[metric_name] = {
                    "type": "counter",
                    "total_increments": total_increment,
                    "current_value": data[-1]["value"] if data else 0,
                    "events": len(data),
                }
            elif sample_entry.get("type") == "gauge":
                # Métrica de gauge
                values = [entry["value"] for entry in data]
                summary[metric_name] = {
                    "type": "gauge",
                    "current": values[-1] if values else 0,
                    "avg": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                }

        return summary


# Instancia global del colector
metrics = MetricsCollector()


class ApplicationMetrics:
    """
    Métricas específicas de la aplicación Eduney
    """

    @staticmethod
    def track_request(request, response, duration):
        """
        Rastrear métricas de requests HTTP
        """
        tags = {
            "method": request.method,
            "status": response.status_code,
            "path": request.path[:50],  # Limitar longitud
        }

        metrics.increment("http_requests_total", tags=tags)
        metrics.timing("http_request_duration", duration, tags=tags)

        # Métricas específicas para errores
        if response.status_code >= 400:
            error_tags = {"status": response.status_code, "path": request.path[:50]}
            metrics.increment("http_errors_total", tags=error_tags)

    @staticmethod
    def track_authentication(email: str, success: bool):
        """
        Rastrear intentos de autenticación
        """
        result = "success" if success else "failure"
        metrics.increment("auth_attempts_total", tags={"result": result})

        if not success:
            metrics.increment(
                "auth_failures_total", tags={"email_domain": email.split("@")[-1]}
            )

    @staticmethod
    def track_database_query(table: str, operation: str, duration: float):
        """
        Rastrear consultas a base de datos
        """
        tags = {"table": table, "operation": operation}
        metrics.timing("db_query_duration", duration, tags=tags)
        metrics.increment("db_queries_total", tags=tags)

    @staticmethod
    def track_cache_operation(operation: str, key: str, hit: bool):
        """
        Rastrear operaciones de cache
        """
        result = "hit" if hit else "miss"
        tags = {"operation": operation, "result": result}
        metrics.increment("cache_operations_total", tags=tags)

        # Métricas de hit rate
        if operation == "get":
            metrics.increment("cache_gets_total")
            if hit:
                metrics.increment("cache_hits_total")

    @staticmethod
    def track_business_event(event_type: str, user_id: Optional[int] = None):
        """
        Rastrear eventos de negocio
        """
        tags = {"event_type": event_type}
        if user_id:
            tags["has_user"] = "true"

        metrics.increment("business_events_total", tags=tags)


class SystemMetrics:
    """
    Métricas del sistema y servidor
    """

    @staticmethod
    def collect_system_metrics():
        """
        Recopilar métricas del sistema
        """
        if not PSUTIL_AVAILABLE:
            # Log basic metrics without psutil
            try:
                db_connections = len(connection.queries)
                metrics.gauge("db_connections", db_connections)
            except:
                pass
            return

        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            metrics.gauge("system_cpu_percent", cpu_percent)

            # Memoria
            memory = psutil.virtual_memory()
            metrics.gauge("system_memory_percent", memory.percent)
            metrics.gauge("system_memory_available_mb", memory.available / 1024 / 1024)

            # Disco
            disk = psutil.disk_usage("/")
            metrics.gauge("system_disk_percent", disk.percent)
            metrics.gauge("system_disk_free_gb", disk.free / 1024 / 1024 / 1024)

            # Base de datos
            try:
                db_connections = len(connection.queries)
                metrics.gauge("db_connections", db_connections)
            except:
                pass
        except Exception as e:
            # Si hay error con psutil, continuar sin métricas del sistema
            pass

    @staticmethod
    def get_system_health() -> Dict:
        """
        Obtener estado de salud del sistema
        """
        health_status = {
            "timestamp": datetime.now().isoformat(),
            "status": "healthy",
            "checks": {},
        }

        try:
            # Check CPU and Memory only if psutil is available
            if PSUTIL_AVAILABLE:
                cpu_percent = psutil.cpu_percent(interval=0.1)
                health_status["checks"]["cpu"] = {
                    "status": "ok" if cpu_percent < 80 else "warning",
                    "value": cpu_percent,
                    "unit": "percent",
                }

                # Check Memory
                memory = psutil.virtual_memory()
                health_status["checks"]["memory"] = {
                    "status": "ok" if memory.percent < 85 else "critical",
                    "value": memory.percent,
                    "unit": "percent",
                }
            else:
                health_status["checks"]["system"] = {
                    "status": "warning",
                    "message": "psutil not available - system metrics disabled",
                }

            # Check Database
            from django.db import connection

            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

            health_status["checks"]["database"] = {
                "status": "ok",
                "message": "Database connection successful",
            }

            # Check Cache
            cache.set("health_check", "ok", 30)
            cache_result = cache.get("health_check")

            health_status["checks"]["cache"] = {
                "status": "ok" if cache_result == "ok" else "error",
                "message": "Cache operations working"
                if cache_result == "ok"
                else "Cache error",
            }

        except Exception as e:
            health_status["status"] = "error"
            health_status["error"] = str(e)

        # Determinar estado general
        check_statuses = [check["status"] for check in health_status["checks"].values()]
        if "critical" in check_statuses or health_status["status"] == "error":
            health_status["status"] = "critical"
        elif "warning" in check_statuses:
            health_status["status"] = "warning"

        return health_status


class MetricsMiddleware:
    """
    Middleware para recopilar métricas automáticamente
    """

    def __init__(self, get_response):
        self.get_response = get_response

        # Inicializar thread para métricas del sistema
        self._start_system_metrics_collection()

    def __call__(self, request):
        start_time = time.time()

        response = self.get_response(request)

        duration = time.time() - start_time
        ApplicationMetrics.track_request(request, response, duration)

        return response

    def _start_system_metrics_collection(self):
        """
        Iniciar recopilación periódica de métricas del sistema
        """

        def collect_periodically():
            while True:
                try:
                    SystemMetrics.collect_system_metrics()
                    time.sleep(60)  # Cada minuto
                except Exception as e:
                    print(f"Error collecting system metrics: {e}")
                    time.sleep(60)

        thread = threading.Thread(target=collect_periodically, daemon=True)
        thread.start()


def export_metrics_to_prometheus() -> str:
    """
    Exportar métricas en formato Prometheus
    """
    prometheus_output = []
    summary = metrics.get_summary(hours=1)

    for metric_name, data in summary.items():
        if data["type"] == "counter":
            prometheus_output.append(f"# TYPE {metric_name} counter")
            prometheus_output.append(f"{metric_name} {data['current_value']}")

        elif data["type"] == "gauge":
            prometheus_output.append(f"# TYPE {metric_name} gauge")
            prometheus_output.append(f"{metric_name} {data['current']}")

        elif data["type"] == "timing":
            base_name = metric_name.replace("_duration", "")
            prometheus_output.append(f"# TYPE {base_name}_duration_seconds histogram")
            prometheus_output.append(
                f"{base_name}_duration_seconds_sum {data['total']}"
            )
            prometheus_output.append(
                f"{base_name}_duration_seconds_count {data['count']}"
            )

    return "\n".join(prometheus_output)
