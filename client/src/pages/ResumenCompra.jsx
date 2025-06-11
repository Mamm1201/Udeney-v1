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
} from "@mui/material";
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
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Obtener transacción
        const resT = await getTransaccionById(id);
        console.log("Transacción recibida:", resT.data);
        setTransaccion(resT.data);

        // 2️⃣ Intentar obtener el detalle si existe
        const idDetalle = resT.data.id_detalle_transaccion;

        if (idDetalle && typeof idDetalle === "number") {
          const resD = await getDetalleTransaccionById(idDetalle);
          setDetalle(resD.data);
        } else {
          console.warn("Esta transacción no tiene detalle asociado.");
          setDetalle(null);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el resumen de compra.");
        setLoading(false);
      }
    };

    fetchData();
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
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/historial-transacciones")}
        >
          Volver al Historial
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🧾 Resumen de Compra
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1">
          <strong>ID Transacción:</strong> {transaccion.id_transaccion}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Fecha:</strong>{" "}
          {new Date(transaccion.fecha_transaccion).toLocaleString()}
        </Typography>

        {detalle ? (
          <>
            <Typography variant="subtitle1">
              <strong>Entrega:</strong>{" "}
              {detalle.tipo_entrega === "domicilio"
                ? "🚚 Domicilio"
                : "🏬 Retiro"}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <List>
              {detalle.articulos.map((item, i) => (
                <ListItem key={i} divider>
                  <ListItemText
                    primary={`${item.titulo_articulo} × ${item.cantidad_articulos}`}
                    secondary={`$${item.precio_articulo} c/u — Subtotal: $${calcularSubtotal(
                      item.precio_articulo,
                      item.cantidad_articulos
                    )}`}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" textAlign="right">
              Total: <strong>${detalle.total}</strong>
            </Typography>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Esta transacción no contiene un detalle asociado.
          </Typography>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/historial-transacciones")}
          >
            Ver Historial de Compras
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResumenCompra;
