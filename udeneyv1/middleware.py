"""
Middleware personalizado para autorización y auditoría
"""
import logging
import time

from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

from .logging_utils import PerformanceLogger, SecurityLogger, middleware_logger
from .models import UsuarioRol, Usuarios

logger = logging.getLogger(__name__)


class AuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware para manejar la autenticación basada en JWT
    Convierte el token JWT en un objeto usuario de Eduney
    """

    def process_request(self, request):
        """
        Procesa la request para extraer información de usuario
        """
        # Rutas que no necesitan autenticación
        excluded_paths = [
            "/api/v1/registro/",
            "/api/v1/login/",
            "/admin/",
            "/api/schema/",
            "/api/docs/",
        ]

        # Verificar si la ruta está excluida
        if any(request.path.startswith(path) for path in excluded_paths):
            return None

        # Extraer información del usuario JWT si existe
        if hasattr(request, "user") and hasattr(request.user, "id_usuario"):
            try:
                # Cargar el usuario completo de Eduney
                usuario = Usuarios.objects.get(id_usuario=request.user.id_usuario)
                request.eduney_user = usuario

                # Cargar roles del usuario
                roles = UsuarioRol.objects.filter(id_usuario=usuario).values_list(
                    "id_rol", flat=True
                )
                request.user_roles = list(roles)

                middleware_logger.info(
                    f"Usuario autenticado: {usuario.email_usuario} con roles: {request.user_roles}"
                )

            except Usuarios.DoesNotExist:
                middleware_logger.warning(
                    f"Usuario JWT no encontrado en BD: {request.user}"
                )
                request.eduney_user = None
                request.user_roles = []
        else:
            request.eduney_user = None
            request.user_roles = []

        return None


class RoleBasedAccessMiddleware(MiddlewareMixin):
    """
    Middleware para control de acceso basado en roles
    """

    # Configuración de rutas y roles requeridos
    ROLE_REQUIREMENTS = {
        "/api/v1/articulos/": {
            "POST": ["vendedor"],  # Solo vendedores pueden crear artículos
            "PUT": ["vendedor"],  # Solo vendedores pueden actualizar
            "PATCH": ["vendedor"],  # Solo vendedores pueden modificar
            "DELETE": ["vendedor"],  # Solo vendedores pueden eliminar
        },
        "/api/v1/transacciones/": {
            "POST": ["comprador"],  # Solo compradores pueden crear transacciones
        },
        "/api/v1/todos-articulos/": {
            "GET": ["admin"],  # Solo administradores pueden ver todos los artículos
            "POST": ["admin"],
            "PUT": ["admin"],
            "DELETE": ["admin"],
        },
    }

    def process_request(self, request):
        """
        Verificar permisos basados en roles antes de procesar la vista
        """
        # Verificar si hay restricciones de rol para esta ruta
        for route_pattern, method_roles in self.ROLE_REQUIREMENTS.items():
            if request.path.startswith(route_pattern):
                required_roles = method_roles.get(request.method)

                if required_roles:
                    # Verificar autenticación
                    if not hasattr(request, "user_roles"):
                        return JsonResponse(
                            {"error": "Autenticación requerida"}, status=401
                        )

                    # Verificar roles
                    if not any(role in request.user_roles for role in required_roles):
                        SecurityLogger.log_permission_denied(
                            request, str(required_roles), request.user_roles
                        )
                        return JsonResponse(
                            {
                                "error": f"Acceso denegado. Roles requeridos: {required_roles}"
                            },
                            status=403,
                        )

                    user_info = getattr(request, "eduney_user", "Unknown")
                    middleware_logger.info(
                        f"Acceso permitido para {user_info} en {request.path}"
                    )

        return None


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware para auditoría de acciones del sistema
    """

    # Acciones que queremos auditar
    AUDIT_METHODS = ["POST", "PUT", "PATCH", "DELETE"]
    AUDIT_PATHS = [
        "/api/v1/articulos/",
        "/api/v1/transacciones/",
        "/api/v1/usuarios/",
    ]

    def process_request(self, request):
        """
        Marcar el inicio de la request para medición de tiempo
        """
        request._audit_start_time = time.time()
        return None

    def process_response(self, request, response):
        """
        Auditar la response y registrar métricas
        """
        # Calcular tiempo de respuesta
        if hasattr(request, "_audit_start_time"):
            response_time = time.time() - request._audit_start_time
            response["X-Response-Time"] = f"{response_time:.3f}s"

        # Auditar acciones importantes
        should_audit = request.method in self.AUDIT_METHODS and any(
            request.path.startswith(path) for path in self.AUDIT_PATHS
        )

        if should_audit:
            user_info = "Anonymous"
            if hasattr(request, "eduney_user") and request.eduney_user:
                user_info = f"{request.eduney_user.email_usuario}"

            audit_data = {
                "user": user_info,
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "response_time": getattr(response, "X-Response-Time", "N/A"),
                "user_agent": request.META.get("HTTP_USER_AGENT", "Unknown"),
            }

            middleware_logger.info(f"AUDIT: {audit_data}")

        return response


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware para agregar headers de seguridad
    """

    def process_response(self, request, response):
        """
        Agregar headers de seguridad a todas las responses
        """
        # Headers de seguridad básicos
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'",
            "X-API-Version": "v1.0",
        }

        # Agregar headers si no existen ya
        for header, value in security_headers.items():
            if header not in response:
                response[header] = value

        return response


class RateLimitMiddleware(MiddlewareMixin):
    """
    Middleware básico de rate limiting
    En producción se recomendaría usar Redis para almacenamiento
    """

    def __init__(self, get_response):
        self.get_response = get_response
        # Cache en memoria simple (en producción usar Redis)
        self.request_counts = {}
        self.last_reset = time.time()

    def process_request(self, request):
        """
        Implementar rate limiting básico
        """
        # Reset cada minuto
        current_time = time.time()
        if current_time - self.last_reset > 60:
            self.request_counts.clear()
            self.last_reset = current_time

        # Identificar cliente (IP + User ID si está autenticado)
        client_id = request.META.get("REMOTE_ADDR", "unknown")
        if hasattr(request, "eduney_user") and request.eduney_user:
            client_id += f"_user_{request.eduney_user.id_usuario}"

        # Contar requests
        self.request_counts[client_id] = self.request_counts.get(client_id, 0) + 1

        # Límite: 100 requests por minuto por cliente
        if self.request_counts[client_id] > 100:
            SecurityLogger.log_rate_limit_exceeded(request, client_id)
            return JsonResponse(
                {"error": "Rate limit exceeded. Try again later."}, status=429
            )

        return None


class PerformanceMonitoringMiddleware(MiddlewareMixin):
    """
    Middleware para monitorear el rendimiento del sistema
    """

    def process_request(self, request):
        """
        Iniciar medición de performance
        """
        request._perf_start = time.time()
        return None

    def process_response(self, request, response):
        """
        Finalizar medición y agregar métricas
        """
        if hasattr(request, "_perf_start"):
            duration = time.time() - request._perf_start

            # Agregar headers de performance
            response["X-Response-Time-Ms"] = f"{duration * 1000:.2f}"

            # Log requests lentas (>1 segundo)
            if duration > 1.0:
                PerformanceLogger.log_slow_request(request, duration)

            # Log métricas generales cada 100 requests
            if not hasattr(PerformanceMonitoringMiddleware, "_request_count"):
                PerformanceMonitoringMiddleware._request_count = 0

            PerformanceMonitoringMiddleware._request_count += 1
            if PerformanceMonitoringMiddleware._request_count % 100 == 0:
                middleware_logger.info(
                    f"PERFORMANCE: Processed {PerformanceMonitoringMiddleware._request_count} requests"
                )

        return response
