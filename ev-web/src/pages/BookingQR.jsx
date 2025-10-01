import { useLocation, useParams } from 'react-router-dom'

export default function BookingQR(){
  const { state } = useLocation()
  const { id } = useParams()
  const token = state?.qrToken || 'QR-'+id
  return (
    <div className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">Booking QR</h1>
      <div className="w-56 h-56 bg-slate-100 grid place-items-center text-slate-400 rounded">QR</div>
      <div className="text-slate-600 text-sm">Token: {token}</div>
    </div>
  )
}
