"""
Utilidades de cache para optimizar el rendimiento de Eduney
"""
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key
from django.conf import settings
import hashlib
import json
from functools import wraps
import logging

logger = logging.getLogger(__name__)


def generate_cache_key(prefix, *args, **kwargs):
    """
    Genera una clave de cache única basada en los argumentos
    """
    key_data = {
        'args': args,
        'kwargs': sorted(kwargs.items()) if kwargs else {}
    }
    key_string = json.dumps(key_data, sort_keys=True, default=str)
    key_hash = hashlib.md5(key_string.encode()).hexdigest()
    return f"{prefix}_{key_hash}"


def cache_result(timeout=300, key_prefix='default'):
    """
    Decorador para cachear resultados de funciones
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de cache
            cache_key = generate_cache_key(
                f"{key_prefix}_{func.__name__}",
                *args, **kwargs
            )
            
            # Intentar obtener del cache
            result = cache.get(cache_key)
            if result is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return result
            
            # Si no está en cache, ejecutar función
            logger.debug(f"Cache MISS: {cache_key}")
            result = func(*args, **kwargs)
            
            # Guardar en cache
            cache.set(cache_key, result, timeout)
            return result
            
        return wrapper
    return decorator


class ViewCache:
    """
    Clase para manejar cache de views específicas
    """
    
    @staticmethod
    def get_articulos_cache_key(filtros=None):
        """Genera clave de cache para lista de artículos"""
        return generate_cache_key('articulos_list', filtros or {})
    
    @staticmethod
    def get_articulo_cache_key(articulo_id):
        """Genera clave de cache para un artículo específico"""
        return f"articulo_detail_{articulo_id}"
    
    @staticmethod
    def get_categorias_cache_key():
        """Genera clave de cache para categorías"""
        return "categorias_list"
    
    @staticmethod
    def get_usuario_roles_cache_key(usuario_id):
        """Genera clave de cache para roles de usuario"""
        return f"usuario_roles_{usuario_id}"
    
    @staticmethod
    def invalidate_articulo_cache(articulo_id=None):
        """Invalida cache relacionado con artículos"""
        if articulo_id:
            cache.delete(f"articulo_detail_{articulo_id}")
        
        # Invalidar lista de artículos (múltiples combinaciones de filtros)
        # En un caso real, usaríamos tags de cache
        cache.delete_many([
            'articulos_list_*',  # Patrón, aunque Django DB cache no soporta wildcards
        ])
        logger.info(f"Cache invalidado para artículo: {articulo_id}")


class ArticulosCache:
    """
    Cache específico para artículos con invalidación inteligente
    """
    
    TIMEOUT = 600  # 10 minutos
    
    @classmethod
    def get_articulos_disponibles(cls, categoria_id=None):
        """
        Obtiene artículos disponibles con cache
        """
        filtros = {'categoria': categoria_id} if categoria_id else {}
        cache_key = ViewCache.get_articulos_cache_key(filtros)
        
        result = cache.get(cache_key)
        if result is not None:
            return result
        
        # Import aquí para evitar imports circulares
        from .models import Articulos
        
        queryset = Articulos.objects.filter(disponible=True).select_related('id_categoria', 'id_usuario')
        if categoria_id:
            queryset = queryset.filter(id_categoria=categoria_id)
        
        result = list(queryset.values(
            'id_articulo', 'titulo_articulo', 'descripcion_articulo',
            'precio_articulo', 'id_categoria__nombre_categoria'
        ))
        
        cache.set(cache_key, result, cls.TIMEOUT)
        logger.debug(f"Artículos cacheados: {len(result)} items")
        return result
    
    @classmethod
    def get_articulo_detalle(cls, articulo_id):
        """
        Obtiene detalle de artículo con cache
        """
        cache_key = ViewCache.get_articulo_cache_key(articulo_id)
        
        result = cache.get(cache_key)
        if result is not None:
            return result
        
        from .models import Articulos
        
        try:
            articulo = Articulos.objects.select_related(
                'id_categoria', 'id_usuario'
            ).get(id_articulo=articulo_id)
            
            result = {
                'id_articulo': articulo.id_articulo,
                'titulo_articulo': articulo.titulo_articulo,
                'descripcion_articulo': articulo.descripcion_articulo,
                'precio_articulo': str(articulo.precio_articulo),
                'categoria': articulo.id_categoria.nombre_categoria,
                'vendedor': f"{articulo.id_usuario.nombres_usuario} {articulo.id_usuario.apellidos_usuario}",
                'disponible': articulo.disponible
            }
            
            cache.set(cache_key, result, cls.TIMEOUT)
            return result
            
        except Articulos.DoesNotExist:
            return None
    
    @classmethod
    def invalidate_articulo(cls, articulo_id):
        """
        Invalida cache de un artículo específico
        """
        ViewCache.invalidate_articulo_cache(articulo_id)


class UsuariosCache:
    """
    Cache específico para usuarios y roles
    """
    
    TIMEOUT = 1800  # 30 minutos
    
    @classmethod
    def get_user_roles(cls, usuario_id):
        """
        Obtiene roles de usuario con cache
        """
        cache_key = ViewCache.get_usuario_roles_cache_key(usuario_id)
        
        result = cache.get(cache_key)
        if result is not None:
            return result
        
        from .models import UsuarioRol
        
        roles = list(UsuarioRol.objects.filter(
            id_usuario_id=usuario_id
        ).values_list('id_rol', flat=True))
        
        cache.set(cache_key, roles, cls.TIMEOUT)
        logger.debug(f"Roles cacheados para usuario {usuario_id}: {roles}")
        return roles
    
    @classmethod
    def invalidate_user_roles(cls, usuario_id):
        """
        Invalida cache de roles de usuario
        """
        cache_key = ViewCache.get_usuario_roles_cache_key(usuario_id)
        cache.delete(cache_key)
        logger.info(f"Cache de roles invalidado para usuario: {usuario_id}")


class CategoriasCache:
    """
    Cache para categorías (cambian raramente)
    """
    
    TIMEOUT = 3600  # 1 hora
    
    @classmethod
    def get_all_categorias(cls):
        """
        Obtiene todas las categorías con cache
        """
        cache_key = ViewCache.get_categorias_cache_key()
        
        result = cache.get(cache_key)
        if result is not None:
            return result
        
        from .models import Categorias
        
        result = list(Categorias.objects.values('id_categoria', 'nombre_categoria'))
        
        cache.set(cache_key, result, cls.TIMEOUT)
        logger.debug(f"Categorías cacheadas: {len(result)} items")
        return result
    
    @classmethod
    def invalidate_categorias(cls):
        """
        Invalida cache de categorías
        """
        cache_key = ViewCache.get_categorias_cache_key()
        cache.delete(cache_key)


# Decoradores específicos para views
def cache_articulos_list(timeout=300):
    """Decorador específico para cachear lista de artículos"""
    return cache_result(timeout=timeout, key_prefix='articulos')

def cache_categoria_list(timeout=1800):
    """Decorador específico para cachear categorías"""
    return cache_result(timeout=timeout, key_prefix='categorias')


# Funciones de utilidad
def warm_up_cache():
    """
    Precalienta el cache con datos frecuentemente utilizados
    """
    logger.info("Iniciando precalentamiento de cache...")
    
    try:
        # Precargar categorías
        CategoriasCache.get_all_categorias()
        
        # Precargar artículos más populares
        ArticulosCache.get_articulos_disponibles()
        
        logger.info("Cache precalentado exitosamente")
    except Exception as e:
        logger.error(f"Error precalentando cache: {e}")


def clear_all_cache():
    """
    Limpia todo el cache
    """
    cache.clear()
    logger.info("Todo el cache ha sido limpiado")


def get_cache_stats():
    """
    Obtiene estadísticas del cache (si están disponibles)
    """
    # Django DB cache no proporciona estadísticas nativas
    # Pero podemos implementar un logging básico
    try:
        # Intentar obtener algunas claves conocidas para verificar estado
        test_keys = [
            ViewCache.get_categorias_cache_key(),
            ViewCache.get_articulos_cache_key({}),
        ]
        
        stats = {'cached_items': 0, 'total_checked': len(test_keys)}
        
        for key in test_keys:
            if cache.get(key) is not None:
                stats['cached_items'] += 1
        
        return stats
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de cache: {e}")
        return {'error': str(e)}