import axios from "axios";

// Use VITE_API_BASE when available, otherwise fall back to localhost backend.
// This prevents accidental requests to the Vite dev server (which returns HTML)
// when the env var is not set during development.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5132';
console.debug('[api] using base URL:', API_BASE)
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("jwt");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
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
