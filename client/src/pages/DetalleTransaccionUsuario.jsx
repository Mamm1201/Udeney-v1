// src/components/DetalleTransaccionUsuario.jsx
import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import api from "../api/axiosConfig";

const DetalleTransaccionUsuario = ({ idTransaccion }) => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar detalle de transacción por ID
  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await api.get(`/detalle-transaccion/${idTransaccion}`);
        setDetalle(res.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el detalle de la transacción.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [idTransaccion]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" my={1}>
        {error}
      </Typography>
    );
  }

  if (!detalle) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Transacción #{idTransaccion}
      </Typography>
      <Typography variant="body2">Fecha: {detalle.fecha}</Typography>
      <Typography variant="body2">Monto: ${detalle.monto}</Typography>
      <Typography variant="body2">Estado: {detalle.estado}</Typography>
      {/* Puedes seguir agregando más campos según lo que tu API retorne */}
    </Paper>
  );
};

export default DetalleTransaccionUsuario;
