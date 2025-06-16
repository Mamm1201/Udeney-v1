// ✅ Importación de React y hooks necesarios desde la biblioteca React
import { useEffect, useState } from "react";

// ✅ Importación de componentes de MUI (Material UI) para el diseño visual
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
} from "@mui/material";

// ✅ Importación para navegación interna con React Router
import { Link } from "react-router-dom";

// ✅ Ícono de carrito de compras
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// ✅ Componentes personalizados de la app
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

// ✅ Llamadas a la API para obtener artículos y categorías
import { getAllArticulos, getCategorias } from "../api/articulos.api";

// ✅ Contexto personalizado para manejar el carrito de compras
import { useCarrito } from "../context/CarritoContext";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const { agregarAlCarrito } = useCarrito();

  const fetchCategorias = async () => {
    try {
      const res = await getCategorias();
      setCategorias(res.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const fetchArticulos = async (categoriaId = null) => {
    try {
      const params = categoriaId ? { id_categoria: categoriaId } : {};
      const res = await getAllArticulos(params);
      setArticulos(res.data);
    } catch (error) {
      console.error("Error cargando artículos:", error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await fetchCategorias();
      await fetchArticulos();
      setLoading(false);
    };
    cargarDatos();
  }, []);

  const handleCategoriaChange = async (e) => {
    const value = e.target.value;
    setCategoriaSeleccionada(value);
    setLoading(true);

    if (value === "Todas") {
      await fetchArticulos();
    } else {
      await fetchArticulos(parseInt(value));
    }

    setLoading(false);
  };

  const handleAgregar = (articulo) => {
    agregarAlCarrito(articulo);
    setSnackbar({ open: true, message: "✅ Artículo agregado al carrito" });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Lista de Artículos
        </Typography>

        {/* 🔍 Filtro por categoría */}
        <FormControl fullWidth sx={{ mb: 4 }} component={Paper} elevation={3}>
          <InputLabel id="categoria-label">Filtrar por categoría</InputLabel>
          <Select
            labelId="categoria-label"
            value={categoriaSeleccionada}
            label="Filtrar por categoría"
            onChange={handleCategoriaChange}
          >
            <MenuItem value="Todas">Todas</MenuItem>
            {categorias.map((categoria) => (
              <MenuItem
                key={categoria.id_categoria}
                value={categoria.id_categoria}
              >
                {categoria.nombre_categoria}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 🧱 Grid con las tarjetas de artículos */}
        {articulos.length > 0 ? (
          <Grid container spacing={3}>
            {articulos.map((articulo) => (
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
                    height="300"
                    image={articulo.imagen || "/img/placeholder.jpg"}
                    alt={articulo.titulo_articulo}
                    sx={{
                      width: "100%",
                      objectFit: "cover", // Asegura que la imagen se recorte proporcionalmente y no se distorsione
                      borderTopLeftRadius: "16px", // Coincide con el borderRadius del <Card />
                      borderTopRightRadius: "16px",
                    }}
                  />

                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {articulo.titulo_articulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {/* 📌 Usa noWrap para evitar desbordes, pero puedes quitarlo si deseas mostrar todo el texto */}
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
                      {/* 💰 Formatea el precio como moneda local (COP) */}
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(articulo.precio_articulo)}
                    </Typography>

                    {/* 🧾 Botones de acción: Ver detalles y Añadir */}
                    <Box mt={2} display="flex" flexDirection="column" gap={1}>
                      <Button
                        variant="contained"
                        color="primary" //color del boton ver detalle
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
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No hay artículos disponibles para esta categoría.
          </Typography>
        )}
      </Container>
      <Pie />

      {/* ✅ Snackbar para mostrar notificación al agregar artículo */}
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
