interface PricingTableProps {
  onSelectPlan?: (planId: string) => void;
  highlightPlan?: string;
  ctaLabel?: string;
}

const plans = [
  {
    id: "weekly",
    name: "Weekly Pulse",
    price: "₹199",
    cadence: "per week",
    description: "Rapid market scans for agile outreach sprints.",
    features: ["400 verified leads / week", "2 lead lists", "CSV export"],
    accent: "from-cyan/70 to-cyan",
  },
  {
    id: "monthly",
    name: "Momentum",
    price: "₹799",
    cadence: "per month",
    description: "Our best-selling plan for growth teams.",
    features: ["Unlimited searches", "Smart filters + groups", "Unlimited lead lists"],
    highlight: true,
    accent: "from-cyan via-magenta to-magenta",
  },
  {
    id: "yearly",
    name: "Constellation",
    price: "₹7,999",
    cadence: "per year",
    description: "Enterprise-grade intelligence with concierge support.",
    features: ["Priority enrichment", "Dedicated CSM", "Custom scoring models"],
    accent: "from-magenta to-magenta/60",
  },
];

const PricingTable = ({ onSelectPlan, highlightPlan = "monthly", ctaLabel = "Get Started" }: PricingTableProps) => {
  return (
    <div id="pricing" className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isHighlight = plan.id === highlightPlan || plan.highlight;
        return (
          <div
            key={plan.id}
            className={`glass-panel relative rounded-3xl p-6 shadow-[0_25px_65px_rgba(0,0,0,0.45)] ${
              isHighlight ? "border-cyan/40" : "border-white/5"
            }`}
          >
            {isHighlight && (
              <span className="absolute right-5 top-5 rounded-full bg-cyan/30 px-3 py-1 text-xs uppercase text-cyan">
                Recommended
              </span>
            )}
            <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
            <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-gray-400">{plan.cadence}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSelectPlan?.(plan.id)}
              className={`mt-8 w-full rounded-2xl bg-gradient-to-r ${plan.accent} px-4 py-3 text-sm font-semibold text-night`}
            >
              {ctaLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PricingTable;


