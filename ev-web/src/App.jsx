import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Owners from "./pages/Owners";
import Stations from "./pages/Stations";
import Bookings from "./pages/Bookings";

function App() {
  const role = localStorage.getItem("role");

  console.log("App component rendering, role:", role);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {role === "backoffice" && (
          <>
            <Route path="/users" element={<Users />} />
            <Route path="/owners" element={<Owners />} />
            <Route path="/stations" element={<Stations />} />
            <Route path="/bookings" element={<Bookings />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
