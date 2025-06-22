// src/api/transacciones.js
import api from "./axiosConfig";

// Obtener todas las transacciones
export const getTransacciones = async () => {
  return await api.get("/transacciones/");
};

// Obtener una transacción por ID
export const getTransaccionById = async (id) => {
  return await api.get(`/transacciones/${id}/`);
};

// Obtener detalle de la transacción por ID
export const getDetalleTransaccionById = async (id) => {
  return await api.get(`/detalle_transaccion/${id}/`);
};

// Crear transacción con detalles
// export const crearTransaccionConDetalles = async (datos) => {
//   return await api.post(`/transacciones/crear-con-detalles/`, datos);
// };

export const crearTransaccionConDetalles = async (datos) => {
  return await api.post(`/crear-transaccion/`, datos);
};

// Obtener resumen de la compra completo
export const getResumenCompraByTransaccionId = async (id) => {
  return await api.get(`/resumen-compra/${id}/`);
};

// Obtener transacciones del usuario autenticado con filtros
export const getMisTransacciones = async (params) => {
  const token = localStorage.getItem("access_token");
  return await api.get("/mis-transacciones/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
};
