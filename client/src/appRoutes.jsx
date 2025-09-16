import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes de protección y navegación
import RoleBasedNavigation from './components/common/RoleBasedNavigation';
import ProtectedRoute, { 
  AdminRoute, 
  MonitorRoute, 
  VendedorRoute, 
  CompradorRoute,
  AuthenticatedRoute 
} from './components/guards/ProtectedRoute';

// Páginas públicas
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import PoliticaCookies from './pages/PoliticaCookies';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import AvisoLegal from './pages/AvisoLegal';
import ResumenVenta from './pages/ResumenVenta';

// Autenticación
import Login from './pages/Login';
import Registro from './pages/Registro';

// Dashboards por rol
import AdminDashboard from './pages/admin/AdminDashboard';
import MonitorDashboard from './pages/monitor/MonitorDashboard';
import VendedorDashboard from './pages/vendedor/VendedorDashboard';
import CompradorDashboard from './pages/comprador/CompradorDashboard';

// Artículos
import Articulos from './pages/Articulos';
import ArticuloDetail from './pages/ArticuloDetail';
import CrearArticulo from './pages/CrearArticulo';
import EditarArticulo from './pages/EditarArticulo';
import MisArticulos from './pages/MisArticulos';

// Compra
import Carrito from './pages/Carrito';
import Comprar from './pages/Comprar';
import ResumenCompra from './pages/ResumenCompra';
import DetalleTransaccion from './pages/DetalleTransaccion';

// Perfil de usuario
import UserProfile from './pages/UserProfile';
import ActualizarDatos from './pages/ActualizarDatos';
import HistorialTransacciones from './pages/HistorialTransacciones';
import MisTransacciones from './pages/MisTransacciones';
import Calificar from './pages/Calificar';
import Favoritos from './pages/Favoritos';

// Administración
import Rol from './pages/Rol';
import PqrsAdmin from './components/admin/PqrsAdmin';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import Moderation from './pages/admin/Moderation';
import SystemConfig from './pages/admin/SystemConfig';

// Componentes de redirección
import DashboardRedirect from './components/common/DashboardRedirect';
import GenericDashboard from './components/common/GenericDashboard';

// Página base o futura app interna
import App from './pages/App';

const AppRoutes = () => {
  return (
    <Router>
      <RoleBasedNavigation />
      <Routes>
        {/* --- Páginas públicas --- */}
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/home" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/politica-cookies" element={<PoliticaCookies />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/resumen-venta/:id" element={<ResumenVenta />} />

        {/* --- Autenticación --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* --- Catálogo de artículos --- */}
        <Route path="/articulos" element={<Articulos />} />
        <Route path="/articulos/:id" element={<ArticuloDetail />} />

        {/* --- Proceso de compra --- */}
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="/resumen/:id" element={<ResumenCompra />} />

        {/* --- Gestión de artículos del usuario --- */}
        <Route path="/mis-articulos" element={<MisArticulos />} />
        <Route path="/crear-articulo" element={<CrearArticulo />} />
        <Route
          path="/editar-articulo/:id_articulo"
          element={<EditarArticulo />}
        />
        <Route path="/mis-transacciones" element={<MisTransacciones />} />

        {/* --- Perfil de usuario --- */}
        <Route path="/user" element={<UserProfile />} />
        <Route path="/actualizar-datos" element={<ActualizarDatos />} />
        <Route
          path="/historial-transacciones"
          element={<HistorialTransacciones />}
        />
        <Route
          path="/detalle-transaccion/:id"
          element={<DetalleTransaccion />}
        />
        <Route path="/calificar/:id" element={<Calificar />} />
        <Route path="/favoritos" element={<Favoritos />} />

        {/* --- Administración --- */}
        <Route path="/rol" element={<Rol />} />
        <Route path="/admin/pqrs" element={<PqrsAdmin />} />

        {/* --- Rutas Administrativas Protegidas --- */}
        <Route
          path="/admin/usuarios"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <AdminRoute>
              <Reports />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/moderacion"
          element={
            <AdminRoute>
              <Moderation />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/configuracion"
          element={
            <AdminRoute>
              <SystemConfig />
            </AdminRoute>
          }
        />

        {/* --- Dashboards específicos por rol --- */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/monitor-dashboard" 
          element={
            <MonitorRoute>
              <MonitorDashboard />
            </MonitorRoute>
          } 
        />
        <Route 
          path="/vendedor-dashboard" 
          element={
            <VendedorRoute>
              <VendedorDashboard />
            </VendedorRoute>
          } 
        />
        <Route 
          path="/comprador-dashboard" 
          element={
            <CompradorRoute>
              <CompradorDashboard />
            </CompradorRoute>
          } 
        />
        
        {/* --- Dashboard genérico --- */}
        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <GenericDashboard />
            </AuthenticatedRoute>
          }
        />
        
        {/* --- Ruta auxiliar o futura app interna --- */}
        <Route path="/app" element={<App />} />

        {/* --- Ruta comodín para manejar errores 404 --- */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
