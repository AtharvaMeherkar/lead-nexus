import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      onClose();
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
  }, [isAuthenticated, user, navigate, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel relative w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-400">Enter your credentials to access Lead Nexus</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-gray-400">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan transition-colors"
              placeholder="your@email.com"
            />
          </label>
          <label className="block text-sm text-gray-400">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan transition-colors"
              placeholder="Minimum 8 characters"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan to-magenta px-4 py-3 font-semibold text-night shadow-lg shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => {
              onClose();
              onSwitchToRegister?.();
            }}
            className="text-cyan hover:text-cyan/80 transition-colors"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;

