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
} from "@mui/material";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const { agregarAlCarrito } = useCarrito(); // ✅ Usamos el contexto global

  useEffect(() => {
    getAllArticulos()
      .then((response) => setArticulos(response.data))
      .catch((error) => console.error(error));
  }, []);

  const handleAgregar = (articulo) => {
    agregarAlCarrito(articulo);
    setSnackbar({ open: true, message: "✅ Artículo agregado al carrito" });
  };

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
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            textAlign: "center",
          }}
        >
          LISTA DE ARTÍCULOS
        </Typography>
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
            {articulos.length > 0 ? (
              articulos.map((articulo) => (
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
                        ${articulo.precio_articulo}
                      </Typography>

                      <Box mt={2} display="flex" flexDirection="column" gap={1}>
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
              <Typography
                variant="body1"
                color="textSecondary"
                textAlign="center"
              >
                No hay artículos disponibles.
              </Typography>
            )}
          </Grid>
        </Box>
      </Container>
      <Pie />

      {/* Snackbar */}
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
