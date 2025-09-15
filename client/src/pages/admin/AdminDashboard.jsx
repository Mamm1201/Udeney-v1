/**
 * Dashboard para administradores de negocio
 * Muestra métricas, herramientas de gestión y accesos rápidos
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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People,
  Assessment,
  TrendingUp,
  Warning,
  Store,
  ShoppingCart,
  AdminPanelSettings,
  Refresh,
  Settings,
  NotificationImportant
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '../../hooks/useRoleAuth';

/**
 * Componente de tarjeta de métrica
 */
const MetricCard = ({ title, value, subtitle, icon, color = 'primary', trend = null }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp 
                fontSize="small" 
                color={trend > 0 ? 'success' : 'error'} 
              />
              <Typography 
                variant="body2" 
                color={trend > 0 ? 'success.main' : 'error.main'}
                ml={0.5}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Componente de actividad reciente
 */
const RecentActivity = ({ activities = [] }) => (
  <Card elevation={2}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Actividad Reciente
      </Typography>
      <List dense>
        {activities.length > 0 ? activities.map((activity, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  {activity.type === 'user' ? <People /> : <Store />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.title}
                secondary={activity.time}
              />
              <Chip 
                label={activity.status} 
                size="small"
                color={activity.status === 'Completado' ? 'success' : 'warning'}
                variant="outlined"
              />
            </ListItem>
            {index < activities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        )) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No hay actividad reciente
          </Typography>
        )}
      </List>
    </CardContent>
  </Card>
);

/**
 * Componente de acciones rápidas
 */
const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Ver y administrar cuentas de usuarios',
      icon: <People />,
      path: '/admin/usuarios',
      color: 'primary'
    },
    {
      title: 'Ver Reportes',
      description: 'Acceder a reportes y análisis',
      icon: <Assessment />,
      path: '/admin/reportes',
      color: 'secondary'
    },
    {
      title: 'Moderación',
      description: 'Revisar contenido y PQRs',
      icon: <AdminPanelSettings />,
      path: '/admin/moderacion',
      color: 'warning'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: <Settings />,
      path: '/admin/configuracion',
      color: 'info'
    }
  ];

  return (
    <Grid container spacing={2}>
      {actions.map((action, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Card 
            elevation={1} 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                elevation: 4,
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate(action.path)}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: `${action.color}.main`, mr: 2 }}>
                  {action.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Dashboard principal para administradores
 */
const AdminDashboard = () => {
  const { user, permissions } = useRoleAuth();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, new: 0 },
    transactions: { total: 0, today: 0, trend: 0 },
    articles: { total: 0, pending: 0 },
    alerts: []
  });

  const [recentActivities] = useState([
    {
      title: 'Usuario bloqueado por comportamiento sospechoso',
      type: 'user',
      time: 'Hace 2 horas',
      status: 'Completado'
    },
    {
      title: 'Artículo reportado removido',
      type: 'content',
      time: 'Hace 4 horas',
      status: 'Completado'
    },
    {
      title: 'Nuevo reporte de ventas generado',
      type: 'report',
      time: 'Hace 6 horas',
      status: 'Pendiente'
    }
  ]);

  // Simular carga de datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Aquí se harían las llamadas reales a la API
        setTimeout(() => {
          setDashboardData({
            users: { total: 1250, active: 1180, new: 25 },
            transactions: { total: 3420, today: 15, trend: 12.5 },
            articles: { total: 890, pending: 5 },
            alerts: [
              {
                type: 'warning',
                message: '5 artículos pendientes de moderación'
              },
              {
                type: 'info',
                message: 'Respaldo del sistema completado exitosamente'
              }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
          <Typography variant="h4" fontWeight="bold">
            Panel de Administración
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bienvenido, {user?.nombres_usuario} {user?.apellidos_usuario}
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

      {/* Alertas */}
      {dashboardData.alerts.length > 0 && (
        <Box mb={3}>
          {dashboardData.alerts.map((alert, index) => (
            <Alert 
              key={index}
              severity={alert.type}
              sx={{ mb: 1 }}
              action={
                <Button size="small" color="inherit">
                  Ver detalles
                </Button>
              }
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Métricas principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Usuarios Totales"
            value={dashboardData.users.total.toLocaleString()}
            subtitle={`${dashboardData.users.active} activos`}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Transacciones"
            value={dashboardData.transactions.total.toLocaleString()}
            subtitle={`${dashboardData.transactions.today} hoy`}
            icon={<ShoppingCart />}
            color="secondary"
            trend={dashboardData.transactions.trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Artículos"
            value={dashboardData.articles.total.toLocaleString()}
            subtitle={`${dashboardData.articles.pending} pendientes`}
            icon={<Store />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ingresos"
            value="$45,280"
            subtitle="Este mes"
            icon={<TrendingUp />}
            color="success"
            trend={8.2}
          />
        </Grid>
      </Grid>

      {/* Tabs de contenido */}
      <Box mb={3}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Acciones Rápidas" />
          <Tab label="Actividad Reciente" />
        </Tabs>
      </Box>

      {/* Contenido de tabs */}
      {tabValue === 0 && (
        <QuickActions />
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <RecentActivity activities={recentActivities} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado del Sistema
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Rendimiento
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={92} 
                    sx={{ mt: 1 }}
                    color="success"
                  />
                  <Typography variant="caption" color="success.main">
                    92% Óptimo
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Almacenamiento
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={68} 
                    sx={{ mt: 1 }}
                    color="warning"
                  />
                  <Typography variant="caption" color="warning.main">
                    68% Utilizado
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;