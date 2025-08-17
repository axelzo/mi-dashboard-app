import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

// Interceptor to add the token to requests
api.interceptors.request.use(
  (config) => {
    // Check if running in browser environment before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;


// Auth API
export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const register = async (data: any) => {
  const response = await api.post('/auth/register', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Clothing API
export const getClothingItems = async () => {
  const response = await api.get('/clothing');
  return response.data;
};

export const addClothingItem = async (item: FormData) => {
  const response = await api.post('/clothing', item, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateClothingItem = async (id: string, data: FormData) => {
  const response = await api.put(`/clothing/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteClothingItem = async (id: string) => {
  const response = await api.delete(`/clothing/${id}`);
  return response.data;
};