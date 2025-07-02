// src/pages/ResumenCompra.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Avatar,
  Grid,
} from '@mui/material';
import { getResumenCompraByTransaccionId } from '../api/transacciones.api';

const ResumenCompra = () => {
  const { id } = useParams(); // ID desde la URL
  const navigate = useNavigate();

  const [resumen, setResumen] = useState(null); // Datos de la transacción
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error
  const fallbackImage = '/estudiantes.jpg'; // Imagen por defecto

  // Petición al backend para obtener resumen por ID
  useEffect(() => {
    const fetchResumen = async () => {
      try {
        setLoading(true);
        const response = await getResumenCompraByTransaccionId(id);
        console.log('🧾 Resumen recibido:', response.data);
        console.log('📦 Artículos completos:', response.data.articulos);
        setResumen(response.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el resumen de transacción.');
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [id]);

  // Mostrar loader si está cargando
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar error si ocurre
  if (error || !resumen) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/historial-transacciones')}
        >
          Volver al Historial
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        p: 3,
        backgroundColor: '#0D0D0D', // Fondo oscuro
        minHeight: '100vh',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 4,
          borderRadius: 4,
          backgroundColor: '#ffffff', // Tarjeta blanca
        }}
      >
        {/* Título dinámico según el tipo de transacción */}
        <Typography variant="h4" gutterBottom color="primary">
          🧾 Resumen de{' '}
          {resumen.tipo_transaccion === 'venta' ? 'Venta' : 'Compra'}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Información general */}
        {resumen.id_transaccion && (
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>ID Transacción:</strong> {resumen.id_transaccion}
          </Typography>
        )}

        {resumen.fecha_transaccion ? (
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Fecha:</strong>{' '}
            {new Date(resumen.fecha_transaccion).toLocaleString()}
          </Typography>
        ) : (
          <Typography variant="subtitle1" color="error">
            <strong>Fecha:</strong> No disponible
          </Typography>
        )}

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          <strong>Tipo de entrega:</strong>{' '}
          {resumen.tipo_entrega === 'domicilio'
            ? '🚚 Domicilio a tu dirección'
            : '🏬 Retiro en punto físico'}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Lista de artículos */}
        {resumen.articulos?.length > 0 ? (
          <List>
            {resumen.articulos.map((item, index) => (
              <ListItem key={index} divider alignItems="flex-start">
                <Grid container spacing={2} alignItems="center">
                  {/* Imagen del artículo */}
                  <Grid item>
                    <Avatar
                      variant="rounded"
                      src={item.imagen || fallbackImage}
                      alt={item.titulo_articulo}
                      sx={{ width: 64, height: 64 }}
                      onError={e => {
                        e.target.src = fallbackImage;
                        e.target.style.opacity = 1;
                      }}
                    />
                  </Grid>

                  {/* Detalle del artículo */}
                  <Grid item xs>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          component="span"
                        >
                          {item.titulo_articulo} × {item.cantidad}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          Precio unitario: $
                          {item.precio_unitario.toLocaleString('es-CO')} <br />
                          Subtotal: ${item.subtotal.toLocaleString('es-CO')}
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" textAlign="center" color="text.secondary">
            No hay artículos para mostrar en esta transacción.
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Total de la transacción */}
        <Typography variant="h5" textAlign="right" color="primary">
          Total: <strong>${resumen.total.toLocaleString('es-CO')}</strong>
        </Typography>

        {/* Mensaje informativo */}
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          📦 Esta transacción está en trámite. Recibirás confirmación pronto.
          Gracias por hacer parte del cambio.
        </Typography>

        {/* Botón para volver al inicio */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: '#0593A2',
              '&:hover': { backgroundColor: '#038C7F' },
              color: 'white',
            }}
          >
            Volver
          </Button>

          {/* Botón para calificar la transacción */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/calificar/${resumen.id_transaccion}`)}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                },
                mb: 2,
              }}
            >
              Calificar transacción
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResumenCompra;
