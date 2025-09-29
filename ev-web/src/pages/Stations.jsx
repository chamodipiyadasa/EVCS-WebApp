import { useEffect, useState } from "react";
import { listStations, deactivateStation } from "../api/stations";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Stations() {
  const [stations, setStations] = useState([]);
  const load = async () => {
    try { setStations(await listStations()); }
    catch { toast.error("Failed to load stations"); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Stations</h1>
        <Link to="/stations/new" className="bg-blue-600 text-white px-3 py-2 rounded">Add Station</Link>
      </div>
      <table className="w-full border">
        <thead><tr><th>Name</th><th>Type</th><th>Slots</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {stations.map((s) => (
            <tr key={s.id} className="border-t">
              <td>{s.name}</td><td>{s.type}</td><td>{s.slots}</td><td>{s.active ? "Active":"Deactivated"}</td>
              <td className="space-x-2">
                <Link to={`/stations/${s.id}`} className="underline">Edit</Link>
                {s.active && <button className="text-red-600" onClick={async()=>{await deactivateStation(s.id); load();}}>Deactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
