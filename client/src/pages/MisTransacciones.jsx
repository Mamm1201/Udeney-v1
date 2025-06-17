import React, { useEffect, useState } from "react";
import { getMisTransacciones } from "../api/transacciones.api";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const MisTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    tipo: "todas", // Nueva propiedad
  });

  const fetchTransacciones = async () => {
    try {
      const filtrosEnviar = {
        ...filtros,
        tipo: filtros.tipo === "todas" ? null : filtros.tipo,
      };
      const { data } = await getMisTransacciones(filtrosEnviar);
      setTransacciones(data);
    } catch (error) {
      console.error("Error al obtener transacciones del usuario:", error);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  const handleFiltrar = () => {
    fetchTransacciones();
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Mis Transacciones
      </Typography>

      {/* Filtros */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Desde"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filtros.fecha_inicio}
          onChange={(e) =>
            setFiltros({ ...filtros, fecha_inicio: e.target.value })
          }
        />
        <TextField
          label="Hasta"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filtros.fecha_fin}
          onChange={(e) =>
            setFiltros({ ...filtros, fecha_fin: e.target.value })
          }
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="tipo-label">Tipo</InputLabel>
          <Select
            labelId="tipo-label"
            value={filtros.tipo}
            label="Tipo"
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          >
            <MenuItem value="todas">Todas</MenuItem>
            <MenuItem value="compra">Compras</MenuItem>
            <MenuItem value="venta">Ventas</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleFiltrar}>
          Filtrar
        </Button>
      </Box>

      {/* Tabla de resultados */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Transacción</TableCell>
              <TableCell>Fecha</TableCell>
              {/* Puedes agregar más columnas como total, estado, etc. */}
            </TableRow>
          </TableHead>
          <TableBody>
            {transacciones.map((tx) => (
              <TableRow key={tx.id_transaccion}>
                <TableCell>{tx.id_transaccion}</TableCell>
                <TableCell>
                  {new Date(tx.fecha_transaccion).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MisTransacciones;
