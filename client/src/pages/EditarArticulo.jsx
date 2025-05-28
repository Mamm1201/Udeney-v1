import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Stack,
} from '@mui/material';
import { getCategorias, editarArticulo } from '../api/articulos.api';
import api from '../api/axiosConfig';

const EditarArticulo = () => {
  const navigate = useNavigate();
  const { id_articulo } = useParams();
  const idUsuario = localStorage.getItem('id_usuario');

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
  const [articuloActual, setArticuloActual] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(res.data);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      }
    };

    const fetchArticulo = async () => {
      try {
        const res = await api.get(`/articulos/${id_articulo}/`);
        setArticuloActual(res.data);
        setFormData({
          titulo_articulo: res.data.titulo_articulo,
          descripcion_articulo: res.data.descripcion_articulo,
          institucion_articulo: res.data.institucion_articulo,
          precio_articulo: res.data.precio_articulo,
          id_categoria: res.data.id_categoria,
          id_usuario: res.data.id_usuario,
        });
      } catch (error) {
        console.error('Error al obtener artículo:', error);
      }
    };

    fetchCategorias();
    fetchArticulo();
  }, [id_articulo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'id_categoria' ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('titulo_articulo', formData.titulo_articulo);
    data.append('descripcion_articulo', formData.descripcion_articulo);
    data.append('institucion_articulo', formData.institucion_articulo);
    data.append('precio_articulo', formData.precio_articulo);
    data.append('id_categoria', formData.id_categoria);
    data.append('id_usuario', formData.id_usuario);
    if (imagen) {
      data.append('imagen', imagen);
    }

    try {
      const response = await editarArticulo(id_articulo, data);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: '✅ Artículo actualizado con éxito',
        });
        setTimeout(() => {
          navigate(`/articulos/${id_articulo}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      setSnackbar({
        open: true,
        message: '❌ Error al actualizar el artículo',
      });
    }
  };

  if (!articuloActual) return <div>Cargando artículo...</div>;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 0,
        backgroundColor: '#f4f6f8',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 500,
          padding: 3,
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: 4,
        }}
      >
        <TextField
          fullWidth
          type="file"
          onChange={handleImageChange}
          inputProps={{ accept: 'image/*' }}
          sx={{ mt: 2 }}
        />

        <TextField
          label="Título del Artículo"
          name="titulo_articulo"
          value={formData.titulo_articulo}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Descripción del Artículo"
          name="descripcion_articulo"
          value={formData.descripcion_articulo}
          onChange={handleChange}
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
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Precio"
          name="precio_articulo"
          value={formData.precio_articulo}
          onChange={handleChange}
          variant="outlined"
          margin="normal"
          type="number"
        />

        <FormControl variant="outlined" margin="normal" fullWidth>
          <InputLabel>Categoría</InputLabel>
          <Select
            name="id_categoria"
            value={formData.id_categoria}
            onChange={handleChange}
            label="Categoría"
          >
            {categorias.map((categoria) => (
              <MenuItem
                key={categoria.id_categoria}
                value={categoria.id_categoria}
              >
                {categoria.nombre_categoria}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Botones de acción */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          mt={3}
        >
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={() => navigate(-1)} // Regresa a la página anterior
          >
            Cancelar
          </Button>

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Actualizar Artículo
          </Button>
        </Stack>
      </Box>

      {/* Snackbar de confirmación */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ open: false, message: '' })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditarArticulo;
