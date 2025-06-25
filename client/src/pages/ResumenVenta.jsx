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
  Paper,
} from "@mui/material";
import NavbarVender from "../components/NavbarVender";
import Pie from "../components/Pie";
import axios from "axios";

const CATEGORIAS = {
  1: "Prenda",
  2: "Útiles",
  3: "Libros",
  4: "Herramientas",
};

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
      <>
        <NavbarVender />
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <CircularProgress sx={{ color: "#468C8C" }} />
        </Box>
        <Pie />
      </>
    );
  }

  if (!articulo) {
    return (
      <>
        <NavbarVender />
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography color="error">No se encontró el artículo</Typography>
        </Box>
        <Pie />
      </>
    );
  }

  return (
    <>
      <NavbarVender />
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, p: 3, minHeight: "80vh" }}>
        {/* Agradecimiento */}
        <Box
          sx={{
            mb: 3,
            backgroundColor: "#f0fdfa",
            borderLeft: "6px solid #468C8C",
            p: 2,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="#468C8C">
            🎉 ¡Gracias por publicar tu artículo!
          </Typography>
          <Typography variant="body2">
            Este es un resumen de tu publicación. Puedes revisarla, y si deseas modificarla, accede desde <strong>Mis artículos</strong>.
          </Typography>
        </Box>

        {/* Contenido principal */}
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
                    width: "100%",
                    height: "auto",
                    borderRadius: 3,
                    boxShadow: 4,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Imagen no disponible
                </Typography>
              )}
            </Grid>

            {/* Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="#468C8C">
                {articulo.titulo_articulo}
              </Typography>

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                <strong>Institución:</strong> {articulo.institucion_articulo || "No registrada"}
              </Typography>

              <Typography variant="h5" sx={{ color: "#2e7d32", mb: 2, fontWeight: 600 }}>
                ${parseFloat(articulo.precio_articulo).toLocaleString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" sx={{ mb: 2 }}>
                {articulo.descripcion_articulo}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Categoría</Typography>
                <Chip
                  label={CATEGORIAS[articulo.id_categoria] || `ID ${articulo.id_categoria}`}
                  sx={{
                    mt: 0.5,
                    backgroundColor: "#468C8C",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: 1,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Estado</Typography>
                <Chip
                  label={articulo.disponible ? "Disponible" : "No disponible"}
                  color={articulo.disponible ? "success" : "default"}
                  sx={{ mt: 0.5, fontWeight: 500, borderRadius: 1 }}
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/mis-articulos")}
                  sx={{
                    backgroundColor: "#468C8C",
                    "&:hover": {
                      backgroundColor: "#3a7c7c",
                    },
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  Ir a mis artículos
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

export default ResumenVenta;
