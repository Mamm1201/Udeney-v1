// src/pages/MisArticulos.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const MisArticulos = () => {
  const navigate = useNavigate();
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articuloAEliminar, setArticuloAEliminar] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const id_usuario = localStorage.getItem('id_usuario');

  // 🔁 Cargar artículos del usuario
  const fetchArticulos = async () => {
    try {
      const res = await api.get(`/articulos/`);
      const filtrados = res.data.filter(
        (art) => parseInt(art.id_usuario) === parseInt(id_usuario),
      );
      setArticulos(filtrados);
    } catch (error) {
      console.error('Error al obtener artículos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  // 🧹 Eliminar artículo
  const handleEliminar = async () => {
    try {
      await api.delete(`/articulos/${articuloAEliminar.id_articulo}/`);
      setArticulos((prev) =>
        prev.filter((a) => a.id_articulo !== articuloAEliminar.id_articulo),
      );
      setSnackbar({
        open: true,
        message: '✅ Artículo eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      setSnackbar({
        open: true,
        message: '❌ Error al eliminar el artículo',
      });
    } finally {
      setArticuloAEliminar(null);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  return (
    <Box sx={{ padding: 4 }}>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<span style={{ fontSize: '1.2rem' }}>🏠</span>}
        sx={{
          mb: 3,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          px: 3,
          py: 1,
          ':hover': {
            backgroundColor: '#f0f0f0',
          },
        }}
        onClick={() => navigate('/')}
      >
        Volver al inicio
      </Button>

      <Typography variant="h4" gutterBottom>
        📦 Mis Artículos en Venta
      </Typography>

      {articulos.length === 0 ? (
        <Typography>No has subido ningún artículo aún.</Typography>
      ) : (
        <Grid container spacing={3}>
          {articulos.map((articulo) => (
            <Grid item xs={12} sm={6} md={4} key={articulo.id_articulo}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={
                    articulo.imagen ||
                    'https://via.placeholder.com/300x160?text=Sin+imagen'
                  }
                  alt={articulo.titulo_articulo}
                />
                <CardContent>
                  <Typography variant="h6">
                    {articulo.titulo_articulo}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Precio: ${articulo.precio_articulo}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        navigate(`/editar-articulo/${articulo.id_articulo}`)
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => setArticuloAEliminar(articulo)}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de confirmación */}
      <Dialog
        open={!!articuloAEliminar}
        onClose={() => setArticuloAEliminar(null)}
      >
        <DialogTitle>¿Eliminar artículo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este artículo? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArticuloAEliminar(null)}>Cancelar</Button>
          <Button color="error" onClick={handleEliminar}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ open: false, message: '' })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MisArticulos;
