import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";

const Registro = () => {
  const navigate = useNavigate(); // Hook para redirección

  const [formData, setFormData] = useState({
    nombres_usuario: "",
    apellidos_usuario: "",
    email_usuario: "",
    contraseña_usuario: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
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
        });

        // Redirigir al usuario a /articulos
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
        padding: 2,
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
        />
        <TextField
          label="Apellidos"
          name="apellidos_usuario"
          value={formData.apellidos_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Email"
          name="email_usuario"
          value={formData.email_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          type="email"
        />
        <TextField
          label="Contraseña"
          name="contraseña_usuario"
          value={formData.contraseña_usuario}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          type="password"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            marginTop: 2,
            padding: "10px 0",
            fontSize: "16px",
          }}
        >
          Crear Usuario
        </Button>
      </Box>
    </Box>
  );
};

export default Registro;
