import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
  IconButton,
} from '@mui/material';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import SchoolIcon from '@mui/icons-material/School';

import categoriasMap from '../../utils/categoriaUtils';

const ArticuloCard = ({
  titulo_articulo,
  descripcion_articulo,
  institucion_articulo,
  precio_articulo,
  id_categoria,
  imagen,
  mostrarBotonCarrito = false,
  onAgregarAlCarrito = () => {},
}) => {
  const fallbackImage = '/images/articulo-placeholder.jpg';
  const imagenValida =
    imagen && typeof imagen === 'string' && imagen.trim() !== ''
      ? imagen
      : fallbackImage;

  const nombreCategoria = categoriasMap[id_categoria] || 'Sin categoría';

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        boxShadow: 4,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#fff',
        maxWidth: 900,
        margin: 'auto',
      }}
    >
      <CardMedia
        component="img"
        image={imagenValida}
        alt={titulo_articulo}
        onError={e => {
          e.target.src = fallbackImage;
          e.target.style.opacity = 0.8;
        }}
        sx={{
          width: { xs: '100%', md: 300 },
          height: 'auto',
          objectFit: 'cover',
        }}
      />

      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {titulo_articulo}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {descripcion_articulo}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <SchoolIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {institucion_articulo || 'No especificada'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <CategoryIcon fontSize="small" color="action" />
          <Typography variant="body2">{nombreCategoria}</Typography>
        </Box>

        <Typography variant="h6" color="success.main" fontWeight="bold" mt={2}>
          Precio:{' '}
          {new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(precio_articulo || 0)}
        </Typography>

        {mostrarBotonCarrito && (
          <Tooltip title="Añadir al carrito">
            <IconButton
              onClick={onAgregarAlCarrito}
              sx={{
                mt: 2,
                backgroundColor: '#5C858C',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#A98B71',
                },
              }}
            >
              <ShoppingCartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};

ArticuloCard.propTypes = {
  titulo_articulo: PropTypes.string.isRequired,
  descripcion_articulo: PropTypes.string.isRequired,
  institucion_articulo: PropTypes.string,
  precio_articulo: PropTypes.number,
  id_categoria: PropTypes.number,
  imagen: PropTypes.string,
  mostrarBotonCarrito: PropTypes.bool,
  onAgregarAlCarrito: PropTypes.func,
};

export default ArticuloCard;
