"""
Development settings for Eduney project.
Configuraciones específicas para el entorno de desarrollo.
"""

import os

from .base import *

# Middleware adicionales para desarrollo - DESHABILITADOS TEMPORALMENTE
# MIDDLEWARE += [
#     "udeneyv1.metrics.MetricsMiddleware",  # Debe ir primero para capturar todo
#     "udeneyv1.middleware.AuthenticationMiddleware",
#     "udeneyv1.middleware.RoleBasedAccessMiddleware",
#     "udeneyv1.middleware.AuditMiddleware",
#     "udeneyv1.middleware.SecurityHeadersMiddleware",
#     "udeneyv1.middleware.RateLimitMiddleware",
#     "udeneyv1.middleware.PerformanceMonitoringMiddleware",
# ]

# Debug activado en desarrollo
DEBUG = os.getenv("DEBUG", "True") == "True"

# Hosts permitidos en desarrollo
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,0.0.0.0").split(",")

# Orígenes permitidos para CORS en desarrollo
cors_origins = os.getenv(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(",")]

# Permitir todos los orígenes en desarrollo (solo para desarrollo)
CORS_ALLOW_ALL_ORIGINS = True

# Configuraciones adicionales para desarrollo
INTERNAL_IPS = [
    "127.0.0.1",
]

# Logging más detallado en desarrollo
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
        },
    },
}
