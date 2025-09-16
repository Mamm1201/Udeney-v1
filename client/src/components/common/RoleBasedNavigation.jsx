/**
 * Componente de navegación dinámico basado en roles de usuario
 * Muestra elementos de menú según los permisos y roles del usuario
 */

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Store,
  ShoppingCart,
  Assessment,
  People,
  Settings,
  ExitToApp,
  History,
  AdminPanelSettings,
  MonitorHeart,
  Inventory,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoleAuth } from '../../hooks/useRoleAuth';

/**
 * Configuración de elementos de navegación por rol
 */
const getNavigationItems = (user, permissions) => {
  const items = [];

  // Elementos comunes para usuarios autenticados
  if (user) {
    items.push({
      label: 'Dashboard',
      path: '/comprador-dashboard',
      icon: <Dashboard />,
      roles: ['Vendedor', 'Comprador', 'Admin_Negocio', 'Monitor'],
      show: true,
    });

    // Historial de transacciones (IMPORTANTE: Mantener para vendedores y compradores)
    if (permissions.can_view_transactions) {
      items.push({
        label: 'Historial',
        path: '/mis-transacciones',
        icon: <History />,
        roles: ['Vendedor', 'Comprador'],
        show: true,
      });
    }

    // Elementos específicos para vendedores
    if (permissions.can_create_articles) {
      items.push({
        label: 'Mis Artículos',
        path: '/mis-articulos',
        icon: <Store />,
        roles: ['Vendedor'],
        show: true,
      });

      items.push({
        label: 'Nuevo Artículo',
        path: '/crear-articulo',
        icon: <Inventory />,
        roles: ['Vendedor'],
        show: true,
      });
    }

    // Elementos de cambio de rol (disponible para todos los usuarios logueados)
    items.push({
      label: 'Modo Comprador',
      path: '/comprador-dashboard',
      icon: <ShoppingCart />,
      roles: ['all'],
      show: true,
    });

    items.push({
      label: 'Modo Vendedor',
      path: '/vendedor-dashboard',
      icon: <Store />,
      roles: ['all'],
      show: true,
    });

    // Elementos específicos para compradores
    items.push({
      label: 'Explorar',
      path: '/articulos',
      icon: <ShoppingCart />,
      roles: ['all'],
      show: true,
    });

    // Elementos administrativos
    if (permissions.can_manage_users) {
      items.push({
        label: 'Gestión de Usuarios',
        path: '/admin/usuarios',
        icon: <People />,
        roles: ['Admin_Negocio'],
        show: true,
      });
    }

    if (permissions.can_view_reports) {
      items.push({
        label: 'Reportes',
        path: '/admin/reportes',
        icon: <Assessment />,
        roles: ['Admin_Negocio', 'Monitor'],
        show: true,
      });
    }

    if (permissions.can_moderate_content) {
      items.push({
        label: 'Moderación',
        path: '/admin/moderacion',
        icon: <AdminPanelSettings />,
        roles: ['Admin_Negocio'],
        show: true,
      });
    }

    // Elementos de monitoreo
    if (user.groups?.includes('Monitor')) {
      items.push({
        label: 'Monitoreo',
        path: '/monitor/sistema',
        icon: <MonitorHeart />,
        roles: ['Monitor', 'Admin_Negocio'],
        show: true,
      });
    }

    // Configuración del sistema (solo superusers)
    if (user.is_superuser) {
      items.push({
        label: 'Sistema',
        path: '/admin/sistema',
        icon: <Settings />,
        roles: ['superuser'],
        show: true,
      });
    }
  }

  return items;
};

/**
 * Componente principal de navegación
 */
const RoleBasedNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, permissions, logout, isAuthenticated, getPrimaryRole } =
    useRoleAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navigationItems = getNavigationItems(user, permissions);
  const primaryRole = getPrimaryRole();

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavigation = path => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Componente del menú de usuario
  const UserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1,
          minWidth: 250,
        },
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {user?.nombres_usuario} {user?.apellidos_usuario}
        </Typography>
        <Typography variant="body2" color="primary">
          {user?.email}
        </Typography>
        {primaryRole && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={primaryRole}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Box>
      <Divider />
      <MenuItem
        onClick={() => {
          handleMenuClose();
          navigate('/perfil');
        }}
      >
        <ListItemIcon>
          <AccountCircle fontSize="small" />
        </ListItemIcon>
        <ListItemText>Mi Perfil</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <ExitToApp fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cerrar Sesión</ListItemText>
      </MenuItem>
    </Menu>
  );

  // Componente del drawer móvil
  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={toggleMobileDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Eduney
        </Typography>
        {user && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              {user.nombres_usuario} {user.apellidos_usuario}
            </Typography>
            {primaryRole && (
              <Chip
                label={primaryRole}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        )}
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <>
      <AppBar position="sticky" elevation={2} sx={{ backgroundColor: '#45858C' }}>
        <Toolbar>
          {/* Botón de menú móvil */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleMobileDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo y título */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/home')}
          >
            Eduney
          </Typography>

          {/* Navegación desktop */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
              {navigationItems.map((item, index) => (
                <Button
                  key={index}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mr: 1,
                    backgroundColor:
                      location.pathname === item.path
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Menú de usuario */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="large" onClick={handleMenuOpen} color="inherit">
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                >
                  {user.nombres_usuario?.charAt(0)?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Componentes auxiliares */}
      <UserMenu />
      <MobileDrawer />
    </>
  );
};

export default RoleBasedNavigation;
