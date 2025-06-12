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
import { getTransaccionById } from "../api/transacciones.api";
import axios from "axios";

const ResumenCompra = () => {
  const { id } = useParams(); // esta linea se cambio
  const navigate = useNavigate();

  const [transaccion, setTransaccion] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ Obtener transacción
        const resT = await getTransaccionById(id);
        setTransaccion(resT.data);
        console.log("🧾 Transacción recibida:", resT.data);

        const idDetalle = resT.data.id_detalle_transaccion;

        // ✅ Si existe, obtener detalle completo
        if (idDetalle && typeof idDetalle === "number") {
          const resD = await axios.get(
            `http://localhost:8000/detalle-transaccion/${idDetalle}/`
          );
          console.log("📦 Detalle recibido:", resD.data);
          setDetalle(resD.data);
        } else {
          setDetalle(null); // No tiene detalle asociado
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

  // ⏳ Estado de carga
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ❌ Error al cargar
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
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🧾 Resumen de Compra
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* 🧾 Datos de la transacción */}
        <Typography variant="subtitle1">
          <strong>ID Transacción:</strong> {transaccion.id_transaccion}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Fecha:</strong>{" "}
          {new Date(transaccion.fecha_transaccion).toLocaleString()}
        </Typography>

        {/* 📦 Si hay detalle asociado */}
        {detalle ? (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              <strong>Entrega:</strong>{" "}
              {detalle.tipo_entrega === "domicilio"
                ? "🚚 Domicilio a tu dirección"
                : "🏬 Retiro en punto de entrega"}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 🛒 Lista de artículos */}
            <List>
              {detalle.articulos.map((item, i) => (
                <ListItem key={i} divider alignItems="flex-start">
                  <Grid container spacing={2} alignItems="center">
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
                    <Grid item xs>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.titulo_articulo} × {item.cantidad_articulos}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              Precio unitario: ${item.precio_articulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Subtotal: $
                              {calcularSubtotal(
                                item.precio_articulo,
                                item.cantidad_articulos
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

            {/* 💰 Total */}
            <Typography variant="h6" textAlign="right">
              Total: <strong>${detalle.total}</strong>
            </Typography>

            {/* 📦 Estado */}
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              📦 Tu compra está siendo procesada y pronto recibirás novedades.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Esta transacción no contiene un detalle asociado.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Es posible que aún no se haya finalizado la compra o hubo un
              error.
            </Typography>
          </>
        )}

        {/* 🔙 Volver */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
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
