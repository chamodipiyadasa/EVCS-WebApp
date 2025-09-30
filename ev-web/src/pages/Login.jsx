import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // TODO: Call API for login
    // const res = await fetch("http://localhost:5000/api/login", {...})
    // const data = await res.json();

    const role = "backoffice"; // mock until API ready
    localStorage.setItem("role", role);

    navigate("/dashboard");
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
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
        width: '384px' 
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          EV Charging Station Login
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '12px',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '12px',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
