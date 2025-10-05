// src/auth/RequireRole.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireRole({ roles = [], children }) {
  const { isAuthed, role } = useAuth();
  const loc = useLocation();

  // not logged in → go to login
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  // role not allowed → friendly message
  if (roles.length > 0 && !roles.includes(role)) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Not authorized for this page</h1>
        <div className="text-slate-600">
          Current role: <b>{role || "unknown"}</b>
        </div>
        <div className="mt-4">
          <a
            href="/app"
            className="inline-block bg-slate-900 text-white px-4 py-2 rounded"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
