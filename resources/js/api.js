import axios from 'axios';

const api = axios.create({
    // Lê a variável do .env, se não achar, usa o localhost por segurança
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para injetar o Token de Login automaticamente
api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('hub_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('hub_admin_token');
        }
        return Promise.reject(error);
    }
);

export default api;