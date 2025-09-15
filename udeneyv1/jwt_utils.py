"""
Utilidades para personalizar JWT tokens incluyendo información de roles y permisos
"""

from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions_new import get_user_role_info


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador personalizado para incluir información de roles en el token JWT
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregar información de roles y permisos al token
        role_info = get_user_role_info(user)

        # Información básica del usuario
        token["user_id"] = user.id
        token["username"] = user.username
        token["email"] = user.email
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name

        # Información de roles
        token["groups"] = role_info["groups"]
        token["is_superuser"] = role_info["is_superuser"]
        token["is_staff"] = role_info["is_staff"]

        # Permisos principales (limitados para no saturar el token)
        main_permissions = [
            perm
            for perm in role_info["permissions"]
            if "udeneyv1." in perm  # Solo permisos de nuestra app
        ]
        token["permissions"] = main_permissions[
            :10
        ]  # Limitar a 10 permisos principales

        return token


def get_tokens_for_user(user):
    """
    Función utilitaria para generar tokens personalizados para un usuario
    """
    refresh = RefreshToken.for_user(user)

    # Agregar información personalizada
    role_info = get_user_role_info(user)

    # Información básica del usuario
    refresh["user_id"] = user.id
    refresh["username"] = user.username
    refresh["email"] = user.email
    refresh["first_name"] = user.first_name
    refresh["last_name"] = user.last_name

    # Información de roles
    refresh["groups"] = role_info["groups"]
    refresh["is_superuser"] = role_info["is_superuser"]
    refresh["is_staff"] = role_info["is_staff"]

    # Permisos principales
    main_permissions = [
        perm for perm in role_info["permissions"] if "udeneyv1." in perm
    ]
    refresh["permissions"] = main_permissions[:10]

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def decode_user_info_from_token(token):
    """
    Decodifica información del usuario desde un token JWT
    """
    try:
        from django.conf import settings
        from jwt import decode as jwt_decode
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from rest_framework_simplejwt.tokens import UntypedToken

        # Verificar que el token es válido
        UntypedToken(token)

        # Decodificar el token
        decoded_token = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        return {
            "user_id": decoded_token.get("user_id"),
            "username": decoded_token.get("username"),
            "email": decoded_token.get("email"),
            "first_name": decoded_token.get("first_name"),
            "last_name": decoded_token.get("last_name"),
            "groups": decoded_token.get("groups", []),
            "permissions": decoded_token.get("permissions", []),
            "is_superuser": decoded_token.get("is_superuser", False),
            "is_staff": decoded_token.get("is_staff", False),
        }

    except (InvalidToken, TokenError, Exception):
        return None


def user_has_role_in_token(token, role_name):
    """
    Verifica si un usuario tiene un rol específico basado en el token JWT
    """
    user_info = decode_user_info_from_token(token)
    if not user_info:
        return False

    return role_name in user_info.get("groups", [])


def get_user_dashboard_route(user_groups):
    """
    Determina la ruta del dashboard basada en los grupos del usuario
    """
    # Prioridad de roles (el más importante primero)
    role_routes = {
        "Admin_Negocio": "/admin-dashboard",
        "Monitor": "/monitor-dashboard",
        "Vendedor": "/vendedor-dashboard",
        "Comprador": "/comprador-dashboard",
    }

    # Buscar el rol con mayor prioridad
    for role, route in role_routes.items():
        if role in user_groups:
            return route

    # Dashboard por defecto
    return "/dashboard"


def get_user_permissions_summary(user):
    """
    Obtiene un resumen de permisos del usuario para el frontend
    """
    if not user.is_authenticated:
        return {
            "can_view_transactions": False,
            "can_create_articles": False,
            "can_manage_users": False,
            "can_view_reports": False,
            "can_moderate_content": False,
            "dashboard_route": "/login",
        }

    groups = list(user.groups.values_list("name", flat=True))

    permissions_summary = {
        "can_view_transactions": (
            user.is_superuser
            or bool(set(groups) & {"Vendedor", "Comprador", "Admin_Negocio", "Monitor"})
        ),
        "can_create_articles": (user.is_superuser or "Vendedor" in groups),
        "can_manage_users": (user.is_superuser or "Admin_Negocio" in groups),
        "can_view_reports": (
            user.is_superuser or bool(set(groups) & {"Admin_Negocio", "Monitor"})
        ),
        "can_moderate_content": (user.is_superuser or "Admin_Negocio" in groups),
        "dashboard_route": get_user_dashboard_route(groups),
    }

    return permissions_summary
