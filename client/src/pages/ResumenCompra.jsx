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
  const { id } = useParams(); // ID de la transacción desde la URL
  const navigate = useNavigate();

  const [resumen, setResumen] = useState(null); // Datos de la transacción
  const [loading, setLoading] = useState(true); // Cargando resumen
  const [error, setError] = useState(null); // Errores
  const fallbackImage = "/estudiantes.jpg"; // Imagen por defecto

  // Cargar resumen desde el backend
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

  // Mostrar loader
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar error
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
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        p: 3,
        backgroundColor: "#e3f2fd", // Fondo azul claro
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          backgroundColor: "#ffffff", // Tarjeta blanca sobre fondo azul
        }}
      >
        {/* Título */}
        <Typography variant="h4" gutterBottom color="primary">
          🧾 Resumen de Compra
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Información general */}
        {resumen.id_transaccion && (
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>ID Transacción:</strong> {resumen.id_transaccion}
          </Typography>
        )}

        {resumen.fecha_transaccion ? (
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Fecha:</strong>{" "}
            {new Date(resumen.fecha_transaccion).toLocaleString()}
          </Typography>
        ) : (
          <Typography variant="subtitle1" color="error">
            <strong>Fecha:</strong> No disponible
          </Typography>
        )}

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          <strong>Entrega:</strong>{" "}
          {resumen.tipo_entrega === "domicilio"
            ? "🚚 Domicilio a tu dirección"
            : "🏬 Retiro en punto físico"}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Lista de artículos */}
        <List>
          {resumen.articulos.map((item, index) => (
            <ListItem key={index} divider alignItems="flex-start">
              <Grid container spacing={2} alignItems="center">
                {/* Imagen */}
                <Grid item>
                  <Avatar
                    variant="rounded"
                    src={item.imagen || fallbackImage}
                    alt={item.titulo_articulo}
                    sx={{ width: 64, height: 64 }}
                    onError={(e) => {
                      e.target.src = fallbackImage;
                      e.target.style.opacity = 1;
                    }}
                  />
                </Grid>

                {/* Detalle artículo */}
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="span"
                      >
                        Precio unitario: $
                        {item.precio_unitario.toLocaleString("es-CO")} <br />
                        Subtotal: ${item.subtotal.toLocaleString("es-CO")}
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        {/* Total */}
        <Typography variant="h5" textAlign="right" color="primary">
          Total: <strong>${resumen.total.toLocaleString("es-CO")}</strong>
        </Typography>

        {/* Mensaje estado */}
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          📦 Tu compra está en trámite. Recibirás confirmación pronto.
        </Typography>

        {/* Botón volver */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/historial-transacciones")}
          >
            Volver
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResumenCompra;
