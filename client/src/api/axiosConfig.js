// ============================================================================
// CONFIGURACIÓN AVANZADA DE AXIOS CON REFRESH AUTOMÁTICO DE TOKENS
// ============================================================================

import axios from 'axios';

// Configuración base de axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Variable para controlar si ya se está renovando el token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// =====================================
// INTERCEPTOR DE SOLICITUDES (REQUEST)
// =====================================

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 AXIOS: Token agregado automáticamente');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================
// INTERCEPTOR DE RESPUESTAS (RESPONSE) - CON RENOVACIÓN AUTOMÁTICA
// =====================================

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (token expirado) y no es una request de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si ya se está renovando el token, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 AXIOS: Renovando token automáticamente...');
        
        // Llamar al endpoint de refresh (formato estándar DRF SimpleJWT)
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;

        // Guardar el nuevo token
        localStorage.setItem('access_token', access);
        
        console.log('✅ AXIOS: Token renovado exitosamente');

        // Procesar cola de requests pendientes
        processQueue(null, access);
        
        // Reintentar la request original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.log('❌ AXIOS: Error al renovar token:', refreshError);
        
        // Limpiar tokens y procesar cola con error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user');
        
        processQueue(refreshError, null);
        
        // El error se propaga para que el componente lo maneje
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
