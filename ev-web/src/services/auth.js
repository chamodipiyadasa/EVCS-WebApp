import api from "../api/client";

export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  // store JWT
  localStorage.setItem("jwt", data.token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("username", data.username);
  return { token: data.token, role: data.role, username };
}
