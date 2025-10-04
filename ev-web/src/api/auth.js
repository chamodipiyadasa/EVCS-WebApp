import api from "./client";

// server expects /api/auth/login
export const login = async (username, password) => {
  const { data } = await api.post("/api/auth/login", { username, password });
  return data;
};
