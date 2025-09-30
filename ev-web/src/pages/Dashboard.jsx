import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (!userRole) {
      navigate("/");
      return;
    }
    setRole(userRole);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  if (!role) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
        padding: '16px 24px' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            EV Charging Station Management
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#6b7280' }}>
              Welcome, {role === 'backoffice' ? 'Backoffice User' : 'Station Operator'}
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: role === 'backoffice' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          {role === 'backoffice' && (
            <>
              <DashboardCard
                title="Users"
                count="25"
                description="Manage system users"
                onClick={() => navigate('/users')}
              />
              <DashboardCard
                title="EV Owners"
                count="150"
                description="Manage EV owner profiles"
                onClick={() => navigate('/owners')}
              />
              <DashboardCard
                title="Stations"
                count="12"
                description="Manage charging stations"
                onClick={() => navigate('/stations')}
              />
              <DashboardCard
                title="Bookings"
                count="45"
                description="Manage reservations"
                onClick={() => navigate('/bookings')}
              />
            </>
          )}
          
          {role === 'operator' && (
            <>
              <DashboardCard
                title="My Stations"
                count="3"
                description="Stations under your management"
                onClick={() => navigate('/stations')}
              />
              <DashboardCard
                title="Today's Bookings"
                count="8"
                description="Reservations for today"
                onClick={() => navigate('/bookings')}
              />
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'semibold', marginBottom: '16px' }}>
            Recent Activity
          </h2>
          <div style={{ color: '#6b7280' }}>
            <p>• New EV owner registered: John Doe (NIC: 123456789V)</p>
            <p>• Booking confirmed for Station A - Slot 2</p>
            <p>• Station B maintenance completed</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ title, count, description, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
    >
      <h3 style={{ fontSize: '14px', fontWeight: 'medium', color: '#6b7280' }}>
        {title}
      </h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '8px 0' }}>
        {count}
      </p>
      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
        {description}
      </p>
    </div>
  );
}
