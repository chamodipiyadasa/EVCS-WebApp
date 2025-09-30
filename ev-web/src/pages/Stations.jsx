export default function Stations() {
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
          Manage charging station details including location, type (AC/DC), available slots, and operational schedules.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f0f9ff'
          }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              backgroundColor: '#0ea5e9',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              AC
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
              AC Charging Stations
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Standard alternating current charging points for regular charging needs
            </p>
          </div>
          
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#fefce8'
          }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              backgroundColor: '#eab308',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              DC
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
              DC Fast Charging
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              High-speed direct current charging stations for rapid charging
            </p>
          </div>
          
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f0fdf4'
          }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              backgroundColor: '#22c55e',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              L
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
              Location Management
            </h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Station locations, accessibility features, and geographic data
            </p>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <button style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Add New Charging Station
          </button>
        </div>
      </div>
    </div>
  );
}
