import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// Componentes personalizados
import ArticuloCard from "../components/Articulos/ArticuloCard";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";

// MUI
import { Box, CircularProgress, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

// Contexto del carrito
import { useCarrito } from "../context/CarritoContext";

// Componente principal
const ArticuloDetail = () => {
  const { id } = useParams();
  const [articulo, setArticulo] = useState(null);
  const [error, setError] = useState("");
  const { agregarAlCarrito } = useCarrito();

  // Traer datos del artículo al cargar el componente
  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/articulos/${id}/`,
        );
        setArticulo(response.data);
      } catch (error) {
        setError("No se pudo cargar el artículo.");
      }
    };
    fetchArticulo();
  }, [id]);

  // Maneja la acción de agregar al carrito
  const handleAgregar = () => {
    if (articulo) {
      agregarAlCarrito(articulo);
    }
  };

  // Estado de error
  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Estado de carga
  if (!articulo) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <>
      <Navbar />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "80vh",
          backgroundColor: "#e0f7fa",
          padding: 2,
        }}
      >
        {/* ArticuloCard con el botón incluido como prop */}
        <ArticuloCard
          titulo_articulo={articulo.titulo_articulo}
          descripcion_articulo={articulo.descripcion_articulo}
          institucion_articulo={articulo.institucion_articulo}
          precio_articulo={articulo.precio_articulo}
          id_usuario={articulo.id_usuario}
          id_categoria={articulo.id_categoria}
          imagen={articulo.imagen}
          // ✅ Añadimos la acción personalizada como prop
          onAgregarAlCarrito={handleAgregar}
          mostrarBotonCarrito
        />
      </Box>

      <Pie />
    </>
  );
};

export default ArticuloDetail;
