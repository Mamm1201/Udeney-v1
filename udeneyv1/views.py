# ====================================
# IMPORTACIONES NECESARIAS
# ====================================

# Django
from django.utils.dateparse import parse_date

# DRF
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

import jwt
from django.conf import settings

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
        except Usuarios.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        if not user.is_active:
            return Response({"error": "Cuenta desactivada"}, status=403)

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
    try:
        data = request.data
        id_usuario = data.get("id_usuario")
        tipo_transaccion = data.get("tipo_transaccion")
        tipo_entrega = data.get("tipo_entrega")
        articulos = data.get("articulos", [])

        if not all([id_usuario, tipo_transaccion, tipo_entrega, articulos]):
            return Response({"error": "Datos incompletos"}, status=400)

        usuario = Usuarios.objects.filter(id_usuario=id_usuario).first()
        if not usuario:
            return Response({"error": "Usuario no registrado"}, status=404)

        # ✅ CAMBIO: usar 'usuario' (nombre del campo del modelo)
        transaccion = Transacciones.objects.create(usuario=usuario)

        detalle = DetalleTransaccion.objects.create(
            id_transaccion=transaccion,
            tipo_transaccion=tipo_transaccion,
            tipo_entrega=tipo_entrega,
            cantidad_articulos=len(articulos),
        )

        for art in articulos:
            id_articulo = art.get("id_articulo")
            cantidad = art.get("cantidad", 1)

            articulo = Articulos.objects.filter(id_articulo=id_articulo).first()
            if not articulo:
                return Response({"error": f"Artículo {id_articulo} no existe"}, status=404)

            ArticuloDetalleTransaccion.objects.create(
                id_detalle_transaccion=detalle,
                id_articulo=articulo,
                cantidad=cantidad,
            )

        return Response({
            "message": "Transacción registrada correctamente",
            "id_transaccion": transaccion.id_transaccion
        }, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


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
        return Response({"error": "ID inválido"}, status=400)

    fecha_inicio = parse_date(request.query_params.get("fecha_inicio")) if request.query_params.get("fecha_inicio") else None
    fecha_fin = parse_date(request.query_params.get("fecha_fin")) if request.query_params.get("fecha_fin") else None

    # ✅ CAMBIO: usar 'usuario_id' en lugar de 'id_usuario_id'
    compras = Transacciones.objects.filter(
        usuario_id=id_usuario,
        detalletransaccion__tipo_transaccion="compra"
    )

    # ✅ CAMBIO: verificar si Articulos tiene campo 'usuario'
    ventas = Transacciones.objects.filter(
        detalletransaccion__id_articulo__usuario_id=id_usuario,
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
# RESUMEN DE COMPRA POR ID
# ====================================

class ResumenCompraAPIView(APIView):
    def get(self, request, id_transaccion):
        try:
            detalle = DetalleTransaccion.objects.select_related("id_transaccion").get(id_transaccion_id=id_transaccion)
            articulos_relacionados = ArticuloDetalleTransaccion.objects.select_related("id_articulo").filter(id_detalle_transaccion=detalle)

            articulos_data = []
            total = 0

            for item in articulos_relacionados:
                articulo = item.id_articulo
                subtotal = articulo.precio_articulo * item.cantidad
                total += subtotal

                imagen_url = request.build_absolute_uri(articulo.imagen.url) if articulo.imagen else None

                articulos_data.append({
                    "id_articulo": articulo.id_articulo,
                    "titulo_articulo": articulo.titulo_articulo,
                    "precio_unitario": articulo.precio_articulo,
                    "cantidad": item.cantidad,
                    "subtotal": subtotal,
                    "imagen": imagen_url,
                })

            return Response({
                "id_transaccion": detalle.id_transaccion.id_transaccion,
                "fecha_transaccion": detalle.id_transaccion.fecha_transaccion,
                "tipo_transaccion": detalle.tipo_transaccion,
                "tipo_entrega": detalle.tipo_entrega,
                "cantidad_articulos": detalle.cantidad_articulos,
                "articulos": articulos_data,
                "total": total
            }, status=200)

        except DetalleTransaccion.DoesNotExist:
            return Response({"error": "Transacción no encontrada"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ====================================
# MIS TRANSACCIONES (Autenticado)
# ====================================

# class MisTransaccionesAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         auth_header = request.headers.get('Authorization', '')
#         if not auth_header.startswith('Bearer '):
#             return Response({"error": "Token no proporcionado"}, status=401)

#         token = auth_header.split(' ')[1]

#         try:
#             payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
#             user_id = payload.get("user_id")

#             if not user_id:
#                 return Response({"error": "Token inválido (sin user_id)"}, status=401)

#             usuario = Usuarios.objects.get(id_usuario=user_id)

#             # ✅ CAMBIO: usar 'usuario' (campo del modelo)
#             transacciones = Transacciones.objects.filter(usuario=usuario)

#             data = [{
#                 "id": t.id_transaccion,
#                 "fecha": t.fecha_transaccion
#             } for t in transacciones]

#             return Response({"transacciones": data})

#         except jwt.ExpiredSignatureError:
#             return Response({"error": "Token expirado"}, status=401)
#         except jwt.DecodeError:
#             return Response({"error": "Token inválido"}, status=401)
#         except Usuarios.DoesNotExist:
#             return Response({"error": "Usuario no encontrado"}, status=404)
#         except Exception as e:
#             return Response({"error": str(e)}, status=500 })
