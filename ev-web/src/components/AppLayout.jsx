import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function AppLayout() {
  const nav = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-slate-900 text-slate-200 p-4 space-y-2">
        <div className="text-xl font-bold mb-4">EVCS</div>
        <Link to="/" className="block px-3 py-2 rounded hover:bg-slate-800">Dashboard</Link>
        {role === "Backoffice" && (
          <Link to="/owners" className="block px-3 py-2 rounded hover:bg-slate-800">Owners</Link>
        )}
        <Link to="/stations" className="block px-3 py-2 rounded hover:bg-slate-800">Stations</Link>
        <Link to="/bookings" className="block px-3 py-2 rounded hover:bg-slate-800">Bookings</Link>
        <div className="pt-4 border-t border-slate-700"></div>
        <div className="text-xs">Signed in as <b>{role}</b></div>
        <button onClick={() => { localStorage.removeItem("jwt"); nav("/login"); }}
          className="mt-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">
          Logout
        </button>
      </aside>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
