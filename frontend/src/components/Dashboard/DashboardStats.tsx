import { useEffect, useState } from "react";
import { Users, Building2, Filter, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import api from "../../utils/api";

interface DashboardStatsProps {
  totalMatches: number;
  activeFilters: number;
  leadListsCount: number;
}

interface PublicStats {
  leads: number;
  companies: number;
  job_titles: number;
}

const DashboardStats = ({ totalMatches, activeFilters, leadListsCount }: DashboardStatsProps) => {
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get<PublicStats>("/public/stats");
        setPublicStats(data);
      } catch (error) {
        console.error("Failed to load public stats", error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Current Matches",
      value: totalMatches.toLocaleString(),
      icon: TrendingUp,
      color: "from-cyan to-blue-500",
    },
    {
      label: "Active Filters",
      value: activeFilters,
      icon: Filter,
      color: "from-magenta to-pink-500",
    },
    {
      label: "Your Lead Lists",
      value: leadListsCount,
      icon: Users,
      color: "from-purple-500 to-magenta",
    },
    {
      label: "Total Companies",
      value: publicStats?.companies.toLocaleString() ?? "—",
      icon: Building2,
      color: "from-blue-500 to-cyan",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-panel group relative overflow-hidden rounded-2xl border border-white/10 p-5 transition hover:border-cyan/30"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-gray-400" />
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition group-hover:opacity-5`} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;

