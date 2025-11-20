import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, CheckCircle, AlertTriangle, Trash2, Merge, Loader2 } from "lucide-react";
import { Lead } from "../../types";
import api from "../../utils/api";
import { useNotification } from "../../context/NotificationContext";

interface DuplicateGroup {
  group_id: string;
  count: number;
  leads: Lead[];
}

interface DeduplicationToolProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const DeduplicationTool = ({ isOpen, onClose, onRefresh }: DeduplicationToolProps) => {
  const { showNotification } = useNotification();
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);
  const [keepLeads, setKeepLeads] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      scanForDuplicates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const scanForDuplicates = async () => {
    setScanning(true);
    try {
      const { data } = await api.get<{
        total_duplicate_groups: number;
        total_duplicate_leads: number;
        duplicates: DuplicateGroup[];
      }>("/leads/duplicates");
      setDuplicates(data.duplicates);
      
      // Initialize keep leads (default to first lead in each group)
      const initialKeep: Record<string, string> = {};
      data.duplicates.forEach((group) => {
        if (group.leads.length > 0) {
          initialKeep[group.group_id] = group.leads[0].id;
        }
      });
      setKeepLeads(initialKeep);
      
      if (data.total_duplicate_groups > 0) {
        showNotification({
          type: "info",
          title: "Duplicates Found",
          message: `Found ${data.total_duplicate_groups} duplicate group(s) with ${data.total_duplicate_leads} total leads.`,
        });
      } else {
        showNotification({
          type: "success",
          title: "No Duplicates",
          message: "No duplicate leads found in the database.",
        });
      }
    } catch (error) {
      console.error("Failed to scan for duplicates", error);
      showNotification({
        type: "error",
        title: "Scan Failed",
        message: "Failed to scan for duplicates. Please try again.",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleMerge = async () => {
    if (selectedGroups.size === 0) {
      showNotification({
        type: "error",
        title: "No Groups Selected",
        message: "Please select at least one duplicate group to merge.",
      });
      return;
    }

    if (!confirm(`Are you sure you want to merge ${selectedGroups.size} duplicate group(s)? This action cannot be undone.`)) {
      return;
    }

    setMerging(true);
    try {
      const mergePromises = Array.from(selectedGroups).map(async (groupId) => {
        const group = duplicates.find((g) => g.group_id === groupId);
        if (!group) return;

        const keepLeadId = keepLeads[groupId];
        if (!keepLeadId) return;

        const duplicateIds = group.leads.filter((l) => l.id !== keepLeadId).map((l) => l.id);

        if (duplicateIds.length === 0) return;

        await api.post("/leads/duplicates/merge", {
          keep_lead_id: keepLeadId,
          duplicate_ids: duplicateIds,
        });
      });

      await Promise.all(mergePromises);

      showNotification({
        type: "success",
        title: "Merge Successful",
        message: `Successfully merged ${selectedGroups.size} duplicate group(s).`,
      });

      // Refresh duplicates list
      await scanForDuplicates();
      setSelectedGroups(new Set());
      
      // Trigger refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to merge duplicates", error);
      showNotification({
        type: "error",
        title: "Merge Failed",
        message: "Failed to merge duplicates. Please try again.",
      });
    } finally {
      setMerging(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-5xl max-h-[90vh] rounded-3xl border border-white/10 bg-night/95 backdrop-blur-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Lead Deduplication</h2>
              <p className="text-sm text-gray-400">Find and merge duplicate leads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {scanning ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-cyan mb-4" />
              <p className="text-gray-400">Scanning for duplicates...</p>
            </div>
          ) : duplicates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Duplicates Found</h3>
              <p className="text-gray-400">Your database is clean! No duplicate leads detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">
                    Found <span className="font-semibold text-white">{duplicates.length}</span> duplicate group(s)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total duplicate leads: {duplicates.reduce((sum, g) => sum + g.count, 0)}
                  </p>
                </div>
                <button
                  onClick={scanForDuplicates}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Rescan
                </button>
              </div>

              {duplicates.map((group) => (
                <motion.div
                  key={group.group_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleGroupSelection(group.group_id)}
                      className="mt-1"
                    >
                      {selectedGroups.has(group.group_id) ? (
                        <CheckCircle className="h-5 w-5 text-cyan" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-white">
                          {group.count} Duplicate Lead(s)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {group.leads.map((lead) => (
                          <div
                            key={lead.id}
                            className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                              keepLeads[group.group_id] === lead.id
                                ? "border-cyan bg-cyan/10"
                                : "border-white/10 bg-night/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`keep-${group.group_id}`}
                              checked={keepLeads[group.group_id] === lead.id}
                              onChange={() => setKeepLeads({ ...keepLeads, [group.group_id]: lead.id })}
                              className="h-4 w-4 text-cyan"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{lead.full_name}</p>
                              <p className="text-xs text-gray-400">{lead.email}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                <div className="flex flex-wrap items-center gap-1">
                                  {(lead.job_title || "Unknown").split(',').map((title, idx) => (
                                    <span key={idx} className="text-xs text-gray-300">{title.trim()}</span>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400"> at {lead.company_name}</span>
                              </div>
                            </div>
                            {keepLeads[group.group_id] === lead.id && (
                              <span className="text-xs font-medium text-cyan">Keep</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {duplicates.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <div className="text-sm text-gray-400">
              {selectedGroups.size > 0 && (
                <span>
                  {selectedGroups.size} group(s) selected for merging
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                disabled={merging || selectedGroups.size === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-magenta px-6 py-3 font-semibold text-night hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {merging ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Merging...</span>
                  </>
                ) : (
                  <>
                    <Merge className="h-4 w-4" />
                    <span>Merge Selected ({selectedGroups.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DeduplicationTool;

