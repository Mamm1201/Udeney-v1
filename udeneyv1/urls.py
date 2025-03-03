from django.urls import path, include
from . import views  # Importa las vistas desde la misma app
from rest_framework.routers import DefaultRouter
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # importación para token de validación
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
    path("register/", views.register, name="register"),  
    path("login/", LoginView.as_view(), name="login"),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Para obtener token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Para refrescar token
    # path("", TemplateView.as_view(template_name="index.html"), name="home"),
]
