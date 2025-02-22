import axios from "axios";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post("/api/login/", { email, password });
    return response.data; // Retorna los datos del usuario autenticado
  } catch (error) {
    throw error.response?.data?.error || "Error en el inicio de sesión";
  }
};
