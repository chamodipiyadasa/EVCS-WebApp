import { useEffect, useState } from "react";
import { listBookings, approveBooking, cancelBooking, generateQr } from "../api/bookings";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const nav = useNavigate();
  const load = async ()=>{ try{setBookings(await listBookings());}catch{toast.error("Failed to load");} };
  useEffect(()=>{ load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Bookings</h1>
        <Link to="/bookings/new" className="bg-blue-600 text-white px-3 py-2 rounded">Add Booking</Link>
      </div>
      <table className="w-full border">
        <thead><tr><th>ID</th><th>Owner</th><th>Station</th><th>Start</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {bookings.map(b=>(
            <tr key={b.id} className="border-t">
              <td>{b.id}</td><td>{b.ownerNic}</td><td>{b.stationId}</td><td>{b.start}</td><td>{b.status}</td>
              <td className="space-x-2">
                {b.status==="Pending" && <button onClick={async()=>{await approveBooking(b.id); load();}}>Approve</button>}
                {(b.status==="Pending"||b.status==="Approved") && <button className="text-red-600" onClick={async()=>{await cancelBooking(b.id); load();}}>Cancel</button>}
                {b.status==="Approved" && <button onClick={async()=>{await generateQr(b.id); nav(`/bookings/${b.id}/qr`);}}>QR</button>}
                <Link to={`/bookings/${b.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
