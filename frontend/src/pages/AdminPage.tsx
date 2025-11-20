import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Users, TrendingUp, Database, DollarSign, Activity, Trash2, CheckSquare } from "lucide-react";

import TopNav from "../components/Shared/TopNav";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

interface AdminStats {
  users: {
    total: number;
    active_clients: number;
    inactive_clients: number;
    admin_users: number;
  };
  leads: {
    total: number;
    total_companies: number;
    total_job_titles: number;
  };
  subscriptions: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

interface User {
  id: string;
  email: string;
  role: string;
  subscription_status: string;
  plan: string | null;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  company_name: string;
  location: string | null;
  domain: string | null;
}

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "leads">("overview");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsRes = await api.get<AdminStats>("/admin/stats");
      setStats(statsRes.data);

      // Fetch users
      const usersRes = await api.get<{ total: number; users: User[] }>("/admin/users?limit=100");
      setUsers(usersRes.data.users);

      // Fetch recent leads
      const leadsRes = await api.get<{ leads: Lead[] }>("/admin/recent-leads?limit=20");
      setRecentLeads(leadsRes.data.leads);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load admin data");
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    try {
      setUploading(true);
      setUploadMessage(null);

      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await api.post("/admin/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadMessage(`✅ ${response.data.detail || "CSV uploaded successfully!"}`);
      setCsvFile(null);
      
      // Refresh data after upload
      setTimeout(() => {
        fetchData();
        setUploadMessage(null);
      }, 2000);
    } catch (err: any) {
      setUploadMessage(`❌ ${err.response?.data?.detail || "Failed to upload CSV"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm(`Are you sure you want to delete this lead? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/leads/${leadId}`);
      setRecentLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      setSelectedLeads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
      // Refresh stats
      fetchData();
    } catch (err: any) {
      alert(`Failed to delete lead: ${err.response?.data?.detail || "Unknown error"}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} lead(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await api.post("/admin/leads/bulk-delete", { lead_ids: Array.from(selectedLeads) });
      setRecentLeads((prev) => prev.filter((lead) => !selectedLeads.has(lead.id)));
      setSelectedLeads(new Set());
      alert(`✅ ${response.data.detail || "Leads deleted successfully"}`);
      // Refresh stats
      fetchData();
    } catch (err: any) {
      alert(`❌ Failed to delete leads: ${err.response?.data?.detail || "Unknown error"}`);
    } finally {
      setDeleting(false);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const selectAllLeads = () => {
    if (selectedLeads.size === recentLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(recentLeads.map((lead) => lead.id)));
    }
  };

  if (user?.role !== "admin") {
    return null;
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    gradient 
  }: { 
    title: string; 
    value: number | string; 
    subtitle: string; 
    icon: any;
    gradient: string;
  }) => (
    <div className="glass-panel rounded-3xl border border-white/10 p-6 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`p-2 rounded-xl ${gradient}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-4xl font-bold text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-night text-white">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">
            Admin Command Center
          </h1>
          <p className="mt-2 text-gray-400">Welcome back, {user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          {[
            { id: "overview", label: "Overview" },
            { id: "users", label: "Users" },
            { id: "leads", label: "Recent Leads" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-cyan border-b-2 border-cyan"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Loading admin data...</p>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                {/* Main Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    subtitle="All registered users"
                    icon={Users}
                    gradient="bg-gradient-to-br from-cyan/20 to-cyan/10"
                  />
                  <StatCard
                    title="Active Clients"
                    value={stats.users.active_clients}
                    subtitle="With active subscriptions"
                    icon={Activity}
                    gradient="bg-gradient-to-br from-green-500/20 to-green-500/10"
                  />
                  <StatCard
                    title="Total Leads"
                    value={stats.leads.total}
                    subtitle="In database"
                    icon={Database}
                    gradient="bg-gradient-to-br from-magenta/20 to-magenta/10"
                  />
                  <StatCard
                    title="Companies"
                    value={stats.leads.total_companies}
                    subtitle="Unique companies"
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-purple-500/20 to-purple-500/10"
                  />
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="glass-panel rounded-3xl border border-white/10 p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">User Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active:</span>
                        <span className="text-green-400 font-semibold">{stats.users.active_clients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Inactive:</span>
                        <span className="text-gray-400">{stats.users.inactive_clients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Admins:</span>
                        <span className="text-cyan font-semibold">{stats.users.admin_users}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl border border-white/10 p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Subscription Plans</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weekly:</span>
                        <span className="text-white font-semibold">{stats.subscriptions.weekly}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly:</span>
                        <span className="text-white font-semibold">{stats.subscriptions.monthly}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Yearly:</span>
                        <span className="text-white font-semibold">{stats.subscriptions.yearly}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl border border-white/10 p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Lead Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Leads:</span>
                        <span className="text-magenta font-semibold">{stats.leads.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Companies:</span>
                        <span className="text-white font-semibold">{stats.leads.total_companies}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Job Titles:</span>
                        <span className="text-white font-semibold">{stats.leads.total_job_titles}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CSV Upload */}
                <div className="glass-panel rounded-3xl border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload size={24} className="text-cyan" />
                    <h2 className="text-2xl font-semibold text-white">Import Leads</h2>
                  </div>
                  <form onSubmit={handleCsvUpload} className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan/20 file:text-cyan hover:file:bg-cyan/30 file:cursor-pointer"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Supported formats: CSV (.csv), Excel (.xlsx, .xls)
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={!csvFile || uploading}
                      className="w-full rounded-2xl bg-gradient-to-r from-cyan to-magenta px-6 py-3 font-semibold text-night shadow-lg shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      {uploading ? "Uploading..." : "Upload File"}
                    </button>
                    {uploadMessage && (
                      <p className={`text-sm ${uploadMessage.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                        {uploadMessage}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-2xl font-semibold text-white">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white">{u.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                u.role === "admin"
                                  ? "bg-cyan/20 text-cyan"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                u.subscription_status === "active"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {u.subscription_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">{u.plan || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Leads Tab */}
            {activeTab === "leads" && (
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">Recent Leads ({recentLeads.length})</h2>
                  {selectedLeads.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={deleting}
                      className="flex items-center gap-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 hover:bg-red-500/30 transition disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                      <span>Delete Selected ({selectedLeads.size})</span>
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={selectAllLeads}
                            className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase hover:text-white transition"
                          >
                            <CheckSquare size={16} className={selectedLeads.size === recentLeads.length && recentLeads.length > 0 ? "text-cyan" : ""} />
                            Select All
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Job Title</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Company</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {recentLeads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            No leads found
                          </td>
                        </tr>
                      ) : (
                        recentLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleLeadSelection(lead.id)}
                                className="text-gray-400 hover:text-cyan transition"
                              >
                                <CheckSquare size={18} className={selectedLeads.has(lead.id) ? "text-cyan" : ""} />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-white font-medium">{lead.full_name}</td>
                            <td className="px-6 py-4 text-cyan">{lead.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-1">
                                {(lead.job_title || "Unknown").split(',').map((title, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center rounded-md border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-xs font-medium text-cyan"
                                  >
                                    {title.trim()}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{lead.company_name}</td>
                            <td className="px-6 py-4 text-gray-400">{lead.location || "—"}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 transition"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
