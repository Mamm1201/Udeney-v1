import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import axiosInstance from '../api/axiosConfig';

const ActualizarDatos = () => {
  // ============================================================================
  // COMPONENTE ACTUALIZADO: Usa endpoint dinámico /usuarios/me/ 
  // - NO requiere id_usuario hardcodeado
  // - Maneja automáticamente renovación de tokens JWT
  // - Funciona sin necesidad de re-login del usuario
  // ============================================================================
  
  // Hook para navegación entre rutas
  const navigate = useNavigate();

  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    nombres_usuario: '',
    apellidos_usuario: '',
    email_usuario: '',
    telefono_usuario: '',
    direccion_usuario: '',
  });

  // Estado para indicar si está cargando datos o enviando actualización
  const [loading, setLoading] = useState(false);

  // Estado para manejar mensajes de éxito o error con Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // puede ser 'success', 'error', 'warning', 'info'
  });

  // useEffect para cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Usar el nuevo endpoint dinámico que obtiene datos del usuario autenticado
        // Este endpoint maneja automáticamente la renovación de tokens si es necesario
        const res = await axiosInstance.get('/usuarios/me/');

        // Guardar datos recibidos en el estado del formulario
        setFormData(res.data);
        
        console.log('✅ Datos del perfil cargados correctamente');
      } catch (error) {
        console.error('❌ Error al cargar datos del perfil:', error);
        
        // Mostrar mensaje de error específico según el tipo
        let errorMessage = 'Error al cargar los datos del usuario';
        
        if (error.response?.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          // Opcional: redirigir al login después de unos segundos
          setTimeout(() => navigate('/login'), 3000);
        } else if (error.response?.status === 404) {
          errorMessage = 'No se encontraron los datos del usuario.';
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    };

    fetchDatos();
  }, []); // Ya no depende de id_usuario

  // Manejador para actualizar el estado cuando el usuario cambia un campo
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función que se ejecuta al enviar el formulario para actualizar datos
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usar el endpoint dinámico para actualización con PATCH (actualización parcial)
      // Este endpoint maneja automáticamente la renovación de tokens si es necesario
      await axiosInstance.patch('/usuarios/me/', formData);

      console.log('✅ Datos actualizados correctamente');

      // Mostrar mensaje de éxito en Snackbar
      setSnackbar({
        open: true,
        message: '✅ Datos actualizados correctamente',
        severity: 'success',
      });

      // Redirigir a la página principal después de 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('❌ Error al actualizar:', error);

      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al actualizar datos';
      
      if (error.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        setTimeout(() => navigate('/login'), 3000);
      } else if (error.response?.status === 400) {
        // Error de validación
        const validationErrors = error.response.data;
        if (typeof validationErrors === 'object') {
          const firstError = Object.values(validationErrors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
          errorMessage = 'Datos inválidos. Revisa los campos e intenta nuevamente.';
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado.';
      }

      // Mostrar mensaje de error en Snackbar
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
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
      <Paper sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" gutterBottom>
          Actualizar mis datos
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          🔐 Sesión segura con renovación automática de tokens
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
            {loading ? <CircularProgress size={24} /> : 'Actualizar'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ActualizarDatos;
