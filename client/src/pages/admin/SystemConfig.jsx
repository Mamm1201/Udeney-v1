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
import { systemConfigAPI } from '../../api/systemConfig.api';

const SystemConfig = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [config, setConfig] = useState({
    // Configuración general
    site_name: 'Eduney Marketplace',
    site_description: 'Plataforma de comercio electrónico',
    maintenance_mode: false,
    registration_enabled: true,

    // Configuración de seguridad
    password_min_length: 8,
    session_timeout: 30,
    max_login_attempts: 5,
    two_factor_auth: false,

    // Configuración de emails
    email_notifications: true,
    welcome_emails: true,
    order_notifications: true,
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',

    // Configuración de pagos
    payment_gateway: 'stripe',
    min_order_amount: 10000,
    max_order_amount: 5000000,
    tax_rate: 19,

    // Configuración de sistema
    cache_enabled: true,
    debug_mode: false,
    logging_level: 'INFO',
    backup_frequency: 'daily'
  });

  const [systemMetrics, setSystemMetrics] = useState({
    performance: { cpu_usage: 0, memory_usage: 0, disk_usage: 0 },
    database: { connections: 0, size_mb: 0, usage_percent: 0 },
    traffic: { active_users_24h: 0, transactions_24h: 0, traffic_percent: 0 },
    uptime: { percent: 0 }
  });

  // Cargar configuración actual
  const fetchConfig = async () => {
    try {
      setLoading(true);

      // Cargar configuración real desde la API
      const configData = await systemConfigAPI.getConfig();
      setConfig(configData);

      // Cargar métricas del sistema
      const metricsData = await systemConfigAPI.getSystemMetrics();
      setSystemMetrics(metricsData);

      setLoading(false);
      setError(null);
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

      // Guardar configuración real en la API
      const response = await systemConfigAPI.updateConfig(config);

      setSuccess('Configuración guardada exitosamente');
      setError(null);

      // Actualizar configuración con los datos devueltos por la API
      if (response.config) {
        setConfig(response.config);
      }

    } catch (err) {
      if (err.response?.data?.details) {
        setError(`Error de validación: ${JSON.stringify(err.response.data.details)}`);
      } else {
        setError('Error al guardar configuración');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar cache
  const handleClearCache = async () => {
    try {
      await systemConfigAPI.clearCache();
      setSuccess('Cache limpiado exitosamente');
    } catch (err) {
      setError('Error al limpiar cache');
      console.error('Error:', err);
    }
  };

  // Precalentar cache
  const handleWarmupCache = async () => {
    try {
      await systemConfigAPI.warmupCache();
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
                value={config.site_name}
                onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Descripción"
                value={config.site_description}
                onChange={(e) => setConfig({ ...config, site_description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.maintenance_mode}
                    onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                  />
                }
                label="Modo Mantenimiento"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.registration_enabled}
                    onChange={(e) => setConfig({ ...config, registration_enabled: e.target.checked })}
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
                value={config.password_min_length}
                onChange={(e) => setConfig({ ...config, password_min_length: parseInt(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Tiempo de Sesión (minutos)"
                type="number"
                value={config.session_timeout}
                onChange={(e) => setConfig({ ...config, session_timeout: parseInt(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Máximo Intentos de Login"
                type="number"
                value={config.max_login_attempts}
                onChange={(e) => setConfig({ ...config, max_login_attempts: parseInt(e.target.value) })}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.two_factor_auth}
                    onChange={(e) => setConfig({ ...config, two_factor_auth: e.target.checked })}
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
                    checked={config.email_notifications}
                    onChange={(e) => setConfig({ ...config, email_notifications: e.target.checked })}
                  />
                }
                label="Notificaciones por Email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.welcome_emails}
                    onChange={(e) => setConfig({ ...config, welcome_emails: e.target.checked })}
                  />
                }
                label="Emails de Bienvenida"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.order_notifications}
                    onChange={(e) => setConfig({ ...config, order_notifications: e.target.checked })}
                  />
                }
                label="Notificaciones de Pedidos"
              />
              <TextField
                label="Host SMTP"
                value={config.smtp_host}
                onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                fullWidth
              />
              <TextField
                label="Puerto SMTP"
                type="number"
                value={config.smtp_port}
                onChange={(e) => setConfig({ ...config, smtp_port: parseInt(e.target.value) })}
                fullWidth
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
                value={config.min_order_amount}
                onChange={(e) => setConfig({ ...config, min_order_amount: parseInt(e.target.value) })}
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
              <TextField
                label="Monto Máximo de Pedido"
                type="number"
                value={config.max_order_amount}
                onChange={(e) => setConfig({ ...config, max_order_amount: parseInt(e.target.value) })}
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
              <TextField
                label="Tasa de Impuesto (%)"
                type="number"
                value={config.tax_rate}
                onChange={(e) => setConfig({ ...config, tax_rate: parseFloat(e.target.value) })}
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
                        checked={config.cache_enabled}
                        onChange={(e) => setConfig({ ...config, cache_enabled: e.target.checked })}
                      />
                    }
                    label="Cache Habilitado"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.debug_mode}
                        onChange={(e) => setConfig({ ...config, debug_mode: e.target.checked })}
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
                    <Typography variant="h5" color="success.main">
                      {Math.round(100 - systemMetrics.performance.cpu_usage)}%
                    </Typography>
                    <Typography variant="body2">CPU Disponible</Typography>
                    <Typography variant="caption" color="text.secondary">
                      CPU usado: {systemMetrics.performance.cpu_usage}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      color={systemMetrics.database.usage_percent > 80 ? "error.main" : "info.main"}
                    >
                      {systemMetrics.database.usage_percent}%
                    </Typography>
                    <Typography variant="body2">Uso de DB</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {systemMetrics.database.size_mb} MB
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography
                      variant="h5"
                      color={systemMetrics.traffic.traffic_percent > 70 ? "warning.main" : "success.main"}
                    >
                      {systemMetrics.traffic.traffic_percent}%
                    </Typography>
                    <Typography variant="body2">Tráfico</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {systemMetrics.traffic.transactions_24h} transacciones/24h
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="success.main">
                      {systemMetrics.uptime.percent}%
                    </Typography>
                    <Typography variant="body2">Uptime</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Memoria: {systemMetrics.performance.memory_usage}%
                    </Typography>
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