// ======================================================
// Calificar.jsx - Componente para calificar una transacción
// ======================================================

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import api from '../api/axiosConfig'; // Reemplaza si tu ruta cambia

// Opciones de calificación con texto y emojis
const opcionesCalificacion = [
  { label: '😄 Excelente', value: 'excelente' },
  { label: '😊 Buena', value: 'buena' },
  { label: '😞 Mala', value: 'mala' },
];

const Calificar = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID de transacción desde la URL

  // Estados locales
  const [tipoCalificacion, setTipoCalificacion] = useState('');
  const [comentario, setComentario] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  // Enviar calificación al backend
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await api.post('/calificaciones/', {
        id_transaccion: id,
        tipo_calificacion: tipoCalificacion,
        comentario: comentario || null,
      });

      setMensaje({
        texto: '✅ Calificación enviada exitosamente',
        tipo: 'success',
      });
      setMostrarAlerta(true);

      // Volver atrás luego de unos segundos
      setTimeout(() => navigate('/articulos'), 1000);
    } catch (error) {
      console.error('❌ Error al enviar calificación:', error);
      setMensaje({
        texto: 'Ocurrió un error al enviar la calificación',
        tipo: 'error',
      });
      setMostrarAlerta(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage:
          "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('/otoño1.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          borderRadius: 4,
          backgroundColor: '#ffffffee',
        }}
      >
        {/* Título e ícono */}
        <Box display="flex" alignItems="center" mb={2}>
          <EmojiEmotionsIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Calificar Transacción #{id}
          </Typography>
        </Box>

        {/* Formulario de calificación */}
        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle1" mb={1}>
            ¿Cómo fue tu experiencia?
          </Typography>

          {/* Opciones visuales de calificación */}
          <Stack direction="row" spacing={2} mb={3}>
            {opcionesCalificacion.map(opcion => (
              <Button
                key={opcion.value}
                variant={
                  tipoCalificacion === opcion.value ? 'contained' : 'outlined'
                }
                onClick={() => setTipoCalificacion(opcion.value)}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  whiteSpace: 'nowrap',
                  borderRadius: 2,
                }}
              >
                {opcion.label}
              </Button>
            ))}
          </Stack>

          {/* Comentario opcional */}
          <TextField
            label="Comentario (opcional)"
            multiline
            rows={4}
            fullWidth
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            placeholder="¿Qué te gustaría contarnos sobre esta transacción?"
            sx={{ mb: 3 }}
          />

          {/* Botón para enviar */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!tipoCalificacion}
          >
            Enviar Calificación
          </Button>
        </form>
      </Paper>

      {/* Alerta inferior */}
      <Snackbar
        open={mostrarAlerta}
        autoHideDuration={4000}
        onClose={() => setMostrarAlerta(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
