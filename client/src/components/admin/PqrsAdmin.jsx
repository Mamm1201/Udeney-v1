// src/components/admin/PqrsAdmin.jsx

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  MenuItem,
  TextField,
} from '@mui/material';
import { getPQRS } from '../../api';

const tipos = ['', 'peticion', 'queja', 'reclamo'];

const PqrsAdmin = () => {
  const [pqrs, setPqrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  // Callback para evitar advertencia en useEffect por dependencia
  const fetchPQRS = useCallback(async () => {
    setLoading(true);
    try {
      const filtros = {};
      if (tipoFiltro) filtros.tipo_pqr = tipoFiltro;
      if (usuarioFiltro) filtros.id_usuario = usuarioFiltro;

      const data = await getPQRS(filtros);
      setPqrs(data);
    } catch (error) {
      console.error('Error al obtener PQRS:', error);
    } finally {
      setLoading(false);
    }
  }, [tipoFiltro, usuarioFiltro]);

  // Llamar a la función cada vez que cambian los filtros
  useEffect(() => {
    fetchPQRS();
  }, [fetchPQRS]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Administración de PQRS
      </Typography>

      {/* Filtros de búsqueda */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Tipo de PQR"
          select
          value={tipoFiltro}
          onChange={e => setTipoFiltro(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {tipos.map(tipo => (
            <MenuItem key={tipo} value={tipo}>
              {tipo || 'Todos'}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="ID Usuario"
          type="number"
          value={usuarioFiltro}
          onChange={e => setUsuarioFiltro(e.target.value)}
        />
      </Box>

      {/* Resultados de PQRS */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {pqrs.map(item => (
            <Grid item xs={12} md={6} key={item.id_pqr}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    Tipo: {item.tipo_pqr.toUpperCase()}
                  </Typography>
                  <Typography>Descripción: {item.descripcion_pqr}</Typography>
                  <Typography>
                    Fecha: {new Date(item.fecha_pqr).toLocaleString()}
                  </Typography>
                  <Typography>ID Usuario: {item.id_usuario}</Typography>
                  <Typography>ID Transacción: {item.id_transaccion}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PqrsAdmin;
