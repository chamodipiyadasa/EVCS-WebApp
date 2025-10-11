// src/auth/useAuth.js
import { useMemo } from "react";

export function useAuth() {
  const token = localStorage.getItem("jwt") || "";
  const role = localStorage.getItem("role") || "";
  const username = localStorage.getItem("username") || "";

  // you can decode JWT here if you prefer, but we trust what /auth/login returned
  return useMemo(
    () => ({
      isAuthed: Boolean(token),
      role,
      user: { username, role },
      token,
    }),
    [token, role, username]
  );
}
