import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { registrarUsuario } from '../api/register.api';
import registroBg from '../assets/registro.png'; // Asegúrate de que exista esta imagen

const Registro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email_usuario: '',
    nombres_usuario: '',
    apellidos_usuario: '',
    password_usuario: '',
    telefono_usuario: '',
    direccion_usuario: '',
    fecha_nacimiento: '',
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarError, setSnackbarError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        backgroundImage: `url(${registroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 450,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.3)',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#16a34a' }}
        >
          Registro de Usuario
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column' }}
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
          />
          <TextField
            label="Contraseña"
            name="password_usuario"
            value={formData.password_usuario}
            onChange={handleChange}
            type="password"
            margin="normal"
            required
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
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#16a34a',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: '#15803d',
              },
            }}
          >
            Crear Usuario
          </Button>
        </Box>
      </Paper>

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
