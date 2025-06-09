import React from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";

const ArticuloCard = ({
  titulo_articulo,
  descripcion_articulo,
  institucion_articulo,
  precio_articulo,
  id_usuario,
  id_categoria,
  imagen,
}) => {
  // Imagen de respaldo local (debe existir en tu directorio public/images)
  const fallbackImage = "/images/articulo-placeholder.jpg";

  return (
    <Card
      sx={{
        maxWidth: 345,
        margin: "auto",
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: 6,
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Contenedor de imagen con solución anti-parpadeo */}
      <Box
        sx={{
          position: "relative",
          height: 140,
          backgroundColor: "#e0e0e0", // Fondo gris para placeholder
        }}
      >
        <CardMedia
          component="img"
          height="140"
          image={imagen || fallbackImage} // Usa imagen o fallback
          alt={titulo_articulo || "Imagen del artículo"}
          onError={(e) => {
            // Si falla la imagen, usa el fallback y fuerza mostrar
            e.target.src = fallbackImage;
            e.target.style.opacity = 1;
          }}
          sx={{
            objectFit: "cover",
            height: 140,
            width: "100%",
            // Transición suave para cambios de imagen
            transition: "opacity 0.3s ease",
            // Mostrar al 80% de opacidad si es placeholder, 100% si es imagen real
            opacity: imagen ? 1 : 0.8,
          }}
        />

        {/* Mostrar texto "Sin imagen" solo cuando no hay imagen (incluyendo fallback) */}
        {!imagen && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none", // Permite clicks en la imagen debajo
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Sin imagen
            </Typography>
          </Box>
        )}
      </Box>

      {/* Contenido de la tarjeta (sin cambios) */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          color="primary"
          noWrap
        >
          {titulo_articulo}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: "4.5em",
          }}
        >
          {descripcion_articulo}
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1}>
          Institución: {institucion_articulo || "No especificada"}
        </Typography>

        <Typography
          variant="body1"
          color="text.primary"
          fontWeight="bold"
          mt={1}
        >
          Precio: ${precio_articulo?.toLocaleString() || "0"}
        </Typography>

        <Box mt={2} sx={{ opacity: 0.7 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            ID Usuario: {id_usuario}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ID Categoría: {id_categoria}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ArticuloCard;
