// src/components/Navbar.jsx
// import React, { useState } from "react";
import { useState } from "react";
import Logo from "./Logo";
import LoginButton from "./Loginbutton";
import LogoutButton from "./LogoutButton";
import PerfilMenu from "./PerfilMenuVendedor"; // Componente de perfil (que se abre cuando el usuario hace clic en su avatar)
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
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate(); // Hook para navegar entre rutas
  const nombre = localStorage.getItem("nombres_usuario"); // Obtener nombre del usuario desde localStorage
  const isLoggedIn = !!localStorage.getItem("access_token"); // Obtener nombre del usuario desde localStorage

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Verificar si es una vista móvil

  // Menú hamburguesa para móviles
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null); // Abre el menú móvil
  const handleMobileMenuOpen = (event) =>
    setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null); // Cierra el menú móvil

  // Menú de acciones: ¿Qué deseas hacer hoy?
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenRoles = (event) => setAnchorEl(event.currentTarget); // Abre el menú para seleccionar el rol
  const handleCloseRoles = () => setAnchorEl(null); // Cierra el menú de roles

  const handleLogout = () => {
    const nombre = localStorage.getItem("nombres_usuario");
    localStorage.clear(); // Limpiar datos del usuario en localStorage
    navigate("/login"); // Redirigir a la página de login
    console.log(`👋 Hasta luego, ${nombre || "usuario"}!`); // Imprimir mensaje de despedida en la consola
  };

  // ⚡ Guardar el rol y navegar según la acción seleccionada
  const seleccionarRol = (rol) => {
    localStorage.setItem("rol_usuario", rol); // Guardar el rol seleccionado en localStorage
    if (rol === "vendedor") {
      navigate("/crear-articulo"); // Redirigir al formulario de crear artículo si es vendedor
    } else {
      navigate("/articulos"); // Redirigir a la lista de artículos si es comprador
    }
    handleCloseRoles(); // Cerrar el menú de roles
  };

  return (
    <AppBar position="static" color="#86C384">
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          color: "inherit",
        }}
      >
        {/* Logo / Título */}
        <Logo />

        {/* Navegación */}
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              <MenuItem onClick={() => navigate("/nosotros")}>
                Nosotros
              </MenuItem>
              <MenuItem onClick={() => navigate("/contacto")}>
                Contacto
              </MenuItem>
              <MenuItem onClick={handleOpenRoles}>
                ¿Qué deseas hacer hoy? <ArrowDropDownIcon fontSize="small" />
              </MenuItem>

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
          <Box display="flex" alignItems="center" gap={2}>
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
