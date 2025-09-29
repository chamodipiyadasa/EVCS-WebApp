import { useMemo } from "react";

export function useAuth() {
  const token = localStorage.getItem("jwt");
  const role = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.role || null;
    } catch {
      return null;
    }
  }, [token]);
  return { token, role, isAuthed: !!token };
}
