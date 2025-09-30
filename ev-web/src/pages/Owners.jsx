export default function Owners() {
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
          Create, update, and delete EV owner profiles using NIC as the primary key. 
          Enable activation and deactivation of EV owner accounts with full audit trail.
        </p>
        
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '32px', 
          textAlign: 'center',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ 
            width: '80px',
            height: '80px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px',
            margin: '0 auto 20px auto'
          }}>
            EV
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
            EV Owner Registry
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            Comprehensive management system for electric vehicle owners with NIC-based identification, 
            account status control, and registration tracking.
          </p>
          <button style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Register New EV Owner
          </button>
        </div>
      </div>
    </div>
  );
}
