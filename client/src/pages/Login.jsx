import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Avatar,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import loginBg from '../assets/login.png'; // Imagen de fondo

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar({ open: false, message: '', severity: 'info' });

    try {
      const response = await loginUser(form);
      const {
        access_token,
        refresh_token,
        message,
        id_usuario,
        email,
        nombres_usuario,
      } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('email_usuario', email);
      localStorage.setItem('id_usuario', id_usuario);
      localStorage.setItem('nombres_usuario', nombres_usuario);

      setSnackbar({
        open: true,
        message: message || 'Inicio de sesión exitoso',
        severity: 'success',
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Error al iniciar sesión. Intenta de nuevo.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.3)', // sombra basada en #16a34a
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ m: 1, bgcolor: '#16a34a' }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ color: '#16a34a' }}>
              Iniciar Sesión
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                name="email"
                label="Correo electrónico"
                fullWidth
                variant="outlined"
                margin="normal"
                required
                value={form.email}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                name="password"
                label="Contraseña"
                fullWidth
                variant="outlined"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  backgroundColor: '#16a34a',
                  '&:hover': {
                    backgroundColor: '#0e9f4a', // más oscuro para hover
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Ingresar'}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Login;
