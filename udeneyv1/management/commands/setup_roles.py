"""
Comando para configurar el sistema de roles usando Groups y Permissions de Django.
Migra los roles existentes y crea los nuevos roles requeridos.
"""

from django.contrib.auth.models import Group, Permission, User
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.db import transaction

from udeneyv1.models import UsuarioRol, Usuarios


class Command(BaseCommand):
    help = 'Configura el sistema de roles usando Groups y Permissions de Django'

    def add_arguments(self, parser):
        parser.add_argument(
            '--migrate-existing',
            action='store_true',
            help='Migra usuarios existentes del sistema actual al nuevo',
        )
        parser.add_argument(
            '--create-superadmin',
            action='store_true',
            help='Crea un usuario superadmin por defecto',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando configuración del sistema de roles...'))
        
        try:
            with transaction.atomic():
                self.create_groups_and_permissions()
                
                if options['migrate_existing']:
                    self.migrate_existing_users()
                
                if options['create_superadmin']:
                    self.create_default_superadmin()
                    
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error durante la configuración: {str(e)}'))
            return
        
        self.stdout.write(self.style.SUCCESS('[SUCCESS] Sistema de roles configurado exitosamente'))

    def create_groups_and_permissions(self):
        """Crea los grupos y permisos necesarios"""
        self.stdout.write('Creando grupos y permisos...')
        
        # Obtener content types necesarios
        from udeneyv1.models import Articulos, Transacciones, Calificaciones, Usuarios
        
        articulos_ct = ContentType.objects.get_for_model(Articulos)
        transacciones_ct = ContentType.objects.get_for_model(Transacciones)
        calificaciones_ct = ContentType.objects.get_for_model(Calificaciones)
        usuarios_ct = ContentType.objects.get_for_model(Usuarios)
        
        # Crear permisos personalizados si no existen
        custom_permissions = [
            # Artículos
            ('view_own_articulos', 'Can view own articles', articulos_ct),
            ('change_own_articulos', 'Can change own articles', articulos_ct),
            
            # Transacciones
            ('view_own_transacciones', 'Can view own transactions', transacciones_ct),
            ('view_all_transacciones', 'Can view all transactions', transacciones_ct),
            
            # Usuarios (para administración)
            ('manage_user_status', 'Can manage user status', usuarios_ct),
            ('view_all_users', 'Can view all users', usuarios_ct),
            
            # Reportes y auditoría
            ('view_reports', 'Can view reports', usuarios_ct),
            ('view_audit_logs', 'Can view audit logs', usuarios_ct),
        ]
        
        for codename, name, content_type in custom_permissions:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                name=name,
                content_type=content_type,
            )
            if created:
                self.stdout.write(f'  [OK] Permiso creado: {name}')
        
        # Definir grupos y sus permisos
        groups_config = {
            'Vendedor': [
                # Permisos de artículos
                'add_articulos',
                'view_articulos',
                'view_own_articulos',
                'change_own_articulos',
                'delete_articulos',
                
                # Permisos de transacciones (para ver sus ventas)
                'view_transacciones',
                'view_own_transacciones',
                
                # Permisos de calificaciones (para ver calificaciones recibidas)
                'view_calificaciones',
            ],
            'Comprador': [
                # Permisos de transacciones
                'add_transacciones',
                'view_transacciones',
                'view_own_transacciones',
                
                # Permisos de calificaciones
                'add_calificaciones',
                'view_calificaciones',
                
                # Permisos de artículos (solo lectura)
                'view_articulos',
            ],
            'Admin_Negocio': [
                # Gestión de usuarios
                'view_all_users',
                'manage_user_status',
                
                # Transacciones y reportes
                'view_all_transacciones',
                'view_reports',
                
                # Calificaciones
                'view_calificaciones',
                
                # Artículos (para moderación)
                'view_articulos',
                'change_articulos',
                'delete_articulos',
            ],
            'Monitor': [
                # Solo permisos de lectura
                'view_all_transacciones',
                'view_calificaciones',
                'view_reports',
                'view_audit_logs',
                'view_articulos',
                'view_all_users',
            ]
        }
        
        # Crear grupos y asignar permisos
        for group_name, permission_codenames in groups_config.items():
            group, created = Group.objects.get_or_create(name=group_name)
            
            if created:
                self.stdout.write(f'  [NEW] Grupo creado: {group_name}')
            else:
                self.stdout.write(f'  [EXISTS] Grupo existente: {group_name}')
            
            # Limpiar permisos actuales
            group.permissions.clear()
            
            # Asignar permisos
            for perm_codename in permission_codenames:
                try:
                    permission = Permission.objects.get(codename=perm_codename)
                    group.permissions.add(permission)
                except Permission.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'    [WARNING] Permiso no encontrado: {perm_codename}')
                    )
            
            self.stdout.write(f'    [OK] {len(permission_codenames)} permisos asignados a {group_name}')

    def migrate_existing_users(self):
        """Migra usuarios existentes del sistema UsuarioRol a Groups"""
        self.stdout.write('Migrando usuarios existentes...')
        
        # Mapeo de roles antiguos a grupos nuevos
        role_mapping = {
            'vendedor': 'Vendedor',
            'comprador': 'Comprador'
        }
        
        migrated_count = 0
        
        # Obtener todos los usuarios con roles
        usuario_roles = UsuarioRol.objects.select_related('id_usuario').all()
        
        for usuario_rol in usuario_roles:
            try:
                # Obtener el usuario Django correspondiente
                django_user = User.objects.get(id=usuario_rol.id_usuario.id_usuario)
                
                # Mapear el rol antiguo al grupo nuevo
                old_role = usuario_rol.id_rol
                new_group_name = role_mapping.get(old_role)
                
                if new_group_name:
                    group = Group.objects.get(name=new_group_name)
                    django_user.groups.add(group)
                    
                    self.stdout.write(f'  [OK] Usuario {django_user.username} -> Grupo {new_group_name}')
                    migrated_count += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(f'  [WARNING] Rol no mapeado: {old_role} para usuario {django_user.username}')
                    )
                    
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'  [WARNING] Usuario Django no encontrado para ID: {usuario_rol.id_usuario.id_usuario}')
                )
            except Group.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'  [ERROR] Grupo no encontrado: {new_group_name}')
                )
        
        self.stdout.write(f'[SUCCESS] {migrated_count} usuarios migrados exitosamente')

    def create_default_superadmin(self):
        """Crea un usuario superadmin por defecto"""
        self.stdout.write('Creando usuario superadmin...')
        
        try:
            # Crear usuario superadmin si no existe
            superuser, created = User.objects.get_or_create(
                username='superadmin',
                defaults={
                    'email': 'admin@eduney.com',
                    'is_staff': True,
                    'is_superuser': True,
                    'first_name': 'Super',
                    'last_name': 'Admin'
                }
            )
            
            if created:
                # Establecer contraseña por defecto (debe cambiarse)
                superuser.set_password('admin123456')
                superuser.save()
                
                # Crear usuario Eduney correspondiente
                usuario_eduney = Usuarios.objects.create(
                    id_usuario=superuser.id,
                    nombres_usuario='Super',
                    apellidos_usuario='Admin',
                    email_usuario='admin@eduney.com',
                    telefono_usuario='0000000000',
                    direccion_usuario='N/A',
                    is_active=True
                )
                usuario_eduney.set_password('admin123456')
                usuario_eduney.save()
                
                self.stdout.write(
                    self.style.SUCCESS('[SUCCESS] Usuario superadmin creado exitosamente')
                )
                self.stdout.write(
                    self.style.WARNING('[WARNING] IMPORTANTE: Cambie la contraseña por defecto (admin123456)')
                )
            else:
                self.stdout.write('[EXISTS] Usuario superadmin ya existe')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'[ERROR] Error creando superadmin: {str(e)}')
            )