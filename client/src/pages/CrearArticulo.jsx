import React, { useState, useEffect } from 'react';
import NavbarVender from '../components/NavbarVender';
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
} from '@mui/material';
import { getCategorias, crearArticulo } from '../api/articulos.api';

const CrearArticulo = () => {
  const navigate = useNavigate();

  // Obtenemos datos del usuario logueado desde localStorage
  const idUsuario = localStorage.getItem('id_usuario');
  const nombreUsuario = localStorage.getItem('nombres_usuario');

  // Estado para el formulario, con el ID del usuario ya cargado
  const [formData, setFormData] = useState({
    titulo_articulo: '',
    descripcion_articulo: '',
    institucion_articulo: '',
    precio_articulo: '',
    id_categoria: '',
    id_usuario: parseInt(idUsuario),
  });

  const [imagen, setImagen] = useState(null); // Imagen seleccionada
  const [categorias, setCategorias] = useState([]); // Lista de categorías
  const [articuloCreado, setArticuloCreado] = useState(null); // Artículo creado
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Estado del snackbar

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        console.log('Categorías recibidas:', res.data); // 👈 Asegúrate que esto muestra un array
        setCategorias(res.data);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  // Actualizar campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'id_categoria' ? parseInt(value) : value,
    }));
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
    }
  };

  // Enviar formulario
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
      data.append('imagen', imagen); // adjuntamos la imagen
    }

    try {
      const response = await crearArticulo(data); // debe aceptar FormData
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
      console.log('Detalles del error:', error.response?.data);
      alert('Error al crear artículo: ' + error.message);
      console.log('Detalles:', error.response?.data);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 0,
        backgroundColor: '#f4f6f8',
      }}
    >
      <NavbarVender />

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
        {/* Subir imagen */}
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

        {/* Select de categorías */}
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

        {/* Usuario actual mostrado (solo lectura) */}
        <TextField
          label="Usuario actual"
          value={nombreUsuario}
          margin="normal"
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 4,
            marginTop: 2,
            padding: '10px 0',
            fontSize: '16px',
          }}
        >
          Subir Artículo
        </Button>
      </Box>

      {/* Snackbar de éxito */}
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
