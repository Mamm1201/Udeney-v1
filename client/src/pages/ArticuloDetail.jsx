import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import ArticuloCard from "../components/Articulos/ArticuloCard";
import Navbar from "../components/Navbar";
import Pie from "../components/Pie";
import { Box, Button } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCarrito } from "../context/CarritoContext";

const ArticuloDetail = () => {
  const { id } = useParams();
  const [articulo, setArticulo] = useState(null);
  const [error, setError] = useState("");
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/articulos/${id}/`
        );
        setArticulo(response.data);
      } catch (error) {
        setError("No se pudo cargar el artículo.");
      }
    };
    fetchArticulo();
  }, [id]);

  const handleAgregar = () => {
    if (articulo) {
      agregarAlCarrito(articulo);
    }
  };

  if (error) return <div>{error}</div>;
  if (!articulo) return <div>Cargando artículo...</div>;

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
          padding: "16px",
          gap: 2,
        }}
      >
        {/* Tu tarjeta actual intacta */}
        <ArticuloCard
          titulo_articulo={articulo.titulo_articulo}
          descripcion_articulo={articulo.descripcion_articulo}
          institucion_articulo={articulo.institucion_articulo}
          precio_articulo={articulo.precio_articulo}
          id_usuario={articulo.id_usuario}
          id_categoria={articulo.id_categoria}
          imagen={articulo.imagen}
        />

        {/* Botón añadir al carrito justo abajo */}
        <Button
          variant="contained"
          color="success"
          onClick={handleAgregar}
          startIcon={<ShoppingCartIcon />}
          sx={{ maxWidth: 345, width: "100%" }} // Ancho igual a la tarjeta
        >
          Añadir al carrito
        </Button>
      </Box>
      <Pie />
    </>
  );
};

export default ArticuloDetail;
