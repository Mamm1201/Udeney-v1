// src/api/articulos.js
import api from "./axiosConfig";

// Obtener categorías
export const getCategorias = async () => {
  return await api.get("/categorias/");
};

// Obtener usuarios
export const getUsuarios = async () => {
  return await api.get("/usuarios/");
};

// Crear artículo
export const crearArticulo = async (data) => {
  return await api.post("/articulos/", data);
};

export const getAllArticulos = async () => {
  return await api.get("/articulos/");
};
