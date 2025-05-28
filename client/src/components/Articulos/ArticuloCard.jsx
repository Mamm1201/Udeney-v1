import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

const ArticuloCard = ({
  titulo_articulo,
  descripcion_articulo,
  institucion_articulo,
  precio_articulo,
  id_usuario,
  id_categoria,
  imagen,
}) => {
  return (
    <Card
      sx={{
        maxWidth: 345,
        margin: 'auto', // Centrar horizontalmente
        boxShadow: 3, // Sombra para profundidad
        borderRadius: 2, // Bordes redondeados
        backgroundColor: '#f5f5f5', // Fondo claro
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.05)', // Efecto al pasar el mouse
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={imagen || ' '} // Imagen predeterminada
        alt={titulo_articulo || 'Imagen del artículo'}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" color="primary">
          {titulo_articulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Descripción: {descripcion_articulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Institución: {institucion_articulo || 'No especificada'}
        </Typography>
        <Typography variant="body1" color="text.primary" fontWeight="bold">
          Precio: ${precio_articulo}
        </Typography>
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Usuario ID: {id_usuario}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Categoría ID: {id_categoria}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArticuloCard;
