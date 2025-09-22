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
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
      {action && (
        <CardActions sx={{ p: 0, pt: 2 }}>
          {action}
        </CardActions>
      )}
    </CardContent>
  </Card>
);

/**
 * Componente de artículo reciente
 */
const ArticuloItem = ({ articulo, onEdit, onDelete }) => (
  <Card elevation={1} sx={{ mb: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flexGrow={1}>
          <Typography variant="h6" fontWeight="bold">
            {articulo.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {articulo.categoria}
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            ${articulo.precio}
          </Typography>
          <Box mt={1}>
            <Chip 
              label={articulo.disponible ? 'Disponible' : 'No disponible'}
              size="small"
              color={articulo.disponible ? 'success' : 'default'}
              variant="outlined"
            />
            <Chip 
              label={`${articulo.vistas} vistas`}
              size="small"
              sx={{ ml: 1 }}
              icon={<Visibility />}
            />
          </Box>
        </Box>
        <Box>
          <Tooltip title="Editar artículo">
            <IconButton onClick={() => onEdit(articulo.id)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar artículo">
            <IconButton onClick={() => onDelete(articulo.id)} color="error">
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
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Transacciones Recientes
        </Typography>
        <Button 
          size="small" 
          endIcon={<History />}
          href="/historial"
        >
          Ver Historial
        </Button>
      </Box>
      <List dense>
        {transacciones.length > 0 ? transacciones.map((transaccion, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary={`Venta de "${transaccion.articulo}"`}
                secondary={`${transaccion.fecha} - $${transaccion.monto}`}
              />
              <Chip 
                label={transaccion.estado}
                size="small"
                color={transaccion.estado === 'Completada' ? 'success' : 'warning'}
                variant="outlined"
              />
            </ListItem>
            {index < transacciones.length - 1 && <Divider />}
          </React.Fragment>
        )) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No hay transacciones recientes
          </Typography>
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
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Mi Negocio
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gestiona tus artículos y ventas, {user?.nombres_usuario}
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

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Métricas principales */}
      <Grid container spacing={3} mb={4}>
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
      <Grid container spacing={3}>
        {/* Artículos recientes */}
        <Grid item xs={12} md={7}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Mis Artículos
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => navigate('/crear-articulo')}
            >
              Nuevo Artículo
            </Button>
          </Box>
          {articulosRecientes.map((articulo) => (
            <ArticuloItem
              key={articulo.id}
              articulo={articulo}
              onEdit={handleEditArticulo}
              onDelete={handleDeleteArticulo}
            />
          ))}
        </Grid>

        {/* Transacciones recientes */}
        <Grid item xs={12} md={5}>
          <TransaccionesRecientes transacciones={transaccionesRecientes} />

          {/* Consejos para vendedor */}
          <Card elevation={2} sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                💡 Consejos para vender más
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Sube fotos de calidad"
                    secondary="Las imágenes claras aumentan las ventas en un 40%"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Describe detalladamente"
                    secondary="Incluye especificaciones y estado del producto"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Precio competitivo"
                    secondary="Revisa precios similares en el mercado"
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