import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from "@mui/material";

const HistorialTransacciones = () => {
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const id_usuario = localStorage.getItem("id_usuario");

  // Función para cargar historial desde la API
  const fetchHistorial = async () => {
    if (!id_usuario) {
      setError("No se encontró el ID del usuario.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.get("/historial/", {
        params: {
          id_usuario,
          ...(fechaInicio && { fecha_inicio: fechaInicio }),
          ...(fechaFin && { fecha_fin: fechaFin }),
        },
      });

      setCompras(res.data.compras || []);
      setVentas(res.data.ventas || []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial del historial
  useEffect(() => {
    fetchHistorial();
  }, []);

  // Limpiar filtros y recargar todo
  const handleClearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
    fetchHistorial();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        🧾 Historial de Transacciones
      </Typography>

      {/* Filtros por fecha */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            type="date"
            label="Desde"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            type="date"
            label="Hasta"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <Button
            variant="contained"
            onClick={fetchHistorial}
            fullWidth
            sx={{ height: "100%" }}
          >
            Filtrar
          </Button>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            fullWidth
            sx={{ height: "100%" }}
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>

      {/* Estado de carga o error */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Sección Compras */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" color="green" gutterBottom>
              🛒 Compras
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {compras.length > 0 ? (
              <Stack spacing={1}>
                {compras.map((c, i) => (
                  <Typography key={i}>
                    <strong>
                      {c.year} - {c.month}
                    </strong>
                    : {c.total_compras} compras
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No hay compras registradas en este rango.
              </Typography>
            )}
          </Paper>

          {/* Sección Ventas */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              💼 Ventas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {ventas.length > 0 ? (
              <Stack spacing={1}>
                {ventas.map((v, i) => (
                  <Typography key={i}>
                    <strong>
                      {v.year} - {v.month}
                    </strong>
                    : {v.total_ventas} ventas
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No hay ventas registradas en este rango.
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default HistorialTransacciones;
