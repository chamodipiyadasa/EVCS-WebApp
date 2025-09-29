import { useParams } from "react-router-dom";

export default function BookingQR() {
  const { id } = useParams();
  return (
    <div className="text-center space-y-3">
      <h1 className="text-xl font-semibold">Booking QR</h1>
      <div className="w-56 h-56 bg-slate-100 grid place-items-center text-slate-400 rounded">QR Code</div>
      <div>Booking ID: {id}</div>
    </div>
  );
}
