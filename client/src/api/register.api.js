import api from "./axiosConfig"; // Este archivo contiene la baseURL desde .env

// ✅ Función para registrar un nuevo usuario (usa la vista RegistroUsuarioView del backend)
export const registrarUsuario = async (data) => {
  return await api.post("/register/", data); // Asegúrate de que esta ruta exista en Django
};

// (Opcional) Si luego necesitas obtener usuarios:
export const obtenerUsuarios = async () => {
  return await api.get("/usuarios/");
};
