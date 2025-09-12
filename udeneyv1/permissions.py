"""
Sistema de permisos personalizado para Eduney
Basado en los roles: vendedor y comprador
"""
from rest_framework.permissions import BasePermission
from django.core.exceptions import ObjectDoesNotExist
from .models import UsuarioRol, Articulos


class IsAuthenticated(BasePermission):
    """
    Permiso básico: Usuario debe estar autenticado
    """
    def has_permission(self, request, view):
        return bool(request.user and hasattr(request.user, 'id_usuario'))


class IsVendedor(BasePermission):
    """
    Permiso para vendedores: Solo usuarios con rol de vendedor
    """
    def has_permission(self, request, view):
        if not (request.user and hasattr(request.user, 'id_usuario')):
            return False
            
        try:
            UsuarioRol.objects.get(id_usuario=request.user, id_rol='vendedor')
            return True
        except ObjectDoesNotExist:
            return False


class IsComprador(BasePermission):
    """
    Permiso para compradores: Solo usuarios con rol de comprador
    """
    def has_permission(self, request, view):
        if not (request.user and hasattr(request.user, 'id_usuario')):
            return False
            
        try:
            UsuarioRol.objects.get(id_usuario=request.user, id_rol='comprador')
            return True
        except ObjectDoesNotExist:
            return False


class IsVendedorOrReadOnly(BasePermission):
    """
    Permisos mixtos: 
    - Vendedores pueden leer y escribir
    - Otros usuarios solo pueden leer
    """
    def has_permission(self, request, view):
        # Lectura permitida para usuarios autenticados
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return bool(request.user and hasattr(request.user, 'id_usuario'))
        
        # Escritura solo para vendedores
        if not (request.user and hasattr(request.user, 'id_usuario')):
            return False
            
        try:
            UsuarioRol.objects.get(id_usuario=request.user, id_rol='vendedor')
            return True
        except ObjectDoesNotExist:
            return False


class IsOwnerOrReadOnly(BasePermission):
    """
    Permisos de propietario:
    - Solo el propietario puede modificar/eliminar
    - Otros pueden solo leer
    """
    def has_permission(self, request, view):
        # Permitir acceso básico a usuarios autenticados
        return bool(request.user and hasattr(request.user, 'id_usuario'))
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para usuarios autenticados
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Permisos de escritura solo para el propietario
        if hasattr(obj, 'id_usuario'):
            return obj.id_usuario == request.user
        
        return False


class ArticuloPermissions(BasePermission):
    """
    Permisos específicos para artículos:
    - Crear: Solo vendedores
    - Leer: Todos los autenticados  
    - Actualizar/Eliminar: Solo el vendedor propietario
    """
    def has_permission(self, request, view):
        # Debe estar autenticado
        if not (request.user and hasattr(request.user, 'id_usuario')):
            return False
        
        # Para crear artículos, debe ser vendedor
        if request.method == 'POST':
            try:
                UsuarioRol.objects.get(id_usuario=request.user, id_rol='vendedor')
                return True
            except ObjectDoesNotExist:
                return False
        
        # Para leer, cualquier usuario autenticado
        return True
    
    def has_object_permission(self, request, view, obj):
        # Lectura permitida para todos los autenticados
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Modificación/eliminación solo para el propietario vendedor
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return obj.id_usuario == request.user
        
        return False


class TransaccionPermissions(BasePermission):
    """
    Permisos para transacciones:
    - Crear: Solo compradores
    - Ver: Solo el usuario involucrado en la transacción
    - Modificar: Reglas específicas según estado
    """
    def has_permission(self, request, view):
        # Debe estar autenticado
        if not (request.user and hasattr(request.user, 'id_usuario')):
            return False
        
        # Para crear transacciones, debe ser comprador
        if request.method == 'POST':
            try:
                UsuarioRol.objects.get(id_usuario=request.user, id_rol='comprador')
                return True
            except ObjectDoesNotExist:
                return False
        
        return True
    
    def has_object_permission(self, request, view, obj):
        # Solo el usuario de la transacción puede verla
        return obj.usuario == request.user


class AdminPermissions(BasePermission):
    """
    Permisos administrativos:
    Solo usuarios con permisos especiales pueden acceder
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            hasattr(request.user, 'id_usuario') and
            getattr(request.user, 'is_staff', False)
        )


# Utilidades para verificar roles
def user_has_role(user, role):
    """
    Función utilitaria para verificar si un usuario tiene un rol específico
    """
    if not user or not hasattr(user, 'id_usuario'):
        return False
    
    try:
        UsuarioRol.objects.get(id_usuario=user, id_rol=role)
        return True
    except ObjectDoesNotExist:
        return False


def get_user_roles(user):
    """
    Obtener todos los roles de un usuario
    """
    if not user or not hasattr(user, 'id_usuario'):
        return []
    
    roles = UsuarioRol.objects.filter(id_usuario=user).values_list('id_rol', flat=True)
    return list(roles)


# Decoradores para views basadas en función
def vendedor_required(view_func):
    """
    Decorador para requerir rol de vendedor
    """
    def _wrapped_view(request, *args, **kwargs):
        if not user_has_role(request.user, 'vendedor'):
            from django.http import HttpResponseForbidden
            return HttpResponseForbidden("Acceso denegado: Se requiere rol de vendedor")
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def comprador_required(view_func):
    """
    Decorador para requerir rol de comprador  
    """
    def _wrapped_view(request, *args, **kwargs):
        if not user_has_role(request.user, 'comprador'):
            from django.http import HttpResponseForbidden
            return HttpResponseForbidden("Acceso denegado: Se requiere rol de comprador")
        return view_func(request, *args, **kwargs)
    return _wrapped_view