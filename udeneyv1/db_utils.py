"""
Utilidades de optimización de base de datos para Eduney
"""

import logging
import time
from functools import wraps

from django.conf import settings
from django.db import connection

logger = logging.getLogger(__name__)


def track_db_queries(func):
    """
    Decorador para rastrear consultas SQL ejecutadas por una función
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        initial_queries = len(connection.queries)
        start_time = time.time()

        result = func(*args, **kwargs)

        end_time = time.time()
        queries_executed = len(connection.queries) - initial_queries
        execution_time = end_time - start_time

        if settings.DEBUG:
            logger.info(
                f"DB_PERFORMANCE: {func.__name__} ejecutó {queries_executed} consultas "
                f"en {execution_time:.3f}s"
            )

            # Si hay muchas consultas, posible problema N+1
            if queries_executed > 10:
                logger.warning(
                    f"POSSIBLE_N+1: {func.__name__} ejecutó {queries_executed} consultas. "
                    f"Revisar por posible problema N+1"
                )

        return result

    return wrapper


class QueryOptimizer:
    """
    Clase para optimizar consultas comunes del sistema
    """

    @staticmethod
    def get_articulos_with_relations():
        """
        Obtiene artículos con todas las relaciones optimizadas
        """
        from .models import Articulos

        return (
            Articulos.objects.select_related("id_categoria", "id_usuario")
            .prefetch_related("calificaciones_set", "articulodetalletransaccion_set")
            .filter(disponible=True)
        )

    @staticmethod
    def get_transacciones_with_details():
        """
        Obtiene transacciones con todos los detalles optimizados
        """
        from .models import Transacciones

        return Transacciones.objects.select_related("usuario").prefetch_related(
            "detalletransaccion_set__articulodetalletransaccion_set__id_articulo",
            "detalletransaccion_set__articulodetalletransaccion_set__id_articulo__id_categoria",
        )

    @staticmethod
    def get_usuario_complete_profile(usuario_id):
        """
        Obtiene perfil completo de usuario con una sola consulta optimizada
        """
        from .models import Usuarios

        return (
            Usuarios.objects.select_related()
            .prefetch_related(
                "usuariorol_set__id_rol",
                "articulos_set__id_categoria",
                "transacciones_set__detalletransaccion_set",
            )
            .get(id_usuario=usuario_id)
        )

    @staticmethod
    def get_articulos_by_categoria_optimized(categoria_id):
        """
        Obtiene artículos por categoría con optimización completa
        """
        from .models import Articulos

        return (
            Articulos.objects.select_related("id_categoria", "id_usuario")
            .prefetch_related("calificaciones_set")
            .filter(id_categoria_id=categoria_id, disponible=True)
            .order_by("-fecha_creacion")
        )


def analyze_query_performance():
    """
    Analiza el rendimiento de las consultas más comunes
    """
    if not settings.DEBUG:
        logger.warning("Query analysis requiere DEBUG=True")
        return

    initial_query_count = len(connection.queries)

    # Simular operaciones comunes
    try:
        optimizer = QueryOptimizer()

        # Test 1: Artículos con relaciones
        start = time.time()
        articulos = list(optimizer.get_articulos_with_relations()[:10])
        time_articulos = time.time() - start
        queries_articulos = len(connection.queries) - initial_query_count

        logger.info(
            f"Artículos optimizados: {len(articulos)} items, "
            f"{queries_articulos} consultas, {time_articulos:.3f}s"
        )

        # Test 2: Transacciones con detalles
        initial_query_count = len(connection.queries)
        start = time.time()
        transacciones = list(optimizer.get_transacciones_with_details()[:5])
        time_transacciones = time.time() - start
        queries_transacciones = len(connection.queries) - initial_query_count

        logger.info(
            f"Transacciones optimizadas: {len(transacciones)} items, "
            f"{queries_transacciones} consultas, {time_transacciones:.3f}s"
        )

        return {
            "articulos": {
                "count": len(articulos),
                "queries": queries_articulos,
                "time": time_articulos,
            },
            "transacciones": {
                "count": len(transacciones),
                "queries": queries_transacciones,
                "time": time_transacciones,
            },
        }

    except Exception as e:
        logger.error(f"Error analizando performance: {e}")
        return None


def get_slow_queries(min_time=0.1):
    """
    Obtiene las consultas más lentas del log
    """
    if not settings.DEBUG:
        return []

    slow_queries = [
        query for query in connection.queries if float(query.get("time", 0)) > min_time
    ]

    return sorted(slow_queries, key=lambda x: float(x["time"]), reverse=True)


class DatabaseHealthCheck:
    """
    Clase para verificar la salud de la base de datos
    """

    @staticmethod
    def check_index_usage():
        """
        Verifica el uso de índices en consultas comunes
        """
        # En MySQL, podemos usar EXPLAIN para analizar consultas
        from django.db import connection

        common_queries = [
            "SELECT * FROM articulos WHERE disponible = true",
            "SELECT * FROM articulos WHERE id_categoria = 1",
            "SELECT * FROM transacciones WHERE usuario_id = 1",
            "SELECT * FROM usuario_rol WHERE id_usuario = 1",
        ]

        results = {}

        with connection.cursor() as cursor:
            for query in common_queries:
                try:
                    cursor.execute(f"EXPLAIN {query}")
                    explanation = cursor.fetchall()
                    results[query] = explanation
                except Exception as e:
                    results[query] = f"Error: {e}"

        return results

    @staticmethod
    def suggest_indexes():
        """
        Sugiere índices basado en patrones de consulta comunes
        """
        suggestions = [
            {
                "table": "articulos",
                "columns": ["disponible", "id_categoria"],
                "reason": "Filtros frecuentes en listado de artículos",
            },
            {
                "table": "articulos",
                "columns": ["id_usuario", "disponible"],
                "reason": "Consultas de artículos por vendedor",
            },
            {
                "table": "transacciones",
                "columns": ["usuario_id", "fecha_transaccion"],
                "reason": "Historial de transacciones por usuario",
            },
            {
                "table": "usuario_rol",
                "columns": ["id_usuario"],
                "reason": "Verificación de roles frecuente",
            },
            {
                "table": "calificaciones",
                "columns": ["id_articulo"],
                "reason": "Consultas de calificaciones por artículo",
            },
        ]

        return suggestions
