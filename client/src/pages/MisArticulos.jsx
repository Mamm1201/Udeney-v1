// ✅ Importación de React y hooks necesarios
import { useEffect, useState, useCallback } from "react"; // 👉 Agregué useCallback para poder controlar la dependencia en useEffect

// ✅ Componentes MUI
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
  CircularProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import api from "../api/axiosConfig";

const MisArticulos = () => {
  const navigate = useNavigate();
  const [articulos, setArticulos] = useState([]); // Estado para guardar mis artículos
  const [loading, setLoading] = useState(true);   // Estado para mostrar el loading
  const [snackbar, setSnackbar] = useState({ open: false, message: "" }); // Estado para mostrar alertas
  const id_usuario = localStorage.getItem("id_usuario"); // Tomo mi id del localStorage

  // 🛠 Función para traer artículos (ahora uso useCallback para evitar advertencias en useEffect)
  const fetchArticulos = useCallback(async () => {
    try {
      const res = await api.get(`/articulos/`);
      // Solo dejo mis artículos, comparando con el ID que tengo guardado
      const filtrados = res.data.filter(
        (art) => parseInt(art.id_usuario) === parseInt(id_usuario)
      );
      setArticulos(filtrados);
    } catch (error) {
      console.error("Error al obtener artículos:", error);
    } finally {
      setLoading(false); // Ya terminó de cargar
    }
  }, [id_usuario]); // 👈 Esto evita que useEffect lance advertencias y mantiene el comportamiento deseado

  // 🔁 Al montar el componente llamo a la función para cargar artículos
  useEffect(() => {
    fetchArticulos();
  }, [fetchArticulos]); // 👈 Ya no hay advertencias porque se incluye correctamente

  // 🔄 Mientras carga, muestro un spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: "#B6540D" }} />
      </Box>
    );
  }

  return (
    <>
      {/* Navbar fija arriba */}
      <Box position="fixed" top={0} left={0} right={0} zIndex={10}>
        <Navbar />
      </Box>

      {/* Fondo general de la sección */}
      <Box pt={10} sx={{ backgroundColor: "#291010", minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={700}
            gutterBottom
            sx={{ color: "#6EF55F", fontFamily: "Poppins, sans-serif" }}
          >
            Estos son tus artículos publicados
          </Typography>

          {/* Si tengo artículos, los muestro en tarjetas */}
          {articulos.length > 0 ? (
            <Grid container spacing={4}>
              {articulos.map((articulo) => (
                <Grid item xs={12} sm={6} md={4} key={articulo.id_articulo}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: 4,
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* Imagen del artículo */}
                    <CardMedia
                      component="img"
                      height="180"
                      image={articulo.imagen || "/img/placeholder.jpg"}
                      alt={articulo.titulo_articulo}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Título */}
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ color: "#333" }}
                      >
                        {articulo.titulo_articulo}
                      </Typography>

                      {/* Precio formateado en pesos colombianos */}
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        mt={2}
                        sx={{ color: "#45858C" }}
                      >
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(articulo.precio_articulo)}
                      </Typography>

                      {/* Botones: Editar y Eliminar */}
                      <Box mt={2} display="flex" gap={1}>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            backgroundColor: "#45858C",
                            color: "#fff",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#366e72" },
                          }}
                          onClick={() =>
                            navigate(`/editar-articulo/${articulo.id_articulo}`)
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          color="error"
                          sx={{ fontWeight: "bold" }}
                          onClick={async () => {
                            try {
                              // Elimino el artículo en la API
                              await api.delete(
                                `/articulos/${articulo.id_articulo}/`
                              );
                              // Quito el artículo del estado
                              setArticulos((prev) =>
                                prev.filter(
                                  (a) =>
                                    a.id_articulo !== articulo.id_articulo
                                )
                              );
                              // Muestro confirmación
                              setSnackbar({
                                open: true,
                                message: "✅ Artículo eliminado exitosamente",
                              });
                            } catch (err) {
                              // Si falla, muestro error
                              setSnackbar({
                                open: true,
                                message: "❌ Error al eliminar el artículo",
                              });
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
            >
              No has subido ningún artículo aún.
            </Typography>
          )}
        </Container>
      </Box>

      {/* Pie de página */}
      <Pie />

      {/* Mensaje de éxito/error al eliminar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ open: false, message: "" })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MisArticulos;
