import React from "react";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import { Link } from "react-router-dom"; // Asegúrate de tener react-router-dom instalado

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#86C388", p: 2 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton edge="start" color="inherit" aria-label="" sx={{ mr: 2 }}>
            <img src=" " alt="Logo" style={{ width: 40, height: 40 }} />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
            Eduney
          </Typography>
        </Box>
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
          <IconButton edge="start" color="inherit" aria-label="" sx={{ mr: 2 }}>
            <PermIdentityIcon />
          </IconButton>
          <IconButton color="primary" aria-label="add to shopping cart">
            <AddShoppingCartIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
