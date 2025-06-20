import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../api/axiosConfig";

const Calificar = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id de la transacción (viene de la URL)
  const [tipoCalificacion, setTipoCalificacion] = useState("");
  const [comentario, setComentario] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "success" });
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/calificaciones/", {
        id_transaccion: id,
        tipo_calificacion: tipoCalificacion,
        comentario: comentario,
      });

      setMensaje({
        texto: "✅ Calificación enviada exitosamente",
        tipo: "success",
      });
      setMostrarAlerta(true);

      // Redirigir después de unos segundos
      setTimeout(() => {
        navigate("/mis-transacciones");
      }, 2000);
    } catch (error) {
      console.error("❌ Error al enviar calificación:", error);
      setMensaje({
        texto: "Ocurrió un error al enviar la calificación",
        tipo: "error",
      });
      setMostrarAlerta(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Calificar Transacción #{id}
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tipo de Calificación</InputLabel>
          <Select
            value={tipoCalificacion}
            label="Tipo de Calificación"
            onChange={(e) => setTipoCalificacion(e.target.value)}
            required
          >
            <MenuItem value="excelente">Excelente</MenuItem>
            <MenuItem value="buena">Buena</MenuItem>
            <MenuItem value="mala">Mala</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Comentario"
          multiline
          rows={4}
          fullWidth
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Enviar Calificación
        </Button>
      </form>

      <Snackbar
        open={mostrarAlerta}
        autoHideDuration={4000}
        onClose={() => setMostrarAlerta(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={mensaje.tipo}
          onClose={() => setMostrarAlerta(false)}
          variant="filled"
        >
          {mensaje.texto}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Calificar;
