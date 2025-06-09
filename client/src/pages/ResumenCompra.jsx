import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTransaccionById,
  getDetalleTransaccionById,
} from "../api/transacciones.api";

const ResumenCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaccion, setTransaccion] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);

        const resTransaccion = await getTransaccionById(id);
        const transaccionData = resTransaccion.data;
        setTransaccion(transaccionData);

        const idDetalle = transaccionData.id_detalle_transaccion;
        if (!idDetalle)
          throw new Error("No se encontró detalle para la transacción.");

        const resDetalle = await getDetalleTransaccionById(idDetalle);
        setDetalle(resDetalle.data);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar resumen de compra:", err);
        setError("Error al cargar el resumen de compra.");
        setLoading(false);
      }
    };

    fetchDatos();
  }, [id]);

  const calcularSubtotal = (precio, cantidad) => precio * cantidad;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate("/historial")}>
          Volver al Historial
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🧾 Resumen de Compra
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          <strong>ID Transacción:</strong> {transaccion.id_transaccion || id}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Fecha:</strong>{" "}
          {new Date(transaccion.fecha_transaccion).toLocaleString()}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Tipo de entrega:</strong>{" "}
          {detalle.tipo_entrega === "domicilio"
            ? "🚚 Domicilio"
            : "🏬 Retiro en punto físico"}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Artículos comprados
        </Typography>
        <List>
          {detalle.articulos?.map((item, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={`${item.titulo_articulo} x ${item.cantidad_articulos}`}
                secondary={`$${item.precio_articulo} c/u — Subtotal: $${calcularSubtotal(item.precio_articulo, item.cantidad_articulos)}`}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" textAlign="right">
          Total: <strong>${detalle.total || 0}</strong>
        </Typography>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button variant="contained" onClick={() => navigate("/historial")}>
            Ver Historial de Compras
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResumenCompra;
