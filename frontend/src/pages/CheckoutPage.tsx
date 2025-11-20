import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopNav from "../components/Shared/TopNav";
import { useAuth } from "../context/AuthContext";
import { usePlanStore } from "../store/usePlanStore";
import { BillingAddress } from "../types";
import api from "../utils/api";

const defaultBilling: BillingAddress = {
  full_name: "",
  country: "India",
  address_line1: "",
  city: "",
  state: "",
  postal_code: "",
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { selectedPlan, setBillingAddress, reset } = usePlanStore();
  const [billing, setBilling] = useState<BillingAddress>(defaultBilling);
  const [payment, setPayment] = useState({ card_name: "", card_number: "", expiry: "", cvc: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPlan) {
      navigate("/pricing");
    }
  }, [selectedPlan, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPlan) return;
    setError(null);
    setLoading(true);
    setStatus("processing");
    setBillingAddress(billing);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      await api.post("/subscription/activate", {
        plan_name: selectedPlan,
        billing_address: billing,
      });
      setStatus("success");
      await refreshProfile();
      reset();
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please retry.");
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night text-white">
      <TopNav />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[2fr,1fr]">
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold">Billing Details</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-gray-400">
              Full Name
              <input
                value={billing.full_name}
                onChange={(e) => setBilling((prev) => ({ ...prev, full_name: e.target.value }))}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
              />
            </label>
            <label className="text-sm text-gray-400">
              Country
              <select
                value={billing.country}
                onChange={(e) => setBilling((prev) => ({ ...prev, country: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
              >
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Singapore</option>
              </select>
            </label>
            <label className="text-sm text-gray-400 md:col-span-2">
              Address Line 1
              <input
                value={billing.address_line1}
                onChange={(e) => setBilling((prev) => ({ ...prev, address_line1: e.target.value }))}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
              />
            </label>
            <label className="text-sm text-gray-400">
              City
              <input
                value={billing.city}
                onChange={(e) => setBilling((prev) => ({ ...prev, city: e.target.value }))}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
              />
            </label>
            <label className="text-sm text-gray-400">
              State
              <input
                value={billing.state}
                onChange={(e) => setBilling((prev) => ({ ...prev, state: e.target.value }))}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
              />
            </label>
            <label className="text-sm text-gray-400">
              ZIP / Postal
              <input
                value={billing.postal_code}
                onChange={(e) => setBilling((prev) => ({ ...prev, postal_code: e.target.value }))}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
              />
            </label>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-medium">Payment Method</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-gray-400 md:col-span-2">
                Cardholder Name
                <input
                  value={payment.card_name}
                  onChange={(e) => setPayment((prev) => ({ ...prev, card_name: e.target.value }))}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
                />
              </label>
              <label className="text-sm text-gray-400 md:col-span-2">
                Card Number
                <input
                  value={payment.card_number}
                  onChange={(e) => {
                    const next = e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim();
                    setPayment((prev) => ({ ...prev, card_number: next }));
                  }}
                  required
                  maxLength={19}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white tracking-widest outline-none focus:border-cyan"
                />
              </label>
              <label className="text-sm text-gray-400">
                Expiry (MM/YY)
                <input
                  value={payment.expiry}
                  onChange={(e) => setPayment((prev) => ({ ...prev, expiry: e.target.value }))}
                  placeholder="12/29"
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
                />
              </label>
              <label className="text-sm text-gray-400">
                CVC
                <input
                  value={payment.cvc}
                  onChange={(e) => setPayment((prev) => ({ ...prev, cvc: e.target.value }))}
                  required
                  maxLength={4}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan"
                />
              </label>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan to-magenta px-4 py-3 text-base font-semibold text-night"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
        <div className="glass-panel rounded-3xl border border-white/10 p-8">
          <h3 className="text-xl font-semibold">Order Summary</h3>
          <p className="mt-2 text-sm text-gray-400">Plan selected: {selectedPlan ?? "Not selected"}</p>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Platform Access</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Smart Filters</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Support</span>
              <span>24/7</span>
            </div>
          </div>
          {status === "processing" && (
            <motion.div
              className="mt-10 rounded-2xl border border-cyan/30 p-5 text-center text-cyan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Processing secure payment...
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              className="mt-10 rounded-2xl border border-cyan/40 bg-cyan/10 p-5 text-center text-cyan"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              Payment Successful! Redirecting...
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


