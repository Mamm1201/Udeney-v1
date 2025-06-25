import { useState, useEffect } from "react";
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
  Typography,
} from "@mui/material";
import { getCategorias, crearArticulo } from "../api/articulos.api";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const CrearArticulo = () => {
  const navigate = useNavigate();
  const idUsuario = localStorage.getItem("id_usuario");
  const nombreUsuario = localStorage.getItem("nombres_usuario");

  const [formData, setFormData] = useState({
    titulo_articulo: "",
    descripcion_articulo: "",
    institucion_articulo: "",
    precio_articulo: "",
    id_categoria: "",
    id_usuario: parseInt(idUsuario),
  });

  const [imagen, setImagen] = useState(null);
  const [categorias, setCategorias] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "id_categoria" ? parseInt(value) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagen(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_categoria) {
      alert("Por favor selecciona una categoría antes de enviar.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value)
    );
    if (imagen) data.append("imagen", imagen);

    try {
      const res = await crearArticulo(data);
      if (res.status === 201) {
        const idArticulo = res.data.id_articulo;
        navigate(`/resumen-venta/${idArticulo}`);
      }
    } catch (err) {
      console.error("Error al crear artículo:", err);
      alert("Error al crear artículo: " + err.message);
    }
  };

  const inputFocusStyle = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#ccc",
        transition: "0.3s ease",
      },
      "&:hover fieldset": {
        borderColor: "#468C8C",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#468C8C",
        boxShadow: "0 0 8px 4px rgba(70, 140, 140, 0.75)",
      },
    },
  };

  return (
    <>
      <NavbarVender />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#fff",
          paddingTop: 10,
          paddingBottom: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", maxWidth: 900, px: 6, py: 4 }}
        >
          <Typography variant="body2" sx={{ color: "#d97706", mb: 3 }}>
            Solo aceptamos artículos en buen estado.{" "}
            
          </Typography>

          <Box
            sx={{
              border: "2px dashed #468C8C",
              borderRadius: 2,
              p: 4,
              my: 2,
              backgroundColor: "#f0fdfa",
              textAlign: "center",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <PhotoCameraIcon sx={{ fontSize: 50, color: "#468C8C" }} />
            </Box>
            <Button
              variant="contained"
              component="label"
              sx={{
                backgroundColor: "#468C8C",
                color: "#fff",
                ":hover": { backgroundColor: "#3b7c7c" },
              }}
            >
              Seleccionar fotos
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
              Tamaño recomendado: 1080x1080px.
            </Typography>

            {/* Vista previa de imagen */}
            {imagen && (
              <Box mt={2}>
                <img
                  src={URL.createObjectURL(imagen)}
                  alt="Vista previa"
                  style={{ maxWidth: "100%", maxHeight: 300, marginTop: 10 }}
                />
              </Box>
            )}
          </Box>

          <TextField
            label="Un buen título debe ser claro y descriptivo."
            name="titulo_articulo"
            value={formData.titulo_articulo}
            onChange={handleChange}
            fullWidth
            required
            sx={{ my: 2, ...inputFocusStyle }}
          />

          <TextField
            label="Cuéntanos más de tu artículo"
            name="descripcion_articulo"
            value={formData.descripcion_articulo}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            required
            placeholder="Describe tu artículo con precisión: tamaño, estado, materiales y cualquier detalle que lo haga especial. Una buena descripción atrae más compradores..."
            sx={{ my: 2, ...inputFocusStyle }}
          />

          <TextField
            label="Institución"
            name="institucion_articulo"
            value={formData.institucion_articulo}
            onChange={handleChange}
            fullWidth
            sx={{ my: 2, ...inputFocusStyle }}
          />

          <TextField
            label="Precio"
            name="precio_articulo"
            value={formData.precio_articulo}
            onChange={handleChange}
            type="number"
            fullWidth
            required
            sx={{ my: 2, ...inputFocusStyle }}
          />

          <FormControl fullWidth required sx={{ my: 2, ...inputFocusStyle }}>
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
              {categorias.map((cat) => (
                <MenuItem key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Usuario actual"
            value={nombreUsuario || ""}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ my: 2, ...inputFocusStyle }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 4,
              py: 1.5,
              fontWeight: "bold",
              backgroundColor: "#468C8C",
              ":hover": { backgroundColor: "#3b7c7c" },
            }}
          >
            Continuar
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CrearArticulo;
