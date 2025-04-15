from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import render, get_object_or_404
from django.utils.dateparse import parse_date
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view

# IMPORTACIÓN DE MODELOS
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
# IMPORTACIÓN DE SERIALIZADORES
from .serializers import (
    UsuariosSerializer,
    ArticulosSerializer,
    CategoriasSerializer,
    RolesSerializer,
    UsuarioRolSerializer,
    DetalleTransaccionSerializer,
    TransaccionesSerializer,
    CalificacionesSerializer,
    PagosSerializer,
    PqrsSerializer,
)

# VISTA REGISTRO DE USUARIO
class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuariosSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()

            # No necesitas llamar a set_password aquí, ya se hace en el serializer

            # Generar tokens JWT
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


# VISTA LOGIN USUARIO
User = get_user_model()

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = get_object_or_404(Usuarios, email_usuario=email)

        if not user.is_active:
            return Response({"error": "Cuenta desactivada, contacta al administrador."}, status=status.HTTP_403_FORBIDDEN)

        if not user.check_password(password):
            return Response({"error": "Credenciales incorrectas"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": f"Bienvenido {user.nombres_usuario}",
                "id_usuario": user.id_usuario,
                "email": user.email_usuario,
                "nombres_usuario": user.nombres_usuario,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            },
            status=status.HTTP_200_OK,
        )        

# VISTA CERRAR SESIÓN
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("LogoutView llamado")
        return Response(
            {"message": "Cierre de sesión exitoso"},
            status=status.HTTP_200_OK
        )
           
# HISTORIAL DE TRANSACCIONES USUARIO REGISTARDO
@login_required
def historial_transacciones(request):
    usuario = request.user

    # Obtener fechas desde la URL (?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD)
    fecha_inicio = request.GET.get("fecha_inicio")
    fecha_fin = request.GET.get("fecha_fin")

    # Base de consultas
    compras_qs = Transacciones.objects.filter(
        id_usuario=usuario, id_detalle_transaccion__tipo_transaccion="compra"
    )
    ventas_qs = Transacciones.objects.filter(
        id_detalle_transaccion__id_articulo__id_usuario=usuario,
        id_detalle_transaccion__tipo_transaccion="venta"
    )

    # Aplicar filtros de fecha
    if fecha_inicio:
        fecha_inicio = parse_date(fecha_inicio)
        if fecha_inicio:
            compras_qs = compras_qs.filter(fecha_transaccion__gte=fecha_inicio)
            ventas_qs = ventas_qs.filter(fecha_transaccion__gte=fecha_inicio)

    if fecha_fin:
        fecha_fin = parse_date(fecha_fin)
        if fecha_fin:
            compras_qs = compras_qs.filter(fecha_transaccion__lte=fecha_fin)
            ventas_qs = ventas_qs.filter(fecha_transaccion__lte=fecha_fin)

    # Agrupar por año y mes
    compras = (
        compras_qs
        .annotate(year=TruncYear("fecha_transaccion"), month=TruncMonth("fecha_transaccion"))
        .values("year", "month")
        .annotate(total_compras=Count("id_transaccion"))
        .order_by("-year", "-month")
    )

    ventas = (
        ventas_qs
        .annotate(year=TruncYear("fecha_transaccion"), month=TruncMonth("fecha_transaccion"))
        .values("year", "month")
        .annotate(total_ventas=Count("id_transaccion"))
        .order_by("-year", "-month")
    )

    return render(
        request,
        "historial_transacciones.html",
        {"compras": compras, "ventas": ventas},
    )
    
# CRUDS PARA LOS MODELOS
class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer


class ArticulosViewSet(viewsets.ModelViewSet):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer
    
class ArticuloDetailAPIView(RetrieveAPIView):
    queryset = Articulos.objects.all()
    serializer_class = ArticulosSerializer
    lookup_field = 'id_articulo'  # solicita el id creado


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
    


@api_view(["GET"])
def historial_transacciones_api(request):
    id_usuario = request.query_params.get("id_usuario")
    fecha_inicio = request.query_params.get("fecha_inicio")
    fecha_fin = request.query_params.get("fecha_fin")

    if not id_usuario:
        return Response({"error": "Se requiere id_usuario"}, status=400)

    # Filtros base
    compras = Transacciones.objects.filter(
        id_usuario=id_usuario,
        id_detalle_transaccion__tipo_transaccion="compra"
    )
    ventas = Transacciones.objects.filter(
        id_detalle_transaccion__id_articulo__id_usuario=id_usuario,
        id_detalle_transaccion__tipo_transaccion="venta"
    )

    # Filtrar fechas si existen
    if fecha_inicio:
        fecha_inicio = parse_date(fecha_inicio)
        compras = compras.filter(fecha_transaccion__gte=fecha_inicio)
        ventas = ventas.filter(fecha_transaccion__gte=fecha_inicio)

    if fecha_fin:
        fecha_fin = parse_date(fecha_fin)
        compras = compras.filter(fecha_transaccion__lte=fecha_fin)
        ventas = ventas.filter(fecha_transaccion__lte=fecha_fin)

    # Agrupar por año y mes
    compras_agrupadas = compras.annotate(
        year=TruncYear("fecha_transaccion"),
        month=TruncMonth("fecha_transaccion")
    ).values("year", "month").annotate(total_compras=Count("id_transaccion"))

    ventas_agrupadas = ventas.annotate(
        year=TruncYear("fecha_transaccion"),
        month=TruncMonth("fecha_transaccion")
    ).values("year", "month").annotate(total_ventas=Count("id_transaccion"))

    return Response({
        "compras": list(compras_agrupadas),
        "ventas": list(ventas_agrupadas)
    })

