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

# JWT
from rest_framework_simplejwt.tokens import RefreshToken

# Filtros y funciones ORM
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear

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
    PqrsSerializer, DetalleTransaccionAnidadoSerializer
)

# ====================================
# AUTENTICACIÓN
# ====================================

class RegistroUsuarioView(APIView):
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
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Debe ingresar correo y contraseña"}, status=400)

        try:
            user = Usuarios.objects.get(email_usuario=email)
        except Usuarios.DoesNotExist as e:
            return Response({"error": f"Usuario no encontrado: {str(e)}"}, status=404)

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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Sesión cerrada exitosamente"})


# ====================================
# HISTORIAL DE TRANSACCIONES
# ====================================

@api_view(["GET"])
def historial_transacciones_api(request):
    id_usuario = request.query_params.get("id_usuario")
    if not id_usuario:
        return Response({"error": "ID de usuario obligatorio"}, status=400)
    try:
        id_usuario = int(id_usuario)
    except ValueError:
        return Response({"error": "ID de usuario inválido"}, status=400)

    fecha_inicio = parse_date(request.query_params.get("fecha_inicio")) if request.query_params.get("fecha_inicio") else None
    fecha_fin = parse_date(request.query_params.get("fecha_fin")) if request.query_params.get("fecha_fin") else None

    compras = Transacciones.objects.filter(
        id_usuario=id_usuario,
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
    class Meta:  # se añadio esto
        model = Transacciones   # se añadio esto
        fields = '__all__'    # se añadio esto
    queryset = Transacciones.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            from .serializers import TransaccionConDetalleSerializer
            return TransaccionConDetalleSerializer
        return TransaccionesSerializer    



@api_view(["POST"])
def crear_con_detalles(request):
    """
    Crea una transacción con su detalle y artículos.
    """
    try:
        id_usuario = request.data.get("id_usuario")
        tipo_transaccion = request.data.get("tipo_transaccion")
        tipo_entrega = request.data.get("tipo_entrega")
        articulos = request.data.get("articulos", [])

        transaccion = Transacciones.objects.create(
            id_usuario_id=id_usuario,
            fecha_transaccion=timezone.now()
        )

        detalle = DetalleTransaccion.objects.create(
            id_transaccion=transaccion,
            tipo_transaccion=tipo_transaccion,
            tipo_entrega=tipo_entrega
        )

        for art in articulos:
            try:
                articulo = Articulos.objects.get(id_articulo=art["id_articulo"])
            except Articulos.DoesNotExist:
                return Response(
                    {"error": f"Artículo con id {art['id_articulo']} no existe."},
                    status=400
                )

            ArticuloDetalleTransaccion.objects.create(
                id_detalle_transaccion=detalle,
                id_articulo=articulo,
                cantidad=art["cantidad"]
            )

        return Response({
            "message": "Transacción creada exitosamente",
            "id_transaccion": transaccion.id_transaccion
        }, status=201)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer


class PagosViewSet(viewsets.ModelViewSet):
    queryset = Pagos.objects.all()
    serializer_class = PagosSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        if not data.get("id_detalle_transaccion"):
            return Response(
                {"error": "El campo 'id_detalle_transaccion' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PqrsViewSet(viewsets.ModelViewSet):
    queryset = Pqrs.objects.all()
    serializer_class = PqrsSerializer


# ====================================
# RESUMEN DE COMPRA (ARTÍCULOS + DETALLE)
# ====================================

class ResumenCompraAPIView(APIView):
    """
    Devuelve el resumen de una compra específica por ID de transacción,
    incluyendo detalle de transacción y artículos asociados.
    """
    def get(self, request, id_transaccion):
        try:
            detalle = DetalleTransaccion.objects.get(id_transaccion_id=id_transaccion)
            serializer = DetalleTransaccionAnidadoSerializer(detalle)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DetalleTransaccion.DoesNotExist:
            return Response({"error": "Detalle de transacción no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
# ====================================
# MIS TRANSACCIONES (Autenticado)
# ====================================

class MisTransaccionesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        tipo = request.query_params.get("tipo")
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        compras = Transacciones.objects.filter(
            id_usuario=user,
            detalletransaccion__tipo_transaccion="compra"
        )

        ventas = Transacciones.objects.filter(
            detalletransaccion__id_articulo__id_usuario=user,
            detalletransaccion__tipo_transaccion="venta"
        )

        if fecha_inicio:
            compras = compras.filter(fecha_transaccion__gte=fecha_inicio)
            ventas = ventas.filter(fecha_transaccion__gte=fecha_inicio)
        if fecha_fin:
            compras = compras.filter(fecha_transaccion__lte=fecha_fin)
            ventas = ventas.filter(fecha_transaccion__lte=fecha_fin)

        if tipo == "compra":
            transacciones = compras
        elif tipo == "venta":
            transacciones = ventas
        else:
            transacciones = compras.union(ventas).distinct().order_by("-fecha_transaccion")

        data = transacciones.values("id_transaccion", "fecha_transaccion")

        return Response(data, status=200)




