import axios from 'axios';

// Same-origin keeps the client on the public HTTPS host (including temporary tunnels).
// Set VITE_API_URL only when the API is intentionally served from another origin.
const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
export const ADMIN_UNAUTHORIZED_EVENT = 'hub:admin-unauthorized';

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// A vitrine nunca herda o interceptor do painel administrativo.
export const storefrontApi = axios.create({
    baseURL: apiBaseUrl,
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
        const isProtectedAdminRequest = error.config?.url?.startsWith('/admin/')
            && error.config.url !== '/admin/login';

        if (error.response?.status === 401 && isProtectedAdminRequest) {
            sessionStorage.removeItem('hub_admin_token');
            window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
        }

        return Promise.reject(error);
    }
);

export default api;
