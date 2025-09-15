# 🚀 Guía de Migración del Sistema de Roles Eduney

## 📋 Resumen

Este documento explica la migración completa del sistema de roles personalizado a **Groups y Permissions nativo de Django**, agregando los nuevos roles solicitados mientras mantiene todas las funcionalidades existentes.

## ✨ Nuevas Funcionalidades

### 🔐 Roles Implementados

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **Vendedor** | Usuario que vende productos | Crear/editar artículos, ver historial de transacciones |
| **Comprador** | Usuario que compra productos | Crear transacciones, calificar, ver historial |
| **Admin_Negocio** | Administrador del negocio | Gestionar usuarios, ver reportes, moderar contenido |
| **Monitor** | Auditoría y monitoreo | Solo lectura: transacciones, reportes, logs |
| **Superadmin** | Administrador técnico | Acceso total al sistema |

### 🎯 Características Principales

- ✅ **Mantiene funcionalidades existentes**: Vendedores y compradores conservan acceso al historial
- ✅ **Seguridad robusta**: JWT tokens incluyen roles y permisos
- ✅ **UI responsiva**: Material UI con diseño adaptativo
- ✅ **Escalabilidad**: Fácil agregar nuevos roles y permisos
- ✅ **Auditoría**: Sistema de logs para acciones administrativas

## 🛠️ Instalación y Configuración

### 1. Configuración del Backend

#### Ejecutar la migración de roles:
```bash
# Crear groups y permisos
python manage.py setup_roles

# Migrar usuarios existentes al nuevo sistema
python manage.py setup_roles --migrate-existing

# (Opcional) Crear superadmin por defecto
python manage.py setup_roles --create-superadmin
```

#### Verificar la migración:
```bash
# Ver usuarios y sus grupos
python manage.py shell
>>> from django.contrib.auth.models import User, Group
>>> for user in User.objects.all():
...     print(f"{user.username}: {list(user.groups.values_list('name', flat=True))}")
```

### 2. Configuración del Frontend

#### Instalar dependencias (si no están instaladas):
```bash
cd client
npm install
```

#### Verificar rutas protegidas:
- `/admin-dashboard` - Solo Admin_Negocio
- `/monitor-dashboard` - Solo Monitor y Admin_Negocio  
- `/vendedor-dashboard` - Solo Vendedor
- `/comprador-dashboard` - Solo Comprador
- `/dashboard` - Cualquier usuario autenticado (redirige según rol)

## 🔄 Flujo de Usuario por Rol

### 👤 Vendedor
```
Login → Vendedor Dashboard → Gestión de artículos
                           → Ver historial de transacciones ✅ (MANTENIDO)
                           → Crear nuevos artículos
```

### 🛒 Comprador  
```
Login → Comprador Dashboard → Explorar productos
                            → Ver historial de transacciones ✅ (MANTENIDO)
                            → Realizar compras
```

### 👔 Admin_Negocio
```
Login → Admin Dashboard → Gestión de usuarios
                        → Reportes de negocio
                        → Moderación de contenido
                        → Ver todas las transacciones
```

### 📊 Monitor
```
Login → Monitor Dashboard → Métricas del sistema (solo lectura)
                          → Logs de auditoría
                          → Reportes de actividad
```

## 🔧 API Endpoints

### Endpoints Existentes (Sin Cambios)
```
GET /api/v1/historial/ - Historial de transacciones (Vendedor/Comprador)
POST /api/v1/crear-transaccion/ - Crear transacción (Comprador)
GET /api/v1/articulos/ - Listar artículos (Público)
POST /api/v1/articulos/ - Crear artículo (Vendedor)
GET /api/v1/login/ - Autenticación (con roles extendidos)
POST /api/v1/register/ - Registro de usuario
```

### Nuevos Endpoints Administrativos
```
# Gestión de usuarios (Admin_Negocio)
GET /api/v1/admin/users/ - Listar usuarios
POST /api/v1/admin/users/{id}/block_user/ - Bloquear usuario
GET /api/v1/admin/users/{id}/user_activity/ - Actividad de usuario

# Reportes (Admin_Negocio, Monitor)
GET /api/v1/admin/reports/business_overview/ - Resumen del negocio
GET /api/v1/admin/reports/transaction_report/ - Reporte de transacciones
GET /api/v1/admin/reports/user_engagement/ - Engagement de usuarios

# Moderación (Admin_Negocio)
GET /api/v1/admin/moderation/pending_reviews/ - Contenido pendiente
POST /api/v1/admin/moderation/{id}/moderate_article/ - Moderar artículo

# Monitoreo (Monitor, Admin_Negocio)
GET /api/v1/monitor/system_health/ - Estado del sistema
GET /api/v1/monitor/audit_logs/ - Logs de auditoría

# Configuración (Solo Superuser)
GET /api/v1/admin/system/config/ - Configuración del sistema
```

## 🛡️ Seguridad Implementada

### JWT Tokens Extendidos
```json
{
  "user_id": 123,
  "username": "vendedor@eduney.com",
  "groups": ["Vendedor"],
  "permissions": ["add_articulos", "view_own_transacciones"],
  "is_superuser": false,
  "is_staff": false
}
```

### Validaciones de Seguridad
- ✅ **Backend**: Permisos verificados en cada endpoint
- ✅ **Frontend**: Rutas protegidas por componentes de guardia
- ✅ **UI Dinámica**: Elementos mostrados según permisos
- ✅ **Auditoría**: Todas las acciones administrativas son registradas

## 📱 Componentes Frontend

### Hooks Personalizados
```javascript
// Hook principal de roles
const { 
  isVendedor, 
  isComprador, 
  isAdmin, 
  canViewTransactions,
  hasRole 
} = useRoleAuth();

// Verificación de roles específicos
const { hasAccess } = useRoleCheck(['Admin_Negocio']);
```

### Componentes de Protección
```jsx
// Ruta protegida genérica
<ProtectedRoute requiredRoles={['Vendedor']}>
  <MisArticulos />
</ProtectedRoute>

// Rutas específicas
<AdminRoute><AdminDashboard /></AdminRoute>
<VendedorRoute><VendedorDashboard /></VendedorRoute>
```

### Navegación Dinámica
- Menú se adapta automáticamente según el rol del usuario
- Historial de transacciones **MANTENIDO** para vendedores y compradores
- Diseño responsivo con Material UI

## 🧪 Testing

### Tests Backend
```bash
# Ejecutar tests de permisos
python manage.py test udeneyv1.tests.test_permissions

# Test específicos de roles
python manage.py test udeneyv1.tests.test_roles
```

### Tests Frontend
```bash
cd client
npm test -- --testNamePattern="Role"
```

## 📊 Métricas y Monitoreo

### Dashboard Admin_Negocio
- 📈 Total de usuarios activos
- 💰 Ingresos y transacciones
- 📋 Actividad reciente
- ⚠️ Alertas del sistema

### Dashboard Monitor
- 🖥️ Métricas de rendimiento del sistema
- 📋 Logs de auditoría en tiempo real  
- 🔒 Estado de seguridad
- 📊 Estadísticas de uso

### Dashboard Vendedor (Mejorado)
- 📦 Gestión de artículos
- 💼 Métricas de ventas
- 📈 **Historial de transacciones** ✅ (MANTENIDO)
- 💡 Consejos para vender más

### Dashboard Comprador (Mejorado)
- 🔍 Exploración de productos
- ❤️ Lista de favoritos
- 🛒 Carrito de compras
- 📋 **Historial de compras** ✅ (MANTENIDO)

## 🚀 Próximos Pasos

1. **Ejecutar comando de migración**:
   ```bash
   python manage.py setup_roles --migrate-existing
   ```

2. **Probar funcionalidades existentes**:
   - Login de vendedor/comprador existente
   - Acceso al historial de transacciones
   - Crear/editar artículos

3. **Crear usuarios administrativos**:
   ```bash
   python manage.py createsuperuser
   # O usar el comando con flag
   python manage.py setup_roles --create-superadmin
   ```

4. **Verificar nuevos roles**:
   - Crear usuario Admin_Negocio desde Django Admin
   - Asignar grupo "Admin_Negocio" al usuario
   - Probar acceso a `/admin-dashboard`

## ⚠️ Consideraciones Importantes

### Para Desarrolladores
- Los models antiguos (`UsuarioRol`, `Roles`) se mantienen para compatibilidad pero ya no se usan
- Usar `permissions_new.py` en lugar de `permissions.py` 
- JWT tokens incluyen información de roles automáticamente

### Para Usuarios Existentes
- **No requiere re-registro**: Los usuarios existentes funcionan normalmente
- **Historial preserved**: Todo el historial de transacciones se mantiene
- **Nuevas funcionalidades**: Dashboards mejorados con más información

### Para Administradores
- **Migración automática**: El comando maneja la transición
- **Permisos granulares**: Fácil customizar permisos por rol
- **Auditoría completa**: Todas las acciones quedan registradas

## 🆘 Resolución de Problemas

### Usuario no puede acceder después de migración
```bash
# Verificar que el usuario tiene un grupo asignado
python manage.py shell
>>> user = User.objects.get(username='usuario@email.com')
>>> user.groups.all()  # Debe mostrar al menos un grupo
```

### Dashboard no carga correctamente
1. Verificar que el token JWT incluye información de grupos
2. Comprobar que el componente `RoleBasedNavigation` está renderizando
3. Verificar rutas en `appRoutes.jsx`

### Permisos no funcionan en API
1. Verificar que views usan `permissions_new.py`
2. Comprobar que endpoints usan las clases de permisos correctas
3. Verificar JWT token en Authorization header

## 📞 Contacto y Soporte

Si tienes problemas con la migración:

1. **Revisar logs de Django**: `python manage.py runserver --verbosity=2`
2. **Verificar logs de frontend**: Consola del navegador
3. **Ejecutar tests**: Para verificar que todo funciona correctamente

---

🎉 **¡El sistema de roles extendido está listo!** Mantiene toda la funcionalidad existente mientras agrega poderosas capacidades administrativas y de monitoreo.