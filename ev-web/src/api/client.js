import axios from "axios";

// Use VITE_API_BASE when available, otherwise fall back to localhost backend.
// This prevents accidental requests to the Vite dev server (which returns HTML)
// when the env var is not set during development.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5132';
console.debug('[api] using base URL:', API_BASE)
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(cfg => {
  // Support both real JWT (from backend) and mock token used in development
  const raw = localStorage.getItem("jwt") || localStorage.getItem('jwt_mock');
  // Only attach Authorization when token looks like a JWT/JWE compact string (contains at least two dots)
  if (raw && typeof raw === 'string' && raw.split('.').length >= 3) {
    cfg.headers.Authorization = `Bearer ${raw}`
  }
  console.debug('[api] request', cfg.method, cfg.baseURL + cfg.url, cfg.headers)
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem("jwt");
    window.location.href = "/login";
  }
  return Promise.reject(err);
});

export default api;
