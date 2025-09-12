"""
Configuración de logging estructurado para Eduney
"""
import os
from pathlib import Path

# Base directory for logs
BASE_DIR = Path(__file__).resolve().parent.parent.parent
LOG_DIR = BASE_DIR / "logs"

# Crear directorio de logs si no existe
LOG_DIR.mkdir(exist_ok=True)

# Configuración de logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s %(pathname)s %(lineno)d'
        },
        'structured': {
            'format': '[{asctime}] {levelname:8} | {name:20} | {module:15} | {message}',
            'style': '{',
        },
        'security': {
            'format': '[SECURITY] {asctime} | {levelname} | {name} | {message}',
            'style': '{',
        },
        'performance': {
            'format': '[PERF] {asctime} | {message}',
            'style': '{',
        },
        'audit': {
            'format': '[AUDIT] {asctime} | {message}',
            'style': '{',
        }
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
            'formatter': 'structured'
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_DIR / 'eduney.log',
            'maxBytes': 15728640,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_DIR / 'eduney_errors.log',
            'maxBytes': 15728640,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'security_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_DIR / 'security.log',
            'maxBytes': 15728640,
            'backupCount': 10,
            'formatter': 'security',
        },
        'performance_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_DIR / 'performance.log',
            'maxBytes': 15728640,
            'backupCount': 10,
            'formatter': 'performance',
        },
        'audit_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_DIR / 'audit.log',
            'maxBytes': 15728640,
            'backupCount': 10,
            'formatter': 'audit',
        },
        'db_queries': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_DIR / 'db_queries.log',
            'maxBytes': 15728640,
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file'],
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_file', 'mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django.security.*': {
            'handlers': ['security_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.db.backends': {
            'handlers': ['db_queries'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'udeneyv1': {
            'handlers': ['console', 'file', 'error_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'udeneyv1.security': {
            'handlers': ['security_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'udeneyv1.performance': {
            'handlers': ['performance_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'udeneyv1.audit': {
            'handlers': ['audit_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'udeneyv1.cache': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'udeneyv1.middleware': {
            'handlers': ['console', 'file', 'security_file'],
            'level': 'INFO',
            'propagate': False,
        },
    }
}