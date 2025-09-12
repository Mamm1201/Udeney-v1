"""
Tests para los modelos de la aplicación udeneyv1
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from decimal import Decimal
from udeneyv1.models import (
    Usuarios, Categorias, Articulos, Roles, 
    UsuarioRol, Transacciones, Calificaciones
)


class UsuariosModelTest(TestCase):
    """Tests para el modelo Usuarios"""
    
    def setUp(self):
        """Configuración inicial para los tests"""
        self.usuario_data = {
            'nombres_usuario': 'Juan',
            'apellidos_usuario': 'Pérez',
            'email_usuario': 'juan.perez@test.com',
            'password_usuario': 'password123',
            'telefono_usuario': '1234567890',
            'direccion_usuario': 'Calle 123 #45-67'
        }
    
    def test_crear_usuario_exitoso(self):
        """Test para crear un usuario exitosamente"""
        usuario = Usuarios.objects.create(**self.usuario_data)
        self.assertEqual(usuario.nombres_usuario, 'Juan')
        self.assertEqual(usuario.apellidos_usuario, 'Pérez')
        self.assertEqual(usuario.email_usuario, 'juan.perez@test.com')
        self.assertTrue(usuario.is_active)
        
    def test_str_representation(self):
        """Test para la representación string del usuario"""
        usuario = Usuarios.objects.create(**self.usuario_data)
        self.assertEqual(str(usuario), "Juan Pérez")
        
    def test_email_unique(self):
        """Test para verificar que el email sea único"""
        Usuarios.objects.create(**self.usuario_data)
        
        # Intentar crear otro usuario con el mismo email
        usuario_data_2 = self.usuario_data.copy()
        usuario_data_2['nombres_usuario'] = 'María'
        
        with self.assertRaises(Exception):  # Django levantará IntegrityError
            Usuarios.objects.create(**usuario_data_2)

    def test_set_password(self):
        """Test para el método set_password"""
        usuario = Usuarios.objects.create(**self.usuario_data)
        usuario.set_password('nueva_password')
        self.assertNotEqual(usuario.password_usuario, 'nueva_password')  # Debe estar hasheada
        
    def test_check_password(self):
        """Test para el método check_password"""
        usuario = Usuarios.objects.create(**self.usuario_data)
        usuario.set_password('mi_password_secreta')
        self.assertTrue(usuario.check_password('mi_password_secreta'))
        self.assertFalse(usuario.check_password('password_incorrecta'))


class CategoriasModelTest(TestCase):
    """Tests para el modelo Categorias"""
    
    def test_crear_categoria(self):
        """Test para crear una categoría"""
        categoria = Categorias.objects.create(nombre_categoria='libros')
        self.assertEqual(categoria.nombre_categoria, 'libros')
        
    def test_choices_validas(self):
        """Test para verificar que solo se permiten las opciones válidas"""
        opciones_validas = ['prenda', 'utiles', 'libros', 'herramientas']
        
        for opcion in opciones_validas:
            categoria = Categorias.objects.create(nombre_categoria=opcion)
            self.assertEqual(categoria.nombre_categoria, opcion)


class ArticulosModelTest(TestCase):
    """Tests para el modelo Articulos"""
    
    def setUp(self):
        """Configuración inicial para los tests de artículos"""
        self.usuario = Usuarios.objects.create(
            nombres_usuario='Test',
            apellidos_usuario='User',
            email_usuario='test@test.com',
            password_usuario='pass123',
            telefono_usuario='1234567890',
            direccion_usuario='Test Address'
        )
        self.categoria = Categorias.objects.create(nombre_categoria='libros')
        
    def test_crear_articulo(self):
        """Test para crear un artículo"""
        articulo = Articulos.objects.create(
            titulo_articulo='Libro de Matemáticas',
            descripcion_articulo='Libro de matemáticas de secundaria',
            precio_articulo=Decimal('25000.00'),
            id_usuario=self.usuario,
            id_categoria=self.categoria,
            disponible=True
        )
        
        self.assertEqual(articulo.titulo_articulo, 'Libro de Matemáticas')
        self.assertEqual(articulo.precio_articulo, Decimal('25000.00'))
        self.assertTrue(articulo.disponible)
        self.assertEqual(articulo.id_usuario, self.usuario)
        self.assertEqual(articulo.id_categoria, self.categoria)


class RolesModelTest(TestCase):
    """Tests para el modelo Roles"""
    
    def test_crear_rol_vendedor(self):
        """Test para crear rol de vendedor"""
        rol = Roles.objects.create(tipo_rol='vendedor')
        self.assertEqual(rol.tipo_rol, 'vendedor')
        self.assertEqual(str(rol), 'vendedor')
        
    def test_crear_rol_comprador(self):
        """Test para crear rol de comprador"""
        rol = Roles.objects.create(tipo_rol='comprador')
        self.assertEqual(rol.tipo_rol, 'comprador')
        self.assertEqual(str(rol), 'comprador')


class TransaccionesModelTest(TestCase):
    """Tests para el modelo Transacciones"""
    
    def setUp(self):
        """Configuración inicial para tests de transacciones"""
        self.usuario = Usuarios.objects.create(
            nombres_usuario='Test',
            apellidos_usuario='User',
            email_usuario='test@test.com',
            password_usuario='pass123',
            telefono_usuario='1234567890',
            direccion_usuario='Test Address'
        )
        
    def test_crear_transaccion(self):
        """Test para crear una transacción"""
        transaccion = Transacciones.objects.create(usuario=self.usuario)
        self.assertEqual(transaccion.usuario, self.usuario)
        self.assertIsNotNone(transaccion.fecha_transaccion)


# Test básico para verificar que la configuración funciona
class ConfiguracionTest(TestCase):
    """Tests para verificar la configuración básica"""
    
    def test_configuracion_testing(self):
        """Verificar que estamos usando la configuración de testing"""
        from django.conf import settings
        self.assertFalse(settings.DEBUG)  # En testing debe ser False
        self.assertEqual(settings.DATABASES['default']['ENGINE'], 'django.db.backends.sqlite3')