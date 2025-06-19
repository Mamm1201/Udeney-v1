import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
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
  AppBar,
  Toolbar,
} from "@mui/material";
import { DeleteOutline, ShoppingCartCheckout, Home } from "@mui/icons-material";
import { useCarrito } from "../context/CarritoContext";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const Carrito = () => {
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } =
    useCarrito();
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [tipoEntrega, setTipoEntrega] = useState("domicilio");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const fallbackImage = "/estudiantes.jpg";

  const formatoPesos = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  });

  useEffect(() => {
    const totalCalculado = carrito.reduce(
      (acc, item) => acc + item.precio_articulo * item.cantidad,
      0
    );
    setTotal(totalCalculado);
  }, [carrito]);

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

  const realizarCompra = async () => {
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

      const response = await api.post("/crear-transaccion/", datos);
      const id_transaccion = response?.data?.id_transaccion;
      if (!id_transaccion) throw new Error("Transacción no válida.");

      vaciarCarrito();
      setSnackbar({
        open: true,
        message: "✅ ¡Compra realizada con éxito!",
        type: "success",
      });
      setOpenConfirmDialog(false);
      navigate(`/resumen/${id_transaccion}`);
    } catch (error) {
      console.error("❌ Error al realizar la compra:", error);
      setSnackbar({
        open: true,
        message: "❌ No se pudo completar la compra.",
        type: "error",
      });
      setOpenConfirmDialog(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ mb: 4, backgroundColor: "#45858C" }}>
        <Toolbar>
          <IconButton
            onClick={() => navigate("/")}
            edge="start"
            sx={{ p: 0, mr: 2 }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 100,
                width: 100,
                borderRadius: "20%",
                objectFit: "cover",
              }}
            />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Carrito de Compras
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ paddingX: { xs: 2, md: 4 }, paddingBottom: 4 }}>
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
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 3,
                    }}
                  >
                    {/* Parte superior blanca con imagen */}
                    <Box sx={{ backgroundColor: "#ffffff", p: 2 }}>
                      <CardMedia
                        component="img"
                        image={articulo.imagen || fallbackImage}
                        alt={articulo.titulo_articulo}
                        onError={(e) => {
                          e.target.src = fallbackImage;
                        }}
                        sx={{
                          height: 200,
                          objectFit: "contain",
                          margin: "0 auto",
                          display: "block",
                        }}
                      />
                    </Box>

                    {/* Parte inferior gris claro con detalles */}
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
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
                          {formatoPesos.format(articulo.precio_articulo)} x{" "}
                          {articulo.cantidad}
                        </Typography>
                      </Box>

                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <IconButton
                          onClick={() =>
                            eliminarDelCarrito(articulo.id_articulo)
                          }
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

            <FormControl fullWidth sx={{ mt: 4 }}>
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

            <Box
              sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography variant="h5">
                Total: {formatoPesos.format(total)}
              </Typography>

              <Button
                variant="contained"
                startIcon={<ShoppingCartCheckout />}
                sx={{
                  backgroundColor: "#43a047",
                  "&:hover": { backgroundColor: "#388e3c" },
                  color: "white",
                }}
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

        {/* Confirmación */}
        <Dialog open={openConfirmDialog} onClose={handleCerrarConfirmacion}>
          <DialogTitle>¿Confirmar compra?</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Seguro quieres continuar con la compra por{" "}
              <strong>{formatoPesos.format(total)}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCerrarConfirmacion}>Cancelar</Button>
            <Button
              onClick={realizarCompra}
              variant="contained"
              color="primary"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.type}
            sx={{ width: "100%" }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Carrito;
