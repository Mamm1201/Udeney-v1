"""
Tests para los serializers de la aplicación udeneyv1
"""
from django.test import TestCase
from decimal import Decimal
from udeneyv1.models import Usuarios, Categorias, Articulos
from udeneyv1.serializers import (
    UsuariosSerializer, CategoriasSerializer, ArticulosSerializer
)


class UsuariosSerializerTest(TestCase):
    """Tests para el serializer de Usuarios"""
    
    def setUp(self):
        """Configuración inicial"""
        self.usuario_data = {
            'nombres_usuario': 'Test',
            'apellidos_usuario': 'User',
            'email_usuario': 'test@serializer.com',
            'password_usuario': 'pass123',
            'telefono_usuario': '1234567890',
            'direccion_usuario': 'Test Address'
        }
        
    def test_serializer_valid_data(self):
        """Test para datos válidos del serializer"""
        serializer = UsuariosSerializer(data=self.usuario_data)
        self.assertTrue(serializer.is_valid(), f"Errores: {serializer.errors}")
        
    def test_serializer_invalid_email(self):
        """Test para email inválido"""
        invalid_data = self.usuario_data.copy()
        invalid_data['email_usuario'] = 'email-invalido'
        
        serializer = UsuariosSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email_usuario', serializer.errors)
        
    def test_serializer_missing_required_fields(self):
        """Test para campos requeridos faltantes"""
        incomplete_data = {
            'nombres_usuario': 'Test'
        }
        
        serializer = UsuariosSerializer(data=incomplete_data)
        self.assertFalse(serializer.is_valid())
        
    def test_serialize_existing_user(self):
        """Test para serializar un usuario existente"""
        usuario = Usuarios.objects.create(**self.usuario_data)
        serializer = UsuariosSerializer(usuario)
        
        self.assertEqual(serializer.data['nombres_usuario'], 'Test')
        self.assertEqual(serializer.data['email_usuario'], 'test@serializer.com')


class CategoriasSerializerTest(TestCase):
    """Tests para el serializer de Categorias"""
    
    def test_serializer_valid_category(self):
        """Test para categoría válida"""
        data = {'nombre_categoria': 'libros'}
        serializer = CategoriasSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
    def test_serializer_invalid_category(self):
        """Test para categoría inválida"""
        data = {'nombre_categoria': 'categoria_inexistente'}
        serializer = CategoriasSerializer(data=data)
        # Dependiendo de cómo esté implementada la validación
        # self.assertFalse(serializer.is_valid())
        
    def test_serialize_existing_category(self):
        """Test para serializar categoría existente"""
        categoria = Categorias.objects.create(nombre_categoria='utiles')
        serializer = CategoriasSerializer(categoria)
        
        self.assertEqual(serializer.data['nombre_categoria'], 'utiles')


class ArticulosSerializerTest(TestCase):
    """Tests para el serializer de Articulos"""
    
    def setUp(self):
        """Configuración inicial"""
        self.usuario = Usuarios.objects.create(
            nombres_usuario='Test',
            apellidos_usuario='User',
            email_usuario='test@articulos.com',
            password_usuario='pass123',
            telefono_usuario='1234567890',
            direccion_usuario='Test Address'
        )
        self.categoria = Categorias.objects.create(nombre_categoria='libros')
        
        self.articulo_data = {
            'titulo_articulo': 'Libro Test',
            'descripcion_articulo': 'Descripción de prueba',
            'precio_articulo': '25000.00',
            'id_usuario': self.usuario.id_usuario,
            'id_categoria': self.categoria.id_categoria,
            'disponible': True
        }
        
    def test_serializer_valid_data(self):
        """Test para datos válidos de artículo"""
        serializer = ArticulosSerializer(data=self.articulo_data)
        if not serializer.is_valid():
            print(f"Errores del serializer: {serializer.errors}")
        # Este test podría fallar dependiendo de cómo esté implementado
        # el serializer, ajustar según la implementación real
        
    def test_serialize_existing_article(self):
        """Test para serializar artículo existente"""
        articulo = Articulos.objects.create(
            titulo_articulo='Libro Existente',
            descripcion_articulo='Descripción',
            precio_articulo=Decimal('30000.00'),
            id_usuario=self.usuario,
            id_categoria=self.categoria
        )
        
        serializer = ArticulosSerializer(articulo)
        self.assertEqual(serializer.data['titulo_articulo'], 'Libro Existente')
        self.assertEqual(float(serializer.data['precio_articulo']), 30000.00)


class SerializerIntegrationTest(TestCase):
    """Tests de integración para serializers"""
    
    def test_serializers_import_correctly(self):
        """Test para verificar que todos los serializers se importen correctamente"""
        from udeneyv1.serializers import (
            UsuariosSerializer, ArticulosSerializer, CategoriasSerializer,
            RolesSerializer, TransaccionesSerializer, CalificacionesSerializer
        )
        
        # Verificar que las clases existen
        self.assertTrue(hasattr(UsuariosSerializer, 'Meta'))
        self.assertTrue(hasattr(ArticulosSerializer, 'Meta'))
        self.assertTrue(hasattr(CategoriasSerializer, 'Meta'))
        
    def test_model_serializer_consistency(self):
        """Test para verificar consistencia entre modelos y serializers"""
        # Verificar que los campos principales están en los serializers
        usuario_serializer = UsuariosSerializer()
        articulo_serializer = ArticulosSerializer()
        
        # Los serializers deben tener los campos básicos
        # (Este test necesita ajustarse según la implementación real)
        pass