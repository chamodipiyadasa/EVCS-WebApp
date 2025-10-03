// src/components/SiteNav.jsx
import { Link } from "react-router-dom";

export default function SiteNav() {
  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 grid place-items-center text-white font-bold">
            ⚡
          </div>
          <span className="text-lg font-semibold tracking-tight">EVCS</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
