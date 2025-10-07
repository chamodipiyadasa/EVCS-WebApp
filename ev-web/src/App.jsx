// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Owners from './pages/Owners'
import OwnerForm from './pages/OwnerForm'
import Stations from './pages/Stations'
import StationForm from './pages/StationForm'
import Bookings from './pages/Bookings'
import BookingForm from './pages/BookingForm'
import BookingQR from './pages/BookingQR'
import Users from './pages/Users'
import Schedules from './pages/Schedules'
import RequireRole from './auth/RequireRole'
import { Toaster } from 'react-hot-toast'

// Operator pages
import OperatorDashboard from './pages/OperatorDashboard'
import OperatorBookings from './pages/OperatorBookings'
import OperatorScanQR from './pages/OperatorScanQR'
import RoleLanding from './pages/RoleLanding'

// Helper to redirect while preserving :params
function RedirectWithParams({ toPattern }) {
  const params = useParams()
  let to = toPattern
  for (const [k, v] of Object.entries(params)) {
    to = to.replace(`:${k}`, encodeURIComponent(v))
  }
  return <Navigate to={to} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public login */}
        <Route path="/login" element={<Login />} />

        {/* Protected app under /app */}
        <Route
          path="/app"
          element={
            <RequireRole roles={['Backoffice', 'Operator']}>
              <AppLayout />
            </RequireRole>
          }
        >
          {/* Role-based landing (decides per role)  */}
          <Route
            index
            element={
              <RequireRole roles={['Backoffice','Operator']}>
                <RoleLanding />
              </RequireRole>
            }
          />

          {/* Backoffice dashboard (reachable if you navigate directly) */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Operator */}
          <Route
            path="operator"
            element={
              <RequireRole roles={['Operator']}>
                <OperatorDashboard />
              </RequireRole>
            }
          />
          <Route
            path="operator/bookings"
            element={
              <RequireRole roles={['Operator']}>
                <OperatorBookings />
              </RequireRole>
            }
          />
          <Route
            path="operator/scan"
            element={
              <RequireRole roles={['Operator']}>
                <OperatorScanQR />
              </RequireRole>
            }
          />

          {/* Users (Backoffice only) */}
          <Route
            path="users"
            element={
              <RequireRole roles={['Backoffice']}>
                <Users />
              </RequireRole>
            }
          />

          {/* Owners (Backoffice only) */}
          <Route
            path="owners"
            element={
              <RequireRole roles={['Backoffice']}>
                <Owners />
              </RequireRole>
            }
          />
          <Route
            path="owners/new"
            element={
              <RequireRole roles={['Backoffice']}>
                <OwnerForm />
              </RequireRole>
            }
          />
          <Route
            path="owners/:nic"
            element={
              <RequireRole roles={['Backoffice']}>
                <OwnerForm />
              </RequireRole>
            }
          />

          {/* Stations (Backoffice list / edit) */}
          <Route path="stations" element={<Stations />} />
          <Route
            path="stations/new"
            element={
              <RequireRole roles={['Backoffice']}>
                <StationForm />
              </RequireRole>
            }
          />
          <Route
            path="stations/:id"
            element={
              <RequireRole roles={['Backoffice']}>
                <StationForm />
              </RequireRole>
            }
          />

          {/* Bookings (Backoffice) */}
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/new" element={<BookingForm />} />
          <Route path="bookings/:id" element={<BookingForm />} />
          <Route path="bookings/:id/qr" element={<BookingQR />} />

          {/* Schedules (Backoffice) */}
          <Route
            path="schedules"
            element={
              <RequireRole roles={['Backoffice']}>
                <Schedules />
              </RequireRole>
            }
          />
        </Route>

        {/* Aliases */}
        <Route path="/owners" element={<Navigate to="/app/owners" replace />} />
        <Route path="/owners/new" element={<Navigate to="/app/owners/new" replace />} />
        <Route path="/owners/:nic" element={<RedirectWithParams toPattern="/app/owners/:nic" />} />

        <Route path="/stations" element={<Navigate to="/app/stations" replace />} />
        <Route path="/stations/new" element={<Navigate to="/app/stations/new" replace />} />
        <Route path="/stations/:id" element={<RedirectWithParams toPattern="/app/stations/:id" />} />

        <Route path="/bookings" element={<Navigate to="/app/bookings" replace />} />
        <Route path="/bookings/new" element={<Navigate to="/app/bookings/new" replace />} />
        <Route path="/bookings/:id" element={<RedirectWithParams toPattern="/app/bookings/:id" />} />
        <Route path="/bookings/:id/qr" element={<RedirectWithParams toPattern="/app/bookings/:id/qr" />} />

        <Route path="/schedules" element={<Navigate to="/app/schedules" replace />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/app" replace />} />
      </Routes>

      <Toaster />
    </BrowserRouter>
  )
}
