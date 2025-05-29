// src/pages/Carrito.jsx
import React, { useEffect, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AddCircleOutline,
  RemoveCircleOutline,
  DeleteOutline,
} from '@mui/icons-material';
import { useCarrito } from '../context/CarritoContext';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const Carrito = () => {
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } =
    useCarrito();
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [tipoEntrega, setTipoEntrega] = useState('domicilio');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  useEffect(() => {
    const totalCalculado = carrito.reduce(
      (acc, item) => acc + item.precio_articulo * item.cantidad,
      0,
    );
    setTotal(totalCalculado);
  }, [carrito]);

  const disminuirCantidad = (id_articulo) => {
    const articulo = carrito.find((item) => item.id_articulo === id_articulo);
    if (!articulo) return;

    if (articulo.cantidad > 1) {
      agregarAlCarrito({ ...articulo, cantidad: articulo.cantidad - 1 });
    } else {
      eliminarDelCarrito(id_articulo);
    }
  };

  const handleAbrirConfirmacion = () => setOpenConfirmDialog(true);
  const handleCerrarConfirmacion = () => setOpenConfirmDialog(false);

  const realizarCompra = async () => {
    const id_usuario = parseInt(localStorage.getItem('id_usuario'));

    try {
      for (const item of carrito) {
        const detalle = await api.post('/detalle_transaccion/', {
          tipo_transaccion: 'venta',
          tipo_entrega: tipoEntrega,
          cantidad_articulos: item.cantidad,
          id_articulo: item.id_articulo,
        });

        const id_detalle_transaccion = detalle.data.id_detalle_transaccion;

        await api.post('/transacciones/', {
          id_usuario,
          id_detalle_transaccion,
          fecha_transaccion: new Date().toISOString(),
        });
      }

      setSnackbar({
        open: true,
        message: '✅ ¡Compra realizada con éxito!',
        type: 'success',
      });

      vaciarCarrito();
      setOpenConfirmDialog(false);
      navigate('/articulos');
    } catch (error) {
      console.error('Error al realizar la compra:', error);
      setSnackbar({
        open: true,
        message: 'Ocurrió un error al procesar la compra.',
        type: 'error',
      });
      setOpenConfirmDialog(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Carrito de Compras
      </Typography>

      {carrito.length === 0 ? (
        <Typography>No hay artículos en el carrito.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {carrito.map((articulo) => (
              <Grid item xs={12} sm={6} md={4} key={articulo.id_articulo}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      articulo.imagen || 'https://via.placeholder.com/300x160'
                    }
                    alt={articulo.titulo_articulo}
                  />
                  <CardContent>
                    <Typography variant="h6">
                      {articulo.titulo_articulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {articulo.descripcion_articulo}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="primary"
                      mt={1}
                    >
                      ${articulo.precio_articulo} x {articulo.cantidad}
                    </Typography>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mt={2}
                      alignItems="center"
                    >
                      <IconButton
                        onClick={() => disminuirCantidad(articulo.id_articulo)}
                        aria-label="Disminuir cantidad"
                      >
                        <RemoveCircleOutline />
                      </IconButton>

                      <IconButton
                        onClick={() =>
                          agregarAlCarrito({
                            ...articulo,
                            cantidad: articulo.cantidad + 1,
                          })
                        }
                        aria-label="Aumentar cantidad"
                      >
                        <AddCircleOutline />
                      </IconButton>

                      <IconButton
                        onClick={() => eliminarDelCarrito(articulo.id_articulo)}
                        color="error"
                        aria-label="Eliminar artículo"
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="tipo-entrega-label">Tipo de entrega</InputLabel>
            <Select
              labelId="tipo-entrega-label"
              value={tipoEntrega}
              label="Tipo de entrega"
              onChange={(e) => setTipoEntrega(e.target.value)}
            >
              <MenuItem value="domicilio">🚚 Domicilio</MenuItem>
              <MenuItem value="retiro_punto_fisico">
                🏬 Retiro en punto físico
              </MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5">Total: ${total}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAbrirConfirmacion}
            >
              Realizar Compra
            </Button>
            <Button variant="outlined" onClick={() => navigate('/articulos')}>
              ← Seguir comprando
            </Button>
          </Box>
        </>
      )}

      <Dialog open={openConfirmDialog} onClose={handleCerrarConfirmacion}>
        <DialogTitle>¿Confirmar compra?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas continuar con la compra por{' '}
            <strong>${total}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarConfirmacion}>Cancelar</Button>
          <Button onClick={realizarCompra} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar({ open: false, message: '', type: 'success' })
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.type}
          sx={{ width: '100%' }}
          onClose={() =>
            setSnackbar({ open: false, message: '', type: 'success' })
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Carrito;
