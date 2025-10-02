import { Link, useLocation, useNavigate } from "react-router-dom";

export default function StationOperatorLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Station Operator";
  const stationId = localStorage.getItem("stationId") || "N/A";

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("stationId");
    
    // Dispatch storage event to notify App component
    window.dispatchEvent(new Event('storage'));
    
    navigate("/");
  };

  const menuItems = [
    { path: "/operator-dashboard", label: "Dashboard", icon: "▊" },
    { path: "/my-stations", label: "My Stations", icon: "▤" },
    { path: "/station-bookings", label: "Bookings", icon: "☰" },
    { path: "/station-schedule", label: "Schedule", icon: "▦" }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#1e293b',
        color: 'white',
        boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #334155',
          backgroundColor: '#0f172a',
          flexShrink: 0
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#f1f5f9'
          }}>
            EVCS Operator
          </h1>
          <div style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            {userName}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            padding: '2px 8px',
            backgroundColor: '#334155',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            Station: {stationId}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ 
          padding: '16px 0', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: location.pathname === item.path ? '#38bdf8' : '#cbd5e1',
                textDecoration: 'none',
                backgroundColor: location.pathname === item.path ? '#0f172a' : 'transparent',
                borderRight: location.pathname === item.path ? '3px solid #38bdf8' : 'none',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = '#334155';
                  e.target.style.color = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#cbd5e1';
                }
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '16px' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ 
          padding: '20px', 
          flexShrink: 0,
          borderTop: '1px solid #334155'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Bar */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px 32px',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              Station Operator Portal
            </h2>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span>Station {stationId}</span>
              <span>{userName}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflow: 'auto',
          height: 0
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}