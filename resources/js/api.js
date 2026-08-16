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
    const token = localStorage.getItem('hub_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;