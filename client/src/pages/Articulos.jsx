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
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");

  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        const response = await getAllArticulos();
        setArticulos(response.data);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setSnackbar({ open: true, message: "Error al cargar artículos" });
      } finally {
        setLoading(false);
      }
    };

    fetchArticulos();
  }, []);

  const handleAgregar = (articulo) => {
    agregarAlCarrito(articulo);
    setSnackbar({ open: true, message: "✅ Artículo agregado al carrito" });
  };

  // Filtro por categoría
  const normalizar = (texto) =>
    texto
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const articulosFiltrados =
    categoriaSeleccionada === "todos"
      ? articulos
      : articulos.filter((articulo) => {
          const categoria = normalizar(articulo.nombre_categoria);
          return categoria === categoriaSeleccionada;
        });

  const fallbackImage = "/images/placeholder-articulo.jpg";

  return (
    <>
      <Navbar />
      <Container
        maxWidth="md"
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          marginTop: "24px",
          marginBottom: "24px",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            textAlign: "center",
            mb: 4,
          }}
        >
          LISTA DE ARTÍCULOS
        </Typography>

        {/* Botones para seleccionar categoría */}
        <ToggleButtonGroup
          value={categoriaSeleccionada}
          exclusive
          onChange={(e, nueva) => nueva && setCategoriaSeleccionada(nueva)}
          sx={{ mb: 4, flexWrap: "wrap", justifyContent: "center" }}
        >
          <ToggleButton value="todos">Todos</ToggleButton>
          <ToggleButton value="utiles">Útiles</ToggleButton>
          <ToggleButton value="herramientas">Herramientas</ToggleButton>
          <ToggleButton value="tecnologias">Tecnologías</ToggleButton>
          <ToggleButton value="prendas">Prendas</ToggleButton>
          <ToggleButton value="libros">Libros</ToggleButton>
        </ToggleButtonGroup>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              backgroundColor: "white",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
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
                        image={articulo.imagen || fallbackImage}
                        alt={articulo.titulo_articulo}
                        onError={(e) => {
                          e.target.src = fallbackImage;
                        }}
                        sx={{
                          objectFit: "cover",
                          backgroundColor: "#f0f0f0",
                        }}
                      />
                      <CardContent>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          noWrap
                          title={articulo.titulo_articulo}
                        >
                          {articulo.titulo_articulo}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          title={articulo.descripcion_articulo}
                        >
                          {articulo.descripcion_articulo}
                        </Typography>
                        {articulo.institucion_articulo && (
                          <Typography variant="body2" color="text.secondary">
                            • Institución: {articulo.institucion_articulo}
                          </Typography>
                        )}
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="primary"
                          mt={1}
                        >
                          ${articulo.precio_articulo.toLocaleString()}
                        </Typography>

                        <Box
                          mt={2}
                          display="flex"
                          flexDirection="column"
                          gap={1}
                        >
                          <Button
                            variant="contained"
                            color="primary"
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
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    textAlign="center"
                  >
                    No hay artículos disponibles.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Container>

      <Pie />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: "" })}
          severity={snackbar.message.includes("Error") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Articulos;
