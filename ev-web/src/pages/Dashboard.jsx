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

  if (!role) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Statistics Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: role === 'backoffice' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {role === 'backoffice' && (
          <>
            <StatCard
              title="System Users"
              value="25"
              subtitle="Active accounts"
              trend="+3 this month"
              onClick={() => navigate('/users')}
            />
            <StatCard
              title="EV Owners"
              value="150"
              subtitle="Registered owners"
              trend="+12 this month"
              onClick={() => navigate('/owners')}
            />
            <StatCard
              title="Charging Stations"
              value="12"
              subtitle="Operational units"
              trend="100% uptime"
              onClick={() => navigate('/stations')}
            />
            <StatCard
              title="Active Bookings"
              value="45"
              subtitle="Current reservations"
              trend="+8 today"
              onClick={() => navigate('/bookings')}
            />
          </>
        )}
        
        {role === 'operator' && (
          <>
            <StatCard
              title="Assigned Stations"
              value="3"
              subtitle="Under management"
              trend="All operational"
              onClick={() => navigate('/stations')}
            />
            <StatCard
              title="Today's Bookings"
              value="8"
              subtitle="Scheduled sessions"
              trend="6 completed"
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
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '20px', 
          color: '#111827',
          borderBottom: '1px solid #f3f4f6',
          paddingBottom: '12px'
        }}>
          Recent Activity
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ActivityItem 
            time="2 minutes ago"
            action="New EV owner registered"
            details="John Doe - NIC: 123456789V"
            status="success"
          />
          <ActivityItem 
            time="15 minutes ago"
            action="Booking confirmed"
            details="Station A, Slot 2 - Oct 1, 2025 14:00"
            status="info"
          />
          <ActivityItem 
            time="1 hour ago"
            action="Station maintenance completed"
            details="Station B - All systems operational"
            status="success"
          />
          <ActivityItem 
            time="3 hours ago"
            action="User login"
            details="Station Operator: Jane Smith"
            status="info"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, trend, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#6b7280',
          margin: '0'
        }}>
          {title}
        </h3>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <p style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#111827', 
          margin: '0',
          lineHeight: '1'
        }}>
          {value}
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          fontSize: '12px', 
          color: '#9ca3af'
        }}>
          {subtitle}
        </span>
        <span style={{ 
          fontSize: '11px', 
          color: '#059669',
          fontWeight: '500'
        }}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function ActivityItem({ time, action, details, status }) {
  const statusColors = {
    success: '#059669',
    info: '#0ea5e9',
    warning: '#d97706',
    error: '#dc2626'
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid #f9fafb'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: statusColors[status],
        marginTop: '6px',
        flexShrink: 0
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '2px'
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151' 
          }}>
            {action}
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: '#9ca3af',
            flexShrink: 0,
            marginLeft: '12px'
          }}>
            {time}
          </span>
        </div>
        <p style={{ 
          fontSize: '13px', 
          color: '#6b7280',
          margin: '0'
        }}>
          {details}
        </p>
      </div>
    </div>
  );
}
