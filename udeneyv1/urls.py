from django.urls import path, include
from . import views  # Importa las vistas desde la misma app
from rest_framework.routers import DefaultRouter
from .views import (
    UsuariosViewSet, ArticulosViewSet, CategoriasViewSet, RolesViewSet,
    UsuarioRolViewSet, DetalleTransaccionViewSet, TransaccionesViewSet,
    CalificacionesViewSet, PagosViewSet, PqrsViewSet, 
)

# Configura el router para las rutas generadas automáticamente
router = DefaultRouter()
router.register(r'usuarios', UsuariosViewSet)
router.register(r'articulos', ArticulosViewSet)
router.register(r'categorias', CategoriasViewSet)
router.register(r'roles', RolesViewSet)
router.register(r'usuario-rol', UsuarioRolViewSet)
router.register(r'detalle_transaccion', DetalleTransaccionViewSet)
router.register(r'transacciones', TransaccionesViewSet)
router.register(r'calificaciones', CalificacionesViewSet)
router.register(r'pagos', PagosViewSet)
router.register(r'pqrs', PqrsViewSet)


urlpatterns = [
    # Incluir las rutas generadas automáticamente por el router
    path('', include(router.urls)),
    path('register/', views.register, name='register'),  # Ruta para la página de registro
]



