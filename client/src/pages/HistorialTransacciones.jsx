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
} from "@mui/material";
import axios from "axios";

const HistorialTransacciones = () => {
  const [compras, setCompras] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const id_usuario = localStorage.getItem("id_usuario");

  const fetchHistorial = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/historial/", {
        params: {
          id_usuario,
          fecha_inicio: fechaInicio || undefined,
          fecha_fin: fechaFin || undefined,
        },
      });

      setCompras(res.data.compras || []);
      setVentas(res.data.ventas || []);
    } catch (err) {
      setError("No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" mb={3}>
        🧾 Historial de Transacciones
      </Typography>

      {/* Filtros */}
      <Grid container spacing={2} alignItems="center" mb={3}>
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
        <Grid item xs={12} sm={4}>
          <Button variant="contained" onClick={fetchHistorial} fullWidth>
            Filtrar
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* COMPRAS */}
          <Paper sx={{ padding: 2, marginBottom: 3 }}>
            <Typography variant="h6" color="green">
              🛒 Compras
            </Typography>
            {compras.length > 0 ? (
              compras.map((c, i) => (
                <Typography key={i}>
                  {c.year} - {c.month}: {c.total_compras} compras
                </Typography>
              ))
            ) : (
              <Typography color="text.secondary">
                No hay compras registradas.
              </Typography>
            )}
          </Paper>

          {/* VENTAS */}
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" color="primary">
              💼 Ventas
            </Typography>
            {ventas.length > 0 ? (
              ventas.map((v, i) => (
                <Typography key={i}>
                  {v.year} - {v.month}: {v.total_ventas} ventas
                </Typography>
              ))
            ) : (
              <Typography color="text.secondary">
                No hay ventas registradas.
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default HistorialTransacciones;
