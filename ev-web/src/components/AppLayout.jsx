import { useState, useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

/* --- Inline SVG for your brand: green thunder inside a circle --- */
function ThunderLogo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="flex-shrink-0"
      aria-label="EVCS"
    >
      <circle cx="24" cy="24" r="22" fill="#10B981" /> {/* emerald-500 */}
      <path
        d="M26 6L12 28h8l-2 14 14-22h-8l2-14z"
        fill="white"
      />
    </svg>
  );
}

export default function AppLayout() {
  const { role, user } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const active = (path) =>
    loc.pathname === path
      ? "bg-emerald-600 text-white"
      : "text-slate-200 hover:bg-slate-800 hover:text-white";

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  /* Role menus (kept simple + professional) */
  const links = useMemo(() => {
    if (role === "Backoffice") {
      return [
        { to: "/app", label: "Dashboard" },
        { to: "/app/users", label: "Users" },
        { to: "/app/owners", label: "EV Owners" },
        { to: "/app/stations", label: "Stations" },
        { to: "/app/schedules", label: "Schedules" },
        { to: "/app/bookings", label: "Bookings" },
      ];
    }
    return [
      { to: "/app/operator", label: "My Station" },
      { to: "/app/operator/bookings", label: "Bookings" },
      { to: "/app/operator/scan", label: "Scan QR" },
    ];
  }, [role]);

  return (
    <div className="min-h-screen flex bg-white">
      {/* ---------- Mobile Top Bar ---------- */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-black text-white">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/10 p-1.5">
            <ThunderLogo size={24} />
          </div>
          <div className="text-[15px] font-semibold tracking-tight">EVCS</div>
        </div>
        <button
          onClick={() => setOpen((s) => !s)}
          className="rounded-md border border-white/10 px-3 py-1.5 hover:bg-white/10"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </header>

      {/* ---------- Sidebar (desktop) / Drawer (mobile) ---------- */}
      <aside
        className={[
          "fixed md:sticky md:top-0 z-40 md:z-auto left-0 top-0 h-full md:h-auto md:min-h-screen w-72 md:w-64",
          "bg-black text-white shadow-xl md:shadow-none transform transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <ThunderLogo size={28} />
          <div>
            <div className="text-xl font-bold tracking-tight">EVCS</div>
            <div className="text-[11px] text-emerald-400">Charging Platform</div>
          </div>
        </div>

        {/* Mobile brand row (inside drawer) */}
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ThunderLogo size={28} />
            <div className="text-lg font-semibold">EVCS Admin</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md border border-white/10 px-2.5 py-1 hover:bg-white/10"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Menu */}
        <nav className="px-3 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg ${active(l.to)}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-5 py-4 border-t border-white/10 text-sm">
          <div className="text-slate-300">
            <div className="text-xs">Signed in as</div>
            <div className="font-semibold text-white">{user?.username || "User"}</div>
            <div className="text-[11px] text-emerald-400">Role: {role}</div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ---------- Overlay for mobile drawer ---------- */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ---------- Main Content ---------- */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar (desktop) */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 p-1.5">
              <ThunderLogo size={22} />
            </div>
            <div className="text-xl font-bold tracking-tight text-black">
              EV Charging Station Platform
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Welcome, <span className="font-semibold text-black">{user?.username}</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
