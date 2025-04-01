import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"; // Ícono de menú hamburguesa
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import { Link, useNavigate } from "react-router-dom";

const NavbarVender = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Estado para el menú desplegable de roles
  const [anchorEl, setAnchorEl] = useState(null);

  // Abrir menú
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Cerrar menú
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Redirigir a la opción seleccionada
  const handleRedirect = (path) => {
    navigate(path);
    handleMenuClose();
  };

  // Toggle para el menú móvil
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#86C388", p: 2 }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: "50px", borderRadius: "8px" }}
            />
          </Box>

          {/* Menú de escritorio */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
            <Button component={Link} to="/" color="inherit">
              Home
            </Button>
            <Button component={Link} to="/Nosotros" color="inherit">
              Nosotros
            </Button>
            <Button component={Link} to="/contacto" color="inherit">
              Contacto
            </Button>
            <Button component={Link} to="/registro" color="inherit">
              Registro
            </Button>
            <Button component={Link} to="/ingreso" color="inherit">
              Ingreso
            </Button>
            <Button component={Link} to="/comprar" color="inherit">
              Comprar
            </Button>

            {/* Botón desplegable de Roles */}
            <Button color="inherit" onClick={handleMenuOpen}>
              Seleccionar Rol
            </Button>

            {/* Íconos */}
            <IconButton color="inherit">
              <PermIdentityIcon />
            </IconButton>
            <IconButton color="inherit">
              <AddShoppingCartIcon />
            </IconButton>
          </Box>

          {/* Menú Hamburguesa (solo en móviles) */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer para menú en móviles */}
      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          <List>
            <ListItem button component={Link} to="/">
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button component={Link} to="/Nosotros">
              <ListItemText primary="Nosotros" />
            </ListItem>
            <ListItem button component={Link} to="/contacto">
              <ListItemText primary="Contacto" />
            </ListItem>
            <ListItem button component={Link} to="/registro">
              <ListItemText primary="Registro" />
            </ListItem>
            <ListItem button component={Link} to="/ingreso">
              <ListItemText primary="Ingreso" />
            </ListItem>
            <ListItem button component={Link} to="/comprar">
              <ListItemText primary="Comprar" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavbarVender;
