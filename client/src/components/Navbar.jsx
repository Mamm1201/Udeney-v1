// src/components/Navbar.jsx
import React, { useState } from "react";
import Logo from "./Logo";
import LoginButton from "./Loginbutton";
import LogoutButton from "./LogoutButton";
import PerfilMenu from "./PerfilMenu";
import { useCarrito } from "../context/CarritoContext"; // Hook del contexto del carrito
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
  Badge, // ✅ Importar Badge para el contador
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

  // Menú de acciones: ¿Qué deseas hacer hoy?
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenRoles = (event) => setAnchorEl(event.currentTarget);
  const handleCloseRoles = () => setAnchorEl(null);

  const handleLogout = () => {
    const nombre = localStorage.getItem("nombres_usuario");
    localStorage.clear();
    navigate("/login");
    console.log(`👋 Hasta luego, ${nombre || "usuario"}!`);
  };

  // Guardar el rol y redirigir
  const seleccionarRol = (rol) => {
    localStorage.setItem("rol_usuario", rol);
    if (rol === "vendedor") {
      navigate("/crear-articulo");
    } else {
      navigate("/articulos");
    }
    handleCloseRoles();
  };

  // Obtenemos el carrito y la cantidad total
  const { carrito } = useCarrito();
  const cantidadEnCarrito = carrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

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

            {/* ✅ Ícono de carrito con contador */}
            <IconButton onClick={() => navigate("/carrito")} color="inherit">
              <Badge badgeContent={cantidadEnCarrito} color="error">
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
