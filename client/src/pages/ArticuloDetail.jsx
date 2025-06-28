import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// MUI
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
} from '@mui/material';

// Componentes personalizados
import Navbar from '../components/Navbar';
import Pie from '../components/Pie';

// Contexto del carrito
import { useCarrito } from '../context/CarritoContext';

// Constante para categorías
const CATEGORIAS = {
  1: 'Prenda',
  2: 'Útiles',
  3: 'Libros',
  4: 'Herramientas',
};

const ArticuloDetail = () => {
  const { id } = useParams();
  const [articulo, setArticulo] = useState(null);
  const [error, setError] = useState('');
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/articulos/${id}/`
        );
        setArticulo(response.data);
      } catch (error) {
        setError('No se pudo cargar el artículo.');
      }
    };
    fetchArticulo();
  }, [id]);

  const handleAgregar = () => {
    if (articulo) {
      agregarAlCarrito(articulo);
    }
  };

  if (error) {
    return (
      <>
        <Navbar />
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography color="error">{error}</Typography>
        </Box>
        <Pie />
      </>
    );
  }

  if (!articulo) {
    return (
      <>
        <Navbar />
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <CircularProgress sx={{ color: '#468C8C' }} />
        </Box>
        <Pie />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, p: 3, minHeight: '80vh' }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
          <Grid container spacing={4}>
            {/* Imagen */}
            <Grid item xs={12} md={6}>
              {articulo.imagen ? (
                <Box
                  component="img"
                  src={articulo.imagen}
                  alt={articulo.titulo_articulo}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 3,
                    boxShadow: 4,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Imagen no disponible
                </Typography>
              )}
            </Grid>

            {/* Información */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
                color="#468C8C"
              >
                {articulo.titulo_articulo}
              </Typography>

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                <strong>Institución:</strong>{' '}
                {articulo.institucion_articulo || 'No registrada'}
              </Typography>

              <Typography
                variant="h5"
                sx={{ color: '#2e7d32', mb: 2, fontWeight: 600 }}
              >
                ${parseFloat(articulo.precio_articulo).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" sx={{ mb: 2 }}>
                {articulo.descripcion_articulo}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Categoría</Typography>
                <Chip
                  label={
                    CATEGORIAS[articulo.id_categoria] ||
                    `ID ${articulo.id_categoria}`
                  }
                  sx={{
                    mt: 0.5,
                    backgroundColor: '#468C8C',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: 1,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Estado</Typography>
                <Chip
                  label={articulo.disponible ? 'Disponible' : 'No disponible'}
                  color={articulo.disponible ? 'success' : 'default'}
                  sx={{ mt: 0.5, fontWeight: 500, borderRadius: 1 }}
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAgregar}
                  sx={{
                    backgroundColor: '#468C8C',
                    '&:hover': {
                      backgroundColor: '#3a7c7c',
                    },
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  }}
                >
                  Agregar al carrito 🛒
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <Pie />
    </>
  );
};

export default ArticuloDetail;
