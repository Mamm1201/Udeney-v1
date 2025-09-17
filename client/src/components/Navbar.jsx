import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import Logo from './Logo';
import LoginButton from './Loginbutton';
import LogoutButton from './LogoutButton';
import PerfilMenu from './PerfilMenu';
import { useCarrito } from '../context/CarritoContext';

const Navbar = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem('nombres_usuario');
  const isLoggedIn = !!localStorage.getItem('access_token');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const handleMobileMenuOpen = event =>
    setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenRoles = event => setAnchorEl(event.currentTarget);
  const handleCloseRoles = () => setAnchorEl(null);

  const handleLogout = () => {
    const nombre = localStorage.getItem('nombres_usuario');
    localStorage.clear();
    navigate('/login');
    console.log(`👋 Hasta luego, ${nombre || 'usuario'}!`);
  };

  const seleccionarRol = rol => {
    localStorage.setItem('rol_usuario', rol);
    if (rol === 'vendedor') {
      navigate('/vendedor-dashboard');
    } else if (rol === 'comprador') {
      navigate('/comprador-dashboard');
    }
    handleCloseRoles();
  };

  const { carrito } = useCarrito();
  const cantidadEnCarrito = carrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
        boxShadow: '0 2px 12px rgba(69, 133, 140, 0.15)',
        borderBottom: '1px solid rgba(69, 133, 140, 0.1)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#45858C',
          minHeight: { xs: 64, md: 72 },
        }}
      >
        <Logo />

        {isMobile ? (
          <>
            <IconButton
              onClick={handleMobileMenuOpen}
              sx={{
                color: '#45858C',
                p: 2,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(69, 133, 140, 0.1)',
                  transform: 'rotate(90deg)',
                  color: '#2E5B61',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(69, 133, 140, 0.2)',
                  border: '1px solid rgba(69, 133, 140, 0.1)',
                  minWidth: 200,
                },
              }}
            >
              <MenuItem
                onClick={() => navigate('/nosotros')}
                sx={{
                  py: 2,
                  px: 3,
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(69, 133, 140, 0.08)',
                    color: '#2E5B61',
                    transform: 'translateX(8px)',
                    boxShadow: '0 2px 8px rgba(69, 133, 140, 0.15)',
                  },
                }}
              >
                Nosotros
              </MenuItem>

              <MenuItem
                onClick={() => navigate('/contacto')}
                sx={{
                  py: 2,
                  px: 3,
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(69, 133, 140, 0.08)',
                    color: '#2E5B61',
                    transform: 'translateX(8px)',
                    boxShadow: '0 2px 8px rgba(69, 133, 140, 0.15)',
                  },
                }}
              >
                Contacto
              </MenuItem>
              <MenuItem onClick={handleOpenRoles}>
                ¿Qué deseas hacer hoy? <ArrowDropDownIcon fontSize="small" />
              </MenuItem>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseRoles}
              >
                <MenuItem onClick={() => seleccionarRol('vendedor')}>
                  📦 Vender artículos
                </MenuItem>
                <MenuItem onClick={() => seleccionarRol('comprador')}>
                  🛒 Comprar artículos
                </MenuItem>
              </Menu>

              {!isLoggedIn ? (
                <>
                  <MenuItem onClick={() => navigate('/login')}>
                    Iniciar sesión
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/registro')}>
                    Registrarse
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => navigate('/user')}>Perfil</MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                </>
              )}
              <MenuItem onClick={() => navigate('/carrito')}>
                <Badge badgeContent={cantidadEnCarrito} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box display="flex" alignItems="center" gap={2}>
            {/* <Button onClick={() => navigate('/')} sx={{ color: 'white' }}>
              Inicio
            </Button> */}
            <Button
              onClick={() => navigate('/nosotros')}
              sx={{
                color: '#45858C',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 500,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(69, 133, 140, 0.08)',
                  color: '#2E5B61',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(69, 133, 140, 0.2)',
                },
              }}
            >
              Nosotros
            </Button>
            <Button
              onClick={() => navigate('/contacto')}
              sx={{
                color: '#45858C',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 500,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(69, 133, 140, 0.08)',
                  color: '#2E5B61',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(69, 133, 140, 0.2)',
                },
              }}
            >
              Contacto
            </Button>

            <Button
              onClick={handleOpenRoles}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                color: '#45858C',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 500,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background:
                  'linear-gradient(45deg, rgba(69, 133, 140, 0.05), rgba(69, 133, 140, 0.02))',
                border: '1px solid rgba(69, 133, 140, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(69, 133, 140, 0.12)',
                  color: '#2E5B61',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(69, 133, 140, 0.25)',
                  borderColor: 'rgba(69, 133, 140, 0.2)',
                },
              }}
            >
              ¿Qué deseas hacer hoy?
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseRoles}
            >
              <MenuItem onClick={() => seleccionarRol('vendedor')}>
                📦 Vender artículos
              </MenuItem>
              <MenuItem onClick={() => seleccionarRol('comprador')}>
                🛒 Comprar artículos
              </MenuItem>
            </Menu>

            {!isLoggedIn ? (
              <>
                <LoginButton />
                <Button
                  onClick={() => navigate('/registro')}
                  variant="outlined"
                  sx={{
                    color: '#45858C',
                    borderColor: '#45858C',
                    px: 3,
                    py: 1,
                    borderRadius: 3,
                    fontWeight: 500,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: '#45858C',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(69, 133, 140, 0.3)',
                    },
                  }}
                >
                  Registrarse
                </Button>
              </>
            ) : (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#45858C',
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background:
                      'linear-gradient(45deg, rgba(69, 133, 140, 0.05), rgba(69, 133, 140, 0.02))',
                    border: '1px solid rgba(69, 133, 140, 0.1)',
                  }}
                >
                  ¡Hola, <strong style={{ color: '#2E7D32' }}>{nombre}</strong>!
                </Typography>
                <PerfilMenu />
                <LogoutButton variant="text" size="small" />
              </>
            )}

            <IconButton
              onClick={() => navigate('/carrito')}
              sx={{
                color: '#45858C',
                p: 2,
                borderRadius: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(69, 133, 140, 0.1)',
                  color: '#2E5B61',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 4px 12px rgba(69, 133, 140, 0.2)',
                },
              }}
            >
              <Badge
                badgeContent={cantidadEnCarrito}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#FF4444',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)',
                  },
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
