import { useState, useEffect } from 'react';
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
  Container,
  Grid,
  InputAdornment,
  Chip,
  FormHelperText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  DateRange as DateRangeIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { registrarUsuario } from '../api/register.api';
import { systemConfigAPI } from '../api/systemConfig.api';

const Registro = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState(6);
  const [loading, setLoading] = useState(false);

  // Cargar configuración del sistema
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await systemConfigAPI.getConfig();
        setPasswordMinLength(config.password_min_length || 6);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const camposRequeridos = Object.values(formData).every(
      campo => campo !== ''
    );
    if (!camposRequeridos) {
      setSnackbarError(true);
      setSnackbarMessage('Por favor, completa todos los campos.');
      setOpenSnackbar(true);
      setLoading(false);
      return;
    }

    try {
      const response = await registrarUsuario(formData);

      console.log('Respuesta de registro:', response);
      console.log('Data de respuesta:', response.data);
      console.log('Verification required:', response.data.verification_required);

      if (response.status === 201 || response.status === 200) {
        // SIEMPRE redirigir a verificación para usuarios nuevos
        // Guardar información para la página de verificación
        localStorage.setItem('pending_verification_email', formData.email_usuario);
        localStorage.setItem('pending_verification_name', formData.nombres_usuario);

        setSnackbarError(false);
        setSnackbarMessage('¡Registro exitoso! Redirigiendo para verificar email...');
        setOpenSnackbar(true);

        setTimeout(() => {
          navigate('/verification-pending', {
            state: {
              email: formData.email_usuario,
              nombre: formData.nombres_usuario
            }
          });
        }, 2000);
      } else {
        throw new Error('Error al registrar');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setSnackbarError(true);

      // Manejar errores específicos de validación
      const errorData = error.response?.data;
      let errorMessage = 'Hubo un error al registrar.';

      if (errorData?.password_usuario) {
        errorMessage = Array.isArray(errorData.password_usuario)
          ? errorData.password_usuario[0]
          : errorData.password_usuario;
      } else if (errorData?.email_usuario) {
        errorMessage = Array.isArray(errorData.email_usuario)
          ? errorData.email_usuario[0]
          : errorData.email_usuario;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      }

      setSnackbarMessage(errorMessage);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Información del lado izquierdo (solo en pantallas grandes) */}
          {!isMobile && (
            <Grid item md={6}>
              <Box sx={{ color: 'white', pr: 4 }}>
                <Typography variant="h3" gutterBottom fontWeight="bold">
                  Únete a Eduney
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  La plataforma de compraventa estudiantil más confiable
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon />
                    <Typography>Perfil verificado y seguro</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon />
                    <Typography>Notificaciones de tus transacciones</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon />
                    <Typography>Datos protegidos y encriptados</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Formulario de registro */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                maxWidth: 480,
                mx: 'auto',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                  Crear Cuenta
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Completa tus datos para empezar
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nombres"
                      name="nombres_usuario"
                      value={formData.nombres_usuario}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Apellidos"
                      name="apellidos_usuario"
                      value={formData.apellidos_usuario}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Correo Electrónico"
                      name="email_usuario"
                      value={formData.email_usuario}
                      onChange={handleChange}
                      type="email"
                      fullWidth
                      required
                      variant="outlined"
                      autoComplete="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Contraseña"
                      name="password_usuario"
                      value={formData.password_usuario}
                      onChange={handleChange}
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      required
                      variant="outlined"
                      autoComplete="new-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormHelperText>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={`Mínimo ${passwordMinLength} caracteres`}
                          size="small"
                          color={formData.password_usuario.length >= passwordMinLength ? "success" : "default"}
                          variant={formData.password_usuario.length >= passwordMinLength ? "filled" : "outlined"}
                        />
                      </Box>
                    </FormHelperText>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Teléfono"
                      name="telefono_usuario"
                      value={formData.telefono_usuario}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Fecha de Nacimiento"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      type="date"
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Dirección"
                      name="direccion_usuario"
                      value={formData.direccion_usuario}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <HomeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                    },
                  }}
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    ¿Ya tienes cuenta?{' '}
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => navigate('/login')}
                      sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    >
                      Iniciar Sesión
                    </Button>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbarError ? 'error' : 'success'}
          variant="filled"
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
