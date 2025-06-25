import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 👇 Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ No autorizado. Puede que el token esté vencido.");
      // También podrías redirigir o mostrar un mensaje global
    }
    return Promise.reject(error);
  },
);

// 🟢 Función para hacer login
export const loginUser = async (credentials) => {
  return await api.post("/login/", credentials);
};

// 🟢 Función para registro si la necesitas luego
export const registerUser = async (data) => {
  return await api.post("/register/", data);
};
