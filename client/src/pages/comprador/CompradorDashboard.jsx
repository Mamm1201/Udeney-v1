/**
 * Dashboard para usuarios con rol Comprador
 * Enfocado en explorar artículos, historial de compras y recomendaciones
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
  CardMedia,
  CardActions,
  IconButton,
  Tooltip,
  LinearProgress,
  Fab,
  InputBase,
  Paper
} from '@mui/material';
import {
  ShoppingCart,
  History,
  Favorite,
  Search,
  TrendingUp,
  Star,
  Visibility,
  FavoriteBorder,
  Add,
  Refresh,
  LocalOffer
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '../../hooks/useRoleAuth';

/**
 * Componente de tarjeta de métrica para comprador
 */
const CompradorMetricCard = ({ title, value, subtitle, icon, color = 'primary', onClick = null }) => (
  <Card 
    elevation={2} 
    sx={{ 
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick ? {
        transform: 'translateY(-2px)',
        boxShadow: 3
      } : {}
    }}
    onClick={onClick}
  >
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
    </CardContent>
  </Card>
);

/**
 * Componente de tarjeta de artículo
 */
const ArticuloCard = ({ articulo, onAddToCart, onToggleFavorite }) => (
  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardMedia
      component="img"
      height="200"
      image={articulo.imagen || '/placeholder-image.jpg'}
      alt={articulo.titulo}
      sx={{ objectFit: 'cover' }}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {articulo.titulo}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {articulo.descripcion}
      </Typography>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" color="primary" fontWeight="bold">
          ${articulo.precio}
        </Typography>
        <Chip 
          label={articulo.categoria}
          size="small"
          variant="outlined"
        />
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <Star fontSize="small" sx={{ color: 'gold' }} />
        <Typography variant="body2">
          {articulo.rating || 4.5} ({articulo.reviews || 12} reviews)
        </Typography>
      </Box>
    </CardContent>
    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
      <Button
        variant="contained"
        startIcon={<ShoppingCart />}
        onClick={() => onAddToCart(articulo)}
        size="small"
      >
        Agregar
      </Button>
      <Tooltip title={articulo.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
        <IconButton 
          onClick={() => onToggleFavorite(articulo.id)}
          color={articulo.favorito ? 'error' : 'default'}
        >
          {articulo.favorito ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
      </Tooltip>
    </CardActions>
  </Card>
);

/**
 * Componente de compras recientes
 */
const ComprasRecientes = ({ compras = [] }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Compras Recientes
        </Typography>
        <Button 
          size="small" 
          endIcon={<History />}
          href="/historial"
        >
          Ver Historial Completo
        </Button>
      </Box>
      {compras.length > 0 ? (
        compras.map((compra, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <Avatar 
              src={compra.imagen} 
              sx={{ width: 48, height: 48, mr: 2 }}
            />
            <Box flexGrow={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                {compra.articulo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {compra.fecha} - ${compra.precio}
              </Typography>
            </Box>
            <Chip 
              label={compra.estado}
              size="small"
              color={compra.estado === 'Entregado' ? 'success' : 'warning'}
              variant="outlined"
            />
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          No hay compras recientes
        </Typography>
      )}
    </CardContent>
  </Card>
);

/**
 * Dashboard principal para Comprador
 */
const CompradorDashboard = () => {
  const { user } = useRoleAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [compradorData, setCompradorData] = useState({
    compras: {
      total: 0,
      mes: 0,
      gastado: 0
    },
    favoritos: 0,
    carrito: 0
  });

  const [articulosRecomendados, setArticulosRecomendados] = useState([]);
  const [comprasRecientes, setComprasRecientes] = useState([]);

  // Cargar datos del comprador
  useEffect(() => {
    const loadCompradorData = async () => {
      setLoading(true);
      try {
        // Simular llamadas a API
        setTimeout(() => {
          setCompradorData({
            compras: {
              total: 15,
              mes: 3,
              gastado: 650
            },
            favoritos: 8,
            carrito: 2
          });

          setArticulosRecomendados([
            {
              id: 1,
              titulo: 'MacBook Air M2',
              descripcion: 'Laptop perfecta para estudiantes',
              precio: 1200,
              categoria: 'Tecnología',
              imagen: '/placeholder-image.jpg',
              rating: 4.8,
              reviews: 24,
              favorito: false
            },
            {
              id: 2,
              titulo: 'Libro: Algoritmos Avanzados',
              descripcion: 'Libro de texto para ingeniería',
              precio: 45,
              categoria: 'Libros',
              imagen: '/placeholder-image.jpg',
              rating: 4.5,
              reviews: 18,
              favorito: true
            },
            {
              id: 3,
              titulo: 'Mochila Deportiva Nike',
              descripcion: 'Ideal para el gimnasio y universidad',
              precio: 85,
              categoria: 'Deportes',
              imagen: '/placeholder-image.jpg',
              rating: 4.6,
              reviews: 31,
              favorito: false
            },
            {
              id: 4,
              titulo: 'Calculadora Científica HP',
              descripción: 'Para ingeniería y matemáticas',
              precio: 35,
              categoria: 'Útiles',
              imagen: '/placeholder-image.jpg',
              rating: 4.3,
              reviews: 12,
              favorito: false
            }
          ]);

          setComprasRecientes([
            {
              articulo: 'iPhone 13',
              fecha: '10 Ene 2025',
              precio: 800,
              estado: 'Entregado',
              imagen: '/placeholder-image.jpg'
            },
            {
              articulo: 'Audífonos Sony',
              fecha: '5 Ene 2025',
              precio: 120,
              estado: 'En tránsito',
              imagen: '/placeholder-image.jpg'
            },
            {
              articulo: 'Cuaderno Universitario',
              fecha: '2 Ene 2025',
              precio: 15,
              estado: 'Entregado',
              imagen: '/placeholder-image.jpg'
            }
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error cargando datos del comprador:', error);
        setLoading(false);
      }
    };

    loadCompradorData();
  }, []);

  const handleAddToCart = (articulo) => {
    console.log('Agregando al carrito:', articulo);
    // Implementar lógica del carrito
  };

  const handleToggleFavorite = (articuloId) => {
    setArticulosRecomendados(prev =>
      prev.map(art =>
        art.id === articuloId
          ? { ...art, favorito: !art.favorito }
          : art
      )
    );
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/explorar?search=${encodeURIComponent(searchTerm)}`);
    }
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
            ¡Hola, {user?.nombres_usuario}! 👋
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Descubre productos perfectos para ti
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

      {/* Barra de búsqueda */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(45deg, #f3f4f6 30%, #e5e7eb 90%)'
        }}
      >
        <Search sx={{ mr: 2, color: 'text.secondary' }} />
        <InputBase
          placeholder="¿Qué estás buscando hoy?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flexGrow: 1, fontSize: '1.1rem' }}
        />
        <Button 
          variant="contained" 
          onClick={handleSearch}
          sx={{ ml: 2 }}
        >
          Buscar
        </Button>
      </Paper>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Métricas principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <CompradorMetricCard
            title="Compras"
            value={compradorData.compras.total}
            subtitle={`${compradorData.compras.mes} este mes`}
            icon={<ShoppingCart />}
            color="primary"
            onClick={() => navigate('/historial')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CompradorMetricCard
            title="Gastado"
            value={`$${compradorData.compras.gastado}`}
            subtitle="Total acumulado"
            icon={<TrendingUp />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CompradorMetricCard
            title="Favoritos"
            value={compradorData.favoritos}
            subtitle="Artículos guardados"
            icon={<Favorite />}
            color="error"
            onClick={() => navigate('/favoritos')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CompradorMetricCard
            title="Carrito"
            value={compradorData.carrito}
            subtitle="Artículos pendientes"
            icon={<LocalOffer />}
            color="warning"
            onClick={() => navigate('/carrito')}
          />
        </Grid>
      </Grid>

      {/* Contenido principal */}
      <Grid container spacing={3}>
        {/* Artículos recomendados */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Recomendados para ti
            </Typography>
            <Button 
              variant="outlined"
              onClick={() => navigate('/explorar')}
            >
              Ver más
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {articulosRecomendados.map((articulo) => (
              <Grid item xs={12} sm={6} key={articulo.id}>
                <ArticuloCard
                  articulo={articulo}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <ComprasRecientes compras={comprasRecientes} />

          {/* Ofertas especiales */}
          <Card elevation={2} sx={{ mt: 3, background: 'linear-gradient(45deg, #ff6b6b 30%, #ff5722 90%)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="white" mb={2}>
                🔥 Ofertas Especiales
              </Typography>
              <Typography variant="body2" color="white" mb={2}>
                Descuentos de hasta 50% en tecnología y libros
              </Typography>
              <Button 
                variant="contained" 
                sx={{ bgcolor: 'white', color: 'text.primary' }}
                fullWidth
                onClick={() => navigate('/ofertas')}
              >
                Ver Ofertas
              </Button>
            </CardContent>
          </Card>

          {/* Categorías populares */}
          <Card elevation={2} sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Categorías Populares
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {['Tecnología', 'Libros', 'Útiles', 'Deportes', 'Ropa'].map((categoria) => (
                  <Chip 
                    key={categoria}
                    label={categoria}
                    variant="outlined"
                    onClick={() => navigate(`/explorar?categoria=${categoria}`)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAB para explorar */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/explorar')}
      >
        <Search />
      </Fab>
    </Box>
  );
};

export default CompradorDashboard;