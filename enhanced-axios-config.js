// ============================================================================
// CONFIGURACIÓN AVANZADA DE AXIOS CON REFRESH AUTOMÁTICO DE TOKENS
// ============================================================================

import axios from 'axios';

// Configuración base de axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
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

// Interceptor de request - agrega token automáticamente
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

// Interceptor de response - maneja renovación automática de tokens
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
        
        // Llamar al endpoint de refresh
        const response = await axios.post('http://localhost:8000/api/v1/token/refresh/', {
          refresh_token: refreshToken
        });

        const { access_token } = response.data;

        // Guardar el nuevo token
        localStorage.setItem('access_token', access_token);
        
        console.log('✅ AXIOS: Token renovado exitosamente');

        // Procesar cola de requests pendientes
        processQueue(null, access_token);
        
        // Reintentar la request original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.log('❌ AXIOS: Error al renovar token:', refreshError);
        
        // Limpiar tokens y redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        processQueue(refreshError, null);
        
        // Opcional: redirigir al login o mostrar modal
        // window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// FUNCIONES ESPECÍFICAS PARA GESTIÓN DE PERFIL
// ============================================================================

export const perfilAPI = {
  // Obtener datos del perfil actual
  obtenerPerfil: () => {
    return axiosInstance.get('/usuarios/me/');
  },

  // Actualizar perfil (actualización parcial)
  actualizarPerfil: (data) => {
    return axiosInstance.patch('/usuarios/me/', data);
  },

  // Actualizar perfil completo
  actualizarPerfilCompleto: (data) => {
    return axiosInstance.put('/usuarios/me/', data);
  },

  // Actualizar solo campos específicos
  actualizarCampo: (campo, valor) => {
    return axiosInstance.patch('/usuarios/me/', { [campo]: valor });
  }
};

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

export const authAPI = {
  // Login mejorado con manejo automático de tokens
  login: async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/login/', {
        email,
        password
      });

      const { access_token, refresh_token, ...userData } = response.data;

      // Guardar tokens automáticamente
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user_data', JSON.stringify(userData));

      console.log('✅ LOGIN: Tokens guardados automáticamente');
      
      return response.data;
    } catch (error) {
      console.log('❌ LOGIN: Error en autenticación:', error);
      throw error;
    }
  },

  // Logout mejorado
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    console.log('🔓 LOGOUT: Tokens eliminados');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Obtener datos del usuario guardados
  getUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

export default axiosInstance;