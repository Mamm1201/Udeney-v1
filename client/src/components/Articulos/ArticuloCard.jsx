// =====================================
// IMPORTACIONES NECESARIAS
// =====================================

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CategoryIcon from "@mui/icons-material/Category";
import SchoolIcon from "@mui/icons-material/School";

import categoriasMap from "../../utils/categoriaUtils";

// =====================================
// COMPONENTE ESTILIZADO: ExpandMore con ref
// =====================================
// Este componente corrige el warning de MUI usando forwardRef
const ExpandMore = styled(
  React.forwardRef((props, ref) => {
    const { expand, ...other } = props;
    return <IconButton ref={ref} {...other} />;
  })
)(({ theme, expand }) => ({
  marginLeft: "auto",
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

// =====================================
// COMPONENTE PRINCIPAL
// =====================================

const ArticuloCard = ({
  titulo_articulo,
  descripcion_articulo,
  institucion_articulo,
  precio_articulo,
  id_usuario,
  id_categoria,
  imagen,
  mostrarBotonCarrito = false,
  onAgregarAlCarrito = () => {},
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const fallbackImage = "/images/articulo-placeholder.jpg";
  const imagenValida =
    imagen && typeof imagen === "string" && imagen.trim() !== ""
      ? imagen
      : fallbackImage;
  const isFallback = imagenValida === fallbackImage;

  const nombreCategoria = categoriasMap[id_categoria] || "Sin categoría";

  return (
    <Card
      sx={{
        maxWidth: 345,
        margin: "auto",
        boxShadow: 4,
        borderRadius: 4,
        backgroundColor: "#ffffff",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 8,
        },
        fontFamily: "Poppins, Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ===================================== */}
      {/* IMAGEN DEL ARTÍCULO */}
      {/* ===================================== */}
      <Box
        sx={{ position: "relative", height: 200, backgroundColor: "#f0f0f0" }}
      >
        <CardMedia
          component="img"
          image={imagenValida}
          alt={!isFallback ? titulo_articulo : ""}
          onError={(e) => {
            e.target.src = fallbackImage;
            e.target.style.opacity = 0.8;
          }}
          sx={{
            objectFit: "cover",
            height: "100%",
            width: "100%",
            opacity: isFallback ? 0.8 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        {isFallback && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <Typography variant="body2" color="white">
              Sin imagen
            </Typography>
          </Box>
        )}
      </Box>

      {/* ===================================== */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ===================================== */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" noWrap>
          {titulo_articulo}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {descripcion_articulo}
        </Typography>

        <Typography variant="h6" color="success.main" fontWeight="bold" mt={2}>
          Precio:{" "}
          {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(precio_articulo || 0)}
        </Typography>

        {/* ===================================== */}
        {/* BOTÓN AGREGAR AL CARRITO */}
        {/* ===================================== */}
        {mostrarBotonCarrito && (
          <Tooltip title="Añadir al carrito" arrow>
            <IconButton
              onClick={onAgregarAlCarrito}
              sx={{
                mt: 2,
                backgroundColor: "#5C858C",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#A98B71",
                },
                alignSelf: "center",
                borderRadius: 2,
                boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              }}
            >
              <ShoppingCartIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardContent>

      {/* ===================================== */}
      {/* BOTÓN EXPANDIR */}
      {/* ===================================== */}
      <Box sx={{ px: 2, pb: 1, textAlign: "right" }}>
        <Tooltip title={expanded ? "Ocultar detalles" : "Ver más"}>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="mostrar más"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Tooltip>
      </Box>

      {/* ===================================== */}
      {/* CONTENIDO EXPANDIDO */}
      {/* ===================================== */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-line", mb: 2 }}
          >
            {descripcion_articulo}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <SchoolIcon fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              {institucion_articulo || "No especificada"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CategoryIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ color: "eco.main" }}>
              {nombreCategoria}
            </Typography>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default ArticuloCard;
