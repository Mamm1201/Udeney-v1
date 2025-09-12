"""
Views para exposición de métricas de rendimiento
"""
from django.http import JsonResponse, HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import json

from .permissions import AdminPermissions
from .metrics import metrics, SystemMetrics, export_metrics_to_prometheus
from .db_utils import analyze_query_performance, get_slow_queries


class MetricsAPIView(APIView):
    """
    API para obtener métricas de la aplicación
    """
    permission_classes = [AdminPermissions]  # Solo administradores
    
    def get(self, request):
        """
        Obtener métricas con filtros opcionales
        """
        # Parámetros de consulta
        metric_name = request.query_params.get('metric')
        hours = int(request.query_params.get('hours', 1))
        format_type = request.query_params.get('format', 'json')
        
        try:
            if format_type == 'summary':
                data = metrics.get_summary(hours=hours)
            elif format_type == 'prometheus':
                prometheus_data = export_metrics_to_prometheus()
                return HttpResponse(prometheus_data, content_type='text/plain')
            else:
                since = datetime.now() - timedelta(hours=hours)
                data = metrics.get_metrics(metric_name=metric_name, since=since)
                
                # Convertir datetime para JSON
                for metric, entries in data.items():
                    for entry in entries:
                        if 'timestamp' in entry:
                            entry['timestamp'] = entry['timestamp'].isoformat()
            
            return Response({
                'metrics': data,
                'timestamp': datetime.now().isoformat(),
                'parameters': {
                    'metric_name': metric_name,
                    'hours': hours,
                    'format': format_type
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error retrieving metrics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthCheckAPIView(APIView):
    """
    Endpoint para health check del sistema
    """
    permission_classes = []  # Público para monitoreo externo
    
    def get(self, request):
        """
        Realizar health check completo del sistema
        """
        health_data = SystemMetrics.get_system_health()
        
        # Determinar código de estado HTTP basado en salud
        if health_data['status'] == 'healthy':
            response_status = status.HTTP_200_OK
        elif health_data['status'] == 'warning':
            response_status = status.HTTP_200_OK  # Warning pero aún operativo
        else:  # critical or error
            response_status = status.HTTP_503_SERVICE_UNAVAILABLE
        
        return Response(health_data, status=response_status)


class PerformanceAPIView(APIView):
    """
    API para métricas de rendimiento específicas
    """
    permission_classes = [AdminPermissions]
    
    def get(self, request):
        """
        Obtener análisis de rendimiento
        """
        analysis_type = request.query_params.get('type', 'all')
        
        response_data = {
            'timestamp': datetime.now().isoformat(),
            'analysis_type': analysis_type
        }
        
        try:
            if analysis_type in ['all', 'database']:
                # Análisis de rendimiento de base de datos
                db_performance = analyze_query_performance()
                response_data['database_performance'] = db_performance
                
                # Consultas lentas
                slow_queries = get_slow_queries(min_time=0.1)
                response_data['slow_queries'] = slow_queries[:10]  # Top 10
            
            if analysis_type in ['all', 'cache']:
                # Métricas de cache
                cache_metrics = metrics.get_summary(hours=1)
                cache_data = {
                    name: data for name, data in cache_metrics.items()
                    if 'cache' in name.lower()
                }
                response_data['cache_metrics'] = cache_data
            
            if analysis_type in ['all', 'requests']:
                # Métricas de requests HTTP
                request_metrics = metrics.get_summary(hours=1)
                request_data = {
                    name: data for name, data in request_metrics.items()
                    if 'http' in name.lower()
                }
                response_data['request_metrics'] = request_data
            
            if analysis_type in ['all', 'system']:
                # Métricas del sistema
                system_metrics = metrics.get_summary(hours=1)
                system_data = {
                    name: data for name, data in system_metrics.items()
                    if 'system' in name.lower()
                }
                response_data['system_metrics'] = system_data
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error analyzing performance: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MetricsDashboardAPIView(APIView):
    """
    API para dashboard de métricas
    """
    permission_classes = [AdminPermissions]
    
    def get(self, request):
        """
        Obtener datos para dashboard de métricas
        """
        hours = int(request.query_params.get('hours', 24))
        
        try:
            summary = metrics.get_summary(hours=hours)
            health = SystemMetrics.get_system_health()
            
            # Calcular KPIs principales
            kpis = self._calculate_kpis(summary)
            
            # Top errores
            error_metrics = {
                name: data for name, data in summary.items()
                if 'error' in name.lower() or 'failure' in name.lower()
            }
            
            # Rendimiento de endpoints más utilizados
            request_metrics = {
                name: data for name, data in summary.items()
                if 'http_requests_total' in name
            }
            
            dashboard_data = {
                'timestamp': datetime.now().isoformat(),
                'period_hours': hours,
                'system_health': health,
                'kpis': kpis,
                'error_summary': error_metrics,
                'request_summary': request_metrics,
                'total_metrics': len(summary)
            }
            
            return Response(dashboard_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error generating dashboard: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_kpis(self, summary):
        """
        Calcular KPIs principales del sistema
        """
        kpis = {}
        
        # Request rate
        total_requests = 0
        total_errors = 0
        
        for name, data in summary.items():
            if 'http_requests_total' in name:
                total_requests += data.get('total_increments', 0)
            elif 'http_errors_total' in name:
                total_errors += data.get('total_increments', 0)
        
        kpis['total_requests'] = total_requests
        kpis['total_errors'] = total_errors
        kpis['error_rate'] = (total_errors / total_requests * 100) if total_requests > 0 else 0
        
        # Cache hit rate
        cache_hits = 0
        cache_total = 0
        
        for name, data in summary.items():
            if 'cache_hits_total' in name:
                cache_hits += data.get('total_increments', 0)
            elif 'cache_gets_total' in name:
                cache_total += data.get('total_increments', 0)
        
        kpis['cache_hit_rate'] = (cache_hits / cache_total * 100) if cache_total > 0 else 0
        
        # Average response time
        response_times = []
        for name, data in summary.items():
            if 'http_request_duration' in name and data.get('type') == 'timing':
                response_times.append(data.get('avg', 0))
        
        kpis['avg_response_time'] = sum(response_times) / len(response_times) if response_times else 0
        
        return kpis


class MetricsResetAPIView(APIView):
    """
    API para resetear métricas (solo para testing/desarrollo)
    """
    permission_classes = [AdminPermissions]
    
    def post(self, request):
        """
        Resetear todas las métricas
        """
        if not request.user.is_superuser:  # Protección adicional
            return Response({
                'error': 'Only superusers can reset metrics'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Limpiar métricas
            metrics._metrics.clear()
            metrics._counters.clear()
            metrics._timers.clear()
            
            return Response({
                'message': 'All metrics have been reset',
                'timestamp': datetime.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error resetting metrics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)