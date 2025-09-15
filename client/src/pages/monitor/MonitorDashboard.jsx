/**
 * Dashboard para usuarios con rol Monitor
 * Enfocado en visualización de métricas, auditoría y monitoreo del sistema
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  MonitorHeart,
  Visibility,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Timeline,
  Security,
  Speed,
  Storage
} from '@mui/icons-material';
import { useRoleAuth } from '../../hooks/useRoleAuth';

/**
 * Componente de métrica de sistema
 */
const SystemMetricCard = ({ title, value, status, description, icon, color = 'primary' }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="between">
        <Box flexGrow={1}>
          <Typography variant="h5" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {description}
          </Typography>
          <Chip 
            label={status} 
            size="small"
            color={status === 'Saludable' ? 'success' : status === 'Advertencia' ? 'warning' : 'error'}
            variant="outlined"
          />
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Tabla de logs de auditoría
 */
const AuditLogsTable = ({ logs = [] }) => (
  <TableContainer component={Paper} elevation={2}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Timestamp</TableCell>
          <TableCell>Usuario</TableCell>
          <TableCell>Acción</TableCell>
          <TableCell>Detalles</TableCell>
          <TableCell>Estado</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.length > 0 ? logs.map((log, index) => (
          <TableRow key={index}>
            <TableCell>
              <Typography variant="body2">
                {log.timestamp}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight="medium">
                {log.user}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">
                {log.action}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {log.details}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip 
                label={log.status}
                size="small"
                color={log.status === 'Éxito' ? 'success' : 'error'}
                variant="outlined"
              />
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={5} align="center">
              <Typography color="text.secondary" py={2}>
                No hay logs disponibles
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

/**
 * Componente de alertas del sistema
 */
const SystemAlerts = ({ alerts = [] }) => (
  <Card elevation={2}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Alertas del Sistema
      </Typography>
      {alerts.length > 0 ? (
        <List dense>
          {alerts.map((alert, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {alert.severity === 'error' ? (
                  <Error color="error" />
                ) : alert.severity === 'warning' ? (
                  <Warning color="warning" />
                ) : (
                  <Info color="info" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={alert.message}
                secondary={alert.timestamp}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="success" variant="outlined">
          No hay alertas activas en el sistema
        </Alert>
      )}
    </CardContent>
  </Card>
);

/**
 * Dashboard principal para Monitor
 */
const MonitorDashboard = () => {
  const { user } = useRoleAuth();
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    metrics: {
      total_users: 0,
      active_users: 0,
      transactions_today: 0,
      uptime: '99.9%'
    }
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  // Datos de ejemplo para métricas del sistema
  const [performanceMetrics] = useState([
    {
      title: 'Tiempo de Respuesta',
      value: '145ms',
      status: 'Saludable',
      description: 'Promedio últimas 24h',
      icon: <Speed />,
      color: 'success'
    },
    {
      title: 'Uso de CPU',
      value: '23%',
      status: 'Saludable',
      description: 'Carga actual del servidor',
      icon: <Timeline />,
      color: 'primary'
    },
    {
      title: 'Memoria RAM',
      value: '4.2GB',
      status: 'Advertencia',
      description: 'De 8GB disponibles',
      icon: <Storage />,
      color: 'warning'
    },
    {
      title: 'Seguridad',
      value: '100%',
      status: 'Saludable',
      description: 'Sin amenazas detectadas',
      icon: <Security />,
      color: 'success'
    }
  ]);

  // Cargar datos del sistema
  useEffect(() => {
    const loadSystemData = async () => {
      setLoading(true);
      try {
        // Simular llamada a API de monitoreo
        setTimeout(() => {
          setSystemHealth({
            status: 'healthy',
            metrics: {
              total_users: 1250,
              active_users: 1180,
              transactions_today: 47,
              uptime: '99.9%'
            }
          });

          setAuditLogs([
            {
              timestamp: '2025-01-15 14:30:22',
              user: 'admin@eduney.com',
              action: 'USER_BLOCKED',
              details: 'Usuario bloqueado por actividad sospechosa',
              status: 'Éxito'
            },
            {
              timestamp: '2025-01-15 14:25:15',
              user: 'monitor@eduney.com',
              action: 'REPORT_GENERATED',
              details: 'Reporte mensual de transacciones',
              status: 'Éxito'
            },
            {
              timestamp: '2025-01-15 14:20:08',
              user: 'system',
              action: 'BACKUP_COMPLETED',
              details: 'Respaldo automático de base de datos',
              status: 'Éxito'
            }
          ]);

          setSystemAlerts([
            {
              severity: 'warning',
              message: 'Alto uso de memoria RAM detectado',
              timestamp: 'Hace 15 minutos'
            },
            {
              severity: 'info',
              message: 'Mantenimiento programado para el domingo',
              timestamp: 'Hace 2 horas'
            }
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error cargando datos de monitoreo:', error);
        setLoading(false);
      }
    };

    loadSystemData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center">
            <MonitorHeart sx={{ mr: 2, color: 'primary.main' }} />
            Centro de Monitoreo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Supervisión y auditoría del sistema - {user?.nombres_usuario}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={refreshData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Estado general del sistema */}
      <Alert 
        severity={systemHealth.status === 'healthy' ? 'success' : 'warning'} 
        sx={{ mb: 3 }}
        icon={systemHealth.status === 'healthy' ? <CheckCircle /> : <Warning />}
      >
        <Typography fontWeight="bold">
          Estado del Sistema: {systemHealth.status === 'healthy' ? 'Saludable' : 'Requiere Atención'}
        </Typography>
        <Typography variant="body2">
          Uptime: {systemHealth.metrics.uptime} | 
          Usuarios activos: {systemHealth.metrics.active_users} | 
          Transacciones hoy: {systemHealth.metrics.transactions_today}
        </Typography>
      </Alert>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Métricas de rendimiento */}
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Métricas de Rendimiento
      </Typography>
      <Grid container spacing={3} mb={4}>
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <SystemMetricCard
              title={metric.title}
              value={metric.value}
              status={metric.status}
              description={metric.description}
              icon={metric.icon}
              color={metric.color}
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Sección de logs y alertas */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Logs de Auditoría
          </Typography>
          <AuditLogsTable logs={auditLogs} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <SystemAlerts alerts={systemAlerts} />
          
          {/* Estadísticas adicionales */}
          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Actividad
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Transacciones procesadas hoy
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {systemHealth.metrics.transactions_today}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Usuarios conectados
                </Typography>
                <Typography variant="h4" color="secondary" fontWeight="bold">
                  {systemHealth.metrics.active_users}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de usuarios
                </Typography>
                <Typography variant="h4" color="info" fontWeight="bold">
                  {systemHealth.metrics.total_users.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonitorDashboard;