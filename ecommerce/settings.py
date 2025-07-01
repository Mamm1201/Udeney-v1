from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# load_dotenv("")  # Carga las variables desde el archivo .env

# # Cargar .env desde la raíz del proyecto
# BASE_DIR = Path(__file__).resolve().parent.parent
# load_dotenv(os.path.join(BASE_DIR, '.env'))

# # Comprobación de carga correcta
# print("DB_HOST cargado:", os.getenv("DB_HOST"))


# # Build paths inside the project like this: BASE_DIR / 'subdir'.
# BASE_DIR = Path(__file__).resolve().parent.parent

# # Quick-start development settings - unsuitable for production
# # See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# # SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = "django-insecure-y@)ct$if^^&0x4)gg572v)a-^olhv-g9-v&shq_crc_nct9)!%"

# # SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True

# BASE_DIR del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Usar .env.local si existe, de lo contrario usar .env
env_path = BASE_DIR / '.env.local'
if env_path.exists():
    print("🟢 Cargando configuración desde: .env.local")
    load_dotenv(dotenv_path=env_path)
else:
    print("🟢 Cargando configuración desde: .env")
    load_dotenv(os.path.join(BASE_DIR, '.env'))
    
# ✅ Agrega esto justo después
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise Exception("❌ SECRET_KEY no está definido en el archivo .env o .env.local")

# Ahora puedes acceder a las variables cargadas
print("DB_HOST cargado:", os.getenv("DB_HOST"))

DEBUG = os.getenv("DEBUG", "False") == "True"

if DEBUG:
    ALLOWED_HOSTS = []
else:
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "udeneyv1",
    "django_filters",
]

# INSTALACIÓN PARA AUTENTICACIÓN LOGIN
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id_usuario",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "ecommerce.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # Django busque aquí las plantillas
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "ecommerce.wsgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
        "OPTIONS": {
            "charset": "utf8mb4",  # Soporte para emojis y caracteres especiales
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",  # Mayor validación
            "connect_timeout": 5,  # Timeout para conexión
        },
    },
}



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# DESDE ACA AUTORIZAMOS QUIEN SE PUEDE CONECTAR
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]


MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
