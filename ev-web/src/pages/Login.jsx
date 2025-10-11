// src/pages/Login.jsx
import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Enter username and password");
      return;
    }
    try {
      setLoading(true);
      const res = await login(username, password); // { token, role, username }
      localStorage.setItem("jwt", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("username", res.username);
      toast.success(`Welcome, ${res.username}`);
      nav("/app", { replace: true }); // RoleLanding handles the rest
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-bold">
            EV
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">EVCS Login</h1>
          <p className="text-slate-500 text-sm">Sign in to manage stations, bookings & users</p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white border rounded-2xl shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              autoFocus
              className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                className="border rounded-lg px-3 py-2 w-full pr-11 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                tabIndex={-1}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className={
              "w-full rounded-lg px-4 py-2 text-white font-medium " +
              (loading
                ? "bg-emerald-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700")
            }
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="text-xs text-slate-500 text-center">
            Trouble signing in? Contact your administrator.
          </div>
        </form>

        <div className="text-center text-xs text-slate-400 mt-4">
          © {new Date().getFullYear()} EVCS
        </div>
      </div>
    </div>
  );
}
