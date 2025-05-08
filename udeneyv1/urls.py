from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticuloDetailAPIView
# importación para token de validación
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

from .views import (
    UsuariosViewSet,
    ArticulosViewSet,
    CategoriasViewSet,
    RolesViewSet,
    UsuarioRolViewSet,
    DetalleTransaccionViewSet,
    TransaccionesViewSet,
    CalificacionesViewSet,
    PagosViewSet,
    PqrsViewSet,
    LoginView,
    RegistroUsuarioView,
    historial_transacciones_api
)

# Configura el router para las rutas generadas automáticamente
router = DefaultRouter()
router.register(r"usuarios", UsuariosViewSet)
router.register(r"articulos", ArticulosViewSet)
router.register(r"categorias", CategoriasViewSet)
router.register(r"roles", RolesViewSet)
router.register(r"usuario-rol", UsuarioRolViewSet)
router.register(r"detalle_transaccion", DetalleTransaccionViewSet)
router.register(r"transacciones", TransaccionesViewSet)
router.register(r"calificaciones", CalificacionesViewSet)
router.register(r"pagos", PagosViewSet)
router.register(r"pqrs", PqrsViewSet)


urlpatterns = [
    # Incluir las rutas generadas automáticamente por el router
    path("", include(router.urls)),
    path("register/", RegistroUsuarioView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path(
        "articulos/<int:id_articulo>/",
        ArticuloDetailAPIView.as_view(),
        name="detalle-articulo"),
    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'),
    # Para obtener token
    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'),
    # Para refrescar token
    path(
        "historial/",
        historial_transacciones_api,
        name="historial_api"),
    # Solicitar historial transacciones

]
static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
