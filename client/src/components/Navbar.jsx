import React, { useState } from "react";
import Logo from "./Logo";
import LoginButton from "./Loginbutton";
import LogoutButton from "./LogoutButton";
import PerfilMenu from "./PerfilMenu";
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
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombres_usuario");
  const isLoggedIn = !!localStorage.getItem("access_token");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Menú hamburguesa para móviles
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const handleMobileMenuOpen = (event) =>
    setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  // Menú desplegable para roles
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenRoles = (event) => setAnchorEl(event.currentTarget);
  const handleCloseRoles = () => setAnchorEl(null);

  const handleLogout = () => {
    const nombre = localStorage.getItem("nombres_usuario");

    // Limpia el almacenamiento local
    localStorage.clear();

    // Opcional: podrías mostrar un mensaje con Snackbar aquí si quieres más adelante

    // Redirección a login
    navigate("/login");

    // Solo para debug o futura mejora
    console.log(`👋 Hasta luego, ${nombre || "usuario"}!`);
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
                Seleccionar Rol <ArrowDropDownIcon fontSize="small" />
              </MenuItem>
              {/* <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseRoles}
              >
                <MenuItem onClick={() => navigate("/rol?vendedor")}>
                  Vendedor
                </MenuItem>
                <MenuItem onClick={() => navigate("/rol?comprador")}>
                  Comprador
                </MenuItem>
              </Menu> */}
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
              Seleccionar Rol
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseRoles}
            >
              <MenuItem onClick={() => navigate("/crear-articulo")}>
                Vendedor
              </MenuItem>
              <MenuItem onClick={() => navigate("/articulos")}>
                Comprador
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
                <>
                  <PerfilMenu />
                </>
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
