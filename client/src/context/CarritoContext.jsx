// src/context/CarritoContext.jsx
import { createContext, useContext, useState } from 'react';

// 1️⃣ Crear contexto global para el carrito
const CarritoContext = createContext();

// 2️⃣ Hook personalizado para usar el contexto
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    console.error('⚠️ useCarrito debe usarse dentro de un <CarritoProvider>');
    return {
      carrito: [],
      agregarAlCarrito: () => {},
      eliminarDelCarrito: () => {},
      vaciarCarrito: () => {},
    };
  }
  return context;
};

// 3️⃣ Proveedor del contexto del carrito
export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  // Agregar artículo al carrito (aumenta cantidad si ya existe)
  const agregarAlCarrito = item => {
    setCarrito(prev => {
      const existente = prev.find(i => i.id_articulo === item.id_articulo);
      if (existente) {
        return prev.map(i =>
          i.id_articulo === item.id_articulo
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  // Eliminar artículo del carrito
  const eliminarDelCarrito = id_articulo => {
    setCarrito(prev => prev.filter(i => i.id_articulo !== id_articulo));
  };

  // Vaciar todo el carrito
  const vaciarCarrito = () => setCarrito([]);

  // Proveer funciones y estado a los componentes hijos
  return (
    <CarritoContext.Provider
      value={{ carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
