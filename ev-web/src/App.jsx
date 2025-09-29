// src/App.jsx
import React from 'react';
import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequireRole from "./auth/RequireRole";
import { Toaster } from "react-hot-toast";

import Owners from "./pages/Owners";
import OwnerForm from "./pages/OwnerForm";
import Stations from "./pages/Stations";
import StationForm from "./pages/StationForm";
import Bookings from "./pages/Bookings";
import BookingForm from "./pages/BookingForm";
import BookingQR from "./pages/BookingQR";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <RequireRole roles={["Backoffice","Operator"]}>
            <AppLayout />
          </RequireRole>
        }>
          <Route index element={<Dashboard />} />
          <Route path="owners" element={<RequireRole roles={['Backoffice']}><Owners /></RequireRole>} />
          <Route path="owners/new" element={<RequireRole roles={['Backoffice']}><OwnerForm /></RequireRole>} />
          <Route path="owners/:nic" element={<RequireRole roles={['Backoffice']}><OwnerForm /></RequireRole>} />

          <Route path="stations" element={<Stations />} />
          <Route path="stations/new" element={<RequireRole roles={['Backoffice']}><StationForm /></RequireRole>} />
          <Route path="stations/:id" element={<RequireRole roles={['Backoffice']}><StationForm /></RequireRole>} />

          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/new" element={<BookingForm />} />
          <Route path="bookings/:id" element={<BookingForm />} />
          <Route path="bookings/:id/qr" element={<BookingQR />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
