/**
 * Dashboard para usuarios con rol Comprador
 * Enfocado en explorar artículos, historial de compras y recomendaciones
 * Versión con datos reales de la API
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  Alert,
  CircularProgress,
  Container,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
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
  LocalOffer,
  FilterList,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRoleAuth } from '../../hooks/useRoleAuth';
import { useCarrito } from '../../context/CarritoContext';
import axios from 'axios';

/**
 * Componente de tarjeta de métrica para comprador
 */
const CompradorMetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  onClick = null,
  loading = false,
}) => (
  <Card
    elevation={2}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease-in-out',
      height: '100%',
      '&:hover': onClick
        ? {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          }
        : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      {loading ? (
        <Box>
          <CircularProgress size={24} sx={{ mb: 2 }} />
          <Typography variant="body2">Cargando...</Typography>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
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
      )}
    </CardContent>
  </Card>
);

/**
 * Componente de tarjeta de artículo
 */
const ArticuloCard = ({
  articulo,
  onAddToCart,
  onToggleFavorite,
  onViewDetails,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageUrl = imagen => {
    if (!imagen || imageError) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBObyBEaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
    }
    if (imagen.startsWith('http')) {
      return imagen;
    }
    return `http://localhost:8000${imagen}`;
  };

  return (
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
        onError={handleImageError}
        onClick={() => onViewDetails(articulo)}
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
          onClick={() => onAddToCart(articulo)}
          size="small"
          disabled={!articulo.disponible}
        >
          {articulo.disponible ? 'Agregar' : 'Agotado'}
        </Button>
        <Box>
          <Tooltip title="Ver detalles">
            <IconButton
              onClick={() => onViewDetails(articulo)}
              color="primary"
              size="small"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              articulo.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'
            }
          >
            <IconButton
              onClick={() => onToggleFavorite(articulo.id_articulo)}
              color={articulo.favorito ? 'error' : 'default'}
              size="small"
            >
              {articulo.favorito ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

/**
 * Componente de compras recientes
 */
const ComprasRecientes = ({ compras = [], loading = false }) => (
  <Card elevation={2}>
    <CardContent>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Compras Recientes
        </Typography>
        <Button
          size="small"
          endIcon={<History />}
          href="/historial-transacciones"
        >
          Ver Historial
        </Button>
      </Box>
      {loading ? (
        <Box textAlign="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : compras.length > 0 ? (
        compras.map((compra, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <Avatar
              src={compra.imagen || 'https://via.placeholder.com/48'}
              sx={{ width: 48, height: 48, mr: 2 }}
            />
            <Box flexGrow={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                Transacción #{compra.id_transaccion}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(compra.fecha_transaccion).toLocaleDateString('es-ES')}{' '}
                - ${compra.valor || 'N/A'}
              </Typography>
            </Box>
            <Chip
              label="Completado"
              size="small"
              color="success"
              variant="outlined"
            />
          </Box>
        ))
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={2}
        >
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
  const { carrito, agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);

  const [compradorData, setCompradorData] = useState({
    compras: {
      total: 0,
      mes: 0,
      gastado: 0,
    },
    favoritos: 0,
    carrito: 0,
  });

  const [articulosRecomendados, setArticulosRecomendados] = useState([]);
  const [comprasRecientes, setComprasRecientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // Funciones auxiliares para carrito y favoritos
  const getFavoritos = () => {
    try {
      const favoritos = localStorage.getItem(`favoritos_${user?.id_usuario}`);
      return favoritos ? JSON.parse(favoritos) : [];
    } catch {
      return [];
    }
  };

  // Usar carrito del contexto en lugar de localStorage directo

  const updateMetricsFromLocalStorage = () => {
    const favoritos = getFavoritos();

    setCompradorData(prev => ({
      ...prev,
      favoritos: favoritos.length,
      carrito: carrito.length,
    }));
  };

  // Función para cargar artículos con filtros
  const loadArticulos = useCallback(async (search = '', categoria = '') => {
    try {
      const token = localStorage.getItem('access_token');
      let url = 'http://localhost:8000/api/v1/articulos/';

      const params = new URLSearchParams();
      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (categoria) {
        params.append('id_categoria__nombre_categoria', categoria);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.slice(0, 8); // Limitar a 8 artículos para el dashboard
    } catch (err) {
      console.error('Error cargando artículos:', err);
      return [];
    }
  }, []);

  // Cargar datos del comprador
  const loadCompradorData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Cargar datos en paralelo
      const [articulosRes, transaccionesRes, categoriasRes] = await Promise.all(
        [
          loadArticulos(),
          axios
            .get('http://localhost:8000/api/v1/transacciones/', config)
            .catch(() => ({ data: [] })),
          axios
            .get('http://localhost:8000/api/v1/categorias/', config)
            .catch(() => ({ data: [] })),
        ]
      );

      // Procesar transacciones del usuario (ya filtradas por el backend)
      const userTransactions = transaccionesRes.data || [];

      const now = new Date();
      const transaccionesEsteMes = userTransactions.filter(t => {
        const transDate = new Date(t.fecha_transaccion);
        return (
          transDate.getMonth() === now.getMonth() &&
          transDate.getFullYear() === now.getFullYear()
        );
      });

      // Calcular total gastado basado en artículos comprados
      // Para ahora, simularemos el cálculo hasta implementar la lógica completa
      const totalGastado = userTransactions.length * 25000; // Promedio estimado por transacción

      setCompradorData({
        compras: {
          total: userTransactions.length,
          mes: transaccionesEsteMes.length,
          gastado: totalGastado,
        },
        favoritos: getFavoritos().length,
        carrito: carrito.length,
      });

      // Marcar artículos favoritos
      const favoritos = getFavoritos();
      const articulosConFavoritos = articulosRes.map(articulo => ({
        ...articulo,
        favorito: favoritos.includes(articulo.id_articulo)
      }));

      setArticulosRecomendados(articulosConFavoritos);
      setComprasRecientes(userTransactions.slice(0, 5));
      setCategorias(categoriasRes.data);
      setError(null);
    } catch (error) {
      console.error('Error cargando datos del comprador:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [user, loadArticulos]);

  useEffect(() => {
    if (user) {
      loadCompradorData();
    }
  }, [user, loadCompradorData]);

  // Sincronizar métricas cuando el carrito cambie
  useEffect(() => {
    updateMetricsFromLocalStorage();
  }, [carrito, getFavoritos]);

  const handleAddToCart = articulo => {
    try {
      const articuloExiste = carrito.find(item => item.id_articulo === articulo.id_articulo);

      if (articuloExiste) {
        alert('Este artículo ya está en tu carrito');
        return;
      }

      agregarAlCarrito(articulo);
      alert(`"${articulo.titulo_articulo}" agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito');
    }
  };

  const handleToggleFavorite = articuloId => {
    try {
      const favoritos = getFavoritos();
      const esFavorito = favoritos.includes(articuloId);

      let nuevosFavoritos;
      if (esFavorito) {
        nuevosFavoritos = favoritos.filter(id => id !== articuloId);
      } else {
        nuevosFavoritos = [...favoritos, articuloId];
      }

      localStorage.setItem(`favoritos_${user?.id_usuario}`, JSON.stringify(nuevosFavoritos));
      updateMetricsFromLocalStorage();

      // Actualizar la UI
      setArticulosRecomendados(prev =>
        prev.map(art =>
          art.id_articulo === articuloId
            ? { ...art, favorito: !esFavorito }
            : art
        )
      );
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
    }
  };

  const handleViewDetails = articulo => {
    setSelectedArticulo(articulo);
    setOpenDialog(true);
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      setCategoriaSeleccionada(''); // Limpiar filtro de categoría
      const results = await loadArticulos(searchTerm);

      // Marcar favoritos
      const favoritos = getFavoritos();
      const articulosConFavoritos = results.map(articulo => ({
        ...articulo,
        favorito: favoritos.includes(articulo.id_articulo)
      }));

      setArticulosRecomendados(articulosConFavoritos);
      setLoading(false);
    }
  };

  const handleCategoryFilter = async categoria => {
    setLoading(true);
    setCategoriaSeleccionada(categoria);
    setSearchTerm(''); // Limpiar búsqueda cuando se selecciona categoría
    const results = await loadArticulos('', categoria);

    // Marcar favoritos
    const favoritos = getFavoritos();
    const articulosConFavoritos = results.map(articulo => ({
      ...articulo,
      favorito: favoritos.includes(articulo.id_articulo)
    }));

    setArticulosRecomendados(articulosConFavoritos);
    setLoading(false);
  };

  const refreshData = () => {
    loadCompradorData();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Barra de búsqueda mejorada */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" mb={2} color="white">
          ¿Qué estás buscando hoy?
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Search sx={{ color: 'white' }} />
          <TextField
            placeholder="Buscar por nombre, categoría o descripción... ej: pantalón, tecnología"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            variant="outlined"
            size="small"
            sx={{
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            Buscar
          </Button>
        </Box>
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
            onClick={() => navigate('/historial-transacciones')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CompradorMetricCard
            title="Gastado"
            value={`$${compradorData.compras.gastado.toLocaleString()}`}
            subtitle="Total acumulado"
            icon={<TrendingUp />}
            color="secondary"
            onClick={() => navigate('/historial-transacciones')}
            loading={loading}
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
            loading={loading}
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
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Contenido principal */}
      <Grid container spacing={3}>
        {/* Artículos */}
        <Grid item xs={12} md={8}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h5" fontWeight="bold">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : 'Artículos Destacados'}
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/articulos')}>
              Ver todos
            </Button>
          </Box>

          {articulosRecomendados.length > 0 ? (
            <Grid container spacing={2}>
              {articulosRecomendados.map(articulo => (
                <Grid item xs={12} sm={6} md={6} key={articulo.id_articulo}>
                  <ArticuloCard
                    articulo={articulo}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={handleViewDetails}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm
                  ? 'No se encontraron artículos'
                  : 'No hay artículos disponibles'}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchTerm('');
                  loadCompradorData();
                }}
              >
                Ver todos los artículos
              </Button>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <ComprasRecientes compras={comprasRecientes} loading={loading} />

          {/* Categorías */}
          <Card elevation={2} sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Filtrar por Categoría
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip
                  label="Todas"
                  variant={categoriaSeleccionada === '' ? 'filled' : 'outlined'}
                  color={categoriaSeleccionada === '' ? 'primary' : 'default'}
                  onClick={() => {
                    setSearchTerm('');
                    setCategoriaSeleccionada('');
                    loadCompradorData();
                  }}
                  sx={{ cursor: 'pointer' }}
                />
                {categorias.map(categoria => (
                  <Chip
                    key={categoria.id_categoria}
                    label={categoria.nombre_categoria}
                    variant={categoriaSeleccionada === categoria.nombre_categoria ? 'filled' : 'outlined'}
                    color={categoriaSeleccionada === categoria.nombre_categoria ? 'primary' : 'default'}
                    onClick={() =>
                      handleCategoryFilter(categoria.nombre_categoria)
                    }
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card
            elevation={2}
            sx={{
              mt: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="white" mb={2}>
                💡 Consejos de Búsqueda
              </Typography>
              <Typography variant="body2" color="white" mb={1}>
                • Usa términos específicos como "pantalón jean"
              </Typography>
              <Typography variant="body2" color="white" mb={1}>
                • Filtra por categoría para mejores resultados
              </Typography>
              <Typography variant="body2" color="white">
                • Explora todas las categorías disponibles
              </Typography>
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
        onClick={() => navigate('/articulos')}
      >
        <Search />
      </Fab>

      {/* Dialog de detalles del artículo */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Detalles del Artículo
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedArticulo && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <img
                  src={
                    getImageUrl(selectedArticulo.imagen) ||
                    'https://via.placeholder.com/400x300'
                  }
                  alt={selectedArticulo.titulo_articulo}
                  style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedArticulo.titulo_articulo}
                </Typography>
                <Typography
                  variant="h4"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  ${selectedArticulo.precio_articulo?.toLocaleString()}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedArticulo.descripcion_articulo}
                </Typography>
                <Chip
                  label={
                    selectedArticulo.id_categoria?.nombre_categoria ||
                    'Sin categoría'
                  }
                  color="primary"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Rating value={4.5} readOnly size="small" />
                  <Typography variant="body2">(4.5 estrellas)</Typography>
                </Box>
                <Typography
                  variant="body2"
                  color={
                    selectedArticulo.disponible ? 'success.main' : 'error.main'
                  }
                  fontWeight="bold"
                >
                  {selectedArticulo.disponible ? '✅ Disponible' : '❌ Agotado'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedArticulo) {
                handleAddToCart(selectedArticulo);
              }
              setOpenDialog(false);
            }}
            disabled={!selectedArticulo?.disponible}
          >
            Agregar al Carrito
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompradorDashboard;
