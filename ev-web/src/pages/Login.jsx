import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Predefined users with their credentials and roles
  const users = [
    // Back office users
    { email: "admin@evcs.com", password: "admin123", role: "backoffice", name: "Admin User" },
    { email: "backoffice@evcs.com", password: "backoffice123", role: "backoffice", name: "Back Office User" },
    
    // Station operators
    { email: "operator1@evcs.com", password: "operator123", role: "station-operator", name: "Station Operator 1", stationId: "ST001" },
    { email: "operator2@evcs.com", password: "operator123", role: "station-operator", name: "Station Operator 2", stationId: "ST002" },
    { email: "operator3@evcs.com", password: "operator123", role: "station-operator", name: "Station Operator 3", stationId: "ST003" }
  ];

  const handleLogin = async () => {
    setError("");
    
    // Find user with matching credentials
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      setError("Invalid email or password");
      return;
    }

    // Store user information in localStorage
    localStorage.setItem("role", user.role);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userName", user.name);
    if (user.stationId) {
      localStorage.setItem("stationId", user.stationId);
    }

    // Dispatch a custom event to notify App component of the login
    window.dispatchEvent(new Event('storage'));

    // Navigate based on user role
    if (user.role === "backoffice") {
      navigate("/dashboard");
    } else if (user.role === "station-operator") {
      navigate("/operator-dashboard");
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f3f4f6' 
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '32px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        width: '400px' 
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '24px', 
          textAlign: 'center',
          color: '#1f2937'
        }}>
          EV Charging Station Login
        </h1>
        
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '8px 12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '4px',
            color: '#374151'
          }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '4px',
            color: '#374151'
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Login
        </button>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Demo Credentials:</p>
          <p style={{ margin: '4px 0' }}><strong>Back Office:</strong> admin@evcs.com / admin123</p>
          <p style={{ margin: '4px 0' }}><strong>Station Operator:</strong> operator1@evcs.com / operator123</p>
        </div>
      </div>
    </div>
  );
}
