"""
Tests para el sistema de permisos personalizado de Eduney
"""
from django.test import TestCase, RequestFactory
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APITestCase
from unittest.mock import Mock

from udeneyv1.models import Usuarios, UsuarioRol, Categorias, Articulos
from udeneyv1.permissions import (
    IsVendedor, IsComprador, IsVendedorOrReadOnly, IsOwnerOrReadOnly,
    ArticuloPermissions, TransaccionPermissions, user_has_role, get_user_roles,
    vendedor_required, comprador_required
)


class PermissionsBaseTest(TestCase):
    """Clase base para tests de permisos"""
    
    def setUp(self):
        """Configuración inicial para todos los tests de permisos"""
        self.factory = RequestFactory()
        
        # Crear usuarios de prueba
        self.vendedor_user = Usuarios.objects.create(
            nombres_usuario='Vendedor',
            apellidos_usuario='Test',
            email_usuario='vendedor@test.com',
            password_usuario='pass123',
            telefono_usuario='1234567890',
            direccion_usuario='Dir Vendedor'
        )
        
        self.comprador_user = Usuarios.objects.create(
            nombres_usuario='Comprador',
            apellidos_usuario='Test',
            email_usuario='comprador@test.com',
            password_usuario='pass123',
            telefono_usuario='0987654321',
            direccion_usuario='Dir Comprador'
        )
        
        self.usuario_sin_rol = Usuarios.objects.create(
            nombres_usuario='Sin',
            apellidos_usuario='Rol',
            email_usuario='sinrol@test.com',
            password_usuario='pass123',
            telefono_usuario='1111111111',
            direccion_usuario='Dir Sin Rol'
        )
        
        # Asignar roles
        UsuarioRol.objects.create(id_usuario=self.vendedor_user, id_rol='vendedor')
        UsuarioRol.objects.create(id_usuario=self.comprador_user, id_rol='comprador')
        
        # Crear categoría y artículo de prueba
        self.categoria = Categorias.objects.create(nombre_categoria='libros')
        self.articulo = Articulos.objects.create(
            titulo_articulo='Artículo Test',
            descripcion_articulo='Descripción test',
            precio_articulo='10000.00',
            id_usuario=self.vendedor_user,
            id_categoria=self.categoria
        )


class IsVendedorPermissionTest(PermissionsBaseTest):
    """Tests para el permiso IsVendedor"""
    
    def test_vendedor_tiene_permiso(self):
        """Test: Vendedor debe tener permiso"""
        permission = IsVendedor()
        request = self.factory.get('/')
        request.user = self.vendedor_user
        
        self.assertTrue(permission.has_permission(request, None))
    
    def test_comprador_no_tiene_permiso(self):
        """Test: Comprador no debe tener permiso de vendedor"""
        permission = IsVendedor()
        request = self.factory.get('/')
        request.user = self.comprador_user
        
        self.assertFalse(permission.has_permission(request, None))
    
    def test_usuario_sin_rol_no_tiene_permiso(self):
        """Test: Usuario sin rol no debe tener permiso"""
        permission = IsVendedor()
        request = self.factory.get('/')
        request.user = self.usuario_sin_rol
        
        self.assertFalse(permission.has_permission(request, None))
    
    def test_usuario_anonimo_no_tiene_permiso(self):
        """Test: Usuario anónimo no debe tener permiso"""
        permission = IsVendedor()
        request = self.factory.get('/')
        request.user = AnonymousUser()
        
        self.assertFalse(permission.has_permission(request, None))


class IsCompradorPermissionTest(PermissionsBaseTest):
    """Tests para el permiso IsComprador"""
    
    def test_comprador_tiene_permiso(self):
        """Test: Comprador debe tener permiso"""
        permission = IsComprador()
        request = self.factory.get('/')
        request.user = self.comprador_user
        
        self.assertTrue(permission.has_permission(request, None))
    
    def test_vendedor_no_tiene_permiso_comprador(self):
        """Test: Vendedor no debe tener permiso de comprador"""
        permission = IsComprador()
        request = self.factory.get('/')
        request.user = self.vendedor_user
        
        self.assertFalse(permission.has_permission(request, None))


class IsVendedorOrReadOnlyTest(PermissionsBaseTest):
    """Tests para el permiso IsVendedorOrReadOnly"""
    
    def test_vendedor_tiene_permiso_escritura(self):
        """Test: Vendedor puede escribir"""
        permission = IsVendedorOrReadOnly()
        request = self.factory.post('/')
        request.user = self.vendedor_user
        
        self.assertTrue(permission.has_permission(request, None))
    
    def test_comprador_tiene_permiso_lectura(self):
        """Test: Comprador puede leer"""
        permission = IsVendedorOrReadOnly()
        request = self.factory.get('/')
        request.user = self.comprador_user
        
        self.assertTrue(permission.has_permission(request, None))
    
    def test_comprador_no_tiene_permiso_escritura(self):
        """Test: Comprador no puede escribir"""
        permission = IsVendedorOrReadOnly()
        request = self.factory.post('/')
        request.user = self.comprador_user
        
        self.assertFalse(permission.has_permission(request, None))


class ArticuloPermissionsTest(PermissionsBaseTest):
    """Tests para permisos específicos de artículos"""
    
    def test_vendedor_puede_crear_articulo(self):
        """Test: Vendedor puede crear artículos"""
        permission = ArticuloPermissions()
        request = self.factory.post('/')
        request.user = self.vendedor_user
        
        self.assertTrue(permission.has_permission(request, None))
    
    def test_comprador_no_puede_crear_articulo(self):
        """Test: Comprador no puede crear artículos"""
        permission = ArticuloPermissions()
        request = self.factory.post('/')
        request.user = self.comprador_user
        
        self.assertFalse(permission.has_permission(request, None))
    
    def test_propietario_puede_editar_articulo(self):
        """Test: Propietario puede editar su artículo"""
        permission = ArticuloPermissions()
        request = self.factory.put('/')
        request.user = self.vendedor_user
        
        self.assertTrue(
            permission.has_object_permission(request, None, self.articulo)
        )
    
    def test_no_propietario_no_puede_editar_articulo(self):
        """Test: Otros usuarios no pueden editar artículos ajenos"""
        permission = ArticuloPermissions()
        request = self.factory.put('/')
        request.user = self.comprador_user
        
        self.assertFalse(
            permission.has_object_permission(request, None, self.articulo)
        )


class UtilityFunctionsTest(PermissionsBaseTest):
    """Tests para funciones utilitarias de permisos"""
    
    def test_user_has_role_vendedor(self):
        """Test: Verificar que usuario tiene rol de vendedor"""
        self.assertTrue(user_has_role(self.vendedor_user, 'vendedor'))
        self.assertFalse(user_has_role(self.vendedor_user, 'comprador'))
    
    def test_user_has_role_comprador(self):
        """Test: Verificar que usuario tiene rol de comprador"""
        self.assertTrue(user_has_role(self.comprador_user, 'comprador'))
        self.assertFalse(user_has_role(self.comprador_user, 'vendedor'))
    
    def test_user_has_role_sin_rol(self):
        """Test: Usuario sin rol no debe tener ningún rol"""
        self.assertFalse(user_has_role(self.usuario_sin_rol, 'vendedor'))
        self.assertFalse(user_has_role(self.usuario_sin_rol, 'comprador'))
    
    def test_get_user_roles_vendedor(self):
        """Test: Obtener roles de vendedor"""
        roles = get_user_roles(self.vendedor_user)
        self.assertIn('vendedor', roles)
        self.assertEqual(len(roles), 1)
    
    def test_get_user_roles_comprador(self):
        """Test: Obtener roles de comprador"""
        roles = get_user_roles(self.comprador_user)
        self.assertIn('comprador', roles)
        self.assertEqual(len(roles), 1)
    
    def test_get_user_roles_sin_rol(self):
        """Test: Usuario sin rol debe retornar lista vacía"""
        roles = get_user_roles(self.usuario_sin_rol)
        self.assertEqual(roles, [])
    
    def test_get_user_roles_usuario_anonimo(self):
        """Test: Usuario anónimo debe retornar lista vacía"""
        roles = get_user_roles(AnonymousUser())
        self.assertEqual(roles, [])


class DecoradoresTest(PermissionsBaseTest):
    """Tests para decoradores de permisos"""
    
    def test_decorador_vendedor_required(self):
        """Test: Decorador vendedor_required funciona"""
        @vendedor_required
        def vista_test(request):
            return "success"
        
        # Mock request con vendedor
        request_vendedor = Mock()
        request_vendedor.user = self.vendedor_user
        
        result = vista_test(request_vendedor)
        self.assertEqual(result, "success")
        
        # Mock request con comprador (debe fallar)
        request_comprador = Mock()
        request_comprador.user = self.comprador_user
        
        result = vista_test(request_comprador)
        self.assertEqual(result.status_code, 403)
    
    def test_decorador_comprador_required(self):
        """Test: Decorador comprador_required funciona"""
        @comprador_required
        def vista_test(request):
            return "success"
        
        # Mock request con comprador
        request_comprador = Mock()
        request_comprador.user = self.comprador_user
        
        result = vista_test(request_comprador)
        self.assertEqual(result, "success")
        
        # Mock request con vendedor (debe fallar)
        request_vendedor = Mock()
        request_vendedor.user = self.vendedor_user
        
        result = vista_test(request_vendedor)
        self.assertEqual(result.status_code, 403)


class PermissionsIntegrationTest(PermissionsBaseTest):
    """Tests de integración para el sistema de permisos"""
    
    def test_usuario_con_multiples_roles(self):
        """Test: Usuario con múltiples roles"""
        # Agregar rol de comprador al vendedor
        UsuarioRol.objects.create(id_usuario=self.vendedor_user, id_rol='comprador')
        
        roles = get_user_roles(self.vendedor_user)
        self.assertIn('vendedor', roles)
        self.assertIn('comprador', roles)
        self.assertEqual(len(roles), 2)
        
        # Debe tener ambos permisos
        self.assertTrue(user_has_role(self.vendedor_user, 'vendedor'))
        self.assertTrue(user_has_role(self.vendedor_user, 'comprador'))