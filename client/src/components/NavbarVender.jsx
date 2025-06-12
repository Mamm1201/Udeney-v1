import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import LoginButton from "./Loginbutton";
import LogoutButton from "./LogoutButton";
import PerfilMenu from "./PerfilMenuVendedor";

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
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Navbar = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombres_usuario");
  const isLoggedIn = !!localStorage.getItem("access_token");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detectar vista móvil

  // Menú móvil (hamburguesa)
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const handleMobileMenuOpen = (e) => setMobileMenuAnchor(e.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  // Menú para seleccionar el rol
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenRoles = (e) => setAnchorEl(e.currentTarget);
  const handleCloseRoles = () => setAnchorEl(null);

  const handleLogout = () => {
    const nombre = localStorage.getItem("nombres_usuario");
    localStorage.clear();
    navigate("/login");
    console.log(`👋 Hasta luego, ${nombre || "usuario"}!`);
  };

  const seleccionarRol = (rol) => {
    localStorage.setItem("rol_usuario", rol);
    if (rol === "vendedor") {
      navigate("/crear-articulo");
    } else {
      navigate("/articulos");
    }
    handleCloseRoles();
    handleMobileMenuClose(); // Cierra también el menú móvil si está abierto
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#86C384",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          color: "black",
        }}
      >
        {/* Logo a la izquierda */}
        <Logo />

        {/* Contenido para móvil (menú hamburguesa) */}
        {isMobile ? (
          <>
            <IconButton color="black" onClick={handleMobileMenuOpen} edge="end">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              <MenuItem onClick={() => navigate("/")}>Inicio</MenuItem>
              <MenuItem onClick={() => navigate("/nosotros")}>
                Nosotros
              </MenuItem>
              <MenuItem onClick={() => navigate("/contacto")}>
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
                <MenuItem onClick={() => seleccionarRol("vendedor")}>
                  📦 Vender artículos
                </MenuItem>
                <MenuItem onClick={() => seleccionarRol("comprador")}>
                  🛒 Comprar artículos
                </MenuItem>
              </Menu>

              {!isLoggedIn ? (
                <>
                  <MenuItem onClick={() => navigate("/login")}>
                    Iniciar sesión
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/registro")}>
                    Registrarse
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => navigate("/user")}>Perfil</MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          // Contenido para escritorio
          <Box display="flex" alignItems="center" gap={2}>
            <Button onClick={() => navigate("/")} color="inherit">
              Inicio
            </Button>
            <Button onClick={() => navigate("/nosotros")} color="inherit">
              Nosotros
            </Button>
            <Button onClick={() => navigate("/contacto")} color="inherit">
              Contacto
            </Button>

            <Button
              onClick={handleOpenRoles}
              color="inherit"
              endIcon={<ArrowDropDownIcon />}
            >
              ¿Qué deseas hacer hoy?
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseRoles}
            >
              <MenuItem onClick={() => seleccionarRol("vendedor")}>
                📦 Vender artículos
              </MenuItem>
              <MenuItem onClick={() => seleccionarRol("comprador")}>
                🛒 Comprar artículos
              </MenuItem>
            </Menu>

            {!isLoggedIn ? (
              <>
                <LoginButton />
                <Button
                  onClick={() => navigate("/registro")}
                  color="inherit"
                  variant="outlined"
                >
                  Registrarse
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1">
                  ¡Hola, <strong>{nombre}</strong>!
                </Typography>
                <PerfilMenu />
                <LogoutButton variant="text" size="small" />
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
