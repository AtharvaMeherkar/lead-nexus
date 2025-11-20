import { useState, useEffect } from "react";
import { Search, Loader2, Inbox, Grid3x3, List, CheckSquare, Square, Plus, Download } from "lucide-react";
import { motion } from "framer-motion";

import { Lead, LeadGroup, LeadList } from "../../types";
import LeadCard from "./LeadCard";
import ExportModal from "./ExportModal";
import { useNotification } from "../../context/NotificationContext";

type ViewMode = "list" | "grid";

interface Props {
  leads: Lead[];
  groups: LeadGroup[];
  groupByCompany: boolean;
  pagination: { page: number; limit: number; total: number };
  loading: boolean;
  initialLoad: boolean;
  onPaginate: (page: number) => void;
  leadLists: LeadList[];
  onAddLead: (leadId: string, listId: string) => Promise<void>;
  onCreateList: () => void;
}

const ResultsView = ({
  leads,
  groups,
  groupByCompany,
  pagination,
  loading,
  initialLoad,
  onPaginate,
  leadLists,
  onAddLead,
  onCreateList,
}: Props) => {
  const { showNotification } = useNotification();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkListId, setBulkListId] = useState<string>(leadLists[0]?.id ?? "");
  const [bulkAdding, setBulkAdding] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (leadLists.length > 0 && !leadLists.find((l) => l.id === bulkListId)) {
      setBulkListId(leadLists[0].id);
    }
  }, [leadLists, bulkListId]);

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const data = groupByCompany ? groups : leads;
  const hasResults = Array.isArray(data) && data.length > 0;
  const isEmpty = !loading && !hasResults;
  
  // Get all lead IDs from current view
  const allLeadIds = groupByCompany
    ? (groups || []).flatMap((g) => (g.leads || []).map((l) => l.id))
    : (leads || []).map((l) => l.id);

  const toggleSelectAll = () => {
    if (selectedLeads.size === allLeadIds.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(allLeadIds));
    }
  };

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkAdd = async () => {
    if (!bulkListId || selectedLeads.size === 0) return;
    setBulkAdding(true);
    try {
      await Promise.all(Array.from(selectedLeads).map((leadId) => onAddLead(leadId, bulkListId)));
      setSelectedLeads(new Set());
      showNotification({
        type: "success",
        title: "Leads Added",
        message: `Successfully added ${selectedLeads.size} lead(s) to list.`,
      });
    } catch (error) {
      console.error("Bulk add failed", error);
      showNotification({
        type: "error",
        title: "Add Failed",
        message: "Failed to add leads to list. Please try again.",
      });
    } finally {
      setBulkAdding(false);
    }
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="glass-panel animate-pulse rounded-3xl border border-white/10 p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 rounded bg-white/10" />
              <div className="h-4 w-24 rounded bg-white/10" />
            </div>
            <div className="h-6 w-20 rounded-full bg-white/10" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 rounded-full bg-white/5 p-6">
        {initialLoad ? (
          <Search className="h-12 w-12 text-gray-500" />
        ) : (
          <Inbox className="h-12 w-12 text-gray-500" />
        )}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">
        {initialLoad ? "Ready to Search" : "No Leads Found"}
      </h3>
      <p className="max-w-sm text-sm text-gray-400">
        {initialLoad
          ? "Use the filters on the left to search for leads. Try searching by job title, company, location, or domain."
          : "No leads match your current search criteria. Try adjusting your filters or clearing them to see all leads."}
      </p>
    </motion.div>
  );

  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Results</p>
          <h3 className="text-2xl font-semibold text-white">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-cyan" />
                Searching...
              </span>
            ) : (
              `${pagination.total.toLocaleString()} Matches`
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-2 py-1 transition ${
                viewMode === "list" ? "bg-cyan text-night" : "text-gray-400 hover:text-white"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-2 py-1 transition ${
                viewMode === "grid" ? "bg-cyan text-night" : "text-gray-400 hover:text-white"
              }`}
              title="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={onCreateList}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            New Lead List
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {hasResults && !loading && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              {selectedLeads.size === allLeadIds.length && allLeadIds.length > 0 ? (
                <CheckSquare className="h-4 w-4 text-cyan" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>
                {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : "Select all"}
              </span>
            </button>
            {selectedLeads.size > 0 && (
              <>
                <span className="text-gray-600">|</span>
                <select
                  value={bulkListId}
                  onChange={(e) => setBulkListId(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-cyan"
                >
                  {leadLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.list_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAdd}
                  disabled={bulkAdding || !bulkListId}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan px-3 py-1.5 text-xs font-medium text-night transition hover:bg-cyan/90 disabled:opacity-50"
                >
                  {bulkAdding ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      <span>Add {selectedLeads.size} to list</span>
                    </>
                  )}
                </button>
              </>
            )}
            <button
              onClick={() => setShowExportModal(true)}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
              title="Export Leads"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export {selectedLeads.size > 0 ? `${selectedLeads.size} ` : ""}Leads</span>
            </button>
          </div>
          {selectedLeads.size > 0 && (
            <button
              onClick={() => setSelectedLeads(new Set())}
              className="text-xs text-gray-400 transition hover:text-white"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      <div className="mt-6">
        {loading && <LoadingSkeleton />}
        {isEmpty && <EmptyState />}
        {!loading && hasResults && (
          <div
            className={
              viewMode === "grid" && !groupByCompany
                ? "grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-3 md:space-y-4"
            }
          >
            {!groupByCompany &&
              leads.map((lead) => (
                <div key={lead.id} className="relative">
                  <button
                    onClick={() => toggleSelectLead(lead.id)}
                    className="absolute left-2 top-2 z-10 rounded border border-white/20 bg-night/80 p-1 transition hover:bg-white/20"
                  >
                    {selectedLeads.has(lead.id) ? (
                      <CheckSquare className="h-4 w-4 text-cyan" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <div className={selectedLeads.has(lead.id) ? "ring-2 ring-cyan rounded-3xl" : ""}>
                    <LeadCard lead={lead} leadLists={leadLists} onAdd={onAddLead} />
                  </div>
                </div>
              ))}
            {groupByCompany &&
              (groups || []).map((group) => (
                <motion.div
                  key={group.company_name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-white">{group.company_name}</p>
                    <span className="text-sm text-gray-400">{group.leads.length} leads</span>
                  </div>
                  <div
                    className={`mt-4 grid gap-3 ${
                      viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
                    }`}
                  >
                    {(group.leads || []).map((lead) => (
                      <div key={lead.id} className="relative">
                        <button
                          onClick={() => toggleSelectLead(lead.id)}
                          className="absolute left-2 top-2 z-10 rounded border border-white/20 bg-night/80 p-1 transition hover:bg-white/20"
                        >
                          {selectedLeads.has(lead.id) ? (
                            <CheckSquare className="h-4 w-4 text-cyan" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <div className={selectedLeads.has(lead.id) ? "ring-2 ring-cyan rounded-3xl" : ""}>
                          <LeadCard lead={lead} leadLists={leadLists} onAdd={onAddLead} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>
      <div className="mt-8 flex items-center justify-between text-sm text-gray-400">
        <span>
          Page {pagination.page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPaginate(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className="rounded-full border border-white/10 px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => onPaginate(Math.min(totalPages, pagination.page + 1))}
            disabled={pagination.page === totalPages}
            className="rounded-full border border-white/10 px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        leads={groupByCompany ? (groups || []).flatMap((g) => g.leads || []) : (leads || [])}
        selectedLeads={selectedLeads.size > 0 ? selectedLeads : undefined}
      />
    </div>
  );
};

export default ResultsView;

