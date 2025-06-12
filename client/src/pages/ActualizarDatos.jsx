import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const ActualizarDatos = () => {
  // Hook para navegación entre rutas
  const navigate = useNavigate();

  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    nombres_usuario: "",
    apellidos_usuario: "",
    email_usuario: "",
    telefono_usuario: "",
    direccion_usuario: "",
  });

  // Estado para indicar si está cargando datos o enviando actualización
  const [loading, setLoading] = useState(false);

  // Estado para manejar mensajes de éxito o error con Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // puede ser 'success', 'error', 'warning', 'info'
  });

  // Obtener el id del usuario desde el localStorage
  const id_usuario = localStorage.getItem("id_usuario");

  // Función para unir correctamente la URL base con el endpoint,
  // evitando errores con '/' repetidas o faltantes
  const joinUrl = (base, path) => {
    if (!base.endsWith("/")) base += "/";
    if (path.startsWith("/")) path = path.substring(1);
    return base + path;
  };

  // useEffect para cargar datos del usuario al montar el componente
  useEffect(() => {
    if (!id_usuario) {
      // Mostrar error si no hay id de usuario
      setSnackbar({
        open: true,
        message: "No se encontró el ID del usuario",
        severity: "error",
      });
      return;
    }

    const fetchDatos = async () => {
      try {
        // Construir la URL correcta usando la función joinUrl
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = joinUrl(apiUrl, `usuarios/${id_usuario}/`);

        // Petición GET para obtener datos del usuario
        const res = await axios.get(url);

        // Guardar datos recibidos en el estado del formulario
        setFormData(res.data);
      } catch (error) {
        // Mostrar mensaje de error si falla la carga
        setSnackbar({
          open: true,
          message: "Error al cargar los datos del usuario",
          severity: "error",
        });
      }
    };

    fetchDatos();
  }, [id_usuario]);

  // Manejador para actualizar el estado cuando el usuario cambia un campo
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función que se ejecuta al enviar el formulario para actualizar datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construir URL de actualización con joinUrl para evitar problemas
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = joinUrl(apiUrl, `usuarios/${id_usuario}/`);

      // Petición PUT para actualizar datos en backend
      await axios.put(url, formData);

      // Mostrar mensaje de éxito en Snackbar
      setSnackbar({
        open: true,
        message: "Datos actualizados correctamente",
        severity: "success",
      });

      // Redirigir a la página principal después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error(
        "Error al actualizar:",
        error.response?.data || error.message
      );

      // Mostrar mensaje de error en Snackbar si la actualización falla
      setSnackbar({
        open: true,
        message: "Error al actualizar datos",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f4f6f8"
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 500 }}>
        <Typography variant="h5" gutterBottom>
          Actualizar mis datos
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nombres"
            name="nombres_usuario"
            value={formData.nombres_usuario}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Apellidos"
            name="apellidos_usuario"
            value={formData.apellidos_usuario}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Correo"
            name="email_usuario"
            value={formData.email_usuario}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="email"
            required
          />
          <TextField
            label="Teléfono"
            name="telefono_usuario"
            value={formData.telefono_usuario}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Dirección"
            name="direccion_usuario"
            value={formData.direccion_usuario}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Actualizar"}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ActualizarDatos;
