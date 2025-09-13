"""
Testing settings for Eduney project.
Configuraciones específicas para ejecutar tests.
"""

from .base import *

# Debug desactivado en tests
DEBUG = False

# Usar SQLite en memoria para tests (más rápido)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Hosts permitidos en tests
ALLOWED_HOSTS = ["testserver"]

# Password hashers más simples para tests (más rápido)
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]


# Desactivar migraciones para tests (usar schema directo)
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None


MIGRATION_MODULES = DisableMigrations()

# Configuraciones adicionales para tests
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# Media y static files para tests
MEDIA_ROOT = BASE_DIR / "test_media"
STATIC_ROOT = BASE_DIR / "test_static"

# Logging mínimo en tests
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "null": {
            "class": "logging.NullHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["null"],
            "level": "CRITICAL",
        },
    },
}
