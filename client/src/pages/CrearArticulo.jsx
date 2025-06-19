import React, { useState, useEffect } from "react";
import NavbarVender from "../components/NavbarVender";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { getCategorias, crearArticulo } from "../api/articulos.api";

const CrearArticulo = () => {
  const navigate = useNavigate();

  // Obtener datos del usuario desde localStorage
  const idUsuario = localStorage.getItem("id_usuario");
  const nombreUsuario = localStorage.getItem("nombres_usuario");

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo_articulo: "",
    descripcion_articulo: "",
    institucion_articulo: "",
    precio_articulo: "",
    id_categoria: "",
    estado_articulo: "Bueno", // Valor por defecto
    id_usuario: parseInt(idUsuario),
  });

  const [imagen, setImagen] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [articuloCreado, setArticuloCreado] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Obtener categorías desde la API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(res.data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "id_categoria" ? parseInt(value) : value,
    }));
  };

  // Maneja el cambio de archivo de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagen(file);
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_categoria) {
      alert("Por favor selecciona una categoría.");
      return;
    }

    const data = new FormData();
    data.append("titulo_articulo", formData.titulo_articulo);
    data.append("descripcion_articulo", formData.descripcion_articulo);
    data.append("institucion_articulo", formData.institucion_articulo);
    data.append("precio_articulo", formData.precio_articulo);
    data.append("id_categoria", formData.id_categoria);
    data.append("estado_articulo", formData.estado_articulo); // ✅ Nuevo campo
    data.append("id_usuario", formData.id_usuario);
    if (imagen) data.append("imagen", imagen);

    try {
      const response = await crearArticulo(data);
      if (response.status === 201) {
        setArticuloCreado(response.data);
        setSnackbarOpen(true);

        // Reiniciar formulario
        setFormData({
          titulo_articulo: "",
          descripcion_articulo: "",
          institucion_articulo: "",
          precio_articulo: "",
          id_categoria: "",
          estado_articulo: "Bueno",
          id_usuario: parseInt(idUsuario),
        });
        setImagen(null);
      }
    } catch (error) {
      console.error("Error al crear artículo:", error);
      alert("Error al crear artículo: " + error.message);
    }
  };

  return (
    <>
      <NavbarVender />

      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#e9ecef",
          paddingTop: 8,
          paddingBottom: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            maxWidth: 500,
            backgroundColor: "#ffffff",
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
            marginX: 2,
          }}
        >
          {/* Imagen */}
          <TextField
            fullWidth
            type="file"
            onChange={handleImageChange}
            inputProps={{ accept: "image/*" }}
            sx={{ mt: 1 }}
          />

          {/* Título */}
          <TextField
            label="Título del Artículo"
            name="titulo_articulo"
            value={formData.titulo_articulo}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />

          {/* Descripción */}
          <TextField
            label="Descripción del Artículo"
            name="descripcion_articulo"
            value={formData.descripcion_articulo}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            fullWidth
          />

          {/* Institución */}
          <TextField
            label="Institución del Artículo"
            name="institucion_articulo"
            value={formData.institucion_articulo}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />

          {/* Precio */}
          <TextField
            label="Precio"
            name="precio_articulo"
            value={formData.precio_articulo}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="number"
            fullWidth
          />

          {/* Categoría */}
          <FormControl variant="outlined" margin="normal" fullWidth required>
            <InputLabel>Categoría</InputLabel>
            <Select
              name="id_categoria"
              value={formData.id_categoria || ""}
              onChange={handleChange}
              label="Categoría"
            >
              <MenuItem value="">
                <em>Selecciona una categoría</em>
              </MenuItem>
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

          {/* Estado del artículo */}
          <FormControl variant="outlined" margin="normal" fullWidth required>
            <InputLabel>Estado del Artículo</InputLabel>
            <Select
              name="estado_articulo"
              value={formData.estado_articulo}
              onChange={handleChange}
              label="Estado del Artículo"
            >
              <MenuItem value="Nuevo">Nuevo</MenuItem>
              <MenuItem value="Bueno">Bueno</MenuItem>
              <MenuItem value="Regular">Regular</MenuItem>
              <MenuItem value="Dañado">Dañado</MenuItem>
            </Select>
          </FormControl>

          {/* Usuario */}
          <TextField
            label="Usuario actual"
            value={nombreUsuario || ""}
            margin="normal"
            fullWidth
            InputProps={{ readOnly: true }}
          />

          {/* Botón */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              borderRadius: 4,
              marginTop: 2,
              padding: "10px 0",
              fontSize: "16px",
            }}
          >
            Subir Artículo
          </Button>
        </Box>
      </Box>

      {/* Snackbar de éxito */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
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
    </>
  );
};

export default CrearArticulo;
