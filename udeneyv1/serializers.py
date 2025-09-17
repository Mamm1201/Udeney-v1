# ====================================
# IMPORTACIONES NECESARIAS
# ====================================
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (ArticuloDetalleTransaccion, Articulos, Calificaciones, Categorias,
                     DetalleTransaccion, Pagos, Pqrs, Reportes, Roles, Transacciones, UsuarioRol,
                     Usuarios)


# ====================================
# SERIALIZADOR DE USUARIOS
# ====================================
class UsuariosSerializer(serializers.ModelSerializer):
    password_usuario = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuarios
        fields = [
            "id_usuario",
            "nombres_usuario",
            "apellidos_usuario",
            "email_usuario",
            "telefono_usuario",
            "direccion_usuario",
            "password_usuario",
        ]

    def create(self, validated_data):
        user = Usuarios(
            nombres_usuario=validated_data["nombres_usuario"],
            apellidos_usuario=validated_data["apellidos_usuario"],
            email_usuario=validated_data["email_usuario"],
            telefono_usuario=validated_data["telefono_usuario"],
            direccion_usuario=validated_data["direccion_usuario"],
        )
        user.set_password(validated_data["password_usuario"])
        user.save()
        return user

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == "password_usuario":
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance


# ====================================
# SERIALIZADOR DE ROLES
# ====================================
class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = "__all__"


# ====================================
# SERIALIZADOR DE USUARIO_ROL
# ====================================
class UsuarioRolSerializer(serializers.ModelSerializer):
    id_rol = serializers.ChoiceField(choices=UsuarioRol.ROL_CHOICES)
    id_usuario = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field="username",
    )

    class Meta:
        model = UsuarioRol
        fields = ["id_usuario_rol", "id_usuario", "id_rol"]


# ====================================
# SERIALIZADOR DE CATEGORÍAS
# ====================================
class CategoriasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorias
        fields = "__all__"


# ====================================
# SERIALIZADOR DE ARTÍCULOS
# ====================================
class ArticulosSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(use_url=True, required=False)
    id_usuario = serializers.PrimaryKeyRelatedField(read_only=True)
    id_categoria = serializers.PrimaryKeyRelatedField(queryset=Categorias.objects.all())

    class Meta:
        model = Articulos
        fields = "__all__"
        read_only_fields = ["disponible", "id_usuario"]

    def create(self, validated_data):
        validated_data["disponible"] = True
        return super().create(validated_data)


# ====================================
# SERIALIZADOR DE DETALLE TRANSACCIÓN
# ====================================
class DetalleTransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleTransaccion
        fields = "__all__"


# ====================================
# SERIALIZADOR DE ARTÍCULO DETALLE TRANSACCIÓN
# ====================================
class ArticuloDetalleTransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticuloDetalleTransaccion
        fields = "__all__"


# ====================================
# SERIALIZADOR ANIDADO DE ARTÍCULOS EN DETALLE TRANSACCIÓN
# ====================================
class ArticuloDetalleTransaccionAnidadoSerializer(serializers.ModelSerializer):
    titulo_articulo = serializers.CharField(source="id_articulo.titulo_articulo")
    precio_articulo = serializers.DecimalField(
        source="id_articulo.precio_articulo", max_digits=10, decimal_places=2
    )
    imagen_articulo = serializers.SerializerMethodField()

    class Meta:
        model = ArticuloDetalleTransaccion
        fields = ["titulo_articulo", "cantidad", "precio_articulo", "imagen_articulo"]

    def get_imagen_articulo(self, obj):
        if obj.id_articulo.imagen:
            return obj.id_articulo.imagen.url
        return None


# ====================================
# SERIALIZADOR ANIDADO DE DETALLE TRANSACCIÓN CON ARTÍCULOS
# ====================================
class DetalleTransaccionAnidadoSerializer(serializers.ModelSerializer):
    articulos = serializers.SerializerMethodField()

    class Meta:
        model = DetalleTransaccion
        fields = ["tipo_transaccion", "tipo_entrega", "articulos"]

    def get_articulos(self, detalle):
        articulos = ArticuloDetalleTransaccion.objects.filter(
            id_detalle_transaccion=detalle
        )
        return ArticuloDetalleTransaccionAnidadoSerializer(articulos, many=True).data


# ====================================
# SERIALIZADOR DE TRANSACCIÓN CON DETALLES COMPLETOS
# ====================================
class TransaccionConDetalleSerializer(serializers.ModelSerializer):
    detalle = serializers.SerializerMethodField()

    class Meta:
        model = Transacciones
        fields = ["id_transaccion", "fecha_transaccion", "id_usuario", "detalle"]

    def get_detalle(self, transaccion):
        try:
            detalle = DetalleTransaccion.objects.get(id_transaccion=transaccion)
            return DetalleTransaccionAnidadoSerializer(detalle).data
        except DetalleTransaccion.DoesNotExist:
            return None


# ====================================
# SERIALIZADOR BÁSICO DE TRANSACCIONES
# ====================================
class TransaccionesSerializer(serializers.ModelSerializer):
    id_detalle_transaccion = serializers.PrimaryKeyRelatedField(read_only=True)
    detalle_transaccion_data = DetalleTransaccionSerializer(
        source="id_detalle_transaccion", read_only=True
    )

    class Meta:
        model = Transacciones
        fields = "__all__"
        extra_fields = ["detalle_transaccion_data"]
        depth = 0


# ====================================
# SERIALIZADOR DE CALIFICACIONES
# ====================================
class CalificacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificaciones
        fields = "__all__"
        extra_kwargs = {
            "comentario": {
                "required": False,
                "allow_null": True,
                "allow_blank": True,
            }
        }


# ====================================
# SERIALIZADOR DE PAGOS
# ====================================
class PagosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagos
        fields = "__all__"


# ====================================
# SERIALIZADOR DE PQRS
# ====================================
class PqrsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pqrs
        fields = "__all__"


class ReportesSerializer(serializers.ModelSerializer):
    reportado_por_nombre = serializers.SerializerMethodField()
    resuelto_por_nombre = serializers.SerializerMethodField()
    contenido_info = serializers.SerializerMethodField()

    class Meta:
        model = Reportes
        fields = "__all__"

    def get_reportado_por_nombre(self, obj):
        if obj.reportado_por:
            return f"{obj.reportado_por.nombres_usuario} {obj.reportado_por.apellidos_usuario}"
        return "Usuario desconocido"

    def get_resuelto_por_nombre(self, obj):
        if obj.resuelto_por:
            return f"{obj.resuelto_por.nombres_usuario} {obj.resuelto_por.apellidos_usuario}"
        return None

    def get_contenido_info(self, obj):
        contenido = obj.get_contenido_reportado()
        if contenido:
            if obj.tipo_contenido == "articulo":
                return {
                    "titulo": contenido.titulo_articulo,
                    "descripcion": contenido.descripcion_articulo[:100] + "...",
                    "precio": contenido.precio_articulo
                }
            elif obj.tipo_contenido == "usuario":
                return {
                    "nombre": f"{contenido.nombres_usuario} {contenido.apellidos_usuario}",
                    "email": contenido.email_usuario
                }
        return None


# ====================================
# SERIALIZADOR DE RESUMEN COMPRA
# ====================================
class ResumenCompraSerializer(serializers.Serializer):
    id_transaccion = serializers.IntegerField()
    fecha_transaccion = serializers.DateTimeField()
    tipo_transaccion = serializers.CharField()
    tipo_entrega = serializers.CharField()
    cantidad_articulos = serializers.IntegerField()
    articulos = ArticuloDetalleTransaccionAnidadoSerializer(many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)


# ====================================
# SERIALIZADOR DE MIS TRANSACCIONES
# ====================================
class TransaccionesUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transacciones
        fields = ["id_transaccion", "fecha_transaccion", "usuario"]
