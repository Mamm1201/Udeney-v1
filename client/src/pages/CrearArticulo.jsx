import { useState, useEffect } from 'react';
import NavbarVender from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import { getCategorias, crearArticulo } from '../api/articulos.api';
import fondoVender from '../assets/vender.png'; // Ajusta si tu ruta es distinta

const CrearArticulo = () => {
  const navigate = useNavigate();
  const idUsuario = localStorage.getItem('id_usuario');
  const nombreUsuario = localStorage.getItem('nombres_usuario');

  const [formData, setFormData] = useState({
    titulo_articulo: '',
    descripcion_articulo: '',
    institucion_articulo: '',
    precio_articulo: '',
    id_categoria: '',
    id_usuario: parseInt(idUsuario),
  });

  const [imagen, setImagen] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [articuloCreado, setArticuloCreado] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(res.data);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'id_categoria' ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagen(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value)
    );
    if (imagen) data.append('imagen', imagen);

    try {
      const response = await crearArticulo(data);
      if (response.status === 201) {
        setArticuloCreado(response.data);
        setSnackbarOpen(true);
        setFormData({
          titulo_articulo: '',
          descripcion_articulo: '',
          institucion_articulo: '',
          precio_articulo: '',
          id_categoria: '',
          id_usuario: parseInt(idUsuario),
        });
        setImagen(null);
      }
    } catch (error) {
      console.error('Error al crear artículo:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${fondoVender})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
      }}
    >
      <NavbarVender />

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={10}
        sx={{
          mt: 6,
          mb: 4,
          maxWidth: 500,
          width: '100%',
          p: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
          boxShadow: 6,
        }}
      >
        <TextField
          fullWidth
          type="file"
          onChange={handleImageChange}
          inputProps={{ accept: 'image/*' }}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Título del Artículo"
          name="titulo_articulo"
          value={formData.titulo_articulo}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Descripción del Artículo"
          name="descripcion_articulo"
          value={formData.descripcion_articulo}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
        />
        <TextField
          label="Institución del Artículo"
          name="institucion_articulo"
          value={formData.institucion_articulo}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Precio"
          name="precio_articulo"
          type="number"
          value={formData.precio_articulo}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />

        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel>Categoría</InputLabel>
          <Select
            name="id_categoria"
            value={formData.id_categoria}
            onChange={handleChange}
            label="Categoría"
          >
            {categorias.map((categoria) => (
              <MenuItem key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre_categoria}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Usuario actual"
          value={nombreUsuario}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 2,
            borderRadius: 5,
            backgroundColor: '#16a34a',
            color: 'white',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#15803d',
            },
          }}
        >
          Subir Artículo
        </Button>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() =>
                navigate(`/articulos/${articuloCreado?.id_articulo}`)
              }
            >
              Ver artículo
            </Button>
          }
        >
          🎉 ¡Artículo creado exitosamente!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearArticulo;
