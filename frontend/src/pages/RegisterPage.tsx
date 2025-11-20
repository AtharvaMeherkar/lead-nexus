import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopNav from "../components/Shared/TopNav";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  return (
    <div className="min-h-screen bg-night text-white">
      <TopNav />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-24 md:flex-row">
        <div className="flex-1">
          <h2 className="text-4xl font-semibold">Create your Lead Nexus profile.</h2>
          <p className="mt-4 text-gray-400">Unlock the command center experience in under a minute.</p>
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
            {loading ? "Creating..." : "Create Account"}
          </button>
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button type="button" className="text-cyan" onClick={() => navigate("/login")}>
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;


