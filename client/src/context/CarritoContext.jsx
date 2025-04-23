// src/context/CarritoContext.jsx
import React, { createContext, useContext, useState } from "react";

// 1️⃣ Crear contexto
const CarritoContext = createContext();

// 2️⃣ Hook personalizado
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    console.error("⚠️ useCarrito debe usarse dentro de un <CarritoProvider>");
    return {
      carrito: [],
      agregarAlCarrito: () => {},
      eliminarDelCarrito: () => {},
      vaciarCarrito: () => {},
    };
  }
  return context;
};

// 3️⃣ Componente proveedor
export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = (item) => {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.id_articulo === item.id_articulo);
      if (existente) {
        return prev.map((i) =>
          i.id_articulo === item.id_articulo
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (id_articulo) => {
    setCarrito((prev) => prev.filter((i) => i.id_articulo !== id_articulo));
  };

  const vaciarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider
      value={{ carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
