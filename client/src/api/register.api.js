import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ahora toma la URL del archivo .env
});

//export const getAllArticulos = () => api.get("/articulos/");

export const postAllUsuarios = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL}`);
};
