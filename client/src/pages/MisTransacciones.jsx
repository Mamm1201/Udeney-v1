// src/components/MisTransacciones.jsx
import { useEffect, useState } from "react";
import { getMisTransacciones } from "../api/transacciones.api";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
} from "@mui/material";

const MisTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        const response = await getMisTransacciones();
        setTransacciones(response.data);
      } catch (err) {
        console.error("Error al obtener las transacciones:", err);
        setError("No se pudieron cargar tus transacciones.");
      } finally {
        setCargando(false);
      }
    };

    fetchTransacciones();
  }, []);

  if (cargando) return <CircularProgress />;

  if (error) return <Typography color="error">{error}</Typography>;

  if (transacciones.length === 0) {
    return <Typography>No tienes transacciones registradas aún.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Mis Transacciones
      </Typography>

      {transacciones.map((tx) => (
        <Card key={tx.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body1">ID Transacción: {tx.id}</Typography>
            <Typography variant="body2">Fecha: {tx.fecha}</Typography>
            <Typography variant="body2">Estado: {tx.estado}</Typography>

            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={() => navigate(`/resumen/${tx.id}`)}
            >
              Ver Resumen
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default MisTransacciones;
