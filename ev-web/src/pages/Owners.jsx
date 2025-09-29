import { useEffect, useState } from "react";
import { listOwners, deactivateOwner, reactivateOwner } from "../api/owners";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Owners() {
  const [owners, setOwners] = useState([]);

  const load = async () => {
    try {
      const data = await listOwners();
      setOwners(data);
    } catch {
      toast.error("Failed to load owners");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">EV Owners</h1>
        <Link to="/owners/new" className="bg-blue-600 text-white px-3 py-2 rounded">Add Owner</Link>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="text-left text-slate-500 text-sm">
            <th>NIC</th><th>Name</th><th>Email</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((o) => (
            <tr key={o.nic} className="border-t">
              <td>{o.nic}</td>
              <td>{o.fullName}</td>
              <td>{o.email}</td>
              <td>{o.active ? "Active" : "Deactivated"}</td>
              <td className="space-x-2">
                <Link className="underline" to={`/owners/${o.nic}`}>Edit</Link>
                {o.active ? (
                  <button className="text-red-600" onClick={async ()=>{await deactivateOwner(o.nic); toast.success("Deactivated"); load();}}>
                    Deactivate
                  </button>
                ) : (
                  <button className="text-green-700" onClick={async ()=>{await reactivateOwner(o.nic); toast.success("Reactivated"); load();}}>
                    Reactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
