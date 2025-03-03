import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";

const Registro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres_usuario: "",
    apellidos_usuario: "",
    email_usuario: "",
    contraseña_usuario: "",
    fecha_nacimiento: "",
    telefono_usuario: "",
    direccion_usuario: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones rápidas
    if (
      !formData.nombres_usuario ||
      !formData.apellidos_usuario ||
      !formData.email_usuario ||
      !formData.contraseña_usuario ||
      !formData.fecha_nacimiento ||
      !formData.telefono_usuario ||
      !formData.direccion_usuario
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/usuarios/",
        formData
      );

      if (response.status === 201 || response.status === 200) {
        alert("Usuario creado exitosamente");
        setFormData({
          nombres_usuario: "",
          apellidos_usuario: "",
          email_usuario: "",
          contraseña_usuario: "",
          fecha_nacimiento: "",
          telefono_usuario: "",
          direccion_usuario: "",
        });

        navigate("/articulos");
      } else {
        alert("Error al crear usuario: " + JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Error en la conexión o solicitud: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 3,
        backgroundColor: "#f4f6f8",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Registro de Usuario
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 400,
          padding: 3,
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: 3,
        }}
      >
        <TextField
          label="Nombres"
          name="nombres_usuario"
          value={formData.nombres_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
        />
        <TextField
          label="Apellidos"
          name="apellidos_usuario"
          value={formData.apellidos_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          required
        />
        <TextField
          label="Email"
          name="email_usuario"
          value={formData.email_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          type="email"
          required
        />
        <TextField
          label="Contraseña"
          name="contraseña_usuario"
          value={formData.contraseña_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          type="password"
          autoComplete="current-password"
          required
        />
        <TextField
          label="Teléfono"
          name="telefono_usuario"
          value={formData.telefono_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          type="tel"
        />
        <TextField
          label="Dirección"
          name="direccion_usuario"
          value={formData.direccion_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Fecha de Nacimiento"
          name="fecha_nacimiento"
          value={formData.fecha_nacimiento}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          type="date"
          InputLabelProps={{ shrink: true }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginTop: 2, padding: "10px 0", fontSize: "16px" }}
        >
          Crear Usuario
        </Button>
      </Box>
    </Box>
  );
};

export default Registro;
