import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Owners from "./pages/Owners";
import Stations from "./pages/Stations";
import Bookings from "./pages/Bookings";
import AdminLayout from "./components/AdminLayout";

function App() {
  const role = localStorage.getItem("role");

  console.log("App component rendering, role:", role);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        } />
        {role === "backoffice" && (
          <>
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
          </>
        )}
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
