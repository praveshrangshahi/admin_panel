import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jayantassociatebackend.vercel.app';

// Create Axios instance
const api = axios.create({
    baseURL: `${BASE_URL}/api`, // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Resolves a file path to a full URL using the centralized BASE_URL.
 * Handles absolute URLs, data URIs, and relative paths.
 */
export const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
};

// Add Interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo'); // Or wherever you store it
        if (userInfo) {
            const token = JSON.parse(userInfo).token;
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        const selectedBranch = localStorage.getItem('selectedBranch');
        if (selectedBranch) {
            config.headers['x-branch-id'] = selectedBranch;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
