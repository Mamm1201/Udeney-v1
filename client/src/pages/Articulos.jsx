// src/pages/Articulos.jsx

import { useEffect, useState } from "react";
import { getAllArticulos } from "../api/articulos.api";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCarrito } from "../context/CarritoContext";
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
  Divider,
} from "@mui/material";

// ✅ Diccionario para traducir el ID de categoría a su nombre
const CATEGORIAS = {
  1: "Útiles",
  2: "Libros",
  3: "Prendas",
  4: "Herramientas",
};

const Articulos = () => {
  const [articulos, setArticulos] = useState([]); // Todos los artículos
  const [filtroCategoria, setFiltroCategoria] = useState(null); // ID de categoría a filtrar
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const { agregarAlCarrito } = useCarrito(); // Contexto del carrito

  // 🔄 Obtener artículos desde el backend al cargar el componente
  useEffect(() => {
    getAllArticulos()
      .then((response) => setArticulos(response.data))
      .catch((error) => console.error(error));
  }, []);

  // 🛒 Añadir artículo al carrito y mostrar mensaje
  const handleAgregar = (articulo) => {
    agregarAlCarrito(articulo);
    setSnackbar({ open: true, message: "✅ Artículo agregado al carrito" });
  };

  // 🔍 Filtrar artículos por categoría seleccionada
  const articulosFiltrados = filtroCategoria
    ? articulos.filter((art) => art.id_categoria === filtroCategoria)
    : articulos;

  return (
    <>
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "row",
          gap: 3,
          marginTop: "24px",
        }}
      >
        {/* 🔲 Menú lateral de categorías */}
        <Box
          sx={{
            width: "220px",
            backgroundColor: "#ffffff",
            padding: 2,
            boxShadow: 2,
            borderRadius: 2,
            height: "fit-content",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Filtrar por Categoría
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {/* Botón para mostrar todos */}
          <Button
            variant={!filtroCategoria ? "contained" : "outlined"}
            fullWidth
            onClick={() => setFiltroCategoria(null)}
            sx={{ mb: 1 }}
          >
            Todos
          </Button>

          {/* Botones por categoría */}
          {Object.entries(CATEGORIAS).map(([id, nombre]) => (
            <Button
              key={id}
              variant={
                filtroCategoria === parseInt(id) ? "contained" : "outlined"
              }
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => setFiltroCategoria(parseInt(id))}
            >
              {nombre}
            </Button>
          ))}
        </Box>

        {/* 📦 Listado de artículos */}
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#1976d2", textAlign: "center" }}
          >
            LISTA DE ARTÍCULOS
          </Typography>

          <Grid container spacing={3}>
            {articulosFiltrados.length > 0 ? (
              articulosFiltrados.map((articulo) => (
                <Grid item xs={12} sm={6} md={4} key={articulo.id_articulo}>
                  <Card
                    sx={{
                      height: "100%",
                      boxShadow: 3,
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={
                        articulo.imagen || "https://via.placeholder.com/300x180"
                      }
                      alt={articulo.titulo_articulo}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {articulo.titulo_articulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {articulo.descripcion_articulo}
                      </Typography>

                      {/* 🏫 Mostrar institución si está disponible */}
                      {articulo.institucion_articulo && (
                        <Typography variant="body2" color="text.secondary">
                          • Institución: {articulo.institucion_articulo}
                        </Typography>
                      )}

                      {/* 🗂️ Mostrar nombre de la categoría */}
                      <Typography variant="body2" color="text.secondary">
                        • Categoría:{" "}
                        {CATEGORIAS[articulo.id_categoria] || "Sin categoría"}
                      </Typography>

                      {/* 💲 Precio */}
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary"
                        mt={1}
                      >
                        ${articulo.precio_articulo}
                      </Typography>

                      {/* 🧾 Botones de acción */}
                      <Box mt={2} display="flex" flexDirection="column" gap={1}>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#00bcd4", // color turquesa educativo
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: "#0097a7", // un poco más oscuro al hacer hover
                            },
                          }}
                          component={Link}
                          to={`/articulos/${articulo.id_articulo}`}
                          fullWidth
                        >
                          Ver Detalles
                        </Button>

                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() => handleAgregar(articulo)}
                          fullWidth
                          startIcon={<ShoppingCartIcon />}
                        >
                          Añadir
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography
                variant="body1"
                color="textSecondary"
                textAlign="center"
              >
                No hay artículos disponibles en esta categoría.
              </Typography>
            )}
          </Grid>
        </Box>
      </Container>

      <Pie />

      {/* ✅ Snackbar de confirmación */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: "" })}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Articulos;
