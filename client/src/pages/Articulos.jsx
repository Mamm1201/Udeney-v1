import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Container,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Fab,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Clear,
  Visibility,
  FilterList,
  AttachMoney,
  Category,
  ShoppingBag,
} from '@mui/icons-material';

import { getAllArticulos, getCategorias } from '../api/articulos.api';
import { useCarrito } from '../context/CarritoContext';
import Navbar from '../components/Navbar';

const Articulos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();

  const [articulos, setArticulos] = useState([]);
  const [articulosOriginales, setArticulosOriginales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { agregarAlCarrito, carrito } = useCarrito();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [categoriasRes, articulosRes] = await Promise.all([
          getCategorias(),
          getAllArticulos(),
        ]);

        setCategorias(categoriasRes.data || []);
        setArticulos(articulosRes.data || []);
        setArticulosOriginales(articulosRes.data || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setSnackbar({
          open: true,
          message:
            'Error al cargar los artículos. Por favor, intenta de nuevo.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Procesar parámetros URL para filtrado inicial
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoriaNombre = searchParams.get('id_categoria__nombre_categoria');

    if (categoriaNombre && categorias.length > 0) {
      // Buscar la categoría por nombre y obtener su ID
      const categoriaEncontrada = categorias.find(
        cat => cat.nombre_categoria === categoriaNombre
      );

      if (categoriaEncontrada) {
        setCategoriaSeleccionada(categoriaEncontrada.id_categoria.toString());
      }
    }
  }, [location.search, categorias]);

  // Filtrar artículos por categoría y búsqueda
  useEffect(() => {
    let articulosFiltrados = [...articulosOriginales];

    // Filtrar por categoría
    if (categoriaSeleccionada) {
      articulosFiltrados = articulosFiltrados.filter(articulo => {
        // Intentar ambas estructuras posibles
        const categoriaId =
          articulo.id_categoria?.id_categoria || articulo.id_categoria;
        return categoriaId === parseInt(categoriaSeleccionada);
      });
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      articulosFiltrados = articulosFiltrados.filter(
        articulo =>
          articulo.titulo_articulo
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          articulo.descripcion_articulo
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          articulo.id_categoria?.nombre_categoria
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setArticulos(articulosFiltrados);
  }, [categoriaSeleccionada, searchTerm, articulosOriginales]);

  const handleAgregar = articulo => {
    try {
      // Verificar si el artículo ya está en el carrito
      const yaEnCarrito = carrito.some(
        item => item.id_articulo === articulo.id_articulo
      );

      if (yaEnCarrito) {
        setSnackbar({
          open: true,
          message: '⚠️ Este artículo ya está en tu carrito',
          type: 'warning',
        });
        return;
      }

      if (!articulo.disponible) {
        setSnackbar({
          open: true,
          message: '❌ Este artículo no está disponible actualmente',
          type: 'error',
        });
        return;
      }

      agregarAlCarrito(articulo);
      setSnackbar({
        open: true,
        message: '✅ ¡Artículo agregado al carrito exitosamente!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      setSnackbar({
        open: true,
        message: 'Error al agregar el artículo. Intenta de nuevo.',
        type: 'error',
      });
    }
  };

  const handleVerDetalle = articulo => {
    setSelectedArticle(articulo);
    setDialogOpen(true);
  };

  const limpiarFiltros = () => {
    setCategoriaSeleccionada('');
    setSearchTerm('');
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
        >
          <CircularProgress size={60} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Cargando artículos...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Navbar />
      {/* Header mejorado */}
      <Box textAlign="center" mb={4}>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          fontWeight="bold"
          gutterBottom
          sx={{
            color: 'primary.main',
            mb: 2,
          }}
        >
          🛍️ Encuentra lo que necesitas
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: '600px', mx: 'auto' }}
        >
          Artículos de segunda mano de calidad para toda la familia
        </Typography>
      </Box>

      {/* Barra de búsqueda prominente */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, descripción o categoría... (ej: 'uniforme', 'libros')"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                fullWidth={isMobile}
              >
                Filtros
              </Button>
              {(categoriaSeleccionada || searchTerm) && (
                <Button
                  variant="text"
                  startIcon={<Clear />}
                  onClick={limpiarFiltros}
                  color="error"
                  fullWidth={isMobile}
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Panel de filtros colapsable */}
      {showFilters && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtrar por categoría
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Selecciona una categoría</InputLabel>
                <Select
                  value={categoriaSeleccionada}
                  label="Selecciona una categoría"
                  onChange={e => setCategoriaSeleccionada(e.target.value)}
                >
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {categorias.map(categoria => (
                    <MenuItem
                      key={categoria.id_categoria}
                      value={categoria.id_categoria}
                    >
                      {categoria.nombre_categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Categorías populares:
                </Typography>
                {categorias.slice(0, 3).map(categoria => (
                  <Chip
                    key={categoria.id_categoria}
                    label={categoria.nombre_categoria}
                    variant="outlined"
                    size="small"
                    clickable
                    onClick={() =>
                      setCategoriaSeleccionada(
                        categoria.id_categoria.toString()
                      )
                    }
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Información de resultados */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="body1" color="text.secondary">
          {articulos.length === 0
            ? 'No se encontraron artículos'
            : `${articulos.length} artículo${articulos.length !== 1 ? 's' : ''} encontrado${articulos.length !== 1 ? 's' : ''}`}
          {(categoriaSeleccionada || searchTerm) &&
            ' con los filtros aplicados'}
        </Typography>

        {carrito.length > 0 && (
          <Chip
            icon={<ShoppingBag />}
            label={`${carrito.length} en carrito`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Grid de artículos mejorado */}
      {articulos.length > 0 ? (
        <Grid container spacing={3}>
          {articulos.map(articulo => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={articulo.id_articulo}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                {/* Badge de disponibilidad */}
                {!articulo.disponible && (
                  <Chip
                    label="No disponible"
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  />
                )}

                <CardMedia
                  component="img"
                  height="200"
                  image={articulo.imagen || '/placeholder.jpg'}
                  alt={articulo.titulo_articulo}
                  sx={{
                    cursor: 'pointer',
                    filter: !articulo.disponible ? 'grayscale(100%)' : 'none',
                  }}
                  onClick={() => handleVerDetalle(articulo)}
                />

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight="600"
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.primary',
                    }}
                  >
                    {articulo.titulo_articulo}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {articulo.descripcion_articulo}
                  </Typography>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: 'success.main' }}
                    >
                      {formatPrice(articulo.precio_articulo)}
                    </Typography>

                    {articulo.id_categoria && (
                      <Chip
                        label={articulo.id_categoria.nombre_categoria}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box display="flex" gap={1}>
                    <Tooltip title="Ver detalles del artículo">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleVerDetalle(articulo)}
                        sx={{ flex: 1 }}
                      >
                        Ver
                      </Button>
                    </Tooltip>

                    <Tooltip
                      title={
                        !articulo.disponible
                          ? 'Artículo no disponible'
                          : 'Agregar al carrito'
                      }
                    >
                      <span style={{ flex: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAgregar(articulo)}
                          disabled={!articulo.disponible}
                          fullWidth
                          sx={{
                            backgroundColor: articulo.disponible
                              ? 'primary.main'
                              : 'grey.400',
                            '&:hover': {
                              backgroundColor: articulo.disponible
                                ? 'primary.dark'
                                : 'grey.400',
                            },
                          }}
                        >
                          {isMobile ? '+' : 'Agregar'}
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            😔 No encontramos artículos
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {searchTerm || categoriaSeleccionada
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'No hay artículos disponibles en este momento'}
          </Typography>
          {(searchTerm || categoriaSeleccionada) && (
            <Button
              variant="contained"
              onClick={limpiarFiltros}
              startIcon={<Clear />}
            >
              Limpiar filtros
            </Button>
          )}
        </Paper>
      )}

      {/* Botón flotante del carrito */}
      {carrito.length > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          component={Link}
          to="/carrito"
        >
          <Badge badgeContent={carrito.length} color="error">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}

      {/* Dialog de detalles del artículo */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedArticle && (
          <>
            <DialogTitle>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5" fontWeight="bold">
                  {selectedArticle.titulo_articulo}
                </Typography>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <Clear />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedArticle.imagen || '/placeholder.jpg'}
                    alt={selectedArticle.titulo_articulo}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 8,
                      maxHeight: 400,
                      objectFit: 'cover',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h4"
                    color="success.main"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {formatPrice(selectedArticle.precio_articulo)}
                  </Typography>

                  <Typography variant="body1" paragraph>
                    {selectedArticle.descripcion_articulo}
                  </Typography>

                  {selectedArticle.id_categoria && (
                    <Chip
                      label={selectedArticle.id_categoria.nombre_categoria}
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Typography
                    variant="body2"
                    color={
                      selectedArticle.disponible ? 'success.main' : 'error.main'
                    }
                    fontWeight="bold"
                  >
                    {selectedArticle.disponible
                      ? '✅ Disponible'
                      : '❌ No disponible'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={() => {
                  handleAgregar(selectedArticle);
                  setDialogOpen(false);
                }}
                disabled={!selectedArticle.disponible}
              >
                Agregar al carrito
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar mejorado */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.type} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Articulos;
