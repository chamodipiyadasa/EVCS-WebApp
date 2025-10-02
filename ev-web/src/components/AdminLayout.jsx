import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("role");
    
    // Dispatch storage event to notify App component
    window.dispatchEvent(new Event('storage'));
    
    navigate("/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      description: "Overview & Analytics"
    },
    {
      name: "Users",
      path: "/users",
      description: "System Users",
      adminOnly: true
    },
    {
      name: "EV Owners",
      path: "/owners",
      description: "EV Owner Profiles",
      adminOnly: true
    },
    {
      name: "Stations",
      path: "/stations",
      description: "Charging Stations"
    },
    {
      name: "Bookings",
      path: "/bookings",
      description: "Reservations"
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || role === "backoffice"
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? "280px" : "80px",
          backgroundColor: "#1e293b",
          color: "white",
          transition: "width 0.3s ease",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 1000,
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: "20px", 
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              fontSize: "16px", 
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              borderRadius: "8px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold"
            }}>
              EV
            </div>
            {isSidebarOpen && (
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: "18px", 
                  fontWeight: "bold",
                  color: "white"
                }}>
                  EVCS Admin
                </h2>
                <p style={{ 
                  margin: 0, 
                  fontSize: "12px", 
                  color: "#94a3b8"
                }}>
                  {role === "backoffice" ? "Backoffice" : "Station Operator"}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: "20px 0" }}>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: "100%",
                  padding: isSidebarOpen ? "12px 20px" : "12px",
                  background: isActive 
                    ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" 
                    : "transparent",
                  border: "none",
                  color: isActive ? "white" : "#cbd5e1",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s ease",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "normal",
                  marginBottom: "4px"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = "#334155";
                    e.target.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#cbd5e1";
                  }
                }}
              >
                <span style={{ fontSize: "14px", minWidth: "20px", fontWeight: "600" }}>
                  {item.name.charAt(0)}
                </span>
                {isSidebarOpen && (
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: "inherit" }}>{item.name}</div>
                    <div style={{ 
                      fontSize: "11px", 
                      color: isActive ? "#e2e8f0" : "#94a3b8",
                      marginTop: "2px" 
                    }}>
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          right: 0,
          borderTop: "1px solid #334155",
          padding: "20px"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px",
            marginBottom: "12px"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              color: "white",
              fontWeight: "bold"
            }}>
              A
            </div>
            {isSidebarOpen && (
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                <div style={{ color: "white", fontWeight: "500" }}>
                  Admin User
                </div>
                <div>admin@evcs.com</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <span style={{ fontSize: "12px" }}>↗</span>
            {isSidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        marginLeft: isSidebarOpen ? "280px" : "80px",
        width: `calc(100% - ${isSidebarOpen ? "280px" : "80px"})`,
        transition: "margin-left 0.3s ease, width 0.3s ease",
        minHeight: "100vh"
      }}>
        {/* Top Bar */}
        <header style={{
          backgroundColor: "white",
          padding: "16px 24px",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: "20px", 
                fontWeight: "600", 
                color: "#1f2937" 
              }}>
                {filteredMenuItems.find(item => item.path === location.pathname)?.name || "Dashboard"}
              </h1>
              <p style={{ 
                margin: "4px 0 0 0", 
                fontSize: "14px", 
                color: "#6b7280" 
              }}>
                {filteredMenuItems.find(item => item.path === location.pathname)?.description || "Welcome to EVCS Management System"}
              </p>
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              fontSize: "12px",
              color: "#6b7280"
            }}>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}