import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { LeadList } from "../../types";

interface DashboardInsightsProps {
  leads: any[];
  groups: any[];
  leadLists: LeadList[];
  totalMatches: number;
}

const DashboardInsights = ({ leadLists }: DashboardInsightsProps) => {

  return (
    <div>
      {/* Lead Lists Summary */}
      {leadLists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-3xl border border-white/10 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-cyan" />
              <h3 className="text-lg font-semibold text-white">Your Lead Lists</h3>
            </div>
            <span className="rounded-full bg-cyan/20 px-3 py-1 text-xs font-medium text-cyan">
              {leadLists.length} {leadLists.length === 1 ? "list" : "lists"}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {leadLists.slice(0, 6).map((list, index) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
              >
                <div className="rounded-lg bg-cyan/20 p-2">
                  <Star className="h-4 w-4 text-cyan" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{list.list_name}</p>
                  <p className="text-xs text-gray-400">Lead List</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardInsights;

