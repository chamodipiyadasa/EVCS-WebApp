// src/pages/RoleLanding.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { getMe } from "../services/users";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard"; // backoffice dashboard

export default function RoleLanding(){
  const { role } = useAuth();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function decide(){
      if (role === 'Operator') {
        const me = await getMe().catch(() => null);
        const sid = me?.assignedStationId;

        // You can choose to land on /app/operator (dashboard view) or go direct to station page.
        // Here we send them to the OperatorDashboard route.
        if (!cancelled) setTarget('/app/operator');

        // If you prefer deep-linking to station page:
        // if (!cancelled) setTarget(sid ? `/app/stations/${encodeURIComponent(sid)}` : '/app/stations');
      } else {
        // Backoffice: show main dashboard
        if (!cancelled) setTarget('backoffice');
      }
    }

    decide();
    return () => { cancelled = true; };
  }, [role]);

  if (!target) return <div className="py-10 text-center text-slate-500">Loading…</div>;

  if (role === 'Backoffice' && target === 'backoffice') return <Dashboard/>;
  if (role === 'Operator') return <Navigate to={target} replace />;

  return <Dashboard/>;
}
