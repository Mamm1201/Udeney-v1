import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Ahora toma la URL del archivo .env
});

//export const getAllArticulos = () => api.get("/articulos/");

export const getAllArticulos = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL}`);
};

export const postAllArticulos = async () => {
  return await axios.get(`${import.meta.env.VITE_API_URL}`);
};

//export const createArticulo = (data) => api.post("/articulos/", data);

//import axios from "axios";

//const articulosApi = axios.create({
//  baseURL: "http://127.0.0.1:8000/articulos/",
//});

// Obtener todos los artículos
//export const getAllArticulos = () => articulosApi.get("/");

// Crear un artículo (envía datos al backend)
//export const createArticulo = (data) => articulosApi.post("/", data);
