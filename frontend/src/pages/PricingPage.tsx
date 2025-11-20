import { useNavigate } from "react-router-dom";

import PricingTable from "../components/Shared/PricingTable";
import TopNav from "../components/Shared/TopNav";
import { useAuth } from "../context/AuthContext";
import { usePlanStore } from "../store/usePlanStore";

const PricingPage = () => {
  const navigate = useNavigate();
  const setPlan = usePlanStore((state) => state.setPlan);
  const { user } = useAuth();

  const handleSelectPlan = (planId: string) => {
    setPlan(planId);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-night text-white">
      <TopNav />
      <div className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Pricing</p>
        <h1 className="mt-4 text-4xl font-semibold">Select the orbit that matches your GTM velocity.</h1>
        <p className="mt-2 text-gray-400">
          Signed in as <span className="text-white">{user?.email}</span>
        </p>
        <div className="mt-12">
          <PricingTable onSelectPlan={handleSelectPlan} ctaLabel="Buy Plan" />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;


