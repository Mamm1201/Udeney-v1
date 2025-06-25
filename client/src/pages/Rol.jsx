import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Rol = () => {
  const navigate = useNavigate();

  const handleRol = (role) => {
    // Dependiendo del rol, redirigimos a la página correspondiente
    if (role === "admin") {
      navigate("/crear-articulo"); // Redirigir al formulario de creación de artículos
    } else if (role === "vendedor") {
      navigate("/articulos"); // Redirigir a la lista de artículos
    }
  };

  return (
    <Box sx={{ textAlign: "center", padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Selecciona tu Rol
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ margin: 2 }}
        onClick={() => handleRol("admin")}
      >
        Administrador
      </Button>
      <Button
        variant="contained"
        color="secondary"
        sx={{ margin: 2 }}
        onClick={() => handleRol("vendedor")}
      >
        Vendedor
      </Button>
    </Box>
  );
};

export default Rol;
