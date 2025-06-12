import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './appRoutes';
import { CarritoProvider } from './context/CarritoContext';

//Envolver Carrito para qu quede global

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CarritoProvider>
      <AppRoutes />
    </CarritoProvider>
  </React.StrictMode>,
);
