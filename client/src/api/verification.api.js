import api from './axiosConfig';

// API para verificación de email
export const verificationApi = {
  // Verificar token de email
  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/verify-email/${token}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reenviar email de verificación
  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post('/resend-verification/', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar estado de verificación
  checkVerificationStatus: async (email) => {
    try {
      const response = await api.get(`/verification-status/?email=${email}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default verificationApi;