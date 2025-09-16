// src/context/CarritoContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// 1️⃣ Crear contexto global para el carrito
const CarritoContext = createContext();

// Funciones auxiliares para localStorage
const getCarritoFromStorage = (userId) => {
  try {
    if (!userId) return [];
    const carrito = localStorage.getItem(`carrito_${userId}`);
    return carrito ? JSON.parse(carrito) : [];
  } catch {
    return [];
  }
};

const saveCarritoToStorage = (userId, carrito) => {
  try {
    if (userId) {
      localStorage.setItem(`carrito_${userId}`, JSON.stringify(carrito));
    }
  } catch (error) {
    console.error('Error guardando carrito:', error);
  }
};

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

  // Obtener usuario actual
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  // Cargar carrito del localStorage al inicializar
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const carritoGuardado = getCarritoFromStorage(user.id_usuario);
      setCarrito(carritoGuardado);
    }
  }, []);

  // Agregar artículo al carrito (aumenta cantidad si ya existe)
  const agregarAlCarrito = item => {
    const user = getCurrentUser();
    setCarrito(prev => {
      const existente = prev.find(i => i.id_articulo === item.id_articulo);
      let nuevoCarrito;

      if (existente) {
        nuevoCarrito = prev.map(i =>
          i.id_articulo === item.id_articulo
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      } else {
        nuevoCarrito = [...prev, { ...item, cantidad: 1, fechaAgregado: new Date().toISOString() }];
      }

      // Guardar en localStorage
      if (user) {
        saveCarritoToStorage(user.id_usuario, nuevoCarrito);
      }

      return nuevoCarrito;
    });
  };

  // Eliminar artículo del carrito
  const eliminarDelCarrito = id_articulo => {
    const user = getCurrentUser();
    setCarrito(prev => {
      const nuevoCarrito = prev.filter(i => i.id_articulo !== id_articulo);

      // Guardar en localStorage
      if (user) {
        saveCarritoToStorage(user.id_usuario, nuevoCarrito);
      }

      return nuevoCarrito;
    });
  };

  // Vaciar todo el carrito
  const vaciarCarrito = () => {
    const user = getCurrentUser();
    setCarrito([]);

    // Limpiar localStorage
    if (user) {
      saveCarritoToStorage(user.id_usuario, []);
    }
  };

  // Proveer funciones y estado a los componentes hijos
  return (
    <CarritoContext.Provider
      value={{ carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
