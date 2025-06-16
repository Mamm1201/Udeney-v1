// src/pages/ResumenCompra.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Avatar,
  Grid,
} from "@mui/material";
import { getResumenCompraByTransaccionId } from "../api/transacciones.api";

const ResumenCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener el resumen de compra desde el backend
  useEffect(() => {
    const fetchResumen = async () => {
      try {
        setLoading(true);
        const response = await getResumenCompraByTransaccionId(id);
        console.log("🧾 Resumen recibido:", response.data);
        setResumen(response.data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el resumen de compra.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [id]);

  // Calcula el subtotal de un artículo
  const calcularSubtotal = (precio, cantidad) => precio * cantidad;

  // Mostrar spinner mientras se carga el resumen
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar mensaje de error si hubo un problema
  if (error || !resumen) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/historial-transacciones")}
        >
          Volver al Historial
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        {/* Título */}
        <Typography variant="h4" gutterBottom>
          🧾 Resumen de Compra
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Información general de la transacción */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          <strong>ID Transacción:</strong> {resumen.id_transaccion}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          <strong>Fecha:</strong>{" "}
          {new Date(resumen.fecha_transaccion).toLocaleString()}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          <strong>Entrega:</strong>{" "}
          {resumen.tipo_entrega === "domicilio"
            ? "🚚 Domicilio a tu dirección"
            : "🏬 Retiro en punto físico"}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Lista de artículos comprados */}
        <List>
          {resumen.articulos.map((item, index) => (
            <ListItem key={index} divider alignItems="flex-start">
              <Grid container spacing={2} alignItems="center">
                {/* Imagen del artículo */}
                <Grid item>
                  {item.imagen_articulo ? (
                    <Avatar
                      variant="rounded"
                      src={item.imagen_articulo}
                      alt={item.titulo_articulo}
                      sx={{ width: 64, height: 64 }}
                    />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: "grey.300",
                        fontSize: 12,
                      }}
                    >
                      Sin imagen
                    </Avatar>
                  )}
                </Grid>

                {/* Información del artículo */}
                <Grid item xs>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        component="span"
                      >
                        {item.titulo_articulo} × {item.cantidad}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          display="block"
                        >
                          Precio unitario: ${item.precio_articulo}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          display="block"
                        >
                          Subtotal: $
                          {calcularSubtotal(
                            item.precio_articulo,
                            item.cantidad
                          )}
                        </Typography>
                      </>
                    }
                  />
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        {/* Total de la compra */}
        <Typography variant="h6" textAlign="right">
          Total:{" "}
          <strong>
            $
            {resumen.articulos.reduce(
              (acc, item) =>
                acc + calcularSubtotal(item.precio_articulo, item.cantidad),
              0
            )}
          </strong>
        </Typography>

        {/* Mensaje final */}
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          📦 Tu compra está en tramite.
        </Typography>

        {/* Botón para volver al historial */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/historial-transacciones")}
          >
            Mis Transacciones
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResumenCompra;
