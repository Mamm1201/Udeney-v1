# ====================================
# IMPORTACIONES NECESARIAS
# ====================================

# Django
from django.contrib.auth.models import Group, User
from django.utils.dateparse import parse_date
# Filtros
from django_filters.rest_framework import DjangoFilterBackend
# DRF
from rest_framework import filters, status, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import ValidationError
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Cache utilities
from .cache_utils import (ArticulosCache, CategoriasCache, UsuariosCache, ViewCache,
                          cache_result)
# JWT utilities
from .jwt_utils import get_tokens_for_user, get_user_permissions_summary
# Logging utilities
from .logging_utils import AuditLogger, SecurityLogger, log_api_call
# Metrics utilities
from .metrics import ApplicationMetrics
# Modelos
from .models import (ArticuloDetalleTransaccion, Articulos, Calificaciones, Categorias,
                     DetalleTransaccion, Pagos, Pqrs, Roles, Transacciones, UsuarioRol,
                     Usuarios)
# Permisos personalizados (nuevo sistema basado en Groups)
from .permissions_new import (AdminPermissions, ArticuloPermissions, IsComprador,
                              IsOwnerOrReadOnly, IsVendedor, IsVendedorOrReadOnly,
                              RoleBasedViewMixin, TransaccionPermissions)
# Serializadores
from .serializers import (ArticulosSerializer, CalificacionesSerializer,
                          CategoriasSerializer, DetalleTransaccionAnidadoSerializer,
                          DetalleTransaccionSerializer, PagosSerializer, PqrsSerializer,
                          RolesSerializer, TransaccionesSerializer,
                          UsuarioRolSerializer, UsuariosSerializer)

# ====================================
# AUTENTICACIÓN
# ====================================


class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Validar datos
            serializer = UsuariosSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Extraer datos validados
            email = serializer.validated_data["email_usuario"]
            password = serializer.validated_data["password_usuario"]
            nombres = serializer.validated_data["nombres_usuario"]
            apellidos = serializer.validated_data["apellidos_usuario"]
            telefono = serializer.validated_data.get("telefono_usuario", "")
            direccion = serializer.validated_data.get("direccion_usuario", "")

            # Verificar que el email no exista en Django User
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "Ya existe un usuario con este email"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Verificar que el email no exista en Usuarios
            if Usuarios.objects.filter(email_usuario=email).exists():
                return Response(
                    {"error": "Ya existe un usuario con este email"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Crear usuario Django
            django_user = User.objects.create_user(
                username=email,  # Usar email como username
                email=email,
                password=password,
                first_name=nombres,
                last_name=apellidos,
            )

            # Asignar grupo por defecto (Comprador para usuarios normales)
            comprador_group = Group.objects.get(name="Comprador")
            django_user.groups.add(comprador_group)

            # Crear usuario Eduney vinculado
            usuario_eduney = Usuarios.objects.create(
                id_usuario=django_user.id,
                nombres_usuario=nombres,
                apellidos_usuario=apellidos,
                email_usuario=email,
                telefono_usuario=telefono,
                direccion_usuario=direccion,
                is_active=True,
            )
            usuario_eduney.set_password(password)
            usuario_eduney.save()

            # Generar tokens
            refresh = RefreshToken.for_user(django_user)
            permissions_summary = get_user_permissions_summary(django_user)

            return Response(
                {
                    "message": "Usuario registrado exitosamente",
                    "user": {
                        "id_usuario": usuario_eduney.id_usuario,
                        "email": usuario_eduney.email_usuario,
                        "nombres_usuario": usuario_eduney.nombres_usuario,
                        "apellidos_usuario": usuario_eduney.apellidos_usuario,
                        "groups": list(
                            django_user.groups.values_list("name", flat=True)
                        ),
                        "permissions": permissions_summary,
                        "dashboard_route": permissions_summary["dashboard_route"],
                        "is_superuser": django_user.is_superuser,
                        "is_staff": django_user.is_staff,
                    },
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                },
                status=status.HTTP_201_CREATED,
            )

        except Group.DoesNotExist:
            return Response(
                {"error": "Error de configuración: grupo Comprador no existe"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Debe ingresar correo y contraseña"}, status=400)

        try:
            # Buscar usuario de Eduney
            usuario_eduney = Usuarios.objects.get(email_usuario=email)
            # Buscar usuario Django correspondiente
            user_django = User.objects.get(id=usuario_eduney.id_usuario)
        except (Usuarios.DoesNotExist, User.DoesNotExist):
            SecurityLogger.log_authentication_attempt(request, email, False)
            ApplicationMetrics.track_authentication(email, False)
            return Response({"error": "Usuario no encontrado"}, status=404)

        if not usuario_eduney.is_active:
            SecurityLogger.log_authentication_attempt(request, email, False)
            ApplicationMetrics.track_authentication(email, False)
            return Response({"error": "Cuenta desactivada"}, status=403)

        if not usuario_eduney.check_password(password):
            SecurityLogger.log_authentication_attempt(request, email, False)
            ApplicationMetrics.track_authentication(email, False)
            return Response({"error": "Correo o contraseña incorrectos"}, status=401)

        SecurityLogger.log_authentication_attempt(request, email, True)
        ApplicationMetrics.track_authentication(email, True)

        # Generar tokens personalizados con información de roles
        tokens = get_tokens_for_user(user_django)
        permissions_summary = get_user_permissions_summary(user_django)

        return Response(
            {
                "message": f"Bienvenido {usuario_eduney.nombres_usuario}",
                "user": {
                    "id_usuario": usuario_eduney.id_usuario,
                    "email": usuario_eduney.email_usuario,
                    "nombres_usuario": usuario_eduney.nombres_usuario,
                    "apellidos_usuario": usuario_eduney.apellidos_usuario,
                    "groups": list(user_django.groups.values_list("name", flat=True)),
                    "permissions": permissions_summary,
                    "dashboard_route": permissions_summary["dashboard_route"],
                    "is_superuser": user_django.is_superuser,
                    "is_staff": user_django.is_staff,
                },
                "access_token": tokens["access"],
                "refresh_token": tokens["refresh"],
            }
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"message": "Sesión cerrada exitosamente"})


# ====================================
# CRUD USUARIOS
# ====================================


class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer
    permission_classes = [
        IsAuthenticated
    ]  # Solo usuarios autenticados pueden ver otros usuarios

    def get_queryset(self):
        # Los usuarios solo pueden ver su propia información
        if self.request.user and self.request.user.is_authenticated:
            return Usuarios.objects.filter(id_usuario=self.request.user.id)
        return Usuarios.objects.none()

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == "me":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=["get", "put", "patch"])
    def me(self, request):
        """Get or update current user's information"""
        try:
            usuario = Usuarios.objects.get(id_usuario=request.user.id)
        except Usuarios.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        if request.method == "GET":
            serializer = self.get_serializer(usuario)
            return Response(serializer.data)

        elif request.method in ["PUT", "PATCH"]:
            # Permitir actualización parcial con PATCH y completa con PUT
            partial = request.method == "PATCH"
            serializer = self.get_serializer(
                usuario, data=request.data, partial=partial
            )

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)


# ====================================
# GESTIÓN INTELIGENTE DE TOKENS
# ====================================


# ====================================
# CRUD ARTICULOS
# ====================================


class ArticulosViewSet(viewsets.ModelViewSet):
    serializer_class = ArticulosSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["id_categoria", "id_categoria__nombre_categoria"]
    search_fields = [
        "titulo_articulo",
        "descripcion_articulo",
        "id_categoria__nombre_categoria",
    ]

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.action == "retrieve":
            return Articulos.objects.select_related("id_categoria", "id_usuario")
        return Articulos.objects.filter(disponible=True).select_related(
            "id_categoria", "id_usuario"
        )

    def perform_create(self, serializer):
        # Encontrar el usuario de Eduney correspondiente al usuario Django autenticado
        try:
            usuario_eduney = Usuarios.objects.get(id_usuario=self.request.user.id)
        except Usuarios.DoesNotExist:
            raise ValidationError("Usuario de Eduney no encontrado")

        # Usar el usuario de Eduney
        articulo = serializer.save(id_usuario=usuario_eduney)
        # Audit log
        AuditLogger.log_model_change(
            self.request.user,
            "Articulo",
            articulo.id_articulo,
            "CREATE",
            {
                "titulo": articulo.titulo_articulo,
                "precio": str(articulo.precio_articulo),
            },
        )
        # Business metrics
        ApplicationMetrics.track_business_event(
            "articulo_created", self.request.user.id
        )
        # Invalidar cache de artículos
        ViewCache.invalidate_articulo_cache()

    def perform_update(self, serializer):
        # Actualizar artículo e invalidar cache específico
        instance = serializer.save()
        # Audit log
        AuditLogger.log_model_change(
            self.request.user,
            "Articulo",
            instance.id_articulo,
            "UPDATE",
            serializer.validated_data,
        )
        ViewCache.invalidate_articulo_cache(instance.id_articulo)

    def perform_destroy(self, instance):
        # Audit log
        AuditLogger.log_model_change(
            self.request.user,
            "Articulo",
            instance.id_articulo,
            "DELETE",
            {"titulo": instance.titulo_articulo},
        )
        # Eliminar e invalidar cache específico
        articulo_id = instance.id_articulo
        super().perform_destroy(instance)
        ViewCache.invalidate_articulo_cache(articulo_id)

    @action(detail=False, methods=["get"], url_path="mis-articulos")
    def mis_articulos(self, request):
        id_usuario = request.query_params.get("id_usuario")
        if not id_usuario:
            return Response({"error": "id_usuario requerido"}, status=400)
        articulos = Articulos.objects.filter(id_usuario=id_usuario).select_related(
            "id_categoria", "id_usuario"
        )
        serializer = self.get_serializer(articulos, many=True)
        return Response(serializer.data)


class TodosArticulosViewSet(viewsets.ModelViewSet):
    queryset = Articulos.objects.select_related("id_categoria", "id_usuario")
    serializer_class = ArticulosSerializer
    permission_classes = [
        AdminPermissions
    ]  # Solo administradores pueden ver todos los artículos


class ArticuloDetailAPIView(RetrieveAPIView):
    queryset = Articulos.objects.select_related("id_categoria", "id_usuario")
    serializer_class = ArticulosSerializer
    lookup_field = "id_articulo"
    permission_classes = [AllowAny]  # Permitir lectura pública de artículos
    authentication_classes = []  # No require autenticación


# ====================================
# CRUD CATEGORIAS
# ====================================


class CategoriasViewSet(viewsets.ModelViewSet):
    queryset = Categorias.objects.all()
    serializer_class = CategoriasSerializer
    permission_classes = [
        AllowAny
    ]  # Categorías públicas para lectura, autenticación para escritura

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


# ====================================
# CRUD ROLES
# ====================================


class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer


# ====================================
# CRUD USUARIO - ROL
# ====================================


class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer


# ====================================
# CRUD DETALLE - TRANSACCIÓN
# ====================================


class DetalleTransaccionViewSet(viewsets.ModelViewSet):
    queryset = DetalleTransaccion.objects.select_related(
        "id_transaccion", "id_transaccion__usuario"
    )
    serializer_class = DetalleTransaccionSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados


# ====================================
# CRUD TRANSACCIONES
# ====================================


class TransaccionesViewSet(viewsets.ModelViewSet):
    queryset = Transacciones.objects.all()  # Queryset base requerido por el router
    permission_classes = [
        TransaccionPermissions
    ]  # Permisos específicos para transacciones

    def get_queryset(self):
        # Los usuarios solo pueden ver sus propias transacciones
        if self.request.user and self.request.user.is_authenticated:
            try:
                # Obtener el usuario personalizado basado en el Django user
                usuario_personalizado = Usuarios.objects.get(
                    id_usuario=self.request.user.id
                )
                return Transacciones.objects.filter(
                    usuario=usuario_personalizado
                ).select_related("usuario")
            except Usuarios.DoesNotExist:
                return Transacciones.objects.none()
        return Transacciones.objects.none()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return DetalleTransaccionAnidadoSerializer
        return TransaccionesSerializer

    def perform_create(self, serializer):
        # Encontrar el usuario de Eduney correspondiente al usuario Django autenticado
        try:
            usuario_eduney = Usuarios.objects.get(id_usuario=self.request.user.id)
        except Usuarios.DoesNotExist:
            raise ValidationError("Usuario de Eduney no encontrado")

        # Asignar automáticamente el usuario de Eduney
        transaccion = serializer.save(usuario=usuario_eduney)
        # Audit log
        AuditLogger.log_transaction_event(
            self.request.user, transaccion.id_transaccion, "CREATED"
        )
        # Business metrics
        ApplicationMetrics.track_business_event(
            "transaccion_created", self.request.user.id
        )


class MisTransaccionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id_usuario):
        # Verificar que el usuario puede ver solo sus transacciones
        if not request.user.is_authenticated or request.user.id != int(id_usuario):
            return Response(
                {"error": "No tienes permiso para ver estas transacciones"},
                status=status.HTTP_403_FORBIDDEN,
            )

        transacciones = Transacciones.objects.filter(
            usuario_id=id_usuario
        ).select_related("usuario")
        serializer = TransaccionesSerializer(transacciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ====================================
# CRUD CALIFICACIONES
# ====================================


class CalificacionesViewSet(viewsets.ModelViewSet):
    queryset = Calificaciones.objects.select_related("id_articulo", "id_usuario")
    serializer_class = CalificacionesSerializer
    permission_classes = [
        IsAuthenticated
    ]  # Solo usuarios autenticados pueden calificar


# ====================================
# CRUD PAGOS
# ====================================


class PagosViewSet(viewsets.ModelViewSet):
    queryset = Pagos.objects.select_related(
        "id_detalle_transaccion", "id_detalle_transaccion__id_transaccion"
    )
    serializer_class = PagosSerializer

    def create(self, request, *args, **kwargs):
        if not request.data.get("id_detalle_transaccion"):
            return Response(
                {"error": "El campo 'id_detalle_transaccion' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ====================================
# CRUD PQRS
# ====================================


class PqrsViewSet(viewsets.ModelViewSet):
    queryset = Pqrs.objects.all()
    serializer_class = PqrsSerializer


# ====================================
# CACHE MANAGEMENT
# ====================================


class CacheStatsView(APIView):
    """
    View para obtener estadísticas y gestionar el cache
    """

    permission_classes = [AdminPermissions]  # Solo administradores

    def get(self, request):
        """Obtener estadísticas del cache"""
        from .cache_utils import get_cache_stats

        stats = get_cache_stats()
        return Response(
            {
                "cache_stats": stats,
                "cache_backend": "django.core.cache.backends.db.DatabaseCache",
                "message": "Cache statistics retrieved successfully",
            }
        )

    def delete(self, request):
        """Limpiar todo el cache"""
        from .cache_utils import clear_all_cache

        clear_all_cache()
        return Response(
            {"message": "Cache cleared successfully"}, status=status.HTTP_200_OK
        )


class WarmupCacheView(APIView):
    """
    View para precalentar el cache
    """

    permission_classes = [AdminPermissions]  # Solo administradores

    def post(self, request):
        """Precalentar el cache con datos frecuentes"""
        from .cache_utils import warm_up_cache

        try:
            warm_up_cache()
            return Response(
                {"message": "Cache warmed up successfully"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Error warming up cache: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ====================================
# CREAR TRANSACCIÓN CON DETALLES
# ====================================


@api_view(["POST"])
def crear_con_detalles(request):
    # Verificar autenticación
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Autenticación requerida"}, status=401)

    data = request.data
    tipo_transaccion = data.get("tipo_transaccion")
    tipo_entrega = data.get("tipo_entrega")
    articulos = data.get("articulos", [])

    if not all([tipo_transaccion, tipo_entrega, articulos]):
        return Response({"error": "Datos incompletos"}, status=400)

    # Encontrar el usuario de Eduney correspondiente al usuario Django autenticado
    try:
        usuario_eduney = Usuarios.objects.get(id_usuario=request.user.id)
    except Usuarios.DoesNotExist:
        return Response({"error": "Usuario de Eduney no encontrado"}, status=404)

    # Crear la transacción con el usuario de Eduney
    transaccion = Transacciones.objects.create(usuario=usuario_eduney)

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

        articulo.disponible = False
        articulo.save()

    return Response(
        {
            "message": "Transacción registrada correctamente",
            "id_transaccion": transaccion.id_transaccion,
        },
        status=201,
    )


# ====================================
# HISTORIAL DE TRANSACCIONES
# ====================================


@api_view(["GET"])
def historial_transacciones_api(request):
    # Verificar autenticación
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Autenticación requerida"}, status=401)

    # Usar el ID del usuario autenticado
    id_usuario = request.user.id

    fecha_inicio = (
        parse_date(request.query_params.get("fecha_inicio"))
        if request.query_params.get("fecha_inicio")
        else None
    )

    fecha_fin = (
        parse_date(request.query_params.get("fecha_fin"))
        if request.query_params.get("fecha_fin")
        else None
    )

    compras = Transacciones.objects.filter(
        usuario_id=id_usuario, detalletransaccion__tipo_transaccion="compra"
    ).select_related("usuario")
    # For now, disable ventas query as it needs schema updates
    ventas = Transacciones.objects.none()

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
            detalle = DetalleTransaccion.objects.select_related("id_transaccion").get(
                id_transaccion_id=id_transaccion
            )

            articulos = ArticuloDetalleTransaccion.objects.select_related(
                "id_articulo", "id_articulo__id_categoria", "id_articulo__id_usuario"
            ).filter(id_detalle_transaccion=detalle)

            articulos_data = []
            total = 0
            for item in articulos:
                articulo = item.id_articulo
                subtotal = articulo.precio_articulo * item.cantidad
                total += subtotal

                imagen_url = (
                    request.build_absolute_uri(articulo.imagen.url)
                    if articulo.imagen
                    else None
                )

                articulos_data.append(
                    {
                        "id_articulo": articulo.id_articulo,
                        "titulo_articulo": articulo.titulo_articulo,
                        "precio_unitario": articulo.precio_articulo,
                        "cantidad": item.cantidad,
                        "subtotal": subtotal,
                        "imagen": imagen_url,
                    }
                )

            return Response(
                {
                    "id_transaccion": detalle.id_transaccion.id_transaccion,
                    "fecha_transaccion": detalle.id_transaccion.fecha_transaccion,
                    "tipo_transaccion": detalle.tipo_transaccion,
                    "tipo_entrega": detalle.tipo_entrega,
                    "cantidad_articulos": detalle.cantidad_articulos,
                    "articulos": articulos_data,
                    "total": total,
                },
                status=200,
            )

        except DetalleTransaccion.DoesNotExist:
            return Response({"error": "Transacción no encontrada"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
