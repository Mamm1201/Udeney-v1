import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Grid,
  Chip,
} from "@mui/material";
import axios from "axios";

const ResumenVenta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/articulos/${id}/`);
        setArticulo(res.data);
      } catch (error) {
        console.error("Error al obtener el artículo", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticulo();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!articulo) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error">No se encontró el artículo</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: 2 }}>
      <Grid container spacing={4}>
        {/* Imagen del artículo */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={`http://localhost:8000/media/${articulo.imagen}`}
            alt={articulo.titulo_articulo}
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
        </Grid>

        {/* Detalles del artículo */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {articulo.titulo_articulo}
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Otras marcas
          </Typography>

          <Typography variant="h5" sx={{ color: "green", mb: 2 }}>
            ${articulo.precio_articulo?.toLocaleString()}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" sx={{ mb: 2 }}>
            {articulo.descripcion_articulo}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Talla</Typography>
            <Chip label="Única" />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Categoría</Typography>
            <Chip label={articulo.nombre_categoria || `ID ${articulo.id_categoria}`} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Estado</Typography>
            <Chip label="En perfecto estado" />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Color</Typography>
            <Chip label="Blanco" />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Publicado el:{" "}
            {articulo.fecha_creacion
              ? new Date(articulo.fecha_creacion).toLocaleDateString()
              : "Fecha no disponible"}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/mis-articulos")}
            >
              Ver todos mis artículos
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResumenVenta;
