# ====================================
# IMPORTACIONES NECESARIAS
# ====================================

# Django
from django.shortcuts import render
from django.utils.dateparse import parse_date

# Django Rest Framework
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view, action
from datetime import datetime
from django.utils import timezone


# Filtros
from django_filters.rest_framework import DjangoFilterBackend

# ORM y funciones de agrupación
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear

# Modelos del sistema
from .models import (
    Usuarios, Articulos, Categorias, Roles, UsuarioRol,
    DetalleTransaccion, Transacciones, Calificaciones, Pagos, Pqrs, ArticuloDetalleTransaccion
)

# Serializadores del sistema
from .serializers import (
    UsuariosSerializer, ArticulosSerializer, CategoriasSerializer,
    RolesSerializer, UsuarioRolSerializer, DetalleTransaccionSerializer,
    TransaccionesSerializer, CalificacionesSerializer, PagosSerializer, PqrsSerializer, ArticuloDetalleTransaccionSerializer
)

# JWT
from rest_framework_simplejwt.tokens import RefreshToken

# ====================================
# REGISTRO DE USUARIO
# ====================================
class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuariosSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Usuario registrado exitosamente",
                    "user": {
                        "id_usuario": user.id_usuario,
                        "email_usuario": user.email_usuario,
                        "nombres_usuario": user.nombres_usuario,
                        "apellidos_usuario": user.apellidos_usuario,
                    },
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ====================================
# LOGIN DE USUARIO
# ====================================
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
        return Response(
            {
                "message": f"Bienvenido {user.nombres_usuario}",
                "id_usuario": user.id_usuario,
                "email": user.email_usuario,
                "nombres_usuario": user.nombres_usuario,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            }
        )


# ====================================
# LOGOUT (SIMBÓLICO)
# ====================================
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Sesión cerrada exitosamente"})


# ====================================
# HISTORIAL DE TRANSACCIONES - API
# ====================================
@api_view(["GET"])
def historial_transacciones_api(request):
    id_usuario = request.query_params.get("id_usuario")
    if not id_usuario:
        return Response({"error": "Debe proporcionar el ID del usuario"}, status=400)

    # Se obtienen los parámetros de fecha como cadenas
    fecha_inicio_str = request.query_params.get("fecha_inicio")
    fecha_fin_str = request.query_params.get("fecha_fin")

    # Se convierten en fechas si están en formato válido, sino quedan como None
    fecha_inicio = parse_date(fecha_inicio_str) if isinstance(fecha_inicio_str, str) else None
    fecha_fin = parse_date(fecha_fin_str) if isinstance(fecha_fin_str, str) else None

    try:
        # ============================
        # COMPRAS (el usuario compra)
        # ============================
        compras = Transacciones.objects.filter(
            id_usuario=id_usuario,
            id_detalle_transaccion__tipo_transaccion="compra"
        )

        # ============================
        # VENTAS (el usuario vende)
        # ============================
        ventas = Transacciones.objects.filter(
            id_detalle_transaccion__id_articulo__id_usuario=id_usuario,
            id_detalle_transaccion__tipo_transaccion="venta"
        )

        # Filtro por fechas si se proporcionaron
        if fecha_inicio:
            compras = compras.filter(fecha_transaccion__gte=fecha_inicio)
            ventas = ventas.filter(fecha_transaccion__gte=fecha_inicio)
        if fecha_fin:
            compras = compras.filter(fecha_transaccion__lte=fecha_fin)
            ventas = ventas.filter(fecha_transaccion__lte=fecha_fin)

        # Agrupar por mes y año - compras
        compras_grouped = (
            compras.annotate(
                year=TruncYear("fecha_transaccion"),
                month=TruncMonth("fecha_transaccion")
            )
            .values("year", "month")
            .annotate(total_compras=Count("id_transaccion"))
            .order_by("year", "month")
        )

        # Agrupar por mes y año - ventas
        ventas_grouped = (
            ventas.annotate(
                year=TruncYear("fecha_transaccion"),
                month=TruncMonth("fecha_transaccion")
            )
            .values("year", "month")
            .annotate(total_ventas=Count("id_transaccion"))
            .order_by("year", "month")
        )

        # Retornar la respuesta en JSON
        return Response({
            "compras": list(compras_grouped),
            "ventas": list(ventas_grouped)
        })

    except Exception as e:
        # Captura errores generales del proceso
        return Response({"error": str(e)}, status=500)
    

# ====================================
# CRUD GENERAL PARA MODELOS DEL SISTEMA
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
    
# ====================================
# TRANSACCIONES - CREATE VALIDADO
# ====================================
class TransaccionesViewSet(viewsets.ModelViewSet):
    queryset = Transacciones.objects.all()
    serializer_class = TransaccionesSerializer

    # Vista personalizada para crear una transacción con varios artículos
@api_view(["POST"])
def crear_con_detalles(request):
    print(">>> ✅ LLEGÓ A LA VISTA crear_con_detalles CON MÉTODO:", request.method)
    
    try:
        print(">>> MÉTODO:", request.method)
        print(">>> request.data en crear_con_detalles:", request.data)

        id_usuario = request.data.get("id_usuario")
        tipo_transaccion = request.data.get("tipo_transaccion")
        tipo_entrega = request.data.get("tipo_entrega")
        articulos = request.data.get("articulos", [])

        # Crear la transacción principal
        transaccion = Transacciones.objects.create(
            id_usuario_id=id_usuario,
            fecha_transaccion=timezone.now(),
        )

        # Crear el detalle de la transacción (uno solo en este diseño)
        detalle = DetalleTransaccion.objects.create(
            id_transaccion=transaccion,
            tipo_transaccion=tipo_transaccion,
            tipo_entrega=tipo_entrega,
        )

        # Ahora insertamos cada artículo con su cantidad al modelo intermedio
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
        traceback.print_exc()  # 👈 Imprime error completo en consola
        return Response({"error": str(e)}, status=500)



class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer
   
# CORRECCIÓN PRINCIPAL AQUÍ: validar 'id_detalle_transaccion' en creación de Pagos
class PagosViewSet(viewsets.ModelViewSet):
    queryset = Pagos.objects.all()
    serializer_class = PagosSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        # Validar que 'id_detalle_transaccion' esté presente y no sea nulo
        if not data.get("id_detalle_transaccion"):
            return Response(
                {"error": "El campo 'id_detalle_transaccion' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)    
    
# ====================================
# DETALLE TRANSACCION CON ARTICULO
# ====================================   

class PqrsViewSet(viewsets.ModelViewSet):
    queryset = Pqrs.objects.all()
    serializer_class = PqrsSerializer
    
@api_view(['GET'])
def detalle_transaccion_con_articulo(request, id_detalle_transaccion):
    try:
        detalle = DetalleTransaccion.objects.get(pk=id_detalle_transaccion)
        articulo = Articulos.objects.get(pk=detalle.id_articulo.id_articulo)

        total = articulo.precio * detalle.cantidad_articulos

        data = {
            "tipo_transaccion": detalle.tipo_transaccion,
            "tipo_entrega": detalle.tipo_entrega,
            "total": total,
            "articulos": [
                {
                    "titulo_articulo": articulo.titulo_articulo,
                    "cantidad_articulos": detalle.cantidad_articulos,
                    "precio_articulo": articulo.precio,
                    "imagen_articulo": articulo.imagen_articulo.url if articulo.imagen_articulo else None
                }
            ]
        }

        return Response(data)

    except DetalleTransaccion.DoesNotExist:
        return Response({"error": "Detalle de transacción no encontrado."}, status=404)
    except Articulos.DoesNotExist:
        return Response({"error": "Artículo relacionado no encontrado."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

