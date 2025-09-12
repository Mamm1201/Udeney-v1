"""
Utilidades de logging estructurado para Eduney
"""
import functools
import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from django.http import HttpRequest

# Loggers especializados
security_logger = logging.getLogger("udeneyv1.security")
performance_logger = logging.getLogger("udeneyv1.performance")
audit_logger = logging.getLogger("udeneyv1.audit")
cache_logger = logging.getLogger("udeneyv1.cache")
middleware_logger = logging.getLogger("udeneyv1.middleware")


class StructuredLogger:
    """
    Clase para logging estructurado con contexto
    """

    def __init__(self, logger_name: str = "udeneyv1"):
        self.logger = logging.getLogger(logger_name)

    def log_with_context(
        self, level: str, message: str, context: Dict[str, Any] = None
    ):
        """
        Log con contexto estructurado
        """
        if context is None:
            context = {}

        structured_message = {
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "context": context,
        }

        log_func = getattr(self.logger, level.lower())
        log_func(json.dumps(structured_message, default=str))

    def info(self, message: str, **context):
        self.log_with_context("INFO", message, context)

    def error(self, message: str, **context):
        self.log_with_context("ERROR", message, context)

    def warning(self, message: str, **context):
        self.log_with_context("WARNING", message, context)

    def debug(self, message: str, **context):
        self.log_with_context("DEBUG", message, context)


class SecurityLogger:
    """
    Logger especializado para eventos de seguridad
    """

    @staticmethod
    def log_authentication_attempt(request: HttpRequest, email: str, success: bool):
        """
        Log intento de autenticación
        """
        security_logger.info(
            f"AUTH_ATTEMPT: {email} - {'SUCCESS' if success else 'FAILED'} - "
            f"IP: {request.META.get('REMOTE_ADDR', 'unknown')} - "
            f"User-Agent: {request.META.get('HTTP_USER_AGENT', 'unknown')}"
        )

    @staticmethod
    def log_permission_denied(
        request: HttpRequest, required_role: str, user_roles: list
    ):
        """
        Log denegación de permisos
        """
        user_info = getattr(request, "eduney_user", "Anonymous")
        security_logger.warning(
            f"PERMISSION_DENIED: User: {user_info} - "
            f"Required: {required_role} - Has: {user_roles} - "
            f"Path: {request.path} - Method: {request.method}"
        )

    @staticmethod
    def log_rate_limit_exceeded(request: HttpRequest, client_id: str):
        """
        Log rate limit excedido
        """
        security_logger.warning(
            f"RATE_LIMIT_EXCEEDED: Client: {client_id} - "
            f"Path: {request.path} - IP: {request.META.get('REMOTE_ADDR', 'unknown')}"
        )

    @staticmethod
    def log_suspicious_activity(request: HttpRequest, activity_type: str, details: str):
        """
        Log actividad sospechosa
        """
        security_logger.critical(
            f"SUSPICIOUS_ACTIVITY: Type: {activity_type} - "
            f"Details: {details} - "
            f"User: {getattr(request, 'eduney_user', 'Anonymous')} - "
            f"IP: {request.META.get('REMOTE_ADDR', 'unknown')}"
        )


class PerformanceLogger:
    """
    Logger especializado para métricas de rendimiento
    """

    @staticmethod
    def log_slow_request(request: HttpRequest, duration: float, db_queries: int = None):
        """
        Log request lenta
        """
        performance_logger.warning(
            f"SLOW_REQUEST: {request.method} {request.path} - "
            f"Duration: {duration:.3f}s - "
            f"DB_Queries: {db_queries or 'N/A'} - "
            f"User: {getattr(request, 'eduney_user', 'Anonymous')}"
        )

    @staticmethod
    def log_cache_performance(
        operation: str, cache_key: str, hit: bool, duration: float = None
    ):
        """
        Log rendimiento de cache
        """
        cache_logger.debug(
            f"CACHE_{operation.upper()}: Key: {cache_key} - "
            f"Result: {'HIT' if hit else 'MISS'}"
            + (f" - Duration: {duration:.3f}s" if duration else "")
        )

    @staticmethod
    def log_database_performance(
        query_type: str, table: str, duration: float, rows_affected: int = None
    ):
        """
        Log rendimiento de base de datos
        """
        performance_logger.info(
            f"DB_{query_type.upper()}: Table: {table} - "
            f"Duration: {duration:.3f}s"
            + (f" - Rows: {rows_affected}" if rows_affected is not None else "")
        )


class AuditLogger:
    """
    Logger especializado para auditoría
    """

    @staticmethod
    def log_model_change(
        user, model_name: str, object_id: Any, action: str, changes: Dict = None
    ):
        """
        Log cambios en modelos
        """
        audit_logger.info(
            f"MODEL_CHANGE: User: {user} - "
            f"Model: {model_name} - ID: {object_id} - "
            f"Action: {action} - "
            f"Changes: {json.dumps(changes or {}, default=str)}"
        )

    @staticmethod
    def log_business_event(event_type: str, user, details: Dict):
        """
        Log eventos de negocio importantes
        """
        audit_logger.info(
            f"BUSINESS_EVENT: Type: {event_type} - "
            f"User: {user} - "
            f"Details: {json.dumps(details, default=str)}"
        )

    @staticmethod
    def log_transaction_event(
        user, transaction_id: Any, event: str, amount: float = None
    ):
        """
        Log eventos de transacciones
        """
        audit_logger.info(
            f"TRANSACTION_EVENT: User: {user} - "
            f"Transaction: {transaction_id} - Event: {event}"
            + (f" - Amount: ${amount}" if amount else "")
        )


def log_function_call(logger_name: str = "udeneyv1"):
    """
    Decorador para logging automático de llamadas a funciones
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(logger_name)

            # Log entrada
            logger.debug(f"FUNCTION_CALL: {func.__module__}.{func.__name__} - START")

            try:
                result = func(*args, **kwargs)
                logger.debug(
                    f"FUNCTION_CALL: {func.__module__}.{func.__name__} - SUCCESS"
                )
                return result
            except Exception as e:
                logger.error(
                    f"FUNCTION_CALL: {func.__module__}.{func.__name__} - ERROR: {str(e)}"
                )
                raise

        return wrapper

    return decorator


def log_api_call(func):
    """
    Decorador específico para logging de llamadas API
    """

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        logger = logging.getLogger("udeneyv1")

        # Información de la request
        user_info = getattr(request, "eduney_user", "Anonymous")

        logger.info(
            f"API_CALL: {request.method} {request.path} - "
            f"User: {user_info} - "
            f"View: {func.__name__}"
        )

        try:
            response = func(self, request, *args, **kwargs)

            logger.info(
                f"API_RESPONSE: {request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"User: {user_info}"
            )

            return response
        except Exception as e:
            logger.error(
                f"API_ERROR: {request.method} {request.path} - "
                f"Error: {str(e)} - User: {user_info}"
            )
            raise

    return wrapper


class LoggingContextManager:
    """
    Context manager para logging con contexto automático
    """

    def __init__(self, logger_name: str, operation: str, **context):
        self.logger = logging.getLogger(logger_name)
        self.operation = operation
        self.context = context
        self.start_time = None

    def __enter__(self):
        self.start_time = datetime.now()
        self.logger.info(f"OPERATION_START: {self.operation} - Context: {self.context}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.now() - self.start_time).total_seconds()

        if exc_type is None:
            self.logger.info(
                f"OPERATION_COMPLETE: {self.operation} - Duration: {duration:.3f}s"
            )
        else:
            self.logger.error(
                f"OPERATION_FAILED: {self.operation} - Duration: {duration:.3f}s - Error: {exc_val}"
            )

        return False  # No suprimir excepciones
