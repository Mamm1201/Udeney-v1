/**
 * Dashboard para usuarios con rol Vendedor
 * Enfocado en gestión de artículos, ventas y métricas de negocio
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
  ListItemText,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Fab,
  CardActions
} from '@mui/material';
import {
  Store,
  Add,
  TrendingUp,
  Visibility,
  ShoppingCart,
  Assessment,
  History,
  Edit,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '../../hooks/useRoleAuth';
import { vendedorAPI } from '../../api/vendedor.api';

/**
 * Componente de tarjeta de métrica para vendedor
 */
const VendedorMetricCard = ({ title, value, subtitle, icon, color = 'primary', action = null }) => (
  <Card
    elevation={3}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        elevation: 6,
        transform: 'translateY(-2px)'
      }
    }}
  >
    <CardContent sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box flex={1} mr={2}>
          <Typography variant="h3" fontWeight="bold" color={`${color}.main`} mb={1}>
            {value}
          </Typography>
          <Typography variant="h6" fontWeight="600" color="text.primary" mb={0.5}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" lineHeight={1.4}>
            {subtitle}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}.main`,
            width: 64,
            height: 64,
            boxShadow: 2
          }}
        >
          {icon}
        </Avatar>
      </Box>
      {action && (
        <Box mt={2} pt={1} borderTop="1px solid" borderColor="divider">
          {action}
        </Box>
      )}
    </CardContent>
  </Card>
);

/**
 * Componente de artículo reciente
 */
const ArticuloItem = ({ articulo, onEdit, onDelete }) => (
  <Card
    elevation={2}
    sx={{
      mb: 2,
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        elevation: 4,
        transform: 'translateX(4px)'
      }
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box flexGrow={1} mr={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {articulo.titulo}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{ textTransform: 'capitalize' }}
          >
            {articulo.categoria}
          </Typography>

          <Typography
            variant="h5"
            color="primary.main"
            fontWeight="bold"
            mb={2}
          >
            ${articulo.precio?.toLocaleString()}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip
              label={articulo.disponible ? 'Disponible' : 'No disponible'}
              size="small"
              color={articulo.disponible ? 'success' : 'error'}
              variant={articulo.disponible ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
            <Chip
              label={`${articulo.vistas} vistas`}
              size="small"
              variant="outlined"
              icon={<Visibility />}
              color="info"
            />
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          <Tooltip title="Editar artículo" placement="left">
            <IconButton
              onClick={() => onEdit(articulo.id)}
              color="primary"
              sx={{
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100' }
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar artículo" placement="left">
            <IconButton
              onClick={() => onDelete(articulo.id)}
              color="error"
              sx={{
                bgcolor: 'error.50',
                '&:hover': { bgcolor: 'error.100' }
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Componente de transacciones recientes
 */
const TransaccionesRecientes = ({ transacciones = [] }) => (
  <Card elevation={3} sx={{ borderRadius: 2 }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Transacciones Recientes
        </Typography>
        <Button
          size="small"
          variant="outlined"
          endIcon={<History />}
          href="/historial"
          sx={{ borderRadius: 2 }}
        >
          Ver Historial
        </Button>
      </Box>

      <List sx={{ p: 0 }}>
        {transacciones.length > 0 ? transacciones.map((transaccion, index) => (
          <React.Fragment key={index}>
            <ListItem
              sx={{
                px: 0,
                py: 2,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Box display="flex" flexDirection="column" flexGrow={1} mr={2}>
                <Typography variant="subtitle1" fontWeight="600" color="text.primary" mb={0.5}>
                  {transaccion.articulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {transaccion.fecha}
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold" mt={0.5}>
                  ${transaccion.monto?.toLocaleString()}
                </Typography>
              </Box>

              <Chip
                label={transaccion.estado}
                size="medium"
                color={transaccion.estado === 'Completada' ? 'success' : 'warning'}
                variant="filled"
                sx={{
                  fontWeight: 500,
                  minWidth: 100
                }}
              />
            </ListItem>
            {index < transacciones.length - 1 && (
              <Divider sx={{ my: 1, opacity: 0.6 }} />
            )}
          </React.Fragment>
        )) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={1}>
              No hay transacciones recientes
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Las ventas aparecerán aquí cuando tengas transacciones
            </Typography>
          </Box>
        )}
      </List>
    </CardContent>
  </Card>
);

/**
 * Dashboard principal para Vendedor
 */
const VendedorDashboard = () => {
  const { user } = useRoleAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendedorData, setVendedorData] = useState({
    articulos: {
      total: 0,
      activos: 0,
      vendidos: 0
    },
    ventas: {
      total: 0,
      mes: 0,
      ingresos: 0
    },
    estadisticas: {
      vistas: 0,
      interes: 0
    }
  });

  const [articulosRecientes, setArticulosRecientes] = useState([]);
  const [transaccionesRecientes, setTransaccionesRecientes] = useState([]);

  // Cargar datos del vendedor
  useEffect(() => {
    const loadVendedorData = async () => {
      setLoading(true);
      try {
        // Cargar métricas del dashboard
        const metricsResponse = await vendedorAPI.getDashboardMetrics();
        setVendedorData(metricsResponse);

        // Cargar artículos recientes
        const articulosResponse = await vendedorAPI.getArticulosRecientes();
        setArticulosRecientes(articulosResponse.articulos || []);

        // Cargar transacciones recientes
        const transaccionesResponse = await vendedorAPI.getTransaccionesRecientes();
        setTransaccionesRecientes(transaccionesResponse.transacciones || []);

        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos del vendedor:', error);
        // En caso de error, mantener datos por defecto
        setVendedorData({
          articulos: {
            total: 0,
            activos: 0,
            vendidos: 0
          },
          ventas: {
            total: 0,
            mes: 0,
            ingresos: 0
          },
          estadisticas: {
            vistas: 0,
            interes: 0
          }
        });
        setArticulosRecientes([]);
        setTransaccionesRecientes([]);
        setLoading(false);
      }
    };

    if (user) {
      loadVendedorData();
    }
  }, [user]);

  const handleEditArticulo = (id) => {
    navigate(`/editar-articulo/${id}`);
  };

  const handleDeleteArticulo = async (id) => {
    try {
      // Confirmar eliminación
      if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
        setLoading(true);
        await vendedorAPI.deleteArticulo(id);

        // Recargar datos después de eliminar
        const articulosResponse = await vendedorAPI.getArticulosRecientes();
        setArticulosRecientes(articulosResponse.articulos || []);

        const metricsResponse = await vendedorAPI.getDashboardMetrics();
        setVendedorData(metricsResponse);

        setLoading(false);
      }
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      setLoading(false);
      alert('Error al eliminar el artículo. Por favor, inténtalo de nuevo.');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Recargar todas las métricas y datos
      const metricsResponse = await vendedorAPI.getDashboardMetrics();
      setVendedorData(metricsResponse);

      const articulosResponse = await vendedorAPI.getArticulosRecientes();
      setArticulosRecientes(articulosResponse.articulos || []);

      const transaccionesResponse = await vendedorAPI.getTransaccionesRecientes();
      setTransaccionesRecientes(transaccionesResponse.transacciones || []);

      setLoading(false);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      setLoading(false);
    }
  };

  return (
    <Box p={{ xs: 2, sm: 3 }} sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 3,
          color: 'white'
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" mb={1}>
            Mi Negocio
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Gestiona tus artículos y ventas, {user?.nombres_usuario}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={refreshData}
              disabled={loading}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading bar */}
      {loading && (
        <Box mb={3}>
          <LinearProgress
            sx={{
              borderRadius: 1,
              height: 6,
              bgcolor: 'action.hover'
            }}
          />
        </Box>
      )}

      {/* Métricas principales */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <VendedorMetricCard
            title="Artículos"
            value={vendedorData.articulos.total}
            subtitle={`${vendedorData.articulos.activos} activos`}
            icon={<Store />}
            color="primary"
            action={
              <Button 
                size="small" 
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/crear-articulo')}
              >
                Nuevo Artículo
              </Button>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <VendedorMetricCard
            title="Ventas Totales"
            value={vendedorData.ventas.total}
            subtitle={`${vendedorData.ventas.mes} este mes`}
            icon={<ShoppingCart />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <VendedorMetricCard
            title="Ingresos"
            value={`$${vendedorData.ventas.ingresos.toLocaleString()}`}
            subtitle="Total acumulado"
            icon={<TrendingUp />}
            color="success"
            action={
              <Button 
                size="small" 
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => navigate('/reportes-ventas')}
              >
                Ver Reportes
              </Button>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <VendedorMetricCard
            title="Vistas"
            value={vendedorData.estadisticas.vistas}
            subtitle={`${vendedorData.estadisticas.interes} interesados`}
            icon={<Visibility />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Contenido principal */}
      <Grid container spacing={4}>
        {/* Artículos recientes */}
        <Grid item xs={12} lg={8}>
          <Card elevation={3} sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  Mis Artículos
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/crear-articulo')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  Nuevo Artículo
                </Button>
              </Box>

              {articulosRecientes.length > 0 ? (
                <Box>
                  {articulosRecientes.map((articulo) => (
                    <ArticuloItem
                      key={articulo.id}
                      articulo={articulo}
                      onEdit={handleEditArticulo}
                      onDelete={handleDeleteArticulo}
                    />
                  ))}
                </Box>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  py={6}
                >
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    No tienes artículos publicados
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                    ¡Comienza tu negocio creando tu primer artículo!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/crear-articulo')}
                    size="large"
                  >
                    Crear mi primer artículo
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transacciones recientes */}
        <Grid item xs={12} lg={4}>
          <Box mb={3}>
            <TransaccionesRecientes transacciones={transaccionesRecientes} />
          </Box>

          {/* Consejos para vendedor */}
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  💡 Consejos para vender más
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'action.hover'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                        📸 Sube fotos de calidad
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Las imágenes claras aumentan las ventas en un 40%
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'action.hover'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                        📝 Describe detalladamente
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Incluye especificaciones y estado del producto
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    borderRadius: 1,
                    bgcolor: 'action.hover'
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                        💰 Precio competitivo
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Revisa precios similares en el mercado
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAB para crear artículo */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/crear-articulo')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default VendedorDashboard;