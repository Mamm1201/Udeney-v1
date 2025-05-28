# Importaciones necesarias de Django
from django.shortcuts import render
from django.utils.dateparse import parse_date
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear

# Importaciones de DRF (Django Rest Framework)
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view

# Importación de modelos del sistema
from .models import (
    Usuarios, Articulos, Categorias, Roles, UsuarioRol,
    DetalleTransaccion, Transacciones, Calificaciones, Pagos, Pqrs
)

# Importación de serializadores
from .serializers import (
    UsuariosSerializer, ArticulosSerializer, CategoriasSerializer,
    RolesSerializer, UsuarioRolSerializer, DetalleTransaccionSerializer,
    TransaccionesSerializer, CalificacionesSerializer, PagosSerializer, PqrsSerializer
)

User = get_user_model()

# ====================================
# REGISTRO DE USUARIO
# ====================================
class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]  # Permite el acceso sin autenticación

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

# ====================================
# INICIO DE SESIÓN (LOGIN)
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
        except Usuarios.DoesNotExist:
            return Response({"error": "Correo o contraseña incorrectos"}, status=401)

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


# ====================================
# CIERRE DE SESIÓN (LOGOUT SIMBÓLICO)
# ====================================
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Aquí podrías implementar el logout real usando blacklisting de tokens
        return Response({"message": "Sesión cerrada exitosamente"})


# ====================================
# HISTORIAL DE TRANSACCIONES (VISTA WEB)
# ====================================
@login_required
def historial_transacciones(request):
    usuario = request.user
    fecha_inicio = parse_date(request.GET.get("fecha_inicio"))
    fecha_fin = parse_date(request.GET.get("fecha_fin"))

    # Filtrar compras y ventas por usuario
    compras = Transacciones.objects.filter(
        id_usuario=usuario,
        id_detalle_transaccion__tipo_transaccion="compra"
    )
    ventas = Transacciones.objects.filter(
        id_detalle_transaccion__id_articulo__id_usuario=usuario,
        id_detalle_transaccion__tipo_transaccion="venta"
    )

    # Aplicar filtros de fecha si existen
    if fecha_inicio:
        compras = compras.filter(fecha_transaccion__gte=fecha_inicio)
        ventas = ventas.filter(fecha_transaccion__gte=fecha_inicio)
    if fecha_fin:
        compras = compras.filter(fecha_transaccion__lte=fecha_fin)
        ventas = ventas.filter(fecha_transaccion__lte=fecha_fin)

    # Agrupar compras y ventas por año y mes
    compras_grouped = compras.annotate(
        year=TruncYear("fecha_transaccion"),
        month=TruncMonth("fecha_transaccion")
    ).values("year", "month").annotate(total_compras=Count("id_transaccion"))

    ventas_grouped = ventas.annotate(
        year=TruncYear("fecha_transaccion"),
        month=TruncMonth("fecha_transaccion")
    ).values("year", "month").annotate(total_ventas=Count("id_transaccion"))

    return render(request, "historial_transacciones.html", {
        "compras": compras_grouped,
        "ventas": ventas_grouped
    })

# ====================================
# HISTORIAL DE TRANSACCIONES (API)
# ====================================
@api_view(["GET"])
def historial_transacciones_api(request):
    id_usuario = request.query_params.get("id_usuario")
    if not id_usuario:
        return Response({"error": "Debe proporcionar el ID del usuario"}, status=400)

    fecha_inicio = parse_date(request.query_params.get("fecha_inicio"))
    fecha_fin = parse_date(request.query_params.get("fecha_fin"))

    compras = Transacciones.objects.filter(
        id_usuario=id_usuario,
        id_detalle_transaccion__tipo_transaccion="compra"
    )
    ventas = Transacciones.objects.filter(
        id_detalle_transaccion__id_articulo__id_usuario=id_usuario,
        id_detalle_transaccion__tipo_transaccion="venta"
    )

    if fecha_inicio:
        compras = compras.filter(fecha_transaccion__gte=fecha_inicio)
        ventas = ventas.filter(fecha_transaccion__gte=fecha_inicio)
    if fecha_fin:
        compras = compras.filter(fecha_transaccion__lte=fecha_fin)
        ventas = ventas.filter(fecha_transaccion__lte=fecha_fin)

    compras_grouped = compras.annotate(
        year=TruncYear("fecha_transaccion"),
        month=TruncMonth("fecha_transaccion")
    ).values("year", "month").annotate(total_compras=Count("id_transaccion"))

    ventas_grouped = ventas.annotate(
        year=TruncYear("fecha_transaccion"),
        month=TruncMonth("fecha_transaccion")
    ).values("year", "month").annotate(total_ventas=Count("id_transaccion"))

    return Response({
        "compras": list(compras_grouped),
        "ventas": list(ventas_grouped)
    })


# ====================================
# CRUD GENERAL PARA MODELOS DEL SISTEMA
# ====================================
# Todos los ViewSets permiten listar, crear, actualizar y eliminar registros
class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer


class ArticulosViewSet(viewsets.ModelViewSet):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer


class ArticuloDetailAPIView(RetrieveAPIView):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer
    lookup_field = 'id_articulo'  # Se usa para buscar el artículo por ID

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
    serializer_class = TransaccionesSerializer


class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.all()
    serializer_class = CalificacionesSerializer


class PagosViewSet(viewsets.ModelViewSet):
    queryset = Pagos.objects.all()
    serializer_class = PagosSerializer


class PqrsViewSet(viewsets.ModelViewSet):
    queryset = Pqrs.objects.all()
    serializer_class = PqrsSerializer
    