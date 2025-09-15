/**
 * Hook personalizado para manejo de autenticación y roles
 * Proporciona funcionalidades para verificar permisos y gestionar roles de usuario
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Constantes de roles para consistencia
export const ROLES = {
  VENDEDOR: 'Vendedor',
  COMPRADOR: 'Comprador',
  ADMIN_NEGOCIO: 'Admin_Negocio',
  MONITOR: 'Monitor',
  SUPERUSER: 'superuser' // Especial para is_superuser
};

// Rutas por defecto para cada rol
export const DEFAULT_ROUTES = {
  [ROLES.VENDEDOR]: '/vendedor-dashboard',
  [ROLES.COMPRADOR]: '/comprador-dashboard',
  [ROLES.ADMIN_NEGOCIO]: '/admin-dashboard',
  [ROLES.MONITOR]: '/monitor-dashboard',
  [ROLES.SUPERUSER]: '/admin-dashboard'
};

/**
 * Hook principal para manejo de roles y autenticación
 */
export const useRoleAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  // Obtener información del usuario del localStorage
  const getCurrentUser = useCallback(() => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (!userData || !token) {
        return null;
      }

      const parsedUser = JSON.parse(userData);
      return {
        ...parsedUser,
        token
      };
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }, []);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((roleName) => {
    if (!user || !user.groups) return false;
    if (user.is_superuser) return true; // Superuser tiene todos los roles
    return user.groups.includes(roleName);
  }, [user]);

  // Verificar si el usuario tiene múltiples roles
  const hasAnyRole = useCallback((roleNames) => {
    if (!user || !user.groups) return false;
    if (user.is_superuser) return true;
    return roleNames.some(role => user.groups.includes(role));
  }, [user]);

  // Verificar si el usuario tiene todos los roles especificados
  const hasAllRoles = useCallback((roleNames) => {
    if (!user || !user.groups) return false;
    if (user.is_superuser) return true;
    return roleNames.every(role => user.groups.includes(role));
  }, [user]);

  // Obtener el rol principal del usuario (con mayor prioridad)
  const getPrimaryRole = useCallback(() => {
    if (!user || !user.groups) return null;
    if (user.is_superuser) return ROLES.SUPERUSER;
    
    // Orden de prioridad de roles
    const rolePriority = [
      ROLES.ADMIN_NEGOCIO,
      ROLES.MONITOR,
      ROLES.VENDEDOR,
      ROLES.COMPRADOR
    ];

    for (const role of rolePriority) {
      if (user.groups.includes(role)) {
        return role;
      }
    }
    
    return null;
  }, [user]);

  // Obtener la ruta del dashboard según el rol
  const getDashboardRoute = useCallback(() => {
    const primaryRole = getPrimaryRole();
    return DEFAULT_ROUTES[primaryRole] || '/dashboard';
  }, [getPrimaryRole]);

  // Verificar permisos específicos
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions && user.permissions[permission];
  }, [user]);

  // Login del usuario
  const login = useCallback((userData, tokens) => {
    try {
      // Guardar datos en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // Actualizar estado
      setUser({
        ...userData,
        token: tokens.access_token
      });

      // Configurar permisos
      setPermissions(userData.permissions || {});

      // Redirigir al dashboard correspondiente
      const dashboardRoute = userData.dashboard_route || getDashboardRoute();
      navigate(dashboardRoute);

      return true;
    } catch (error) {
      console.error('Error durante el login:', error);
      return false;
    }
  }, [navigate, getDashboardRoute]);

  // Logout del usuario
  const logout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Limpiar estado
    setUser(null);
    setPermissions({});

    // Redirigir al login
    navigate('/login');
  }, [navigate]);

  // Verificar si el usuario está autenticado
  const isAuthenticated = useCallback(() => {
    return !!(user && user.token);
  }, [user]);

  // Verificar si el usuario puede acceder a una ruta específica
  const canAccessRoute = useCallback((routeRoles) => {
    if (!isAuthenticated()) return false;
    if (!routeRoles || routeRoles.length === 0) return true;
    return hasAnyRole(routeRoles);
  }, [isAuthenticated, hasAnyRole]);

  // Efecto para cargar usuario inicial
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setPermissions(currentUser.permissions || {});
    }
    setLoading(false);
  }, [getCurrentUser]);

  // Verificar roles específicos con funciones de conveniencia
  const isVendedor = useCallback(() => hasRole(ROLES.VENDEDOR), [hasRole]);
  const isComprador = useCallback(() => hasRole(ROLES.COMPRADOR), [hasRole]);
  const isAdmin = useCallback(() => hasRole(ROLES.ADMIN_NEGOCIO), [hasRole]);
  const isMonitor = useCallback(() => hasRole(ROLES.MONITOR), [hasRole]);
  const isSuperuser = useCallback(() => user?.is_superuser || false, [user]);

  // Verificar permisos específicos con funciones de conveniencia
  const canViewTransactions = useCallback(() => 
    hasPermission('can_view_transactions'), [hasPermission]);
  const canCreateArticles = useCallback(() => 
    hasPermission('can_create_articles'), [hasPermission]);
  const canManageUsers = useCallback(() => 
    hasPermission('can_manage_users'), [hasPermission]);
  const canViewReports = useCallback(() => 
    hasPermission('can_view_reports'), [hasPermission]);
  const canModerateContent = useCallback(() => 
    hasPermission('can_moderate_content'), [hasPermission]);

  return {
    // Estado del usuario
    user,
    loading,
    permissions,

    // Funciones de autenticación
    login,
    logout,
    isAuthenticated,

    // Funciones de verificación de roles
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getPrimaryRole,
    getDashboardRoute,
    canAccessRoute,

    // Verificadores de roles específicos
    isVendedor,
    isComprador,
    isAdmin,
    isMonitor,
    isSuperuser,

    // Verificadores de permisos específicos
    hasPermission,
    canViewTransactions,
    canCreateArticles,
    canManageUsers,
    canViewReports,
    canModerateContent,

    // Constantes
    ROLES,
    DEFAULT_ROUTES
  };
};

/**
 * Hook para verificar roles específicos en componentes
 */
export const useRoleCheck = (requiredRoles) => {
  const { hasAnyRole, isAuthenticated, loading } = useRoleAuth();
  
  const hasAccess = isAuthenticated() && hasAnyRole(requiredRoles);
  
  return {
    hasAccess,
    loading,
    isAuthenticated: isAuthenticated()
  };
};

/**
 * Hook para redirigir basado en roles
 */
export const useRoleRedirect = () => {
  const { getPrimaryRole, getDashboardRoute, isAuthenticated } = useRoleAuth();
  const navigate = useNavigate();

  const redirectToDashboard = useCallback(() => {
    if (isAuthenticated()) {
      const dashboardRoute = getDashboardRoute();
      navigate(dashboardRoute);
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, getDashboardRoute, navigate]);

  const redirectBasedOnRole = useCallback(() => {
    const primaryRole = getPrimaryRole();
    const route = DEFAULT_ROUTES[primaryRole] || '/dashboard';
    navigate(route);
  }, [getPrimaryRole, navigate]);

  return {
    redirectToDashboard,
    redirectBasedOnRole
  };
};

export default useRoleAuth;