import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importaciones de páginas
import Articulos from "./pages/Articulos";
import ArticuloDetail from "./pages/ArticuloDetail";
import Login from "./pages/Login";
import Rol from "./pages/Rol";
import CrearArticulo from "./pages/CrearArticulo";
import Registro from "./pages/Registro";
import Comprar from "./pages/Comprar";
import App from "./pages/App";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import UserProfile from "./pages/UserProfile";
import ActualizarDatos from "./pages/ActualizarDatos";
import HistorialTransacciones from "./pages/HistorialTransacciones";
import MisArticulos from "./pages/MisArticulos";
import EditarArticulo from "./pages/EditarArticulo";
import Carrito from "./pages/Carrito";
import ResumenCompra from "./pages/ResumenCompra";
import DetalleTransaccion from "./pages/DetalleTransaccion";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* --- Rutas Públicas --- */}
        {/* Página de inicio y contenido estático */}
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Catálogo de artículos (acceso público) */}
        <Route path="/articulos" element={<Articulos />} />
        <Route path="/articulos/:id" element={<ArticuloDetail />} />

        {/* Proceso de compra */}
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="/resumen/:id" element={<ResumenCompra />} />

        {/* --- Rutas Protegidas (requieren autenticación) --- */}
        {/* Gestión de artículos del usuario */}
        <Route path="/mis-articulos" element={<MisArticulos />} />
        <Route path="/crear-articulo" element={<CrearArticulo />} />
        <Route
          path="/editar-articulo/:id_articulo"
          element={<EditarArticulo />}
        />

        {/* Perfil de usuario */}
        <Route path="/user" element={<UserProfile />} />
        <Route path="/actualizar-datos" element={<ActualizarDatos />} />
        <Route
          path="/historial-transacciones"
          element={<HistorialTransacciones />}
        />
        <Route
          path="/detalle-transaccion/:id"
          element={<DetalleTransaccion />}
        />

        {/* Administración */}
        <Route path="/rol" element={<Rol />} />

        {/* Ruta de aplicación principal (¿quizá redirija a dashboard?) */}
        <Route path="/app" element={<App />} />

        {/* Ruta para manejar páginas no encontradas (opcional) */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
