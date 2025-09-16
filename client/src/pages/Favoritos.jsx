import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  Chip,
  Rating,
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  Visibility,
  FavoriteBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '../hooks/useRoleAuth';
import { useCarrito } from '../context/CarritoContext';
import axios from 'axios';

const Favoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [articulosFavoritos, setArticulosFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useRoleAuth();
  const { agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();

  const getFavoritos = () => {
    try {
      const favoritos = localStorage.getItem(`favoritos_${user?.id_usuario}`);
      return favoritos ? JSON.parse(favoritos) : [];
    } catch {
      return [];
    }
  };

  const handleToggleFavorite = articuloId => {
    try {
      const favoritosActuales = getFavoritos();
      const nuevosFavoritos = favoritosActuales.filter(id => id !== articuloId);

      localStorage.setItem(`favoritos_${user?.id_usuario}`, JSON.stringify(nuevosFavoritos));

      // Actualizar la UI
      setArticulosFavoritos(prev => prev.filter(art => art.id_articulo !== articuloId));
      setFavoritos(nuevosFavoritos);
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
    }
  };

  const handleAddToCart = articulo => {
    try {
      agregarAlCarrito(articulo);
      alert(`"${articulo.titulo_articulo}" agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito');
    }
  };

  const getImageUrl = imagen => {
    if (!imagen) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBObyBEaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
    }
    if (imagen.startsWith('http')) {
      return imagen;
    }
    return `http://localhost:8000${imagen}`;
  };

  useEffect(() => {
    const loadFavoritos = async () => {
      try {
        setLoading(true);
        const favoritosIds = getFavoritos();

        if (favoritosIds.length === 0) {
          setArticulosFavoritos([]);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/v1/articulos/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const articulosData = response.data;
        const articulosFiltrados = articulosData.filter(articulo =>
          favoritosIds.includes(articulo.id_articulo)
        );

        setArticulosFavoritos(articulosFiltrados);
        setFavoritos(favoritosIds);
      } catch (error) {
        console.error('Error cargando favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadFavoritos();
    }
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ❤️ Mis Favoritos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Todos los artículos que has marcado como favoritos
        </Typography>
      </Box>

      {loading ? (
        <Box textAlign="center" py={4}>
          <Typography>Cargando favoritos...</Typography>
        </Box>
      ) : articulosFavoritos.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No tienes favoritos aún
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Explora nuestros artículos y marca tus favoritos haciendo clic en el corazón
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/articulos')}
          >
            Explorar Artículos
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {articulosFavoritos.map((articulo) => (
            <Grid item xs={12} sm={6} md={4} key={articulo.id_articulo}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(articulo.imagen)}
                  alt={articulo.titulo_articulo}
                  sx={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/articulos/${articulo.id_articulo}`)}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {articulo.titulo_articulo}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {articulo.descripcion_articulo}
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      ${articulo.precio_articulo?.toLocaleString()}
                    </Typography>
                    <Chip
                      label={articulo.id_categoria?.nombre_categoria || 'Sin categoría'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={4.5} readOnly size="small" precision={0.5} />
                    <Typography variant="body2" color="text.secondary">
                      (4.5)
                    </Typography>
                    <Chip
                      label={articulo.disponible ? 'Disponible' : 'Agotado'}
                      size="small"
                      color={articulo.disponible ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => handleAddToCart(articulo)}
                    size="small"
                    disabled={!articulo.disponible}
                  >
                    {articulo.disponible ? 'Agregar' : 'Agotado'}
                  </Button>
                  <Box>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        onClick={() => navigate(`/articulos/${articulo.id_articulo}`)}
                        color="primary"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Quitar de favoritos">
                      <IconButton
                        onClick={() => handleToggleFavorite(articulo.id_articulo)}
                        color="error"
                        size="small"
                      >
                        <Favorite />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favoritos;