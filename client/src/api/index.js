// import axiosInstance from "./axiosInstance";
// export const API_URL = import.meta.env.VITE_API_URL; // ✅ Esto habilita el import

// // ✅ Para enviar mensajes
// export const enviarMensaje = async (mensajeData) => {
//   const response = await axiosInstance.post("/mensajes/", mensajeData);
//   return response.data;
// };

// // ✅ Para obtener PQRS con filtros (ya funcionaba bien)
// export const getPQRS = async (filtros = {}) => {
//   const params = new URLSearchParams(filtros).toString();
//   const url = `/pqrs/${params ? "?" + params : ""}`;
//   const response = await axiosInstance.get(url);
//   return response.data;
// };

import axios from "axios";

// Usar la variable de entorno
const API_URL = import.meta.env.VITE_API_URL;

export const getPQRS = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString();
  const url = `${API_URL}/pqrs/${params ? "?" + params : ""}`;
  const response = await axios.get(url);
  return response.data;
};
