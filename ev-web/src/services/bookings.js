import { db } from './mockDb'
export async function listBookings(){ return [...db.bookings] }
export async function getBooking(id){ return db.bookings.find(b=>b.id===id) }
export async function createBooking(dto){
  const id = 'b'+(db.bookings.length+1)
  const b = { id, status:'Pending', ...dto }
  db.bookings.push(b); return b
}
export async function updateBooking(id, dto){
  const i = db.bookings.findIndex(b=>b.id===id)
  if(i>-1) db.bookings[i] = { ...db.bookings[i], ...dto }
  return db.bookings[i]
}
export async function deleteBooking(id){
  const i = db.bookings.findIndex(b=>b.id===id)
  if(i>-1) db.bookings.splice(i,1)
}
export async function approveBooking(id){
  const b = db.bookings.find(x=>x.id===id); if(b) b.status='Approved'
}
export async function generateQr(id){
  return { qrToken: 'QR-'+id+'-'+Math.random().toString(36).slice(2,8) }
}
