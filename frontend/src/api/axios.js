import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://innovalabcenter-production.up.railway.app/api',
});

// Este "interceptor" pega el token automáticamente en cada llamada si existe
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;