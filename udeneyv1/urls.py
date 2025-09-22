# ====================================
# IMPORTACIONES
# ====================================
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Admin views (nuevos endpoints para roles administrativos)
from .admin_views import (ContentModerationViewSet, MonitorViewSet, PromotionsViewSet,
                          ReportsViewSet, UserManagementViewSet, system_configuration, system_metrics)
# Import metrics views
from .metrics_views import (HealthCheckAPIView, MetricsAPIView, MetricsDashboardAPIView,
                            MetricsResetAPIView, PerformanceAPIView)
# Vistas personalizadas
from .views import (ArticuloDetailAPIView, ArticulosViewSet, CacheStatsView,
                    CalificacionesViewSet, CategoriasViewSet, DetalleTransaccionViewSet,
                    LoginView, MisTransaccionesView, PagosViewSet, PqrsViewSet,
                    RegistroUsuarioView, ResumenCompraAPIView, RolesViewSet,
                    TransaccionesViewSet, UsuarioRolViewSet, UsuariosViewSet,
                    WarmupCacheView, crear_con_detalles, historial_transacciones_api,
                    admin_dashboard_metrics, AdminUsersCompleteView, admin_groups_list,
                    admin_update_user_groups, user_transactions_for_pqrs, CreateUserPQRView,
                    user_pqrs_list, verify_email, resend_verification_email, verification_status,
                    vendedor_dashboard_metrics, vendedor_articulos_recientes, vendedor_transacciones_recientes)

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

# Rutas administrativas (solo para roles específicos)
router.register(r"admin/users", UserManagementViewSet, basename="admin-users")
router.register(r"admin/reports", ReportsViewSet, basename="admin-reports")
router.register(
    r"admin/moderation", ContentModerationViewSet, basename="admin-moderation"
)
router.register(r"admin/promotions", PromotionsViewSet, basename="admin-promotions")
router.register(r"monitor", MonitorViewSet, basename="monitor")

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
    # Admin dashboard metrics
    path(
        "admin/dashboard/metrics/",
        admin_dashboard_metrics,
        name="admin-dashboard-metrics",
    ),
    # Admin user management
    path(
        "admin/complete-users/",
        AdminUsersCompleteView.as_view(),
        name="admin-users-complete",
    ),
    path(
        "admin/groups/",
        admin_groups_list,
        name="admin-groups-list",
    ),
    path(
        "admin/users/<int:user_id>/groups/",
        admin_update_user_groups,
        name="admin-update-user-groups",
    ),
    # System configuration (solo superusers)
    path(
        "admin/system/config/",
        system_configuration,
        name="system-config",
    ),
    path(
        "admin/system/metrics/",
        system_metrics,
        name="system-metrics",
    ),
    # PQRs para usuarios
    path(
        "user-pqrs/transactions/",
        user_transactions_for_pqrs,
        name="user-transactions-pqrs",
    ),
    path(
        "user-pqrs/create/",
        CreateUserPQRView.as_view(),
        name="create-user-pqr",
    ),
    path(
        "user-pqrs/list/",
        user_pqrs_list,
        name="user-pqrs-list",
    ),
    # Email verification endpoints
    path(
        "verify-email/<str:token>/",
        verify_email,
        name="verify-email",
    ),
    path(
        "resend-verification/",
        resend_verification_email,
        name="resend-verification",
    ),
    path(
        "verification-status/",
        verification_status,
        name="verification-status",
    ),
    # Vendedor dashboard endpoints
    path(
        "vendedor/dashboard/metrics/",
        vendedor_dashboard_metrics,
        name="vendedor-dashboard-metrics",
    ),
    path(
        "vendedor/articulos/recientes/",
        vendedor_articulos_recientes,
        name="vendedor-articulos-recientes",
    ),
    path(
        "vendedor/transacciones/recientes/",
        vendedor_transacciones_recientes,
        name="vendedor-transacciones-recientes",
    ),
]

# Archivos multimedia (en desarrollo)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
