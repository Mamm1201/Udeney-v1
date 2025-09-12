"""
Tests para el middleware personalizado de Eduney
"""
import time
from unittest.mock import Mock, patch

from django.contrib.auth.models import AnonymousUser
from django.http import HttpResponse, JsonResponse
from django.test import RequestFactory, TestCase

from udeneyv1.middleware import (AuditMiddleware, AuthenticationMiddleware,
                                 PerformanceMonitoringMiddleware, RateLimitMiddleware,
                                 RoleBasedAccessMiddleware, SecurityHeadersMiddleware)
from udeneyv1.models import UsuarioRol, Usuarios


class MiddlewareBaseTest(TestCase):
    """Clase base para tests de middleware"""

    def setUp(self):
        self.factory = RequestFactory()

        # Crear usuario de prueba
        self.usuario = Usuarios.objects.create(
            nombres_usuario="Test",
            apellidos_usuario="User",
            email_usuario="test@middleware.com",
            password_usuario="pass123",
            telefono_usuario="1234567890",
            direccion_usuario="Test Address",
        )

        # Asignar rol
        UsuarioRol.objects.create(id_usuario=self.usuario, id_rol="vendedor")


class AuthenticationMiddlewareTest(MiddlewareBaseTest):
    """Tests para AuthenticationMiddleware"""

    def setUp(self):
        super().setUp()
        self.middleware = AuthenticationMiddleware(lambda x: HttpResponse())

    def test_rutas_excluidas_no_necesitan_auth(self):
        """Test: Rutas excluidas no requieren autenticación"""
        request = self.factory.get("/api/v1/registro/")
        result = self.middleware.process_request(request)

        self.assertIsNone(result)  # No debe interferir

    def test_usuario_autenticado_carga_datos(self):
        """Test: Usuario autenticado carga datos completos"""
        request = self.factory.get("/api/v1/articulos/")

        # Mock usuario JWT
        mock_user = Mock()
        mock_user.id_usuario = self.usuario.id_usuario
        request.user = mock_user

        # Procesar request
        self.middleware.process_request(request)

        # Verificar que se cargaron los datos
        self.assertEqual(request.eduney_user, self.usuario)
        self.assertIn("vendedor", request.user_roles)

    def test_usuario_no_autenticado_sin_datos(self):
        """Test: Usuario no autenticado no tiene datos adicionales"""
        request = self.factory.get("/api/v1/articulos/")
        request.user = AnonymousUser()

        self.middleware.process_request(request)

        self.assertIsNone(request.eduney_user)
        self.assertEqual(request.user_roles, [])


class RoleBasedAccessMiddlewareTest(MiddlewareBaseTest):
    """Tests para RoleBasedAccessMiddleware"""

    def setUp(self):
        super().setUp()
        self.middleware = RoleBasedAccessMiddleware(lambda x: HttpResponse())

    def test_acceso_permitido_con_rol_correcto(self):
        """Test: Acceso permitido con rol correcto"""
        request = self.factory.post("/api/v1/articulos/")
        request.user_roles = ["vendedor"]

        result = self.middleware.process_request(request)

        self.assertIsNone(result)  # No debe bloquear

    def test_acceso_denegado_sin_rol_requerido(self):
        """Test: Acceso denegado sin rol requerido"""
        request = self.factory.post("/api/v1/articulos/")
        request.user_roles = ["comprador"]  # No tiene rol de vendedor

        result = self.middleware.process_request(request)

        self.assertIsInstance(result, JsonResponse)
        self.assertEqual(result.status_code, 403)

    def test_acceso_denegado_sin_autenticacion(self):
        """Test: Acceso denegado sin autenticación"""
        request = self.factory.post("/api/v1/articulos/")
        # No tiene atributo user_roles

        result = self.middleware.process_request(request)

        self.assertIsInstance(result, JsonResponse)
        self.assertEqual(result.status_code, 401)


class AuditMiddlewareTest(MiddlewareBaseTest):
    """Tests para AuditMiddleware"""

    def setUp(self):
        super().setUp()
        self.middleware = AuditMiddleware(lambda x: HttpResponse())

    def test_process_request_marca_tiempo(self):
        """Test: process_request marca tiempo de inicio"""
        request = self.factory.post("/api/v1/articulos/")

        self.middleware.process_request(request)

        self.assertTrue(hasattr(request, "_audit_start_time"))
        self.assertIsInstance(request._audit_start_time, float)

    @patch("udeneyv1.middleware.middleware_logger")
    def test_audit_log_para_acciones_importantes(self, mock_logger):
        """Test: Se registran logs para acciones importantes"""
        request = self.factory.post("/api/v1/articulos/")
        request._audit_start_time = time.time()
        request.eduney_user = self.usuario
        request.META = {"HTTP_USER_AGENT": "Test Agent"}

        response = HttpResponse()
        response.status_code = 201

        result = self.middleware.process_response(request, response)

        # Verificar que se llamó al logger
        mock_logger.info.assert_called()
        self.assertIn("AUDIT:", str(mock_logger.info.call_args))

        # Verificar que se agregó el header de tiempo
        self.assertTrue(result.has_header("X-Response-Time"))


class SecurityHeadersMiddlewareTest(MiddlewareBaseTest):
    """Tests para SecurityHeadersMiddleware"""

    def setUp(self):
        super().setUp()
        self.middleware = SecurityHeadersMiddleware(lambda x: HttpResponse())

    def test_agrega_headers_de_seguridad(self):
        """Test: Se agregan headers de seguridad"""
        request = self.factory.get("/api/v1/articulos/")
        response = HttpResponse()

        result = self.middleware.process_response(request, response)

        # Verificar headers de seguridad
        expected_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "X-XSS-Protection",
            "Referrer-Policy",
            "Content-Security-Policy",
            "X-API-Version",
        ]

        for header in expected_headers:
            self.assertTrue(result.has_header(header))

    def test_no_sobrescribe_headers_existentes(self):
        """Test: No sobrescribe headers que ya existen"""
        request = self.factory.get("/api/v1/articulos/")
        response = HttpResponse()
        response["X-Frame-Options"] = "SAMEORIGIN"  # Header existente

        result = self.middleware.process_response(request, response)

        # El header existente no debe cambiar
        self.assertEqual(result["X-Frame-Options"], "SAMEORIGIN")


class RateLimitMiddlewareTest(MiddlewareBaseTest):
    """Tests para RateLimitMiddleware"""

    def setUp(self):
        super().setUp()
        self.middleware = RateLimitMiddleware(lambda x: HttpResponse())

    def test_permite_requests_normales(self):
        """Test: Permite requests bajo el límite"""
        request = self.factory.get("/api/v1/articulos/")
        request.META = {"REMOTE_ADDR": "127.0.0.1"}

        result = self.middleware.process_request(request)

        self.assertIsNone(result)  # No debe bloquear

    def test_bloquea_requests_excesivos(self):
        """Test: Bloquea requests que exceden el límite"""
        request = self.factory.get("/api/v1/articulos/")
        request.META = {"REMOTE_ADDR": "127.0.0.1"}

        # Simular 101 requests del mismo cliente
        client_id = "127.0.0.1"
        self.middleware.request_counts[client_id] = 101

        result = self.middleware.process_request(request)

        self.assertIsInstance(result, JsonResponse)
        self.assertEqual(result.status_code, 429)


class PerformanceMonitoringMiddlewareTest(MiddlewareBaseTest):
    """Tests para PerformanceMonitoringMiddleware"""

    def setUp(self):
        super().setUp()
        self.middleware = PerformanceMonitoringMiddleware(lambda x: HttpResponse())

    def test_marca_tiempo_inicio(self):
        """Test: Marca tiempo de inicio en request"""
        request = self.factory.get("/api/v1/articulos/")

        self.middleware.process_request(request)

        self.assertTrue(hasattr(request, "_perf_start"))
        self.assertIsInstance(request._perf_start, float)

    def test_agrega_header_tiempo_respuesta(self):
        """Test: Agrega header de tiempo de respuesta"""
        request = self.factory.get("/api/v1/articulos/")
        request._perf_start = time.time() - 0.1  # Simular 100ms de duración

        response = HttpResponse()
        result = self.middleware.process_response(request, response)

        self.assertTrue(result.has_header("X-Response-Time-Ms"))
        response_time = float(result["X-Response-Time-Ms"])
        self.assertGreater(response_time, 0)

    @patch("udeneyv1.middleware.PerformanceLogger")
    def test_log_requests_lentas(self, mock_logger):
        """Test: Log para requests lentas"""
        request = self.factory.get("/api/v1/articulos/")
        request.method = "GET"
        request.path = "/api/v1/articulos/"
        request._perf_start = time.time() - 1.5  # Simular 1.5 segundos

        response = HttpResponse()
        response.status_code = 200

        self.middleware.process_response(request, response)

        # Verificar que se llamó el método de PerformanceLogger
        mock_logger.log_slow_request.assert_called()


class MiddlewareIntegrationTest(MiddlewareBaseTest):
    """Tests de integración para múltiples middlewares"""

    def test_orden_correcto_middlewares(self):
        """Test: Los middlewares se ejecutan en orden correcto"""
        # Este test verificaría que los middlewares no interfieren entre sí
        # En un caso real, se ejecutarían todos en secuencia

        request = self.factory.post("/api/v1/articulos/")
        request.META = {"REMOTE_ADDR": "127.0.0.1", "HTTP_USER_AGENT": "Test"}

        # Simular usuario autenticado
        mock_user = Mock()
        mock_user.id_usuario = self.usuario.id_usuario
        request.user = mock_user

        # Ejecutar middlewares en orden
        auth_middleware = AuthenticationMiddleware(lambda x: HttpResponse())
        auth_middleware.process_request(request)

        security_middleware = SecurityHeadersMiddleware(lambda x: HttpResponse())
        response = HttpResponse()
        final_response = security_middleware.process_response(request, response)

        # Verificar que ambos funcionaron
        self.assertEqual(request.eduney_user, self.usuario)
        self.assertTrue(final_response.has_header("X-Content-Type-Options"))
