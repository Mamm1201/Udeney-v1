// ✅ Importación de React y hooks necesarios
import { useEffect, useState } from "react";

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";

import { Link } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// ✅ Componentes personalizados
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import { getAllArticulos, getCategorias } from "../api/articulos.api";
import { useCarrito } from "../context/CarritoContext";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const cat = await getCategorias();
        const art = await getAllArticulos();
        setCategorias(cat.data);
        setArticulos(art.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleCategoriaChange = async (e) => {
    const value = e.target.value;
    setCategoriaSeleccionada(value);
    setLoading(true);
    try {
      if (value === "Todas") {
        const res = await getAllArticulos();
        setArticulos(res.data);
      } else {
        const res = await getAllArticulos({ id_categoria: parseInt(value) });
        setArticulos(res.data);
      }
    } catch (error) {
      console.error("Error al filtrar artículos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = (articulo) => {
    agregarAlCarrito(articulo);
    setSnackbar({ open: true, message: "✅ Artículo agregado al carrito" });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress sx={{ color: "#45858C" }} />
      </Box>
    );
  }

  return (
    <>
      {/* Navbar fijo */}
      <Box position="fixed" top={0} left={0} right={0} zIndex={10}>
        <Navbar />
      </Box>
      <Box pt={10}>
        {" "}
        {/* Padding para compensar el Navbar fijo */}
        <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight={700}
            gutterBottom
            sx={{
              color: "#2E7D32",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Conecta con artículos que necesitan una segunda oportunidad
          </Typography>

          <Grid container spacing={4}>
            {/* Filtro lateral fijo con imagen */}
            <Grid item xs={12} md={3}>
              <Box position="sticky" top={110} zIndex={1}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, borderRadius: 2, backgroundColor: "#f9f9f9" }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#45858C", fontWeight: "bold", mb: 2 }}
                  >
                    Filtrar por categoría
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormControl fullWidth>
                    <InputLabel id="categoria-label">Categoría</InputLabel>
                    <Select
                      labelId="categoria-label"
                      value={categoriaSeleccionada}
                      label="Categoría"
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

                  {/* Imagen alusiva fija debajo del filtro */}
                  <Box mt={4}>
                    <img
                      src="src/assets/logo.png"
                      alt="Economía Circular"
                      style={{
                        width: "100%",
                        borderRadius: "12px",
                        objectFit: "cover",
                        boxShadow: "0px 3px 10px rgba(0,0,0,0.6)",
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Grid>

            {/* Tarjetas de artículos */}
            <Grid item xs={12} md={9}>
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
                        <CardMedia
                          component="img"
                          height="180"
                          image={articulo.imagen || "/img/placeholder.jpg"}
                          alt={articulo.titulo_articulo}
                        />

                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ color: "#333" }}
                          >
                            {articulo.titulo_articulo}
                          </Typography>

                          {/* <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              height: "40px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {articulo.descripcion_articulo}
                          </Typography> */}

                          {/* {articulo.institucion_articulo && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 1 }}
                            >
                              {articulo.institucion_articulo}
                            </Typography>
                          )} */}

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

                          <Box
                            mt={2}
                            display="flex"
                            flexDirection="column"
                            gap={1}
                          >
                            <Button
                              variant="contained"
                              component={Link}
                              to={`/articulos/${articulo.id_articulo}`}
                              fullWidth
                              sx={{
                                backgroundColor: "#45858C",
                                color: "#fff",
                                fontWeight: "bold",
                                "&:hover": { backgroundColor: "#366e72" },
                              }}
                            >
                              Ver Detalles
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => handleAgregar(articulo)}
                              fullWidth
                              startIcon={<ShoppingCartIcon />}
                              sx={{
                                borderColor: "#45858C",
                                color: "#45858C",
                                fontWeight: "bold",
                                "&:hover": {
                                  backgroundColor: "#f0f4f4",
                                  borderColor: "#366e72",
                                  color: "#366e72",
                                },
                              }}
                            >
                              Añadir al carrito
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
                  No hay artículos disponibles en esta categoría.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Pie />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Articulos;
