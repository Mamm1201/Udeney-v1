/**
 * Componente para proteger rutas basado en roles de usuario
 * Verifica autenticación y permisos antes de renderizar el componente
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert, Paper, Typography } from '@mui/material';
import { useRoleAuth } from '../../hooks/useRoleAuth';

/**
 * Componente de carga mientras se verifican los permisos
 */
const LoadingScreen = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      Verificando permisos...
    </Typography>
  </Box>
);

/**
 * Componente de acceso denegado
 */
const AccessDenied = ({ message, allowedRoles }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    padding={3}
  >
    <Paper 
      elevation={3} 
      sx={{ 
        padding: 4, 
        maxWidth: 500, 
        textAlign: 'center',
        bgcolor: 'background.paper'
      }}
    >
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" gutterBottom>
          {message || 'No tienes permisos para acceder a esta página.'}
        </Typography>
        {allowedRoles && allowedRoles.length > 0 && (
          <Typography variant="body2" color="text.secondary" mt={2}>
            Roles requeridos: {allowedRoles.join(', ')}
          </Typography>
        )}
      </Alert>
    </Paper>
  </Box>
);

/**
 * Componente principal de ruta protegida
 */
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/login',
  allowAnonymous = false,
  customMessage = null
}) => {
  const location = useLocation();
  const {
    loading,
    isAuthenticated,
    hasAnyRole,
    hasPermission,
    user
  } = useRoleAuth();

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado y no se permite acceso anónimo
  if (!isAuthenticated() && !allowAnonymous) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Si está autenticado pero no tiene los roles requeridos
  if (isAuthenticated() && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    // Verificar si es superuser (siempre tiene acceso)
    if (!user?.is_superuser) {
      return (
        <AccessDenied 
          message={customMessage}
          allowedRoles={requiredRoles}
        />
      );
    }
  }

  // Si está autenticado pero no tiene los permisos requeridos
  if (isAuthenticated() && requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermissions && !user?.is_superuser) {
      return (
        <AccessDenied 
          message={customMessage || 'No tienes los permisos necesarios para acceder a esta funcionalidad.'}
          allowedRoles={requiredRoles}
        />
      );
    }
  }

  // Si pasa todas las verificaciones, renderizar el componente
  return children;
};

/**
 * HOC para proteger componentes con roles específicos
 */
export const withRoleProtection = (WrappedComponent, options = {}) => {
  const ProtectedComponent = (props) => (
    <ProtectedRoute {...options}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
  
  ProtectedComponent.displayName = `withRoleProtection(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ProtectedComponent;
};

/**
 * Componente específico para rutas de administrador
 */
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute
    requiredRoles={['Admin_Negocio']}
    customMessage="Esta funcionalidad está reservada para administradores del negocio."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Componente específico para rutas de monitor
 */
export const MonitorRoute = ({ children, ...props }) => (
  <ProtectedRoute
    requiredRoles={['Monitor', 'Admin_Negocio']}
    customMessage="Esta funcionalidad está reservada para usuarios de monitoreo o administradores."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Componente específico para rutas de vendedor
 */
export const VendedorRoute = ({ children, ...props }) => (
  <ProtectedRoute
    requiredRoles={['Vendedor']}
    customMessage="Esta funcionalidad está reservada para vendedores."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Componente específico para rutas de comprador
 */
export const CompradorRoute = ({ children, ...props }) => (
  <ProtectedRoute
    requiredRoles={['Comprador']}
    customMessage="Esta funcionalidad está reservada para compradores."
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Componente para rutas que requieren solo autenticación (cualquier rol)
 */
export const AuthenticatedRoute = ({ children, ...props }) => (
  <ProtectedRoute
    requiredRoles={[]} // No requiere roles específicos, solo autenticación
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;