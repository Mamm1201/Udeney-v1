import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import { Link, useNavigate } from "react-router-dom"; // useNavigate para redirigir

const Navbar = () => {
  const navigate = useNavigate();

  // Estado para el menú desplegable
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

  return (
    <AppBar position="static" sx={{ backgroundColor: "#86C388", p: 2 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton edge="start" color="inherit" aria-label="" sx={{ mr: 2 }}>
            <img src=" " alt="Logo" style={{ width: 40, height: 40 }} />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
            Eduney
          </Typography>
        </Box>

        {/* Botones */}
        <Box sx={{ display: "flex", gap: 3 }}>
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

          {/* Botón desplegable de Roles */}
          <Button color="inherit" onClick={handleMenuOpen}>
            Seleccionar Rol
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleRedirect("/Crear-Articulo")}>
              Vender
            </MenuItem>
            <MenuItem onClick={() => handleRedirect("/Articulos")}>
              Comprar
            </MenuItem>
          </Menu>

          {/* Íconos */}
          <IconButton color="inherit">
            <PermIdentityIcon />
          </IconButton>
          <IconButton color="primary">
            <AddShoppingCartIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
