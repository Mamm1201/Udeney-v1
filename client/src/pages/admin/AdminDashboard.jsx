/**
 * Dashboard para administradores de negocio
 * Muestra métricas, herramientas de gestión y accesos rápidos
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
  Container,
  Paper,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  People,
  Assessment,
  TrendingUp,
  TrendingDown,
  Warning,
  Store,
  ShoppingCart,
  AdminPanelSettings,
  Refresh,
  Settings,
  NotificationImportant,
  AttachMoney
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '../../hooks/useRoleAuth';
import api from '../../api/axiosConfig';

/**
 * Componente de tarjeta de métrica
 */
const MetricCard = ({ title, value, subtitle, icon, color = 'primary', trend = null, loading = false }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="50%" height={20} />
            </Box>
            <Skeleton variant="circular" width={56} height={56} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
  <Card
    elevation={2}
    sx={{
      height: '100%',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        elevation: 4,
        transform: 'translateY(-2px)'
      }
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color={`${color}.main`}
            sx={{
              wordBreak: 'break-word',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {subtitle}
          </Typography>
          {trend !== null && (
            <Box display="flex" alignItems="center" mt={1}>
              {trend > 0 ? (
                <TrendingUp fontSize="small" color="success" />
              ) : (
                <TrendingDown fontSize="small" color="error" />
              )}
              <Typography
                variant="body2"
                color={trend > 0 ? 'success.main' : 'error.main'}
                ml={0.5}
                fontWeight="medium"
              >
                {trend > 0 ? '+' : ''}{Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 }
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
  );
};

/**
 * Componente de actividad reciente
 */
const RecentActivity = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <Card elevation={2} sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actividad Reciente
          </Typography>
          <List dense>
            {[...Array(3)].map((_, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={32} height={32} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="text" width="70%" />}
                  secondary={<Skeleton variant="text" width="40%" />}
                />
                <Skeleton variant="rectangular" width={60} height={24} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Actividad Reciente
      </Typography>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List dense>
          {activities.length > 0 ? activities.map((activity, index) => {
            const getActivityIcon = (type) => {
              switch (type) {
                case 'user': return <People fontSize="small" />;
                case 'content': return <Store fontSize="small" />;
                case 'report': return <Assessment fontSize="small" />;
                default: return <NotificationImportant fontSize="small" />;
              }
            };

            const getActivityColor = (type) => {
              switch (type) {
                case 'user': return 'primary.main';
                case 'content': return 'secondary.main';
                case 'report': return 'info.main';
                default: return 'grey.500';
              }
            };

            return (
              <React.Fragment key={index}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getActivityColor(activity.type), width: 32, height: 32 }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'medium',
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {activity.title}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {activity.time}
                      </Typography>
                    }
                  />
                  <Chip
                    label={activity.status}
                    size="small"
                    color={activity.status === 'Completado' ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            );
          }) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationImportant sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No hay actividad reciente
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </CardContent>
  </Card>
  );
};

/**
 * Componente de acciones rápidas
 */
const QuickActions = ({ loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const actions = useMemo(() => [
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
  ], []);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card elevation={1}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {actions.map((action, index) => (
        <Grid item xs={12} sm={6} md={isMobile ? 12 : 6} key={index}>
          <Card
            elevation={1}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              height: '100%',
              '&:hover': {
                elevation: 6,
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              },
              '&:active': {
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigate(action.path)}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    bgcolor: `${action.color}.main`,
                    mr: 2,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}
                >
                  {action.icon}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      lineHeight: 1.2,
                      wordBreak: 'break-word'
                    }}
                  >
                    {action.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      mt: 0.5
                    }}
                  >
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
  const { user, permissions, isAdmin, isSuperuser } = useRoleAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, new: 0 },
    transactions: { total: 0, today: 0, trend: 0 },
    articles: { total: 0, pending: 0 },
    revenue: { total: 0, monthly: 0, trend: 0 },
    alerts: []
  });
  const [error, setError] = useState(null);

  const [recentActivities, setRecentActivities] = useState([]);

  // Verificar acceso
  const hasAccess = useMemo(() => {
    return isAdmin() || isSuperuser() || user?.groups?.includes('Admin_Negocio');
  }, [isAdmin, isSuperuser, user]);

  // Datos de actividades de ejemplo
  const sampleActivities = useMemo(() => [
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
    },
    {
      title: 'Actualización del sistema completada',
      type: 'system',
      time: 'Hace 1 día',
      status: 'Completado'
    }
  ], []);

  // Simular carga de datos del dashboard
  useEffect(() => {
    if (!hasAccess) return;

    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Llamada real a la API para obtener métricas
        const response = await api.get('/admin/dashboard/metrics/');
        const metricsData = response.data;

        // Configurar datos reales recibidos de la API
        setDashboardData({
          users: {
            total: metricsData.users.total,
            active: metricsData.users.active,
            new: metricsData.users.new
          },
          transactions: {
            total: metricsData.transactions.total,
            today: metricsData.transactions.today,
            trend: metricsData.transactions.trend
          },
          articles: {
            total: metricsData.articles.total,
            pending: metricsData.articles.pending
          },
          revenue: {
            total: metricsData.revenue.total,
            monthly: metricsData.revenue.monthly,
            trend: metricsData.revenue.trend
          },
          alerts: metricsData.alerts.length > 0 ? metricsData.alerts : [
            {
              type: 'info',
              message: 'Sistema funcionando correctamente'
            }
          ]
        });

        setRecentActivities(sampleActivities);

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        setError('Error al cargar los datos del dashboard. Verifique su conexión.');

        // Datos por defecto en caso de error
        setDashboardData({
          users: { total: 0, active: 0, new: 0 },
          transactions: { total: 0, today: 0, trend: 0 },
          articles: { total: 0, pending: 0 },
          revenue: { total: 0, monthly: 0, trend: 0 },
          alerts: [{ type: 'error', message: 'Error al cargar métricas' }]
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [hasAccess, sampleActivities]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const refreshData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Llamada real a la API para actualizar métricas
      const response = await api.get('/admin/dashboard/metrics/');
      const metricsData = response.data;

      // Actualizar con datos reales de la API
      setDashboardData({
        users: {
          total: metricsData.users.total,
          active: metricsData.users.active,
          new: metricsData.users.new
        },
        transactions: {
          total: metricsData.transactions.total,
          today: metricsData.transactions.today,
          trend: metricsData.transactions.trend
        },
        articles: {
          total: metricsData.articles.total,
          pending: metricsData.articles.pending
        },
        revenue: {
          total: metricsData.revenue.total,
          monthly: metricsData.revenue.monthly,
          trend: metricsData.revenue.trend
        },
        alerts: metricsData.alerts.length > 0 ? metricsData.alerts : [
          {
            type: 'info',
            message: 'Sistema funcionando correctamente'
          }
        ]
      });

    } catch (error) {
      console.error('Error al actualizar datos del dashboard:', error);
      setError('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Si no tiene acceso, mostrar mensaje de error
  if (!hasAccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Acceso Denegado</Typography>
          <Typography>
            No tienes permisos para acceder al panel de administración.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={isMobile ? 'flex-start' : 'center'}
          flexDirection={isMobile ? 'column' : 'row'}
          gap={isMobile ? 2 : 0}
        >
          <Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              fontWeight="bold"
              sx={{ mb: 0.5 }}
            >
              Panel de Administración
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ opacity: 0.9 }}
            >
              Bienvenido, {user?.nombres_usuario || user?.first_name} {user?.apellidos_usuario || user?.last_name}
            </Typography>
            {user?.groups && (
              <Box sx={{ mt: 1 }}>
                {user.groups.map((group, index) => (
                  <Chip
                    key={index}
                    label={group}
                    size="small"
                    sx={{
                      mr: 0.5,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          <Box>
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={refreshData}
                disabled={loading}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Alertas */}
      {dashboardData.alerts.length > 0 && (
        <Box mb={3}>
          <Grid container spacing={1}>
            {dashboardData.alerts.map((alert, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Alert
                  severity={alert.type}
                  sx={{
                    height: '100%',
                    '& .MuiAlert-message': {
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }
                  }}
                  action={
                    <Button size="small" color="inherit">
                      Ver
                    </Button>
                  }
                >
                  {alert.message}
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Métricas principales */}
      <Grid container spacing={{ xs: 2, md: 3 }} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Usuarios Totales"
            value={loading ? '---' : dashboardData.users.total.toLocaleString()}
            subtitle={loading ? 'Cargando...' : `${dashboardData.users.active} activos, ${dashboardData.users.new} nuevos`}
            icon={<People />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Transacciones"
            value={loading ? '---' : dashboardData.transactions.total.toLocaleString()}
            subtitle={loading ? 'Cargando...' : `${dashboardData.transactions.today} hoy`}
            icon={<ShoppingCart />}
            color="secondary"
            trend={loading ? null : parseFloat(dashboardData.transactions.trend)}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Artículos"
            value={loading ? '---' : dashboardData.articles.total.toLocaleString()}
            subtitle={loading ? 'Cargando...' : `${dashboardData.articles.pending} pendientes`}
            icon={<Store />}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Ingresos"
            value={loading ? '---' : dashboardData.revenue.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            subtitle={loading ? 'Cargando...' : `${dashboardData.revenue.monthly.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} este mes`}
            icon={<AttachMoney />}
            color="success"
            trend={loading ? null : parseFloat(dashboardData.revenue.trend)}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Tabs de contenido */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minHeight: { xs: 40, sm: 48 }
            }
          }}
        >
          <Tab label="Acciones Rápidas" />
          <Tab label="Actividad Reciente" />
        </Tabs>
      </Paper>

      {/* Contenido de tabs */}
      {tabValue === 0 && (
        <Box sx={{ minHeight: 300 }}>
          <QuickActions loading={loading} />
        </Box>
      )}

      {tabValue === 1 && (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} lg={8}>
            <RecentActivity activities={recentActivities} loading={loading} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado del Sistema
                </Typography>

                {loading ? (
                  <Box>
                    {[...Array(3)].map((_, index) => (
                      <Box key={index} mb={2}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="rectangular" width="100%" height={4} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <>
                    <Box mb={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Rendimiento del Servidor
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={92}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }}
                        color="success"
                      />
                      <Typography variant="caption" color="success.main" fontWeight="medium">
                        92% Óptimo
                      </Typography>
                    </Box>

                    <Box mb={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Uso de Almacenamiento
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={68}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }}
                        color="warning"
                      />
                      <Typography variant="caption" color="warning.main" fontWeight="medium">
                        68% Utilizado
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tráfico de Red
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={45}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4
                          }
                        }}
                        color="info"
                      />
                      <Typography variant="caption" color="info.main" fontWeight="medium">
                        45% Normal
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Última actualización
                      </Typography>
                      <Typography variant="caption" color="primary.main">
                        {new Date().toLocaleString('es-ES')}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AdminDashboard;