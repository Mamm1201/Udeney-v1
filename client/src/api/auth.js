export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/token/`,
      {
        username: email, // Corregido para que Django lo acepte
        password,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
