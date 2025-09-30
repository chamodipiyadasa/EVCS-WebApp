export default function Bookings() {
  return (
    <div>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
          Manage charging bookings and reservations with comprehensive control over scheduling, 
          modifications, and cancellations according to system policies.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #dbeafe', 
            borderRadius: '8px', 
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1e40af',
              marginBottom: '4px'
            }}>
              23
            </div>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              Pending Reservations
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Awaiting confirmation
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #dcfce7', 
            borderRadius: '8px', 
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#166534',
              marginBottom: '4px'
            }}>
              45
            </div>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              Confirmed Bookings
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Active reservations
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#fefce8', 
            border: '1px solid #fef3c7', 
            borderRadius: '8px', 
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#a16207',
              marginBottom: '4px'
            }}>
              12
            </div>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              Today's Sessions
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Scheduled for today
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#dc2626',
              marginBottom: '4px'
            }}>
              5
            </div>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              Cancelled Today
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Recent cancellations
            </div>
          </div>
        </div>
        
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '32px', 
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '80px',
              height: '80px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0 auto 16px auto'
            }}>
              B
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              Booking Management System
            </h3>
          </div>
          
          <div style={{ 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              System Policies
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', lineHeight: '1.6' }}>
              <li>Create new reservations up to 7 days in advance</li>
              <li>Update reservations at least 12 hours before scheduled time</li>
              <li>Cancel reservations at least 12 hours before scheduled time</li>
              <li>Automatic notification system for confirmation and reminders</li>
            </ul>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Create New Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
