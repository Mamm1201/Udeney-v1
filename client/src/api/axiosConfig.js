// =====================================
// CONFIGURACIÓN DE AXIOS PARA API
// =====================================

import axios from 'axios';

// ✅ Crear instancia base de Axios con la URL del backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Asegúrate de que esté definida en .env
});

// =====================================
// INTERCEPTOR DE SOLICITUDES (REQUEST)
// =====================================

// ✅ Solo añade el token JWT si la ruta lo requiere
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');

  // Lista de rutas protegidas que requieren autenticación
  const rutasProtegidas = [
    '/mis-transacciones',
    '/crear-con-detalles',
    '/api/v1/pagos/',
    '/api/v1/pqrs/',
  ];

  // Verifica si la URL actual es una de las protegidas
  const requiereToken = rutasProtegidas.some(ruta => config.url.includes(ruta));

  // Añadir encabezado Authorization solo si es necesario
  if (token && requiereToken) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =====================================
// INTERCEPTOR DE RESPUESTAS (RESPONSE)
// =====================================

// ✅ Maneja errores comunes, como token expirado
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Token inválido o sesión expirada');
      // Aquí puedes redirigir al login o limpiar el token si quieres
    }
    return Promise.reject(error);
  }
);

export default api;
