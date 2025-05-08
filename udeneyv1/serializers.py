from rest_framework import serializers
from .models import (
    Usuarios,
    Articulos,
    Categorias,
    Roles,
    UsuarioRol,
    DetalleTransaccion,
    Transacciones,
    Calificaciones,
    Pagos,
    Pqrs,
)


# SERIALIZADOR DE USUARIOS
class UsuariosSerializer(serializers.ModelSerializer):
    password_usuario = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuarios
        fields = [
            'id_usuario',
            'nombres_usuario',
            'apellidos_usuario',
            'email_usuario',
            'telefono_usuario',
            'direccion_usuario',
            'password_usuario'
        ]

    def create(self, validated_data):
        # Crea un usuario con la contraseña encriptada
        user = Usuarios(
            nombres_usuario=validated_data['nombres_usuario'],
            apellidos_usuario=validated_data['apellidos_usuario'],
            email_usuario=validated_data['email_usuario'],
            telefono_usuario=validated_data['telefono_usuario'],
            direccion_usuario=validated_data['direccion_usuario']
        )
        # Encripta la contraseña
        user.set_password(validated_data['password_usuario'])
        user.save()
        return user

    def update(self, instance, validated_data):
        # Actualiza campos, pero solo cambia contraseña si se envía
        for attr, value in validated_data.items():
            if attr == "password_usuario":
                instance.set_password(value)  # encripta si la envían
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance


# SERIALIZADOR DE ROLES
class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = "__all__"  # o especifica los campos que quieras


# SERIALIZADOR DE USUARIO_ROL
class UsuarioRolSerializer(serializers.ModelSerializer):
    # Mostrar "Vendedor" o "Comprador"
    id_rol = serializers.ChoiceField(choices=UsuarioRol.ROL_CHOICES)

    id_usuario = serializers.SlugRelatedField(
        queryset=Usuarios.objects.all(),
        slug_field='nombres_usuario'  # Muestra el nombre del usuario en lugar del ID
    )

    class Meta:
        model = UsuarioRol
        fields = ['id_usuario_rol', 'id_usuario', 'id_rol']


# SERIALIZADOR DE CATEGORIAS
class CategoriasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorias
        fields = "__all__"  # o especifica los campos que quieras


# SERIALIZADOR DE ARTICULOS
class ArticulosSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(use_url=True)

    class Meta:
        model = Articulos
        fields = "__all__"


# SERIALIZADOR DETALLE_TRANSACCION
class DetalleTransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleTransaccion
        fields = "__all__"


# SERIALIZADOR TRANSACCIONES
class TransaccionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transacciones
        fields = "__all__"


# SERIALIZADOR CALIFICACIONES
class CalificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificaciones
        fields = "__all__"


# SERIALIZADOR PAGOS
class PagosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagos
        fields = "__all__"


# SERIALIZADOR PQRS
class PqrsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pqrs
        fields = "__all__"





