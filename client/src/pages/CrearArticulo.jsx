import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const CrearArticulo = () => {
  const [formData, setFormData] = useState({
    titulo_articulo: "",
    descripcion_articulo: "",
    institucion_articulo: "",
    precio_articulo: "",
    id_categoria: "",
    id_usuario: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchCategoriasYUsuarios = async () => {
      try {
        const categoriasResponse = await axios.get(
          "http://127.0.0.1:8000/categorias/"
        );
        const usuariosResponse = await axios.get(
          "http://127.0.0.1:8000/usuarios/"
        );

        console.log("Categorías:", categoriasResponse.data);
        console.log("Usuarios:", usuariosResponse.data);

        setCategorias(categoriasResponse.data);
        setUsuarios(usuariosResponse.data);
      } catch (error) {
        console.error("Error al obtener categorías o usuarios:", error);
      }
    };
    fetchCategoriasYUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "id_categoria" || name === "id_usuario"
          ? parseInt(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/articulos/",
        formData
      );

      if (response.status === 201) {
        alert("Artículo creado exitosamente");
        setFormData({
          titulo_articulo: "",
          descripcion_articulo: "",
          institucion_articulo: "",
          precio_articulo: "",
          id_categoria: "",
          id_usuario: "",
        });
      } else {
        alert("Error al crear artículo: " + JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error al crear artículo:", error.response?.data || error);
      alert("Error al crear artículo: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 2,
        backgroundColor: "#f4f6f8",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Crear Nuevo Artículo
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 500,
          padding: 3,
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: 4,
        }}
      >
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
          <InputLabel>Categoria</InputLabel>
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
        <FormControl variant="outlined" margin="normal" fullWidth>
          <InputLabel>Usuario</InputLabel>
          <Select
            name="id_usuario"
            value={formData.id_usuario}
            onChange={handleChange}
            label="Usuario"
          >
            {usuarios.map((usuario) => (
              <MenuItem key={usuario.id_usuario} value={usuario.id_usuario}>
                {usuario.nombres_usuario} {usuario.apellidos_usuario}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            marginTop: 2,
            padding: "10px 0",
            fontSize: "16px",
          }}
        >
          Crear Artículo
        </Button>
      </Box>
    </Box>
  );
};

export default CrearArticulo;
