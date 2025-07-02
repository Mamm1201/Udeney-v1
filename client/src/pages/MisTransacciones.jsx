import { useEffect, useState, useCallback } from 'react';
import { getMisTransacciones } from '../api/transacciones.api';
import { useNavigate } from 'react-router-dom';
import {
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';

const MisTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const id_usuario = localStorage.getItem('id_usuario');

  const fetchTransacciones = useCallback(async () => {
    try {
      const response = await getMisTransacciones(id_usuario);
      setTransacciones(response.data);
    } catch (err) {
      console.error('Error al obtener las transacciones:', err);
      setError('No se pudieron cargar tus transacciones.');
    } finally {
      setCargando(false);
    }
  }, [id_usuario]);

  useEffect(() => {
    fetchTransacciones();
  }, [fetchTransacciones]);

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" mt={6}>
        {error}
      </Typography>
    );
  }

  if (transacciones.length === 0) {
    return (
      <Typography align="center" mt={6}>
        No tienes transacciones registradas aún.
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 5, px: 2 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Mis Transacciones
      </Typography>

      <Grid container spacing={3}>
        {transacciones.map(tx => (
          <Grid item xs={12} key={tx.id_transaccion}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                backgroundColor: '#f9f9f9',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ReceiptLongIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Transacción #{tx.id_transaccion}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarMonthIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {new Date(tx.fecha_transaccion).toLocaleString('es-CO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    endIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/resumen/${tx.id_transaccion}`)}
                  >
                    Ver Resumen
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MisTransacciones;
