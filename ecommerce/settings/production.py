"""
Production settings for Eduney project.
Configuraciones específicas para el entorno de producción.
"""

import os

from .base import *

# Middleware adicionales para producción
MIDDLEWARE += [
    "udeneyv1.middleware.AuthenticationMiddleware",
    "udeneyv1.middleware.RoleBasedAccessMiddleware",
    "udeneyv1.middleware.RateLimitMiddleware",
    "udeneyv1.middleware.AuditMiddleware",
    "udeneyv1.middleware.SecurityHeadersMiddleware",
    "udeneyv1.middleware.PerformanceMonitoringMiddleware",
]

# Debug SIEMPRE desactivado en producción
DEBUG = False

# Hosts permitidos en producción (debe configurarse según el dominio)
ALLOWED_HOSTS = (
    os.getenv("ALLOWED_HOSTS", "").split(",") if os.getenv("ALLOWED_HOSTS") else []
)

# Orígenes permitidos para CORS en producción
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in cors_origins.split(",") if origin.strip()
]

# Configuraciones de seguridad para producción
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000  # 1 año
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Logging para producción
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "logs" / "django.log",
            "formatter": "verbose",
        },
        "console": {
            "level": "ERROR",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file", "console"],
            "level": "INFO",
            "propagate": True,
        },
    },
}

# Crear directorio de logs si no existe
import pathlib

logs_dir = BASE_DIR / "logs"
pathlib.Path(logs_dir).mkdir(parents=True, exist_ok=True)
