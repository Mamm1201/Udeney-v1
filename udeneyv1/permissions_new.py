"""
Sistema de permisos renovado para Eduney usando Groups y Permissions de Django.
Mantiene compatibilidad con funcionalidades existentes y agrega nuevos roles.
"""

from functools import wraps

from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseForbidden
from rest_framework.permissions import BasePermission


class RoleBasedPermission(BasePermission):
    """
    Clase base para permisos basados en roles usando Groups de Django
    """

    required_groups = []  # Lista de grupos requeridos
    required_permissions = []  # Lista de permisos específicos requeridos

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        # Si es superuser, siempre tiene acceso
        if request.user.is_superuser:
            return True

        # Verificar grupos requeridos
        if self.required_groups:
            user_groups = request.user.groups.values_list("name", flat=True)
            if not any(group in user_groups for group in self.required_groups):
                return False

        # Verificar permisos específicos
        if self.required_permissions:
            if not request.user.has_perms(self.required_permissions):
                return False

        return True


class IsVendedor(RoleBasedPermission):
    """Permiso para vendedores: Solo usuarios del grupo Vendedor"""

    required_groups = ["Vendedor"]


class IsComprador(RoleBasedPermission):
    """Permiso para compradores: Solo usuarios del grupo Comprador"""

    required_groups = ["Comprador"]


class IsAdminNegocio(RoleBasedPermission):
    """Permiso para administradores de negocio: Solo usuarios del grupo Admin_Negocio"""

    required_groups = ["Admin_Negocio"]


class IsMonitor(RoleBasedPermission):
    """Permiso para monitores: Solo usuarios del grupo Monitor"""

    required_groups = ["Monitor"]


class IsVendedorOrReadOnly(RoleBasedPermission):
    """
    Permisos mixtos:
    - Vendedores pueden leer y escribir
    - Otros usuarios solo pueden leer
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        # Lectura permitida para usuarios autenticados
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Escritura solo para vendedores o superusers
        if request.user.is_superuser:
            return True

        return request.user.groups.filter(name="Vendedor").exists()


class IsOwnerOrReadOnly(BasePermission):
    """
    Permisos de propietario:
    - Solo el propietario puede modificar/eliminar
    - Otros pueden solo leer
    - Admins pueden hacer todo
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para usuarios autenticados
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Superusers y admins de negocio pueden hacer todo
        if (
            request.user.is_superuser
            or request.user.groups.filter(name="Admin_Negocio").exists()
        ):
            return True

        # Permisos de escritura solo para el propietario
        if hasattr(obj, "id_usuario"):
            return obj.id_usuario.id_usuario == request.user.id

        return False


class ArticuloPermissions(RoleBasedPermission):
    """
    Permisos específicos para artículos:
    - Crear: Solo vendedores
    - Leer: Todos los autenticados
    - Actualizar/Eliminar: Solo el vendedor propietario o admins
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        # Para crear artículos, debe ser vendedor
        if request.method == "POST":
            return (
                request.user.is_superuser
                or request.user.groups.filter(name="Vendedor").exists()
            )

        # Para leer, cualquier usuario autenticado
        return True

    def has_object_permission(self, request, view, obj):
        # Lectura permitida para todos los autenticados
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Superusers y admins de negocio pueden hacer todo
        if (
            request.user.is_superuser
            or request.user.groups.filter(name="Admin_Negocio").exists()
        ):
            return True

        # Modificación/eliminación solo para el propietario vendedor
        if request.method in ["PUT", "PATCH", "DELETE"]:
            return obj.id_usuario.id_usuario == request.user.id

        return False


class TransaccionPermissions(RoleBasedPermission):
    """
    Permisos para transacciones:
    - Crear: Solo compradores
    - Ver: Solo el usuario involucrado en la transacción, admins o monitores
    - Modificar: Reglas específicas según estado y rol
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        # Para crear transacciones, debe ser comprador
        if request.method == "POST":
            return (
                request.user.is_superuser
                or request.user.groups.filter(name="Comprador").exists()
            )

        # Admins y monitores pueden ver todas las transacciones
        if (
            request.user.is_superuser
            or request.user.groups.filter(
                name__in=["Admin_Negocio", "Monitor"]
            ).exists()
        ):
            return True

        return True

    def has_object_permission(self, request, view, obj):
        # Superusers, admins y monitores pueden ver todas las transacciones
        if (
            request.user.is_superuser
            or request.user.groups.filter(
                name__in=["Admin_Negocio", "Monitor"]
            ).exists()
        ):
            return True

        # Los usuarios solo pueden ver sus propias transacciones
        return obj.usuario.id_usuario == request.user.id


class AdminPermissions(RoleBasedPermission):
    """
    Permisos administrativos:
    Solo usuarios con permisos especiales pueden acceder
    """

    required_groups = ["Admin_Negocio"]

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        return (
            request.user.is_superuser
            or request.user.groups.filter(name="Admin_Negocio").exists()
        )


class MonitorPermissions(RoleBasedPermission):
    """
    Permisos de solo lectura para monitores:
    Pueden ver datos pero no modificar nada
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        # Solo permiten operaciones de lectura
        if request.method not in ["GET", "HEAD", "OPTIONS"]:
            return False

        return (
            request.user.is_superuser
            or request.user.groups.filter(
                name__in=["Monitor", "Admin_Negocio"]
            ).exists()
        )


# Utilidades para verificar roles usando Groups
def user_has_group(user, group_name):
    """
    Función utilitaria para verificar si un usuario pertenece a un grupo específico
    """
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    return user.groups.filter(name=group_name).exists()


def get_user_groups(user):
    """
    Obtener todos los grupos de un usuario
    """
    if not user or not user.is_authenticated:
        return []

    return list(user.groups.values_list("name", flat=True))


def get_user_role_info(user):
    """
    Obtener información completa de roles y permisos del usuario
    """
    if not user or not user.is_authenticated:
        return {
            "groups": [],
            "permissions": [],
            "is_superuser": False,
            "is_staff": False,
        }

    return {
        "groups": list(user.groups.values_list("name", flat=True)),
        "permissions": list(user.get_all_permissions()),
        "is_superuser": user.is_superuser,
        "is_staff": user.is_staff,
    }


# Decoradores para views basadas en función
def group_required(*group_names):
    """
    Decorador para requerir uno o más grupos específicos
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return HttpResponseForbidden("Autenticación requerida")

            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)

            user_groups = request.user.groups.values_list("name", flat=True)
            if not any(group in user_groups for group in group_names):
                return HttpResponseForbidden(
                    f"Acceso denegado: Se requiere uno de estos roles: {', '.join(group_names)}"
                )

            return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator


def vendedor_required(view_func):
    """Decorador para requerir rol de vendedor"""
    return group_required("Vendedor")(view_func)


def comprador_required(view_func):
    """Decorador para requerir rol de comprador"""
    return group_required("Comprador")(view_func)


def admin_required(view_func):
    """Decorador para requerir rol de administrador"""
    return group_required("Admin_Negocio")(view_func)


def monitor_required(view_func):
    """Decorador para requerir rol de monitor"""
    return group_required("Monitor", "Admin_Negocio")(view_func)


# Mixins para ViewSets
class RoleBasedViewMixin:
    """
    Mixin para facilitar el uso de permisos basados en roles en ViewSets
    """

    def get_role_permissions(self):
        """
        Sobrescribir este método para definir permisos específicos por acción
        """
        return {}

    def get_permissions(self):
        """
        Obtener permisos basados en la acción y el rol
        """
        role_permissions = self.get_role_permissions()

        if self.action in role_permissions:
            permission_classes = role_permissions[self.action]
        else:
            permission_classes = getattr(self, "permission_classes", [])

        return [permission() for permission in permission_classes]


# Constantes para facilitar el uso
ROLE_GROUPS = {
    "VENDEDOR": "Vendedor",
    "COMPRADOR": "Comprador",
    "ADMIN_NEGOCIO": "Admin_Negocio",
    "MONITOR": "Monitor",
}

ROLE_PERMISSIONS = {
    "VIEW_OWN_TRANSACTIONS": "udeneyv1.view_own_transacciones",
    "VIEW_ALL_TRANSACTIONS": "udeneyv1.view_all_transacciones",
    "MANAGE_USERS": "udeneyv1.manage_user_status",
    "VIEW_REPORTS": "udeneyv1.view_reports",
    "VIEW_AUDIT_LOGS": "udeneyv1.view_audit_logs",
}
