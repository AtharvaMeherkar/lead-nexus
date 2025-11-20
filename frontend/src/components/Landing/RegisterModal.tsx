import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    
    // Client-side validation
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await api.post("/auth/register", form);
      await login(data.access_token);
      // Close modal and navigate to pricing
      onClose();
      navigate("/pricing", { replace: true });
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
        setError("Registration failed. Try a different email.");
      }
      console.error("Registration error:", err);
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
        <h2 className="text-3xl font-semibold text-white">Create your account</h2>
        <p className="mt-2 text-sm text-gray-400">Unlock the command center experience in under a minute.</p>
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
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => {
              onClose();
              onSwitchToLogin?.();
            }}
            className="text-cyan hover:text-cyan/80 transition-colors"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;

