import { create } from "zustand";

import { BillingAddress } from "../types";

interface PlanState {
  selectedPlan: string | null;
  setPlan: (plan: string) => void;
  billingAddress: BillingAddress | null;
  setBillingAddress: (address: BillingAddress) => void;
  reset: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
  selectedPlan: localStorage.getItem("lead-nexus-preselected-plan"),
  billingAddress: null,
  setPlan: (plan) => {
    localStorage.setItem("lead-nexus-preselected-plan", plan);
    set({ selectedPlan: plan });
  },
  setBillingAddress: (address) => set({ billingAddress: address }),
  reset: () => {
    localStorage.removeItem("lead-nexus-preselected-plan");
    set({ selectedPlan: null, billingAddress: null });
  },
}));


