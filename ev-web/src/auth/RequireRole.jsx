import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireRole({ roles, children }) {
  const { isAuthed, role } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (roles.includes(role)) return children;
  return <Navigate to="/" replace />;
}
