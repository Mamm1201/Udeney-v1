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
  Avatar,
} from "@mui/material";
import axios from "axios";

const ActualizarDatos = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres_usuario: "",
    apellidos_usuario: "",
    email_usuario: "",
    telefono_usuario: "",
    direccion_usuario: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [imagePreview, setImagePreview] = useState(
    localStorage.getItem("fotoPerfil") || ""
  );

  const id_usuario = localStorage.getItem("id_usuario");

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}usuarios/${id_usuario}/`
        );
        setFormData(res.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error al cargar datos",
          severity: "error",
        });
      }
    };

    fetchDatos();
  }, [id_usuario]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}usuarios/${id_usuario}/`,
        formData
      );

      setSnackbar({
        open: true,
        message: "Datos actualizados correctamente",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al actualizar datos",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      localStorage.setItem("fotoPerfil", reader.result); // Guardar temporalmente
    };
    reader.readAsDataURL(file);
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

        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <Avatar
            src={imagePreview}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Button variant="contained" component="label">
            Subir Imagen
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </Button>
        </Box>

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
