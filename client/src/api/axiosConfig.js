// // src/api/axiosConfig.js
// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });

// // Intercepta respuestas para manejar errores
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       console.warn("Token inválido o sesión expirada");
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;

// src/api/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Intercepta solicitudes y añade el token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // o sessionStorage, según donde lo guardes
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ❗ Intercepta respuestas con error (por ejemplo 401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Token inválido o sesión expirada");
    }
    return Promise.reject(err);
  }
);

export default api;
