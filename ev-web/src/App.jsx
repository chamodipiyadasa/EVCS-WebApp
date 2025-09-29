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
          {/* Add Owners, Stations, Bookings routes here */}
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
