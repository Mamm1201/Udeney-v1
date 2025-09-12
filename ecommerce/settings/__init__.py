"""
Settings package for Eduney project

Para cambiar entre entornos, usa una de estas opciones:

1. Variable de entorno:
   export DJANGO_SETTINGS_MODULE=ecommerce.settings.production

2. En manage.py o wsgi.py:
   os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings.development")

Entornos disponibles:
- development: Para desarrollo local
- production: Para producción
- testing: Para ejecutar tests
"""
