import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Email,
  Refresh,
  CheckCircle,
  Schedule,
  Login,
  Home
} from '@mui/icons-material';
import api from '../api/axiosConfig';

const VerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener email del state de navegación o localStorage
  const userEmail = location.state?.email || localStorage.getItem('pending_verification_email');
  const userName = location.state?.nombre || localStorage.getItem('pending_verification_name');

  const [resendLoading, setResendLoading] = useState(false);
  const [lastResend, setLastResend] = useState(null);
  const [canResend, setCanResend] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const [timeUntilResend, setTimeUntilResend] = useState(0);

  // Timer para cooldown de reenvío
  useEffect(() => {
    let interval;
    if (timeUntilResend > 0) {
      interval = setInterval(() => {
        setTimeUntilResend(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeUntilResend]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      alert('No se encontró el email. Por favor, regístrate nuevamente.');
      navigate('/registro');
      return;
    }

    try {
      setResendLoading(true);
      await api.post('/resend-verification/', { email: userEmail });

      setLastResend(new Date());
      setResendCount(prev => prev + 1);
      setCanResend(false);
      setTimeUntilResend(300); // 5 minutos de cooldown

      alert('Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada y spam.');
    } catch (err) {
      console.error('Error al reenviar email:', err);
      const errorMsg = err.response?.data?.error || 'Error al reenviar email';
      alert(errorMsg);

      if (err.response?.data?.code === 'RATE_LIMITED') {
        setCanResend(false);
        setTimeUntilResend(300); // 5 minutos
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckStatus = async () => {
    if (!userEmail) return;

    try {
      const response = await api.get(`/verification-status/?email=${userEmail}`);
      if (response.data.verified) {
        alert('¡Tu email ya está verificado! Redirigiendo al login...');
        navigate('/login');
      } else {
        alert('Tu email aún no está verificado. Revisa tu bandeja de entrada.');
      }
    } catch (err) {
      console.error('Error al verificar estado:', err);
    }
  };

  if (!userEmail) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            No se encontró información de verificación pendiente.
          </Alert>
          <Button variant="contained" onClick={() => navigate('/registro')}>
            Registrarse
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: 'primary.50' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Email sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" color="primary.main">
              Verificación de Email Pendiente
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Tu cuenta está casi lista
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Información principal */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Schedule sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              ¡Hola {userName || 'Usuario'}!
            </Typography>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Revisa tu email para completar el registro
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Email enviado a:</strong> {userEmail}<br />
            Hemos enviado un enlace de verificación a tu dirección de correo.
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📧 Próximos pasos:
            </Typography>
            <ol style={{ paddingLeft: '20px' }}>
              <li>Revisa tu bandeja de entrada en <strong>{userEmail}</strong></li>
              <li>Busca un email de "Udeney" (revisa también spam/promociones)</li>
              <li>Haz clic en el botón "Verificar mi Email"</li>
              <li>¡Tu cuenta se activará automáticamente!</li>
            </ol>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Controles de reenvío */}
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              ¿No recibiste el email?
            </Typography>

            {resendCount > 0 && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Email reenviado {resendCount} {resendCount === 1 ? 'vez' : 'veces'}
                {lastResend && ` (último: ${lastResend.toLocaleTimeString()})`}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleResendEmail}
                disabled={resendLoading || !canResend}
              >
                {resendLoading ? 'Enviando...' :
                 !canResend ? `Reenviar en ${formatTime(timeUntilResend)}` :
                 'Reenviar Email'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={handleCheckStatus}
              >
                Verificar Estado
              </Button>
            </Box>

            {!canResend && timeUntilResend > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Espera {formatTime(timeUntilResend)} antes del próximo reenvío
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(300 - timeUntilResend) / 300 * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Consejos y ayuda */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          💡 Consejos útiles:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>Revisa tu carpeta de <strong>spam/correo no deseado</strong></li>
          <li>Busca emails de <strong>noreply@udeney.com</strong></li>
          <li>El enlace expira en <strong>24 horas</strong></li>
          <li>Puedes reenviar el email máximo 3 veces por hora</li>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button
            variant="text"
            startIcon={<Login />}
            onClick={() => navigate('/login')}
            size="small"
          >
            Intentar Iniciar Sesión
          </Button>
          <Button
            variant="text"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            size="small"
          >
            Ir al Inicio
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
          ¿Problemas? Contáctanos en{' '}
          <strong>soporte@udeney.com</strong>
        </Typography>
      </Paper>
    </Container>
  );
};

export default VerificationPending;