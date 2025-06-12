// src/api/transacciones.js
import api from "./axiosConfig";

// Obtener una transacción por ID
export const getTransaccionById = async (id) => {
  return await api.get(`/transacciones/${id}/`);
};

// Obtener detalle de la transacción por ID
export const getDetalleTransaccionById = async (id) => {
  return await api.get(`/detalle_transaccion/${id}/`);
};

// Crear transacción con detalles
export const crearTransaccionConDetalles = async (datos) => {
  return await api.post(`/transacciones/crear-con-detalles/`, datos);
};
