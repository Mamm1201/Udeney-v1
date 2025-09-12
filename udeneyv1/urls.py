# ====================================
# IMPORTACIONES
# ====================================
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import metrics views
from .metrics_views import (HealthCheckAPIView, MetricsAPIView, MetricsDashboardAPIView,
                            MetricsResetAPIView, PerformanceAPIView)
# Vistas personalizadas
from .views import (ArticuloDetailAPIView, ArticulosViewSet, CacheStatsView,
                    CalificacionesViewSet, CategoriasViewSet, DetalleTransaccionViewSet,
                    LoginView, MisTransaccionesView, PagosViewSet, PqrsViewSet,
                    RegistroUsuarioView, ResumenCompraAPIView, RolesViewSet,
                    TransaccionesViewSet, UsuarioRolViewSet, UsuariosViewSet,
                    WarmupCacheView, crear_con_detalles, historial_transacciones_api)

# ====================================
# ROUTER DRF (Rutas automáticas para ViewSets)
# ====================================
router = DefaultRouter()
router.register(r"usuarios", UsuariosViewSet)
router.register(r"categorias", CategoriasViewSet)
router.register(r"roles", RolesViewSet)
router.register(r"usuario-rol", UsuarioRolViewSet)
router.register(r"detalle_transaccion", DetalleTransaccionViewSet)
router.register(r"transacciones", TransaccionesViewSet)
router.register(r"calificaciones", CalificacionesViewSet)
router.register(r"pagos", PagosViewSet)
router.register(r"pqrs", PqrsViewSet)
router.register(r"articulos", ArticulosViewSet, basename="articulos")

# ====================================
# URLPATTERNS (Rutas de la aplicación)
# ====================================
urlpatterns = [
    # Rutas de los ViewSets registrados
    path("", include(router.urls)),
    # Autenticación JWT
    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    # Registro e inicio de sesión
    path(
        "register/",
        RegistroUsuarioView.as_view(),
        name="register",
    ),
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),
    # Artículos
    path(
        "articulos/<int:id_articulo>/",
        ArticuloDetailAPIView.as_view(),
        name="detalle-articulo",
    ),
    # Transacciones
    path(
        "crear-transaccion/",
        crear_con_detalles,
        name="crear_transaccion",
    ),
    path(
        "resumen-compra/<int:id_transaccion>/",
        ResumenCompraAPIView.as_view(),
        name="resumen-compra",
    ),
    path(
        "transacciones/usuario/<int:id_usuario>/",
        MisTransaccionesView.as_view(),
        name="mis-transacciones",
    ),
    path(
        "historial/",
        historial_transacciones_api,
        name="historial_api",
    ),
    # Cache management
    path(
        "cache/stats/",
        CacheStatsView.as_view(),
        name="cache-stats",
    ),
    path(
        "cache/warmup/",
        WarmupCacheView.as_view(),
        name="cache-warmup",
    ),
    # Metrics endpoints
    path(
        "metrics/",
        MetricsAPIView.as_view(),
        name="metrics",
    ),
    path(
        "metrics/performance/",
        PerformanceAPIView.as_view(),
        name="metrics-performance",
    ),
    path(
        "metrics/dashboard/",
        MetricsDashboardAPIView.as_view(),
        name="metrics-dashboard",
    ),
    path(
        "metrics/reset/",
        MetricsResetAPIView.as_view(),
        name="metrics-reset",
    ),
    # Health check
    path(
        "health/",
        HealthCheckAPIView.as_view(),
        name="health-check",
    ),
]

# Archivos multimedia (en desarrollo)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
