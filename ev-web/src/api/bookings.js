import api from "./client";

// List all bookings (optionally filter by owner/station/status if backend supports query params)
export const listBookings = () =>
  api.get("/bookings").then(r => r.data);

// Get booking by ID
export const getBooking = (id) =>
  api.get(`/bookings/${id}`).then(r => r.data);

// Create booking
export const createBooking = (dto) =>
  api.post("/bookings", dto).then(r => r.data);

// Update booking
export const updateBooking = (id, dto) =>
  api.put(`/bookings/${id}`, dto).then(r => r.data);

// Cancel booking
export const cancelBooking = (id) =>
  api.delete(`/bookings/${id}`).then(r => r.data);

// Approve booking (generates QR)
export const approveBooking = (id) =>
  api.post(`/bookings/${id}/approve`).then(r => r.data);

// Generate QR explicitly
export const generateQr = (id) =>
  api.post(`/bookings/${id}/generate-qr`).then(r => r.data);

// Scan QR (for Operator verification)
export const scanQr = (qrToken) =>
  api.post("/bookings/scan", { qrToken }).then(r => r.data);

// Finalize booking
export const finalizeBooking = (id) =>
  api.post(`/bookings/${id}/finalize`).then(r => r.data);
