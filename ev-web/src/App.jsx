import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Owners from "./pages/Owners";
import Stations from "./pages/Stations";
import Bookings from "./pages/Bookings";
import AdminLayout from "./components/AdminLayout";

// Station Operator imports
import StationOperatorLayout from "./components/StationOperatorLayout";
import StationOperatorDashboard from "./pages/StationOperatorDashboard";
import MyStations from "./pages/MyStations";
import StationBookings from "./pages/StationBookings";
import StationSchedule from "./pages/StationSchedule";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Listen for localStorage changes to update role
  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
    };

    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage periodically in case storage event doesn't fire
    const interval = setInterval(() => {
      const currentRole = localStorage.getItem("role");
      if (currentRole !== role) {
        setRole(currentRole);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [role]);

  console.log("App component rendering, role:", role);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Back Office Routes */}
        {role === "backoffice" && (
            <>
              <Route path="/dashboard" element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              } />
              <Route path="/users" element={
                <AdminLayout>
                  <Users />
                </AdminLayout>
              } />
              <Route path="/owners" element={
                <AdminLayout>
                  <Owners />
                </AdminLayout>
              } />
              <Route path="/stations" element={
                <AdminLayout>
                  <Stations />
                </AdminLayout>
              } />
              <Route path="/bookings" element={
                <AdminLayout>
                  <Bookings />
                </AdminLayout>
              } />
            </>
          )}

        {/* Station Operator Routes */}
        {role === "station-operator" && (
          <>
            <Route path="/operator-dashboard" element={
              <StationOperatorLayout>
                <StationOperatorDashboard />
              </StationOperatorLayout>
            } />
            <Route path="/my-stations" element={
              <StationOperatorLayout>
                <MyStations />
              </StationOperatorLayout>
            } />
            <Route path="/station-bookings" element={
              <StationOperatorLayout>
                <StationBookings />
              </StationOperatorLayout>
            } />
            <Route path="/station-schedule" element={
              <StationOperatorLayout>
                <StationSchedule />
              </StationOperatorLayout>
            } />
          </>
        )}

        {/* Redirect based on role */}
        <Route path="/dashboard" element={
          role === "backoffice" ? (
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          ) : role === "station-operator" ? (
            <Navigate to="/operator-dashboard" />
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
