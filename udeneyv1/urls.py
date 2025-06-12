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
    historial_transacciones_api,
    detalle_transaccion_con_articulo,
    crear_con_detalles,  # ⬅️ import necesario
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
    # Rutas del router
    path("", include(router.urls)),

    # Rutas personalizadas
    path("register/", RegistroUsuarioView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    path("articulos/<int:id_articulo>/", ArticuloDetailAPIView.as_view(), name="detalle-articulo"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("historial/", historial_transacciones_api, name="historial_api"),
    path("detalle-transaccion/<int:id_detalle_transaccion>/", detalle_transaccion_con_articulo),

    # ✅ Ruta definitiva y sin conflicto para POST
    # path("api/v1/crear-transaccion/", crear_con_detalles, name="crear_con_detalles"),
    path("crear-transaccion/", crear_con_detalles, name="crear_transaccion"),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

