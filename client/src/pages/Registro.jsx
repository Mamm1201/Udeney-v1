import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { registrarUsuario } from '../api/register.api';

const Registro = () => {
  const navigate = useNavigate();

  // Formulario
  const [formData, setFormData] = useState({
    email_usuario: '',
    nombres_usuario: '',
    apellidos_usuario: '',
    password_usuario: '',
    telefono_usuario: '',
    direccion_usuario: '',
    fecha_nacimiento: '',
  });

  // Snackbar de éxito y error
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarError, setSnackbarError] = useState(false);

  // Manejo de campos
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposRequeridos = Object.values(formData).every(
      (campo) => campo !== '',
    );
    if (!camposRequeridos) {
      setSnackbarError(true);
      setSnackbarMessage('Por favor, completa todos los campos.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await registrarUsuario(formData);

      if (response.status === 201 || response.status === 200) {
        setSnackbarError(false);
        setSnackbarMessage('¡Usuario registrado exitosamente!');
        setOpenSnackbar(true);

        // Redirigir al login después de 2 segundos
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw new Error('Error al registrar');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setSnackbarError(true);
      setSnackbarMessage(
        error.response?.data?.email_usuario?.[0] ||
          error.response?.data?.detail ||
          'Hubo un error al registrar.',
      );
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        backgroundColor: '#f4f6f8',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Registro de Usuario
      </Typography>

      {/* Formulario */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 400,
          padding: 3,
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: 3,
        }}
      >
        <TextField
          label="Nombres"
          name="nombres_usuario"
          value={formData.nombres_usuario}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          label="Apellidos"
          name="apellidos_usuario"
          value={formData.apellidos_usuario}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          label="Email"
          name="email_usuario"
          value={formData.email_usuario}
          onChange={handleChange}
          type="email"
          margin="normal"
          required
          autoComplete="email"
        />
        <TextField
          label="Contraseña"
          name="password_usuario"
          value={formData.password_usuario}
          onChange={handleChange}
          type="password"
          margin="normal"
          required
          autoComplete="new-password"
        />
        <TextField
          label="Teléfono"
          name="telefono_usuario"
          value={formData.telefono_usuario}
          onChange={handleChange}
          margin="normal"
          inputProps={{ maxLength: 10 }}
        />
        <TextField
          label="Dirección"
          name="direccion_usuario"
          value={formData.direccion_usuario}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Fecha de Nacimiento"
          name="fecha_nacimiento"
          value={formData.fecha_nacimiento}
          onChange={handleChange}
          type="date"
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginTop: 2, padding: '10px 0', fontSize: '16px' }}
        >
          Crear Usuario
        </Button>
      </Box>

      {/* Snackbar para éxito o error */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbarError ? 'error' : 'success'}
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setOpenSnackbar(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Registro;
