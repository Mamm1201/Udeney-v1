/**
 * Configuración del Sistema - Panel Administrativo
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Save,
  Refresh,
  Security,
  Settings,
  Storage,
  Speed,
  Email,
  Payment,
  Notifications,
  Edit,
  Delete,
  Add
} from '@mui/icons-material';
import axios from 'axios';

const SystemConfig = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [config, setConfig] = useState({
    // Configuración general
    siteName: 'Eduney Marketplace',
    siteDescription: 'Plataforma de comercio electrónico',
    maintenanceMode: false,
    registrationEnabled: true,

    // Configuración de seguridad
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,

    // Configuración de emails
    emailNotifications: true,
    welcomeEmails: true,
    orderNotifications: true,

    // Configuración de pagos
    paymentGateway: 'stripe',
    minOrderAmount: 10000,
    maxOrderAmount: 5000000,
    taxRate: 19,

    // Configuración de sistema
    cacheEnabled: true,
    debugMode: false,
    loggingLevel: 'INFO',
    backupFrequency: 'daily'
  });

  // Cargar configuración actual
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Simular carga de configuración (en producción vendría de la API)
      setTimeout(() => {
        setLoading(false);
        setError(null);
      }, 1000);

    } catch (err) {
      setError('Error al cargar configuración');
      console.error('Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Guardar configuración
  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Simular guardado (en producción se enviaría a la API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Configuración guardada exitosamente');
      setError(null);

    } catch (err) {
      setError('Error al guardar configuración');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar cache
  const handleClearCache = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete('http://localhost:8000/api/v1/cache/stats/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cache limpiado exitosamente');
    } catch (err) {
      setError('Error al limpiar cache');
      console.error('Error:', err);
    }
  };

  // Precalentar cache
  const handleWarmupCache = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://localhost:8000/api/v1/cache/warmup/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cache precalentado exitosamente');
    } catch (err) {
      setError('Error al precalentar cache');
      console.error('Error:', err);
    }
  };

  const ConfigSection = ({ title, icon, children }) => (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardHeader
        avatar={icon}
        title={title}
        sx={{ bgcolor: 'grey.50' }}
      />
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Configuración del Sistema
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Configura y administra los parámetros del sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configuración General */}
        <Grid item xs={12} md={6}>
          <ConfigSection title="Configuración General" icon={<Settings color="primary" />}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nombre del Sitio"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Descripción"
                value={config.siteDescription}
                onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.maintenanceMode}
                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                  />
                }
                label="Modo Mantenimiento"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.registrationEnabled}
                    onChange={(e) => setConfig({ ...config, registrationEnabled: e.target.checked })}
                  />
                }
                label="Permitir Registro de Usuarios"
              />
            </Box>
          </ConfigSection>
        </Grid>

        {/* Configuración de Seguridad */}
        <Grid item xs={12} md={6}>
          <ConfigSection title="Seguridad" icon={<Security color="error" />}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Longitud Mínima de Contraseña"
                type="number"
                value={config.passwordMinLength}
                onChange={(e) => setConfig({ ...config, passwordMinLength: parseInt(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Tiempo de Sesión (minutos)"
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => setConfig({ ...config, sessionTimeout: parseInt(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Máximo Intentos de Login"
                type="number"
                value={config.maxLoginAttempts}
                onChange={(e) => setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) })}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.twoFactorAuth}
                    onChange={(e) => setConfig({ ...config, twoFactorAuth: e.target.checked })}
                  />
                }
                label="Autenticación de Dos Factores"
              />
            </Box>
          </ConfigSection>
        </Grid>

        {/* Configuración de Emails */}
        <Grid item xs={12} md={6}>
          <ConfigSection title="Notificaciones Email" icon={<Email color="info" />}>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.emailNotifications}
                    onChange={(e) => setConfig({ ...config, emailNotifications: e.target.checked })}
                  />
                }
                label="Notificaciones por Email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.welcomeEmails}
                    onChange={(e) => setConfig({ ...config, welcomeEmails: e.target.checked })}
                  />
                }
                label="Emails de Bienvenida"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.orderNotifications}
                    onChange={(e) => setConfig({ ...config, orderNotifications: e.target.checked })}
                  />
                }
                label="Notificaciones de Pedidos"
              />
            </Box>
          </ConfigSection>
        </Grid>

        {/* Configuración de Pagos */}
        <Grid item xs={12} md={6}>
          <ConfigSection title="Pagos" icon={<Payment color="success" />}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Monto Mínimo de Pedido"
                type="number"
                value={config.minOrderAmount}
                onChange={(e) => setConfig({ ...config, minOrderAmount: parseInt(e.target.value) })}
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
              <TextField
                label="Monto Máximo de Pedido"
                type="number"
                value={config.maxOrderAmount}
                onChange={(e) => setConfig({ ...config, maxOrderAmount: parseInt(e.target.value) })}
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
              <TextField
                label="Tasa de Impuesto (%)"
                type="number"
                value={config.taxRate}
                onChange={(e) => setConfig({ ...config, taxRate: parseInt(e.target.value) })}
                fullWidth
              />
            </Box>
          </ConfigSection>
        </Grid>

        {/* Configuración del Sistema */}
        <Grid item xs={12}>
          <ConfigSection title="Sistema y Rendimiento" icon={<Speed color="warning" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.cacheEnabled}
                        onChange={(e) => setConfig({ ...config, cacheEnabled: e.target.checked })}
                      />
                    }
                    label="Cache Habilitado"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.debugMode}
                        onChange={(e) => setConfig({ ...config, debugMode: e.target.checked })}
                      />
                    }
                    label="Modo Debug"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={handleClearCache}
                    startIcon={<Delete />}
                    fullWidth
                  >
                    Limpiar Cache
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleWarmupCache}
                    startIcon={<Refresh />}
                    fullWidth
                  >
                    Precalentar Cache
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </ConfigSection>
        </Grid>

        {/* Estado del Sistema */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader title="Estado del Sistema" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="success.main">92%</Typography>
                    <Typography variant="body2">Rendimiento</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="info.main">68%</Typography>
                    <Typography variant="body2">Uso de DB</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="warning.main">45%</Typography>
                    <Typography variant="body2">Tráfico</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="success.main">99.9%</Typography>
                    <Typography variant="body2">Uptime</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botón de guardar flotante */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          gap: 1
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveConfig}
          startIcon={<Save />}
          disabled={loading}
        >
          Guardar Configuración
        </Button>
      </Box>
    </Container>
  );
};

export default SystemConfig;