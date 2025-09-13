"""
Tests para el sistema de cache de Eduney
"""

from unittest.mock import Mock, patch

from django.core.cache import cache
from django.test import TestCase

from udeneyv1.cache_utils import (ArticulosCache, CategoriasCache, UsuariosCache,
                                  ViewCache, cache_result, clear_all_cache,
                                  generate_cache_key, get_cache_stats, warm_up_cache)
from udeneyv1.models import Articulos, Categorias, UsuarioRol, Usuarios


class CacheUtilsTest(TestCase):
    """Tests para utilidades básicas de cache"""

    def setUp(self):
        # Limpiar cache antes de cada test
        cache.clear()

    def test_generate_cache_key(self):
        """Test: Generar claves de cache únicas"""
        key1 = generate_cache_key("test", "arg1", "arg2")
        key2 = generate_cache_key("test", "arg1", "arg2")
        key3 = generate_cache_key("test", "arg1", "different")

        # Las claves iguales deben ser idénticas
        self.assertEqual(key1, key2)

        # Las claves diferentes deben ser distintas
        self.assertNotEqual(key1, key3)

        # Verificar formato
        self.assertTrue(key1.startswith("test_"))

    def test_cache_result_decorator(self):
        """Test: Decorador de cache funciona correctamente"""
        call_count = 0

        @cache_result(timeout=60, key_prefix="test_func")
        def expensive_function(x, y):
            nonlocal call_count
            call_count += 1
            return x + y

        # Primera llamada
        result1 = expensive_function(5, 3)
        self.assertEqual(result1, 8)
        self.assertEqual(call_count, 1)

        # Segunda llamada (debe usar cache)
        result2 = expensive_function(5, 3)
        self.assertEqual(result2, 8)
        self.assertEqual(call_count, 1)  # No debe incrementar

        # Llamada con argumentos diferentes
        result3 = expensive_function(10, 5)
        self.assertEqual(result3, 15)
        self.assertEqual(call_count, 2)  # Debe incrementar


class ViewCacheTest(TestCase):
    """Tests para la clase ViewCache"""

    def setUp(self):
        cache.clear()

    def test_cache_key_generation(self):
        """Test: Generación de claves específicas"""
        # Test claves de artículos
        key1 = ViewCache.get_articulos_cache_key({"categoria": 1})
        key2 = ViewCache.get_articulos_cache_key({"categoria": 1})
        key3 = ViewCache.get_articulos_cache_key({"categoria": 2})

        self.assertEqual(key1, key2)
        self.assertNotEqual(key1, key3)

        # Test clave de artículo específico
        articulo_key = ViewCache.get_articulo_cache_key(123)
        self.assertEqual(articulo_key, "articulo_detail_123")

        # Test clave de categorías
        cat_key = ViewCache.get_categorias_cache_key()
        self.assertEqual(cat_key, "categorias_list")

        # Test clave de roles de usuario
        role_key = ViewCache.get_usuario_roles_cache_key(456)
        self.assertEqual(role_key, "usuario_roles_456")


class ArticulosCacheTest(TestCase):
    """Tests para cache específico de artículos"""

    def setUp(self):
        cache.clear()

        # Crear datos de prueba
        self.usuario = Usuarios.objects.create(
            nombres_usuario="Test",
            apellidos_usuario="User",
            email_usuario="test@cache.com",
            password_usuario="pass123",
            telefono_usuario="1234567890",
            direccion_usuario="Test Address",
        )

        self.categoria = Categorias.objects.create(nombre_categoria="libros")

        self.articulo = Articulos.objects.create(
            titulo_articulo="Test Book",
            descripcion_articulo="Test Description",
            precio_articulo="15000.00",
            id_usuario=self.usuario,
            id_categoria=self.categoria,
            disponible=True,
        )

    def test_get_articulos_disponibles_cache(self):
        """Test: Cache de artículos disponibles"""
        # Primera llamada (debe hacer query)
        result1 = ArticulosCache.get_articulos_disponibles()
        self.assertEqual(len(result1), 1)
        self.assertEqual(result1[0]["titulo_articulo"], "Test Book")

        # Verificar que está en cache
        cache_key = ViewCache.get_articulos_cache_key({})
        cached_result = cache.get(cache_key)
        self.assertIsNotNone(cached_result)
        self.assertEqual(len(cached_result), 1)

    def test_get_articulos_por_categoria_cache(self):
        """Test: Cache de artículos por categoría"""
        result = ArticulosCache.get_articulos_disponibles(
            categoria_id=self.categoria.id_categoria
        )

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["titulo_articulo"], "Test Book")

    def test_get_articulo_detalle_cache(self):
        """Test: Cache de detalle de artículo"""
        # Primera llamada
        result1 = ArticulosCache.get_articulo_detalle(self.articulo.id_articulo)
        self.assertIsNotNone(result1)
        self.assertEqual(result1["titulo_articulo"], "Test Book")

        # Verificar cache
        cache_key = ViewCache.get_articulo_cache_key(self.articulo.id_articulo)
        cached_result = cache.get(cache_key)
        self.assertIsNotNone(cached_result)

    def test_articulo_no_existe(self):
        """Test: Artículo que no existe"""
        result = ArticulosCache.get_articulo_detalle(9999)
        self.assertIsNone(result)

    def test_invalidate_articulo_cache(self):
        """Test: Invalidación de cache de artículo"""
        # Llenar cache
        ArticulosCache.get_articulo_detalle(self.articulo.id_articulo)

        # Verificar que está cacheado
        cache_key = ViewCache.get_articulo_cache_key(self.articulo.id_articulo)
        self.assertIsNotNone(cache.get(cache_key))

        # Invalidar
        ArticulosCache.invalidate_articulo(self.articulo.id_articulo)

        # Verificar que se eliminó
        self.assertIsNone(cache.get(cache_key))


class UsuariosCacheTest(TestCase):
    """Tests para cache de usuarios"""

    def setUp(self):
        cache.clear()

        self.usuario = Usuarios.objects.create(
            nombres_usuario="Cache",
            apellidos_usuario="User",
            email_usuario="cache@test.com",
            password_usuario="pass123",
            telefono_usuario="1234567890",
            direccion_usuario="Cache Address",
        )

        UsuarioRol.objects.create(id_usuario=self.usuario, id_rol="vendedor")

    def test_get_user_roles_cache(self):
        """Test: Cache de roles de usuario"""
        # Primera llamada
        roles1 = UsuariosCache.get_user_roles(self.usuario.id_usuario)
        self.assertIn("vendedor", roles1)

        # Verificar cache
        cache_key = ViewCache.get_usuario_roles_cache_key(self.usuario.id_usuario)
        cached_roles = cache.get(cache_key)
        self.assertIsNotNone(cached_roles)
        self.assertIn("vendedor", cached_roles)

    def test_invalidate_user_roles(self):
        """Test: Invalidación de cache de roles"""
        # Llenar cache
        UsuariosCache.get_user_roles(self.usuario.id_usuario)

        # Invalidar
        UsuariosCache.invalidate_user_roles(self.usuario.id_usuario)

        # Verificar que se eliminó
        cache_key = ViewCache.get_usuario_roles_cache_key(self.usuario.id_usuario)
        self.assertIsNone(cache.get(cache_key))


class CategoriasCacheTest(TestCase):
    """Tests para cache de categorías"""

    def setUp(self):
        cache.clear()

        Categorias.objects.create(nombre_categoria="libros")
        Categorias.objects.create(nombre_categoria="utiles")

    def test_get_all_categorias_cache(self):
        """Test: Cache de todas las categorías"""
        # Primera llamada
        result1 = CategoriasCache.get_all_categorias()
        self.assertEqual(len(result1), 2)

        # Verificar cache
        cache_key = ViewCache.get_categorias_cache_key()
        cached_result = cache.get(cache_key)
        self.assertIsNotNone(cached_result)
        self.assertEqual(len(cached_result), 2)

    def test_invalidate_categorias(self):
        """Test: Invalidación de cache de categorías"""
        # Llenar cache
        CategoriasCache.get_all_categorias()

        # Invalidar
        CategoriasCache.invalidate_categorias()

        # Verificar que se eliminó
        cache_key = ViewCache.get_categorias_cache_key()
        self.assertIsNone(cache.get(cache_key))


class CacheManagementTest(TestCase):
    """Tests para gestión general de cache"""

    def setUp(self):
        cache.clear()

    @patch("udeneyv1.cache_utils.logger")
    def test_warm_up_cache(self, mock_logger):
        """Test: Precalentamiento de cache"""
        # Crear datos de prueba
        Categorias.objects.create(nombre_categoria="test")

        # Precalentar
        warm_up_cache()

        # Verificar que se llamó al logger
        mock_logger.info.assert_called()

        # Verificar que las categorías están cacheadas
        cache_key = ViewCache.get_categorias_cache_key()
        self.assertIsNotNone(cache.get(cache_key))

    def test_clear_all_cache(self):
        """Test: Limpieza de todo el cache"""
        # Agregar algo al cache
        cache.set("test_key", "test_value")
        self.assertEqual(cache.get("test_key"), "test_value")

        # Limpiar todo
        clear_all_cache()

        # Verificar que se limpió
        self.assertIsNone(cache.get("test_key"))

    def test_get_cache_stats(self):
        """Test: Obtener estadísticas de cache"""
        # Agregar algunas cosas al cache
        CategoriasCache.get_all_categorias()

        stats = get_cache_stats()

        self.assertIsInstance(stats, dict)
        self.assertIn("cached_items", stats)
        self.assertIn("total_checked", stats)


class CacheIntegrationTest(TestCase):
    """Tests de integración para el sistema de cache"""

    def setUp(self):
        cache.clear()

        # Crear datos completos de prueba
        self.usuario = Usuarios.objects.create(
            nombres_usuario="Integration",
            apellidos_usuario="Test",
            email_usuario="integration@test.com",
            password_usuario="pass123",
            telefono_usuario="1234567890",
            direccion_usuario="Integration Address",
        )

        self.categoria = Categorias.objects.create(nombre_categoria="libros")

        self.articulo = Articulos.objects.create(
            titulo_articulo="Integration Book",
            descripcion_articulo="Integration Description",
            precio_articulo="20000.00",
            id_usuario=self.usuario,
            id_categoria=self.categoria,
        )

        UsuarioRol.objects.create(id_usuario=self.usuario, id_rol="vendedor")

    def test_cache_integration_complete(self):
        """Test: Integración completa del sistema de cache"""
        # Precalentar cache
        warm_up_cache()

        # Verificar que todos los datos están cacheados
        cache_keys = [
            ViewCache.get_categorias_cache_key(),
            ViewCache.get_articulos_cache_key({}),
        ]

        for key in cache_keys:
            cached_data = cache.get(key)
            self.assertIsNotNone(cached_data, f"Cache miss for key: {key}")

        # Obtener estadísticas
        stats = get_cache_stats()
        self.assertGreaterEqual(stats.get("cached_items", 0), 1)

    def test_cache_invalidation_cascade(self):
        """Test: Invalidación en cascada funciona"""
        # Llenar cache
        ArticulosCache.get_articulos_disponibles()
        ArticulosCache.get_articulo_detalle(self.articulo.id_articulo)

        # Invalidar artículo específico
        ViewCache.invalidate_articulo_cache(self.articulo.id_articulo)

        # Verificar invalidación específica
        cache_key = ViewCache.get_articulo_cache_key(self.articulo.id_articulo)
        self.assertIsNone(cache.get(cache_key))
