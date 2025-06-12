// src/pages/Carrito.jsx

import { useEffect, useState } from "react";
import {
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  AddCircleOutline,
  RemoveCircleOutline,
  DeleteOutline,
} from "@mui/icons-material";
import { useCarrito } from "../context/CarritoContext";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const Carrito = () => {
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } =
    useCarrito();
  const navigate = useNavigate();

  const [total, setTotal] = useState(0); // Total de la compra
  const [tipoEntrega, setTipoEntrega] = useState("domicilio"); // Tipo de entrega seleccionado
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // Diálogo de confirmación

  const fallbackImage = "/estudiantes.jpg"; // Imagen por defecto si falla la original

  // Recalcula el total cada vez que cambia el carrito
  useEffect(() => {
    const totalCalculado = carrito.reduce(
      (acc, item) => acc + item.precio_articulo * item.cantidad,
      0
    );
    setTotal(totalCalculado);
  }, [carrito]);

  // Disminuye la cantidad o elimina el artículo
  const disminuirCantidad = (id_articulo) => {
    const articulo = carrito.find((item) => item.id_articulo === id_articulo);
    if (!articulo) return;

    if (articulo.cantidad > 1) {
      agregarAlCarrito({ ...articulo, cantidad: articulo.cantidad - 1 });
    } else {
      eliminarDelCarrito(id_articulo);
    }
  };

  const handleAbrirConfirmacion = () => setOpenConfirmDialog(true);
  const handleCerrarConfirmacion = () => setOpenConfirmDialog(false);

  // Realiza la compra y redirige al resumen
  const realizarCompra = async () => {
    console.log("🛒 Enviando compra...");
    const id_usuario = parseInt(localStorage.getItem("id_usuario"));

    try {
      const articulos = carrito.map((item) => ({
        id_articulo: item.id_articulo,
        cantidad: item.cantidad,
      }));

      const datos = {
        id_usuario,
        tipo_transaccion: "venta",
        tipo_entrega: tipoEntrega,
        articulos,
      };

      console.log("📦 Datos a enviar:", datos);

      const response = await api.post("/crear-transaccion/", datos);

      console.log("✅ Transacción creada con éxito:", response.data);

      const id_transaccion = response?.data?.id_transaccion;

      if (!id_transaccion) {
        throw new Error("No se pudo crear la transacción correctamente.");
      }

      vaciarCarrito();
      setSnackbar({
        open: true,
        message: "✅ ¡Compra realizada con éxito!",
        type: "success",
      });
      setOpenConfirmDialog(false);

      // Redirige al resumen de la transacción
      navigate(`/resumen/${id_transaccion}`);
      console.log("➡️ Redirigiendo a resumen:", `/resumen/${id_transaccion}`);
    } catch (error) {
      console.error("❌ Error al realizar la compra:", error);
      setSnackbar({
        open: true,
        message:
          "❌ No se pudo completar la compra. Intenta nuevamente más tarde.",
        type: "error",
      });
      setOpenConfirmDialog(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        🛒 Carrito de Compras
      </Typography>

      {carrito.length === 0 ? (
        <Typography>No hay artículos en el carrito.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {carrito.map((articulo) => (
              <Grid item xs={12} sm={6} md={4} key={articulo.id_articulo}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      height: 160,
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={articulo.imagen || fallbackImage}
                      alt={articulo.titulo_articulo}
                      onError={(e) => {
                        e.target.src = fallbackImage;
                        e.target.style.opacity = 1;
                      }}
                      sx={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        transition: "opacity 0.3s",
                        opacity: articulo.imagen ? 1 : 0.8,
                      }}
                    />
                    {!articulo.imagen && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Sin imagen
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
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

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mt={2}
                      alignItems="center"
                    >
                      <IconButton
                        onClick={() => disminuirCantidad(articulo.id_articulo)}
                      >
                        <RemoveCircleOutline />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          agregarAlCarrito({
                            ...articulo,
                            cantidad: articulo.cantidad + 1,
                          })
                        }
                      >
                        <AddCircleOutline />
                      </IconButton>
                      <IconButton
                        onClick={() => eliminarDelCarrito(articulo.id_articulo)}
                        color="error"
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Selector de tipo de entrega */}
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="tipo-entrega-label">Tipo de entrega</InputLabel>
            <Select
              labelId="tipo-entrega-label"
              value={tipoEntrega}
              label="Tipo de entrega"
              onChange={(e) => setTipoEntrega(e.target.value)}
            >
              <MenuItem value="domicilio">🚚 Domicilio</MenuItem>
              <MenuItem value="retiro_punto_fisico">
                🏬 Retiro en punto físico
              </MenuItem>
            </Select>
          </FormControl>

          {/* Total y acciones */}
          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h5">Total: ${total}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAbrirConfirmacion}
            >
              Realizar Compra
            </Button>
            <Button variant="outlined" onClick={() => navigate("/articulos")}>
              ← Seguir comprando
            </Button>
          </Box>
        </>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={openConfirmDialog} onClose={handleCerrarConfirmacion}>
        <DialogTitle>¿Confirmar compra?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro quieres continuar con la compra por{" "}
            <strong>${total}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarConfirmacion}>Cancelar</Button>
          <Button onClick={realizarCompra} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación (snackbar) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar({ open: false, message: "", type: "success" })
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.type}
          sx={{ width: "100%" }}
          onClose={() =>
            setSnackbar({ open: false, message: "", type: "success" })
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Carrito;
