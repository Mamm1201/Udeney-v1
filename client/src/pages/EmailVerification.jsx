import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  ErrorOutline,
  Email,
  Login,
  Refresh
} from '@mui/icons-material';
import api from '../api/axiosConfig';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  // Verificar token al cargar el componente
  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setLoading(false);
      setError('Token de verificación no válido');
    }
  }, [token]);

  const verifyEmailToken = async (verificationToken) => {
    try {
      setLoading(true);
      const response = await api.get(`/verify-email/${verificationToken}/`);

      setVerificationResult({
        success: true,
        message: response.data.message,
        user: response.data.user
      });
      setError(null);
    } catch (err) {
      console.error('Error al verificar email:', err);
      setError(err.response?.data?.error || 'Error al verificar el email');
      setVerificationResult({ success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = prompt('Ingresa tu email para reenviar la verificación:');
    if (!email) return;

    try {
      setResendLoading(true);
      await api.post('/resend-verification/', { email });
      alert('Email de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      console.error('Error al reenviar email:', err);
      alert(err.response?.data?.error || 'Error al reenviar email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const steps = ['Registro', 'Verificación de Email', 'Cuenta Activada'];
  const activeStep = verificationResult?.success ? 2 : 1;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Verificando tu email...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Por favor espera mientras verificamos tu cuenta
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Stepper de progreso */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Resultado de verificación */}
      <Card elevation={3}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {verificationResult?.success ? (
            // Verificación exitosa
            <>
              <CheckCircle
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  mb: 3
                }}
              />
              <Typography variant="h4" gutterBottom color="success.main">
                ¡Email Verificado!
              </Typography>
              <Typography variant="h6" gutterBottom>
                ¡Bienvenido a Udeney, {verificationResult.user?.nombres}!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión y comenzar a usar la plataforma.
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                <strong>¡Cuenta activada!</strong><br />
                Tu email {verificationResult.user?.email} ha sido verificado correctamente.
              </Alert>

              <Button
                variant="contained"
                size="large"
                startIcon={<Login />}
                onClick={handleGoToLogin}
                sx={{ mr: 2 }}
              >
                Iniciar Sesión
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Ir al Inicio
              </Button>
            </>
          ) : (
            // Error en verificación
            <>
              <ErrorOutline
                sx={{
                  fontSize: 80,
                  color: 'error.main',
                  mb: 3
                }}
              />
              <Typography variant="h4" gutterBottom color="error.main">
                Error de Verificación
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {error || 'No se pudo verificar tu email. El enlace puede haber expirado o ser inválido.'}
              </Typography>

              <Alert severity="error" sx={{ mb: 3 }}>
                <strong>Posibles causas:</strong><br />
                • El enlace de verificación ha expirado (24 horas)<br />
                • El enlace ya fue utilizado anteriormente<br />
                • El enlace es inválido o fue modificado
              </Alert>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Qué puedes hacer?
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Enviando...' : 'Reenviar Email'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/registro')}
                >
                  Crear Nueva Cuenta
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                >
                  Intentar Iniciar Sesión
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          <Email sx={{ verticalAlign: 'middle', mr: 1 }} />
          ¿Necesitas ayuda?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Si tienes problemas con la verificación de tu email, contáctanos en{' '}
          <strong>soporte@udeney.com</strong> o a través de nuestro{' '}
          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/pqrs')}
            sx={{ p: 0, verticalAlign: 'baseline' }}
          >
            sistema de soporte
          </Button>.
        </Typography>
      </Paper>
    </Container>
  );
};

export default EmailVerification;