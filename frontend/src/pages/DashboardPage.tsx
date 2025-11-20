import { useEffect, useState, useCallback } from "react";

import DashboardInsights from "../components/Dashboard/DashboardInsights";
import DashboardStats from "../components/Dashboard/DashboardStats";
import SearchFilters from "../components/CommandCenter/SearchFilters";
import ResultsView from "../components/CommandCenter/ResultsView";
import DeduplicationTool from "../components/CommandCenter/DeduplicationTool";
import EmailAlerts from "../components/CommandCenter/EmailAlerts";
import { useAuth } from "../context/AuthContext";
import { Lead, LeadGroup, LeadList } from "../types";
import api from "../utils/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ job_title: "", company: "", location: "", domain: "" });
  const [sortBy, setSortBy] = useState<string>("");
  const [groupByCompany, setGroupByCompany] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [groups, setGroups] = useState<LeadGroup[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showDeduplication, setShowDeduplication] = useState(false);
  const [showEmailAlerts, setShowEmailAlerts] = useState(false);

  const fetchLeadLists = async () => {
    try {
      const { data } = await api.get<LeadList[]>("/leads/lists");
      setLeadLists(data);
    } catch (error) {
      console.error("Unable to load lead lists", error);
    }
  };

  const fetchLeads = async (page = 1, advancedParams?: URLSearchParams) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: pagination.limit,
        group_by_company: groupByCompany,
      };
      
      // Use advanced params if provided, otherwise use regular filters
      if (advancedParams) {
        // Parse advanced search params
        const jobTitles = advancedParams.getAll("job_titles");
        const companies = advancedParams.getAll("companies");
        const locations = advancedParams.getAll("locations");
        const boolOp = advancedParams.get("boolean_operator");
        
        if (jobTitles.length > 0) {
          params.job_titles = jobTitles;
          if (boolOp) params.boolean_operator = boolOp;
        } else if (filters.job_title) {
          params.job_title = filters.job_title;
        }
        
        if (companies.length > 0) {
          params.companies = companies;
          if (boolOp) params.boolean_operator = boolOp;
        } else if (filters.company) {
          params.company = filters.company;
        }
        
        if (locations.length > 0) {
          params.locations = locations;
          if (boolOp) params.boolean_operator = boolOp;
        } else if (filters.location) {
          params.location = filters.location;
        }
        
        if (filters.domain) params.domain = filters.domain;
        if (sortBy) params.sort_by = sortBy;
      } else {
        // Regular filters (backward compatible)
        if (filters.job_title) params.job_title = filters.job_title;
        if (filters.company) params.company = filters.company;
        if (filters.location) params.location = filters.location;
        if (filters.domain) params.domain = filters.domain;
        if (sortBy) params.sort_by = sortBy;
      }
      
      const { data } = await api.get("/leads/search", { params });
      setPagination((prev) => ({ ...prev, page, total: data.total }));
      if (groupByCompany) {
        setGroups(data.data);
        setLeads([]);
      } else {
        setLeads(data.data);
        setGroups([]);
      }

      // Track search history
      if (page === 1) {
        const hasFilters = Object.values(filters).some((v) => v.trim() !== "") || sortBy !== "";
        if (hasFilters) {
          try {
            const searchHistory = JSON.parse(localStorage.getItem("leadnexus_search_history") || "[]");
            if (Array.isArray(searchHistory)) {
              const searchEntry = {
                id: Date.now().toString(),
                filters: { ...filters },
                sortBy,
                timestamp: Date.now(),
                results: data.total,
              };
              const updated = [searchEntry, ...searchHistory.filter((s: any) => 
                JSON.stringify(s.filters) !== JSON.stringify(filters) || s.sortBy !== sortBy
              )].slice(0, 10);
              localStorage.setItem("leadnexus_search_history", JSON.stringify(updated));
            }
          } catch (error) {
            console.error("Failed to save search history", error);
          }
        }
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleAddLead = async (leadId: string, listId: string) => {
    try {
      await api.post(`/leads/lists/${listId}/add/${leadId}`);
    } catch (error) {
      console.error("Unable to add lead", error);
    }
  };

  const handleCreateList = useCallback(async (listName?: string) => {
    const name = listName || prompt("Name your lead list");
    if (!name) return;
    const { data } = await api.post<LeadList>("/leads/lists", { list_name: name });
    setLeadLists((prev) => [...prev, data]);
  }, []);

  // Listen for custom events
  useEffect(() => {
    const handleCreateListEvent = (e: CustomEvent) => {
      handleCreateList(e.detail.name);
    };
    const handleAdvancedSearchEvent = (e: CustomEvent) => {
      const params = e.detail as URLSearchParams;
      if (params) {
        fetchLeads(1, params);
      }
    };
    
    window.addEventListener("createLeadList", handleCreateListEvent as EventListener);
    window.addEventListener("advancedSearch", handleAdvancedSearchEvent as EventListener);
    
    return () => {
      window.removeEventListener("createLeadList", handleCreateListEvent as EventListener);
      window.removeEventListener("advancedSearch", handleAdvancedSearchEvent as EventListener);
    };
  }, [handleCreateList]);

  useEffect(() => {
    fetchLeadLists();
    fetchLeads();
  }, []);

  useEffect(() => {
    fetchLeads(1);
  }, [groupByCompany, sortBy, pagination.limit]);
  
  const handleClearFilters = () => {
    setFilters({ job_title: "", company: "", location: "", domain: "" });
    setSortBy("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v.trim() !== "").length + (sortBy ? 1 : 0);

  return (
    <div className="space-y-10">
      <div className="glass-panel rounded-3xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Welcome back, {user?.email}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Command Center</h1>
            <p className="text-gray-400">Subscription: {user?.plan ?? "—"} | Status: {user?.subscription_status}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmailAlerts(true)}
              className="flex items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-medium text-cyan hover:bg-cyan/20 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="hidden sm:inline">Email Alerts</span>
            </button>
            <button
              onClick={() => setShowDeduplication(true)}
              className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Find Duplicates</span>
            </button>
          </div>
        </div>
      </div>
      
      <DashboardStats
        totalMatches={pagination.total}
        activeFilters={activeFiltersCount}
        leadListsCount={leadLists.length}
      />
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <SearchFilters
          filters={filters}
          sortBy={sortBy}
          resultsPerPage={pagination.limit}
          groupByCompany={groupByCompany}
          onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
          onFiltersChange={setFilters}
          onSortChange={setSortBy}
          onResultsPerPageChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
          onSearch={() => fetchLeads(1)}
          onClearFilters={handleClearFilters}
          onToggleGroup={setGroupByCompany}
          />
        </div>
        <ResultsView
          leads={leads}
          groups={groups}
          groupByCompany={groupByCompany}
          pagination={pagination}
          loading={loading}
          initialLoad={initialLoad}
          onPaginate={fetchLeads}
          leadLists={leadLists}
          onAddLead={handleAddLead}
          onCreateList={handleCreateList}
        />
      </div>
      <DashboardInsights
        leads={leads}
        groups={groups}
        leadLists={leadLists}
        totalMatches={pagination.total}
      />

      {/* Deduplication Tool */}
      <DeduplicationTool
        isOpen={showDeduplication}
        onClose={() => setShowDeduplication(false)}
        onRefresh={() => fetchLeads(pagination.page)}
      />

      {/* Email Alerts */}
      <EmailAlerts
        isOpen={showEmailAlerts}
        onClose={() => setShowEmailAlerts(false)}
      />
    </div>
  );
};

export default DashboardPage;


