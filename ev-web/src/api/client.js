import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });

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
