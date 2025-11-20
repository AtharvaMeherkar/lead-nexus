import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopNav from "../components/Shared/TopNav";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const LoginPage = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin users go to admin panel
      if (user.role === "admin") {
        navigate("/admin");
        return;
      }
      // Client users go to dashboard or pricing based on subscription
      if (user.subscription_status === "active") {
        navigate("/dashboard");
      } else {
        navigate("/pricing");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    // Client-side validation
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await api.post("/auth/login", form);
      await login(data.access_token);
      // Navigation will happen via useEffect when user loads
    } catch (err: any) {
      // Show detailed error message from backend
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Make sure the backend is running on http://localhost:8000");
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night text-white">
      <TopNav />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-24 md:flex-row">
        <div className="flex-1">
          <h2 className="text-4xl font-semibold">Welcome back Operator.</h2>
          <p className="mt-4 text-gray-400">
            Authenticate with your Lead Nexus credentials to re-enter the command center.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="glass-panel flex-1 rounded-3xl border border-white/10 p-8 shadow-xl">
          <label className="block text-sm text-gray-400">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
            />
          </label>
          <label className="mt-6 block text-sm text-gray-400">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
            />
          </label>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan to-magenta px-4 py-3 font-semibold text-night"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


