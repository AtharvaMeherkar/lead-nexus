import { motion } from "framer-motion";

interface Props {
  leads: number;
  companies: number;
  jobTitles: number;
  loading: boolean;
}

const LiveDataBar = ({ leads, companies, jobTitles, loading }: Props) => {
  const items = [
    { label: "Verified Leads", value: leads.toLocaleString() },
    { label: "Companies", value: companies.toLocaleString() },
    { label: "Job Titles", value: jobTitles.toLocaleString() },
  ];
  return (
    <motion.div
      id="live-data"
      className="glass-panel mt-10 flex flex-col rounded-3xl border border-white/5 px-6 py-5 text-sm text-gray-300 md:flex-row md:items-center md:justify-between md:px-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {items.map((item, index) => (
        <div key={item.label} className="flex flex-1 flex-col border-white/5 py-4 md:border-l md:px-8">
          <span className="text-xs uppercase tracking-widest text-gray-500">{item.label}</span>
          <span className="mt-2 text-3xl font-semibold text-white">
            {loading ? "..." : item.value}
            {index < items.length - 1 ? <span className="ml-2 text-lg text-gray-500">|</span> : null}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

export default LiveDataBar;


