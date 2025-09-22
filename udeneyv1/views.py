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
from rest_framework.decorators import action, api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.exceptions import ValidationError, PermissionDenied
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
# Email verification utilities
from .email_utils import EmailVerificationUtils
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

            # Crear usuario Eduney vinculado (inactivo hasta verificar email)
            usuario_eduney = Usuarios.objects.create(
                id_usuario=django_user.id,
                nombres_usuario=nombres,
                apellidos_usuario=apellidos,
                email_usuario=email,
                telefono_usuario=telefono,
                direccion_usuario=direccion,
                is_active=False,  # Inactivo hasta verificar email
                email_verified=False,  # Email no verificado
            )
            usuario_eduney.set_password(password)
            usuario_eduney.save()

            # Desactivar también el usuario Django hasta verificación
            django_user.is_active = False
            django_user.save()

            # Enviar email de verificación
            email_sent = EmailVerificationUtils.send_verification_email(usuario_eduney)

            if email_sent:
                return Response(
                    {
                        "message": "Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.",
                        "user": {
                            "id_usuario": usuario_eduney.id_usuario,
                            "email": usuario_eduney.email_usuario,
                            "nombres_usuario": usuario_eduney.nombres_usuario,
                            "apellidos_usuario": usuario_eduney.apellidos_usuario,
                            "email_verified": False,
                            "verification_required": True
                        },
                        "email_sent": True,
                        "instructions": "Hemos enviado un email de verificación a tu dirección de correo. Haz clic en el enlace para activar tu cuenta."
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    {
                        "message": "Usuario registrado, pero error al enviar email de verificación",
                        "user": {
                            "id_usuario": usuario_eduney.id_usuario,
                            "email": usuario_eduney.email_usuario,
                            "nombres_usuario": usuario_eduney.nombres_usuario,
                            "apellidos_usuario": usuario_eduney.apellidos_usuario,
                            "email_verified": False,
                            "verification_required": True
                        },
                        "email_sent": False,
                        "warning": "Error al enviar email. Puedes solicitar un reenvío más tarde."
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

        # Verificar que el email esté verificado
        if not usuario_eduney.email_verified:
            SecurityLogger.log_authentication_attempt(request, email, False)
            ApplicationMetrics.track_authentication(email, False)
            return Response({
                "error": "Email no verificado",
                "code": "EMAIL_NOT_VERIFIED",
                "message": "Debes verificar tu email antes de poder iniciar sesión",
                "email": email,
                "can_resend": EmailVerificationUtils.can_resend_verification(usuario_eduney)
            }, status=403)

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
        # Superusuarios y staff pueden ver todos los usuarios
        if self.request.user and self.request.user.is_authenticated:
            if self.request.user.is_superuser or self.request.user.is_staff:
                return Usuarios.objects.all()
            else:
                # Los usuarios normales solo pueden ver su propia información
                return Usuarios.objects.filter(id_usuario=self.request.user.id)
        return Usuarios.objects.none()

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['destroy', 'update', 'partial_update']:
            # Solo superusuarios y staff pueden eliminar/modificar usuarios
            permission_classes = [IsAuthenticated]  # La validación adicional se hace en perform_destroy
        elif self.action == "me":
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_destroy(self, instance):
        """Eliminar usuario personalizado y su correspondiente usuario Django"""
        # Solo superusuarios y staff pueden eliminar
        if not (self.request.user.is_superuser or self.request.user.is_staff):
            raise PermissionDenied("No tienes permisos para eliminar usuarios")

        try:
            # Buscar y eliminar el usuario Django correspondiente
            from django.contrib.auth.models import User
            django_user = User.objects.get(id=instance.id_usuario)

            # Eliminar primero el usuario personalizado
            instance.delete()

            # Luego eliminar el usuario Django
            django_user.delete()

        except User.DoesNotExist:
            # Si no existe el usuario Django, solo eliminar el personalizado
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error al eliminar usuario: {str(e)}")

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
# PQRS PARA USUARIOS (Endpoints específicos)
# ====================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_transactions_for_pqrs(request):
    """Obtener transacciones del usuario para crear PQRs"""
    try:
        # Obtener el usuario de la tabla personalizada basado en el email
        django_user = request.user
        usuario = Usuarios.objects.get(email_usuario=django_user.email)

        # Obtener transacciones del usuario
        transacciones = Transacciones.objects.filter(usuario=usuario).order_by('-fecha_transaccion')

        transactions_data = []
        for transaccion in transacciones:
            transactions_data.append({
                'id_transaccion': transaccion.id_transaccion,
                'fecha_transaccion': transaccion.fecha_transaccion.strftime('%Y-%m-%d %H:%M'),
                'descripcion': f"Transacción #{transaccion.id_transaccion} - {transaccion.fecha_transaccion.strftime('%d/%m/%Y')}"
            })

        return Response({
            'transactions': transactions_data,
            'user_info': {
                'id_usuario': usuario.id_usuario,
                'nombre': f"{usuario.nombres_usuario} {usuario.apellidos_usuario}",
                'email': usuario.email_usuario
            }
        })

    except Usuarios.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al obtener transacciones: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@method_decorator(csrf_exempt, name='dispatch')
class CreateUserPQRView(APIView):
    """Vista para crear una nueva PQR por parte del usuario"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Método GET para verificar que la vista funciona"""
        return Response({
            'message': 'CreateUserPQRView está funcionando correctamente',
            'methods_allowed': ['GET', 'POST']
        }, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            # Obtener el usuario de la tabla personalizada
            django_user = request.user
            usuario = Usuarios.objects.get(email_usuario=django_user.email)

            # Validar datos requeridos
            tipo_pqr = request.data.get('tipo_pqr')
            descripcion_pqr = request.data.get('descripcion_pqr')
            id_transaccion = request.data.get('id_transaccion')

            if not all([tipo_pqr, descripcion_pqr, id_transaccion]):
                return Response(
                    {'error': 'Todos los campos son requeridos'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validar que la transacción pertenezca al usuario
            try:
                transaccion = Transacciones.objects.get(
                    id_transaccion=id_transaccion,
                    usuario=usuario
                )
            except Transacciones.DoesNotExist:
                return Response(
                    {'error': 'Transacción no encontrada o no pertenece al usuario'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Crear la PQR
            pqr = Pqrs.objects.create(
                tipo_pqr=tipo_pqr,
                descripcion_pqr=descripcion_pqr,
                id_transaccion=transaccion
            )

            # Retornar la PQR creada
            return Response({
                'message': 'PQR creada exitosamente',
                'pqr': {
                    'id_pqr': pqr.id_pqr,
                    'tipo_pqr': pqr.tipo_pqr,
                    'descripcion_pqr': pqr.descripcion_pqr,
                    'fecha_pqr': pqr.fecha_pqr,
                    'estado': 'Pendiente de revisión'
                }
            }, status=status.HTTP_201_CREATED)

        except Usuarios.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al crear PQR: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_pqrs_list(request):
    """Obtener todas las PQRs del usuario autenticado"""
    try:
        # Obtener el usuario de la tabla personalizada
        django_user = request.user
        usuario = Usuarios.objects.get(email_usuario=django_user.email)

        # Obtener PQRs del usuario a través de transacciones
        pqrs = Pqrs.objects.filter(
            id_transaccion__usuario=usuario
        ).select_related('id_transaccion').order_by('-fecha_pqr')

        pqrs_data = []
        for pqr in pqrs:
            pqrs_data.append({
                'id_pqr': pqr.id_pqr,
                'tipo_pqr': pqr.tipo_pqr,
                'descripcion_pqr': pqr.descripcion_pqr,
                'fecha_pqr': pqr.fecha_pqr,
                'estado': 'Pendiente de revisión',  # Por ahora estado fijo
                'transaccion': {
                    'id_transaccion': pqr.id_transaccion.id_transaccion,
                    'fecha_transaccion': pqr.id_transaccion.fecha_transaccion
                }
            })

        return Response({
            'pqrs': pqrs_data,
            'total': len(pqrs_data)
        })

    except Usuarios.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error al obtener PQRs: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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


# ====================================
# MÉTRICAS PARA DASHBOARD ADMINISTRATIVO
# ====================================

@api_view(['GET'])
def admin_dashboard_metrics(request):
    """
    Endpoint para obtener métricas reales del dashboard administrativo
    """
    try:
        from django.db.models import Count, Sum, Q
        from datetime import datetime, timedelta
        from django.utils import timezone

        # Fecha actual y rangos de tiempo
        now = timezone.now()
        today = now.date()
        first_day_month = today.replace(day=1)
        last_month = (first_day_month - timedelta(days=1)).replace(day=1)

        # ============ MÉTRICAS DE USUARIOS ============
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()

        # Usuarios nuevos (registrados en los últimos 30 días)
        thirty_days_ago = now - timedelta(days=30)
        new_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()

        # ============ MÉTRICAS DE TRANSACCIONES ============
        total_transactions = Transacciones.objects.count()

        # Transacciones de hoy
        today_transactions = Transacciones.objects.filter(
            fecha_transaccion__date=today
        ).count()

        # Calcular tendencia de transacciones (mes actual vs mes anterior)
        current_month_transactions = Transacciones.objects.filter(
            fecha_transaccion__date__gte=first_day_month
        ).count()

        last_month_transactions = Transacciones.objects.filter(
            fecha_transaccion__date__gte=last_month,
            fecha_transaccion__date__lt=first_day_month
        ).count()

        transactions_trend = 0
        if last_month_transactions > 0:
            transactions_trend = round(
                ((current_month_transactions - last_month_transactions) / last_month_transactions) * 100, 1
            )

        # ============ MÉTRICAS DE ARTÍCULOS ============
        total_articles = Articulos.objects.count()
        pending_articles = Articulos.objects.filter(disponible=False).count()

        # ============ MÉTRICAS DE INGRESOS ============
        # Calcular ingresos totales basados en transacciones
        total_revenue = 0
        monthly_revenue = 0

        # Obtener todos los detalles de transacciones con artículos
        all_transactions = ArticuloDetalleTransaccion.objects.select_related(
            'id_articulo', 'id_detalle_transaccion__id_transaccion'
        ).all()

        # Calcular ingresos totales
        for item in all_transactions:
            subtotal = item.id_articulo.precio_articulo * item.cantidad
            total_revenue += subtotal

            # Ingresos del mes actual
            if item.id_detalle_transaccion.id_transaccion.fecha_transaccion.date() >= first_day_month:
                monthly_revenue += subtotal

        # Calcular tendencia de ingresos (mes actual vs mes anterior)
        last_month_revenue = 0
        for item in all_transactions:
            transaction_date = item.id_detalle_transaccion.id_transaccion.fecha_transaccion.date()
            if last_month <= transaction_date < first_day_month:
                subtotal = item.id_articulo.precio_articulo * item.cantidad
                last_month_revenue += subtotal

        revenue_trend = 0
        if last_month_revenue > 0:
            revenue_trend = round(
                ((monthly_revenue - last_month_revenue) / last_month_revenue) * 100, 1
            )

        # ============ RESPUESTA ============
        metrics_data = {
            "users": {
                "total": total_users,
                "active": active_users,
                "new": new_users
            },
            "transactions": {
                "total": total_transactions,
                "today": today_transactions,
                "trend": transactions_trend
            },
            "articles": {
                "total": total_articles,
                "pending": pending_articles
            },
            "revenue": {
                "total": int(total_revenue),
                "monthly": int(monthly_revenue),
                "trend": revenue_trend
            },
            "alerts": []  # Se puede expandir para alertas reales
        }

        return Response(metrics_data, status=200)

    except Exception as e:
        return Response(
            {"error": f"Error al obtener métricas: {str(e)}"},
            status=500
        )


# ====================================
# GESTIÓN COMPLETA DE USUARIOS PARA ADMIN
# ====================================

class AdminUsersCompleteView(APIView):
    """
    Endpoint para obtener lista completa de usuarios con información de roles y grupos
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            from django.contrib.auth.models import User, Group

            # Log para debugging
            print(f"AdminUsersCompleteView: User={request.user}, Authenticated={request.user.is_authenticated}")

            users_data = []

            for user in User.objects.all().order_by('-date_joined'):
                # Obtener usuario del modelo custom si existe
                custom_user = None
                try:
                    custom_user = Usuarios.objects.get(email_usuario=user.email)
                except Usuarios.DoesNotExist:
                    pass

                # Obtener grupos y roles
                groups = list(user.groups.values_list('name', flat=True))

                user_info = {
                    "id": user.id,
                    "id_usuario": custom_user.id_usuario if custom_user else None,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "nombres_usuario": custom_user.nombres_usuario if custom_user else user.first_name,
                    "apellidos_usuario": custom_user.apellidos_usuario if custom_user else user.last_name,
                    "telefono_usuario": custom_user.telefono_usuario if custom_user else "",
                    "direccion_usuario": custom_user.direccion_usuario if custom_user else "",
                    "fecha_registro": custom_user.fecha_registro if custom_user else user.date_joined.date(),
                    "is_active": user.is_active,
                    "is_superuser": user.is_superuser,
                    "is_staff": user.is_staff,
                    "groups": groups,
                    "last_login": user.last_login,
                    "date_joined": user.date_joined
                }

                users_data.append(user_info)

            return Response({
                "users": users_data,
                "total": len(users_data)
            }, status=200)

        except Exception as e:
            return Response(
                {"error": f"Error al obtener usuarios: {str(e)}"},
                status=500
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_groups_list(request):
    """
    Endpoint para obtener lista de grupos disponibles
    """
    try:
        from django.contrib.auth.models import Group

        groups = Group.objects.all().values('id', 'name')

        return Response({
            "groups": list(groups)
        }, status=200)

    except Exception as e:
        return Response(
            {"error": f"Error al obtener grupos: {str(e)}"},
            status=500
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_update_user_groups(request, user_id):
    """
    Endpoint para actualizar los grupos de un usuario
    """
    try:
        from django.contrib.auth.models import User, Group

        user = User.objects.get(id=user_id)
        group_names = request.data.get('groups', [])

        # Limpiar grupos actuales
        user.groups.clear()

        # Agregar nuevos grupos
        for group_name in group_names:
            try:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
            except Group.DoesNotExist:
                continue

        return Response({
            "message": "Grupos actualizados correctamente",
            "groups": list(user.groups.values_list('name', flat=True))
        }, status=200)

    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    except Exception as e:
        return Response(
            {"error": f"Error al actualizar grupos: {str(e)}"},
            status=500
        )


# ====================================
# VENDEDOR DASHBOARD ENDPOINTS
# ====================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendedor_dashboard_metrics(request):
    """
    Endpoint para obtener métricas específicas del dashboard de vendedor
    """
    try:
        from django.db.models import Count, Sum, Q
        from datetime import datetime, timedelta
        from django.utils import timezone

        # Obtener el usuario de Eduney basado en el usuario Django autenticado
        try:
            usuario_eduney = Usuarios.objects.get(id_usuario=request.user.id)
        except Usuarios.DoesNotExist:
            return Response(
                {"error": "Usuario de Eduney no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fecha actual y rangos de tiempo
        now = timezone.now()
        today = now.date()
        first_day_month = today.replace(day=1)

        # ============ MÉTRICAS DE ARTÍCULOS DEL VENDEDOR ============
        total_articles = Articulos.objects.filter(id_usuario=usuario_eduney).count()
        active_articles = Articulos.objects.filter(
            id_usuario=usuario_eduney,
            disponible=True
        ).count()
        sold_articles = total_articles - active_articles

        # ============ MÉTRICAS DE VENTAS ============
        # Obtener todas las transacciones donde se vendieron artículos del vendedor
        ventas_query = ArticuloDetalleTransaccion.objects.filter(
            id_articulo__id_usuario=usuario_eduney
        ).select_related(
            'id_detalle_transaccion__id_transaccion',
            'id_articulo'
        )

        total_sales = ventas_query.count()

        # Ventas del mes actual
        monthly_sales = ventas_query.filter(
            id_detalle_transaccion__id_transaccion__fecha_transaccion__date__gte=first_day_month
        ).count()

        # ============ MÉTRICAS DE INGRESOS ============
        total_revenue = 0
        monthly_revenue = 0

        for venta in ventas_query:
            subtotal = venta.id_articulo.precio_articulo * venta.cantidad
            total_revenue += subtotal

            # Ingresos del mes actual
            if venta.id_detalle_transaccion.id_transaccion.fecha_transaccion.date() >= first_day_month:
                monthly_revenue += subtotal

        # ============ ESTADÍSTICAS ADICIONALES ============
        # Para vistas e interés, por ahora usamos datos simulados ya que no tenemos tabla de vistas
        total_views = total_articles * 15  # Simulación: promedio 15 vistas por artículo
        interested_users = int(total_views * 0.1)  # Simulación: 10% de las vistas son usuarios interesados

        # ============ RESPUESTA ============
        metrics_data = {
            "articulos": {
                "total": total_articles,
                "activos": active_articles,
                "vendidos": sold_articles
            },
            "ventas": {
                "total": total_sales,
                "mes": monthly_sales,
                "ingresos": int(total_revenue)
            },
            "estadisticas": {
                "vistas": total_views,
                "interes": interested_users
            }
        }

        return Response(metrics_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Error al obtener métricas del vendedor: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendedor_articulos_recientes(request):
    """
    Endpoint para obtener los artículos más recientes del vendedor
    """
    try:
        # Obtener el usuario de Eduney basado en el usuario Django autenticado
        try:
            usuario_eduney = Usuarios.objects.get(id_usuario=request.user.id)
        except Usuarios.DoesNotExist:
            return Response(
                {"error": "Usuario de Eduney no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener los últimos 10 artículos del vendedor
        articulos = Articulos.objects.filter(
            id_usuario=usuario_eduney
        ).select_related('id_categoria').order_by('-id_articulo')[:10]

        articulos_data = []
        for articulo in articulos:
            # Simular vistas por artículo (en el futuro esto vendría de una tabla de analytics)
            simulated_views = articulo.id_articulo * 3  # Simulación simple

            articulos_data.append({
                "id": articulo.id_articulo,
                "titulo": articulo.titulo_articulo,
                "categoria": articulo.id_categoria.nombre_categoria,
                "precio": float(articulo.precio_articulo),
                "disponible": articulo.disponible,
                "vistas": simulated_views,
                "imagen": request.build_absolute_uri(articulo.imagen.url) if articulo.imagen else None
            })

        return Response({
            "articulos": articulos_data,
            "total": len(articulos_data)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Error al obtener artículos: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendedor_transacciones_recientes(request):
    """
    Endpoint para obtener las transacciones recientes donde se vendieron artículos del vendedor
    """
    try:
        # Obtener el usuario de Eduney basado en el usuario Django autenticado
        try:
            usuario_eduney = Usuarios.objects.get(id_usuario=request.user.id)
        except Usuarios.DoesNotExist:
            return Response(
                {"error": "Usuario de Eduney no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener las últimas 10 transacciones donde se vendieron artículos del vendedor
        transacciones_vendedor = ArticuloDetalleTransaccion.objects.filter(
            id_articulo__id_usuario=usuario_eduney
        ).select_related(
            'id_detalle_transaccion__id_transaccion',
            'id_articulo'
        ).order_by('-id_detalle_transaccion__id_transaccion__fecha_transaccion')[:10]

        transacciones_data = []
        for detalle in transacciones_vendedor:
            transaccion = detalle.id_detalle_transaccion.id_transaccion
            monto = float(detalle.id_articulo.precio_articulo * detalle.cantidad)

            transacciones_data.append({
                "articulo": detalle.id_articulo.titulo_articulo,
                "fecha": transaccion.fecha_transaccion.strftime('%d %b %Y'),
                "monto": monto,
                "estado": "Completada",  # Por simplicidad, todas las transacciones están completadas
                "cantidad": detalle.cantidad,
                "id_transaccion": transaccion.id_transaccion
            })

        return Response({
            "transacciones": transacciones_data,
            "total": len(transacciones_data)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Error al obtener transacciones: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ====================================
# EMAIL VERIFICATION ENDPOINTS
# ====================================

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    """Verificar email usando token"""
    try:
        usuario = EmailVerificationUtils.verify_email_token(token)

        if not usuario:
            return Response({
                'error': 'Token inválido o expirado',
                'code': 'INVALID_TOKEN'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar email
        EmailVerificationUtils.mark_email_verified(usuario)

        return Response({
            'message': 'Email verificado exitosamente',
            'user': {
                'id': usuario.id_usuario,
                'nombres': usuario.nombres_usuario,
                'email': usuario.email_usuario,
                'verified': True
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Error al verificar email: {str(e)}',
            'code': 'VERIFICATION_ERROR'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    """Reenviar email de verificación"""
    try:
        email = request.data.get('email')

        if not email:
            return Response({
                'error': 'Email es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuarios.objects.get(email_usuario=email)
        except Usuarios.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verificar si ya está verificado
        if usuario.email_verified:
            return Response({
                'error': 'El email ya está verificado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar rate limiting
        if not EmailVerificationUtils.can_resend_verification(usuario):
            return Response({
                'error': 'Debes esperar antes de solicitar otro email',
                'code': 'RATE_LIMITED'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Enviar email
        if EmailVerificationUtils.send_verification_email(usuario):
            return Response({
                'message': 'Email de verificación enviado',
                'email': email
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Error al enviar email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'error': f'Error al reenviar email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def verification_status(request):
    """Verificar estado de verificación de un email"""
    try:
        email = request.GET.get('email')

        if not email:
            return Response({
                'error': 'Email es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuarios.objects.get(email_usuario=email)
        except Usuarios.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'email': email,
            'verified': usuario.email_verified,
            'active': usuario.is_active,
            'has_pending_verification': bool(usuario.verification_token),
            'token_expires': usuario.verification_token_expires
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Error al verificar estado: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
