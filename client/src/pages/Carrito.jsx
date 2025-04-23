// src/pages/Carrito.jsx
import React, { useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { useCarrito } from "../context/CarritoContext"; // ✅ Importamos correctamente

const Carrito = () => {
  const { carrito, agregarAlCarrito, eliminarDelCarrito } = useCarrito(); // ✅ Usamos el hook dentro del componente
  const [total, setTotal] = React.useState(0);

  // Calcular total del carrito
  useEffect(() => {
    const totalCalculado = carrito.reduce(
      (acc, item) => acc + item.precio_articulo * item.cantidad,
      0
    );
    setTotal(totalCalculado);
  }, [carrito]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Carrito de Compras
      </Typography>

      {carrito.length === 0 ? (
        <Typography>No hay artículos en el carrito.</Typography>
      ) : (
        <Grid container spacing={3}>
          {carrito.map((articulo) => (
            <Grid item xs={12} sm={6} md={4} key={articulo.id_articulo}>
              <Card sx={{ height: "100%" }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={
                    articulo.imagen || "https://via.placeholder.com/300x160"
                  }
                  alt={articulo.titulo_articulo}
                />
                <CardContent>
                  <Typography variant="h6">
                    {articulo.titulo_articulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {articulo.descripcion_articulo}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="primary"
                    mt={1}
                  >
                    ${articulo.precio_articulo} x {articulo.cantidad}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <IconButton
                      onClick={() => eliminarDelCarrito(articulo.id_articulo)}
                    >
                      <RemoveCircleOutline />
                    </IconButton>
                    <IconButton onClick={() => agregarAlCarrito(articulo)}>
                      <AddCircleOutline />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Total y botón de compra */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5">Total: ${total}</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => console.log("Realizar compra")}
        >
          Realizar Compra
        </Button>
      </Box>
    </Box>
  );
};

export default Carrito;
