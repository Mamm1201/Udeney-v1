// src/pages/HistorialTransacciones.jsx
import { useEffect, useState } from 'react';
import { getTransacciones } from '../api/transacciones.api';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const HistorialTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    const fetchTransacciones = async () => {
      try {
        const response = await getTransacciones();
        setTransacciones(response.data);
      } catch (error) {
        console.error('Error al obtener transacciones:', error);
      }
    };

    fetchTransacciones();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Historial de Transacciones
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Transacción</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transacciones.map(tx => (
              <TableRow key={tx.id_transaccion}>
                <TableCell>{tx.id_transaccion}</TableCell>
                <TableCell>{tx.id_usuario}</TableCell>
                <TableCell>
                  {new Date(tx.fecha_transaccion).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default HistorialTransacciones;
