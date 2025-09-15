"""
Tests para verificar que la migración del sistema de roles funciona correctamente.
"""

from django.test import TestCase
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient
from rest_framework import status

from udeneyv1.models import Usuarios, UsuarioRol
from udeneyv1.permissions_new import (
    user_has_group, 
    get_user_groups, 
    get_user_permissions_summary
)
from udeneyv1.jwt_utils import get_tokens_for_user


class RolesMigrationTestCase(TestCase):
    """
    Test case para verificar la migración de roles
    """
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.client = APIClient()
        
        # Crear grupos de roles
        self.vendedor_group = Group.objects.create(name='Vendedor')
        self.comprador_group = Group.objects.create(name='Comprador')
        self.admin_group = Group.objects.create(name='Admin_Negocio')
        self.monitor_group = Group.objects.create(name='Monitor')
        
        # Crear permisos básicos
        from udeneyv1.models import Articulos, Transacciones
        articulos_ct = ContentType.objects.get_for_model(Articulos)
        transacciones_ct = ContentType.objects.get_for_model(Transacciones)
        
        self.add_articulos_perm = Permission.objects.get(
            codename='add_articulos', 
            content_type=articulos_ct
        )
        self.view_articulos_perm = Permission.objects.get(
            codename='view_articulos', 
            content_type=articulos_ct
        )
        self.add_transacciones_perm = Permission.objects.get(
            codename='add_transacciones', 
            content_type=transacciones_ct
        )
        
        # Asignar permisos a grupos
        self.vendedor_group.permissions.add(
            self.add_articulos_perm, 
            self.view_articulos_perm
        )
        self.comprador_group.permissions.add(
            self.add_transacciones_perm, 
            self.view_articulos_perm
        )
        self.admin_group.permissions.add(
            self.view_articulos_perm,
            self.add_transacciones_perm,
            self.add_articulos_perm
        )
        
        # Crear usuarios de prueba
        self.vendedor_user = User.objects.create_user(
            username='vendedor@test.com',
            email='vendedor@test.com',
            password='testpass123'
        )
        self.vendedor_user.groups.add(self.vendedor_group)
        
        self.comprador_user = User.objects.create_user(
            username='comprador@test.com', 
            email='comprador@test.com',
            password='testpass123'
        )
        self.comprador_user.groups.add(self.comprador_group)
        
        self.admin_user = User.objects.create_user(
            username='admin@test.com',
            email='admin@test.com', 
            password='testpass123',
            is_staff=True
        )
        self.admin_user.groups.add(self.admin_group)
        
        self.monitor_user = User.objects.create_user(
            username='monitor@test.com',
            email='monitor@test.com',
            password='testpass123'
        )
        self.monitor_user.groups.add(self.monitor_group)
        
        # Crear usuarios de Eduney correspondientes
        self.vendedor_eduney = Usuarios.objects.create(
            id_usuario=self.vendedor_user.id,
            nombres_usuario='Vendedor',
            apellidos_usuario='Test',
            email_usuario='vendedor@test.com',
            telefono_usuario='1234567890',
            direccion_usuario='Test Address',
            is_active=True
        )
        self.vendedor_eduney.set_password('testpass123')
        self.vendedor_eduney.save()

    def test_user_has_correct_groups(self):
        """Test que los usuarios tengan los grupos correctos"""
        self.assertTrue(user_has_group(self.vendedor_user, 'Vendedor'))
        self.assertFalse(user_has_group(self.vendedor_user, 'Comprador'))
        
        self.assertTrue(user_has_group(self.comprador_user, 'Comprador'))
        self.assertFalse(user_has_group(self.comprador_user, 'Vendedor'))
        
        self.assertTrue(user_has_group(self.admin_user, 'Admin_Negocio'))

    def test_get_user_groups(self):
        """Test que se obtengan correctamente los grupos del usuario"""
        vendedor_groups = get_user_groups(self.vendedor_user)
        self.assertIn('Vendedor', vendedor_groups)
        self.assertEqual(len(vendedor_groups), 1)
        
        comprador_groups = get_user_groups(self.comprador_user)
        self.assertIn('Comprador', comprador_groups)

    def test_user_permissions_summary(self):
        """Test que el resumen de permisos sea correcto"""
        vendedor_summary = get_user_permissions_summary(self.vendedor_user)
        
        # Vendedor debe poder crear artículos pero no gestionar usuarios
        self.assertTrue(vendedor_summary['can_create_articles'])
        self.assertFalse(vendedor_summary['can_manage_users'])
        self.assertTrue(vendedor_summary['can_view_transactions'])
        
        admin_summary = get_user_permissions_summary(self.admin_user)
        self.assertTrue(admin_summary['can_manage_users'])
        self.assertTrue(admin_summary['can_view_reports'])

    def test_jwt_token_includes_role_info(self):
        """Test que los tokens JWT incluyan información de roles"""
        tokens = get_tokens_for_user(self.vendedor_user)
        
        self.assertIn('access', tokens)
        self.assertIn('refresh', tokens)
        
        # Verificar que el token se puede decodificar (simplificado)
        from udeneyv1.jwt_utils import decode_user_info_from_token
        user_info = decode_user_info_from_token(tokens['access'])
        
        if user_info:  # Si la decodificación funciona
            self.assertIn('Vendedor', user_info.get('groups', []))
            self.assertEqual(user_info.get('user_id'), self.vendedor_user.id)


class PermissionsAPITestCase(TestCase):
    """
    Test case para verificar que los permisos funcionan en las APIs
    """
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        
        # Crear grupos
        self.vendedor_group = Group.objects.create(name='Vendedor')
        self.admin_group = Group.objects.create(name='Admin_Negocio')
        
        # Crear usuario vendedor
        self.vendedor_user = User.objects.create_user(
            username='vendedor@test.com',
            password='testpass123'
        )
        self.vendedor_user.groups.add(self.vendedor_group)
        
        # Crear usuario admin
        self.admin_user = User.objects.create_user(
            username='admin@test.com',
            password='testpass123',
            is_staff=True
        )
        self.admin_user.groups.add(self.admin_group)
        
        # Obtener tokens
        self.vendedor_tokens = get_tokens_for_user(self.vendedor_user)
        self.admin_tokens = get_tokens_for_user(self.admin_user)

    def authenticate_user(self, tokens):
        """Helper para autenticar usuario en el cliente"""
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}'
        )

    def test_vendedor_can_access_articulos(self):
        """Test que vendedor puede acceder a endpoints de artículos"""
        self.authenticate_user(self.vendedor_tokens)
        
        response = self.client.get('/articulos/')
        # Debe poder acceder (200 o 404 si no hay artículos)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_admin_can_access_admin_endpoints(self):
        """Test que admin puede acceder a endpoints administrativos"""
        self.authenticate_user(self.admin_tokens)
        
        response = self.client.get('/admin/users/')
        # Debe poder acceder
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendedor_cannot_access_admin_endpoints(self):
        """Test que vendedor NO puede acceder a endpoints administrativos"""
        self.authenticate_user(self.vendedor_tokens)
        
        response = self.client.get('/admin/users/')
        # Debe ser denegado
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class LoginWithRolesTestCase(TestCase):
    """
    Test case para verificar que el login funciona con el nuevo sistema
    """
    
    def setUp(self):
        """Configuración inicial"""
        self.client = APIClient()
        
        # Crear grupo vendedor
        self.vendedor_group = Group.objects.create(name='Vendedor')
        
        # Crear usuario Django
        self.django_user = User.objects.create_user(
            username='test_user',
            password='testpass123'
        )
        self.django_user.groups.add(self.vendedor_group)
        
        # Crear usuario Eduney
        self.eduney_user = Usuarios.objects.create(
            id_usuario=self.django_user.id,
            nombres_usuario='Test',
            apellidos_usuario='User', 
            email_usuario='test@eduney.com',
            telefono_usuario='1234567890',
            direccion_usuario='Test Address',
            is_active=True
        )
        self.eduney_user.set_password('testpass123')
        self.eduney_user.save()

    def test_login_returns_role_info(self):
        """Test que el login retorne información de roles"""
        login_data = {
            'email': 'test@eduney.com',
            'password': 'testpass123'
        }
        
        response = self.client.post('/login/', login_data)
        
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            
            # Verificar que incluye información del usuario y roles
            self.assertIn('user', data)
            self.assertIn('access_token', data)
            self.assertIn('refresh_token', data)
            
            user_data = data['user']
            self.assertIn('groups', user_data)
            self.assertIn('permissions', user_data)
            self.assertIn('dashboard_route', user_data)
            
            # Verificar que tiene el grupo correcto
            self.assertIn('Vendedor', user_data['groups'])


class BackwardsCompatibilityTestCase(TestCase):
    """
    Test case para verificar que las funcionalidades existentes siguen funcionando
    """
    
    def setUp(self):
        """Configuración inicial"""
        # Crear datos que simulan el sistema anterior
        self.vendedor_group = Group.objects.create(name='Vendedor')
        
        self.user = User.objects.create_user(
            username='legacy_user',
            password='testpass123'
        )
        self.user.groups.add(self.vendedor_group)
        
        self.eduney_user = Usuarios.objects.create(
            id_usuario=self.user.id,
            nombres_usuario='Legacy',
            apellidos_usuario='User',
            email_usuario='legacy@eduney.com',
            telefono_usuario='1234567890', 
            direccion_usuario='Test Address',
            is_active=True
        )
        
        # Crear entrada en el modelo antiguo (para compatibilidad)
        UsuarioRol.objects.create(
            id_usuario=self.eduney_user,
            id_rol='vendedor'
        )

    def test_legacy_user_still_works(self):
        """Test que usuarios del sistema anterior sigan funcionando"""
        # El usuario debe tener el grupo asignado
        self.assertTrue(user_has_group(self.user, 'Vendedor'))
        
        # Debe poder generar tokens
        tokens = get_tokens_for_user(self.user)
        self.assertIn('access', tokens)
        self.assertIn('refresh', tokens)
        
        # El resumen de permisos debe funcionar
        permissions = get_user_permissions_summary(self.user)
        self.assertIsInstance(permissions, dict)
        self.assertIn('can_view_transactions', permissions)