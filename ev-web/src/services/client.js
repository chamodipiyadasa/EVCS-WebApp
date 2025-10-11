import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5132/api", // your .NET API port
});

// attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
