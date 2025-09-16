// src/pages/HistorialTransacciones.jsx
import { useEffect, useState } from 'react';
import { getMisTransacciones, getResumenCompraByTransaccionId } from '../api/transacciones.api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  ShoppingBag,
  CalendarToday,
  Payment,
  Visibility,
  CheckCircle,
  HourglassEmpty,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HistorialTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        setLoading(true);
        const response = await getMisTransacciones();
        setTransacciones(response.data || []);
      } catch (error) {
        console.error('Error al obtener transacciones:', error);
        setError('Error al cargar el historial de transacciones');
      } finally {
        setLoading(false);
      }
    };

    fetchTransacciones();
  }, []);

  const handleVerDetalle = async (transaccionId) => {
    navigate(`/detalle-transaccion/${transaccionId}`);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando historial de transacciones...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📋 Mi Historial de Compras
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Revisa todas tus transacciones y compras realizadas
        </Typography>
      </Box>

      {transacciones.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No tienes transacciones aún
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cuando realices tu primera compra, aparecerá aquí
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {transacciones.map((transaccion) => (
            <Grid item xs={12} key={transaccion.id_transaccion}>
              <Card elevation={2} sx={{ '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Transacción #{transaccion.id_transaccion}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatearFecha(transaccion.fecha_transaccion)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Chip
                        icon={<CheckCircle />}
                        label="Completada"
                        color="success"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleVerDetalle(transaccion.id_transaccion)}
                        sx={{ display: 'block', ml: 'auto' }}
                      >
                        Ver Detalle
                      </Button>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        Información de la Compra:
                      </Typography>
                      <Box display="flex" gap={2} flexWrap="wrap">
                        <Chip
                          icon={<Payment />}
                          label="Pago Procesado"
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`ID: #${transaccion.id_transaccion}`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      {transaccion.detalle_transaccion_data && (
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Tipo:</strong> {transaccion.detalle_transaccion_data.tipo_transaccion || 'Compra'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Entrega:</strong> {transaccion.detalle_transaccion_data.tipo_entrega === 'domicilio' ? 'Domicilio' : 'Retiro en punto físico'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                          Resumen de la Compra
                        </Typography>
                        <Typography variant="body2">
                          <strong>Estado:</strong> Completada ✓
                        </Typography>
                        <Typography variant="body2">
                          <strong>Método de pago:</strong> Tarjeta/Transferencia
                        </Typography>
                        <Typography variant="caption" display="block" mt={1} color="text.secondary">
                          Para ver artículos y montos detallados, haz click en "Ver Detalle"
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HistorialTransacciones;
