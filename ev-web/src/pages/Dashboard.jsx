import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { role } = useAuth();
  const isBackoffice = role === "Backoffice";

  return (
    <div className="space-y-4">
      <div className={`grid ${isBackoffice ? "grid-cols-4" : "grid-cols-2"} gap-4`}>
        <Kpi title="Pending Reservations" value="3" />
        <Kpi title="Approved (Upcoming)" value="5" />
        {isBackoffice && <Kpi title="Total Stations" value="12" />}
        {isBackoffice && <Kpi title="Active EV Owners" value="8" />}
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
