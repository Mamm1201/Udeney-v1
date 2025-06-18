# ====================================
# IMPORTACIONES NECESARIAS
# ====================================

# Django
from django.shortcuts import render
from django.utils.dateparse import parse_date
from django.utils import timezone

# Django Rest Framework
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.authentication import JWTAuthentication


# JWT
from rest_framework_simplejwt.tokens import RefreshToken

# Filtros
from django_filters.rest_framework import DjangoFilterBackend

# Modelos
from .models import (
    Usuarios, Articulos, Categorias, Roles, UsuarioRol,
    DetalleTransaccion, Transacciones, Calificaciones, Pagos, Pqrs,
    ArticuloDetalleTransaccion
)

# Serializadores
from .serializers import (
    UsuariosSerializer, ArticulosSerializer, CategoriasSerializer,
    RolesSerializer, UsuarioRolSerializer, DetalleTransaccionSerializer,
    TransaccionesSerializer, CalificacionesSerializer, PagosSerializer,
    PqrsSerializer, DetalleTransaccionAnidadoSerializer, ResumenCompraSerializer
)

# ====================================
# AUTENTICACIÓN
# ====================================

class RegistroUsuarioView(APIView):
    """Registro de nuevos usuarios"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuariosSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Usuario registrado exitosamente",
                "user": {
                    "id_usuario": user.id_usuario,
                    "email_usuario": user.email_usuario,
                    "nombres_usuario": user.nombres_usuario,
                    "apellidos_usuario": user.apellidos_usuario,
                },
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Login de usuarios registrados"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Debe ingresar correo y contraseña"}, status=400)

        try:
            user = Usuarios.objects.get(email_usuario=email)
        except Usuarios.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        if not user.is_active:
            return Response({"error": "Cuenta desactivada. Contacta al administrador."}, status=403)

        if not user.check_password(password):
            return Response({"error": "Correo o contraseña incorrectos"}, status=401)

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": f"Bienvenido {user.nombres_usuario}",
            "id_usuario": user.id_usuario,
            "email": user.email_usuario,
            "nombres_usuario": user.nombres_usuario,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
        })


class LogoutView(APIView):
    """Cierre de sesión"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Sesión cerrada exitosamente"})


# ====================================
# CRUD GENERAL
# ====================================

class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer


class ArticulosViewSet(viewsets.ModelViewSet):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['id_categoria']


class ArticuloDetailAPIView(RetrieveAPIView):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer
    lookup_field = "id_articulo"


class CategoriasViewSet(viewsets.ModelViewSet):
    queryset = Categorias.objects.all()
    serializer_class = CategoriasSerializer


class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer


class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer


class DetalleTransaccionViewSet(viewsets.ModelViewSet):
    queryset = DetalleTransaccion.objects.all()
    serializer_class = DetalleTransaccionSerializer


class TransaccionesViewSet(viewsets.ModelViewSet):
    queryset = Transacciones.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            from .serializers import TransaccionConDetalleSerializer
            return TransaccionConDetalleSerializer
        return TransaccionesSerializer


class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer


class PagosViewSet(viewsets.ModelViewSet):
    queryset = Pagos.objects.all()
    serializer_class = PagosSerializer

    def create(self, request, *args, **kwargs):
        if not request.data.get("id_detalle_transaccion"):
            return Response(
                {"error": "El campo 'id_detalle_transaccion' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PqrsViewSet(viewsets.ModelViewSet):
    queryset = Pqrs.objects.all()
    serializer_class = PqrsSerializer


# ====================================
# CREAR TRANSACCIÓN CON DETALLES
# ====================================

@api_view(["POST"])
def crear_con_detalles(request):
    """
    Crea una transacción, su detalle y asigna artículos vendidos o comprados.
    """
    try:
        data = request.data
        id_usuario = data.get("id_usuario")
        tipo_transaccion = data.get("tipo_transaccion")
        tipo_entrega = data.get("tipo_entrega")
        articulos = data.get("articulos", [])

        # Validaciones básicas
        if not id_usuario or not tipo_transaccion or not tipo_entrega or not articulos:
            return Response(
                {"error": "Datos incompletos"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            usuario = Usuarios.objects.get(id_usuario=id_usuario)
        except Usuarios.DoesNotExist:
            return Response(
                {"error": "Usuario no registrado"}, status=status.HTTP_404_NOT_FOUND
            )

        # Crear la transacción base
        transaccion = Transacciones.objects.create(id_usuario=usuario)

        # Crear el detalle de transacción
        detalle = DetalleTransaccion.objects.create(
            id_transaccion=transaccion,
            tipo_transaccion=tipo_transaccion,
            tipo_entrega=tipo_entrega,
            cantidad_articulos=len(articulos),
        )

        # Asociar cada artículo con la transacción
        for art in articulos:
            id_articulo = art.get("id_articulo")
            cantidad = art.get("cantidad", 1)

            try:
                articulo = Articulos.objects.get(id_articulo=id_articulo)
            except Articulos.DoesNotExist:
                return Response(
                    {"error": f"Artículo con ID {id_articulo} no existe"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            ArticuloDetalleTransaccion.objects.create(
                id_detalle_transaccion=detalle,
                id_articulo=articulo,
                cantidad=cantidad,
            )

        return Response({
            "message": "Transacción registrada correctamente",
            "id_transaccion": transaccion.id_transaccion
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# ====================================
# HISTORIAL DE TRANSACCIONES
# ====================================

@api_view(["GET"])
def historial_transacciones_api(request):
    """Historial de compras y ventas por usuario y fechas opcionales."""
    id_usuario = request.query_params.get("id_usuario")
    if not id_usuario:
        return Response({"error": "ID de usuario obligatorio"}, status=400)

    try:
        id_usuario = int(id_usuario)
    except ValueError:
        return Response({"error": "ID inválido"}, status=400)

    fecha_inicio = parse_date(request.query_params.get("fecha_inicio")) if request.query_params.get("fecha_inicio") else None
    fecha_fin = parse_date(request.query_params.get("fecha_fin")) if request.query_params.get("fecha_fin") else None

    compras = Transacciones.objects.filter(
        id_usuario_id=id_usuario,
        detalletransaccion__tipo_transaccion="compra"
    )
    ventas = Transacciones.objects.filter(
        detalletransaccion__id_articulo__id_usuario=id_usuario,
        detalletransaccion__tipo_transaccion="venta"
    )

    if fecha_inicio:
        compras = compras.filter(fecha_transaccion__gte=fecha_inicio)
        ventas = ventas.filter(fecha_transaccion__gte=fecha_inicio)
    if fecha_fin:
        compras = compras.filter(fecha_transaccion__lte=fecha_fin)
        ventas = ventas.filter(fecha_transaccion__lte=fecha_fin)

    compras_data = list(compras.values("id_transaccion", "fecha_transaccion"))
    ventas_data = list(ventas.values("id_transaccion", "fecha_transaccion"))

    return Response({"compras": compras_data, "ventas": ventas_data})


# ====================================
#         RESUMEN COMPRA
# ====================================

class ResumenCompraAPIView(APIView):
    """Devuelve el detalle completo de una transacción por su ID"""

    def get(self, request, id_transaccion):
        try:
            # Obtener el detalle de la transacción
            detalle = DetalleTransaccion.objects.get(id_transaccion_id=id_transaccion)
            transaccion = detalle.id_transaccion  # acceso directo a la transacción

            # Obtener todos los artículos asociados
            articulos_relacionados = ArticuloDetalleTransaccion.objects.filter(id_detalle_transaccion=detalle)

            articulos_data = []
            total = 0

            for item in articulos_relacionados:
                articulo = item.id_articulo
                cantidad = item.cantidad
                subtotal = articulo.precio_articulo * cantidad
                total += subtotal

                articulos_data.append({
                    "id_articulo": articulo.id_articulo,
                    "titulo_articulo": articulo.titulo_articulo,
                    "precio_unitario": articulo.precio_articulo,
                    "cantidad": cantidad,
                    "subtotal": subtotal,
                    "imagen": articulo.imagen.url if articulo.imagen else None
                })

            # Construir la respuesta completa
            resumen = {
                "id_transaccion": transaccion.id_transaccion,
                "fecha_transaccion": transaccion.fecha_transaccion,
                "tipo_transaccion": detalle.tipo_transaccion,
                "tipo_entrega": detalle.tipo_entrega,
                "cantidad_articulos": detalle.cantidad_articulos,
                "articulos": articulos_data,
                "total": total
            }

            return Response(resumen, status=status.HTTP_200_OK)

        except DetalleTransaccion.DoesNotExist:
            return Response({"error": "Detalle no encontrado."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        
# ====================================
#          MIS TRANSACCIONES
# ====================================        
class MisTransaccionesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 🔐 Extraer manualmente el usuario desde el token
        jwt_authenticator = JWTAuthentication()
        validated_token = jwt_authenticator.get_validated_token(request.headers.get('Authorization').split(' ')[1])
        user_id = validated_token.get('user_id')

        try:
            usuario = Usuarios.objects.get(id_usuario=user_id)
        except Usuarios.DoesNotExist:
            return Response({"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        resumen = []
        transacciones = Transacciones.objects.filter(id_usuario=usuario)

        for transaccion in transacciones:
            try:
                detalle = DetalleTransaccion.objects.get(id_transaccion=transaccion)
                articulos_detalle = ArticuloDetalleTransaccion.objects.filter(id_detalle_transaccion=detalle)

                articulos_data = []
                total = 0

                for item in articulos_detalle:
                    articulo = item.id_articulo
                    cantidad = item.cantidad
                    subtotal = articulo.precio_articulo * cantidad
                    total += subtotal

                    articulos_data.append({
                        "titulo_articulo": articulo.titulo_articulo,
                        "precio_unitario": articulo.precio_articulo,
                        "cantidad": cantidad,
                        "subtotal": subtotal,
                        "imagen": articulo.imagen.url if articulo.imagen else None,
                    })

                resumen.append({
                    "id_transaccion": transaccion.id_transaccion,
                    "fecha_transaccion": transaccion.fecha_transaccion,
                    "tipo_transaccion": detalle.tipo_transaccion,
                    "tipo_entrega": detalle.tipo_entrega,
                    "cantidad_articulos": detalle.cantidad_articulos or sum(item["cantidad"] for item in articulos_data),
                    "articulos": articulos_data,
                    "total": total,
                })
            except DetalleTransaccion.DoesNotExist:
                continue

        return Response(resumen, status=status.HTTP_200_OK)
















