# Tests para Udeneyv1

Esta carpeta contiene los tests para la aplicación principal de Eduney.

## Estructura

- `test_models.py` - Tests para los modelos de Django
- `test_views.py` - Tests para las views y API endpoints
- `test_serializers.py` - Tests para los serializers de DRF

## Ejecutar Tests

### Opción 1: Script de conveniencia
```bash
python run_tests.py
```

### Opción 2: Django manage.py
```bash
python manage.py test udeneyv1.tests --settings=ecommerce.settings.testing
```

### Opción 3: Tests específicos
```bash
# Solo tests de modelos
python manage.py test udeneyv1.tests.test_models --settings=ecommerce.settings.testing

# Solo tests de serializers
python manage.py test udeneyv1.tests.test_serializers --settings=ecommerce.settings.testing

# Solo tests de views
python manage.py test udeneyv1.tests.test_views --settings=ecommerce.settings.testing
```

### Opción 4: Con pytest (si está instalado)
```bash
pytest udeneyv1/tests/ -v
```

## Configuración de Testing

Los tests utilizan automáticamente:
- SQLite en memoria para mayor velocidad
- Configuración optimizada para testing
- Sin migraciones (usa schema directo)
- Logging mínimo

## Cobertura de Tests

Para generar reporte de cobertura:
```bash
pip install coverage
coverage run --source='.' manage.py test udeneyv1.tests --settings=ecommerce.settings.testing
coverage report
coverage html  # Para reporte HTML
```

## Agregar Nuevos Tests

1. Crea archivos de test siguiendo el patrón `test_*.py`
2. Importa `TestCase` o `APITestCase` según corresponda
3. Nombra las funciones de test con prefijo `test_`
4. Usa métodos `setUp()` para configuración inicial
5. Usa assertions de Django: `self.assertEqual()`, `self.assertTrue()`, etc.

## Ejemplo de Test

```python
from django.test import TestCase
from udeneyv1.models import Usuarios

class MiTestCase(TestCase):
    def setUp(self):
        """Configuración que se ejecuta antes de cada test"""
        self.usuario = Usuarios.objects.create(
            nombres_usuario='Test',
            apellidos_usuario='User',
            email_usuario='test@example.com'
        )
    
    def test_mi_funcionalidad(self):
        """Descripción del test"""
        self.assertEqual(self.usuario.nombres_usuario, 'Test')
```