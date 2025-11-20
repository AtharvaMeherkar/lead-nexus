import { useEffect, useState } from "react";
import {
  User,
  Mail,
  CreditCard,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Building2,
  List,
  TrendingUp,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { Invoice, LeadList } from "../types";
import api from "../utils/api";

const tabs = ["Account", "Subscription & Billing", "Billing History", "Activity"] as const;

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Account");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const { data } = await api.get<Invoice[]>("/invoices/");
      setInvoices(data);
    } catch (error) {
      console.error("Invoice fetch failed", error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchLeadLists = async () => {
    setLoadingLists(true);
    try {
      const { data } = await api.get<LeadList[]>("/leads/lists");
      setLeadLists(data);
    } catch (error) {
      console.error("Failed to load lead lists", error);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    if (user?.subscription_status === "active") {
      fetchLeadLists();
    }
  }, [user]);

  const cancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      await api.post("/subscription/cancel");
      await refreshProfile();
      setCancelMessage("Subscription cancelled. You can reactivate anytime.");
      setTimeout(() => setCancelMessage(null), 5000);
    } catch (error) {
      console.error("Cancel failed", error);
      setCancelMessage("Unable to cancel right now. Please try again later.");
    }
  };

  const downloadInvoice = async (id: string) => {
    try {
      const { data } = await api.get<{ html: string }>(`/invoices/${id}/download`);
      const blob = new Blob([data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "inactive":
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-400/20 text-green-400 border-green-400/30";
      case "inactive":
        return "bg-gray-400/20 text-gray-400 border-gray-400/30";
      default:
        return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30";
    }
  };

  const getPlanColor = (plan: string | null | undefined) => {
    switch (plan?.toLowerCase()) {
      case "weekly":
        return "from-blue-500 to-cyan";
      case "monthly":
        return "from-purple-500 to-magenta";
      case "yearly":
        return "from-cyan to-blue-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl border border-white/10 p-6"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan to-magenta">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Profile Settings</h1>
              <p className="text-sm text-gray-400">Manage your account and subscription</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${getStatusColor(user?.subscription_status || "inactive")}`}>
            {getStatusIcon(user?.subscription_status || "inactive")}
            <span className="text-sm font-medium capitalize">{user?.subscription_status || "Inactive"}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {user?.subscription_status === "active" && (
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Lead Lists</p>
                <p className="mt-1 text-2xl font-bold text-white">{leadLists.length}</p>
              </div>
              <div className="rounded-xl bg-cyan/20 p-3">
                <List className="h-6 w-6 text-cyan" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Invoices</p>
                <p className="mt-1 text-2xl font-bold text-white">{invoices.length}</p>
              </div>
              <div className="rounded-xl bg-magenta/20 p-3">
                <FileText className="h-6 w-6 text-magenta" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Plan</p>
                <p className="mt-1 text-xl font-bold text-white capitalize">{user?.plan || "—"}</p>
              </div>
              <div className={`rounded-xl bg-gradient-to-br ${getPlanColor(user?.plan)} p-3`}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs and Content */}
      <div className="glass-panel rounded-3xl border border-white/10 p-6">
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === activeTab
                  ? "bg-gradient-to-r from-cyan to-magenta text-night"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "Account" && <User className="h-4 w-4" />}
              {tab === "Subscription & Billing" && <CreditCard className="h-4 w-4" />}
              {tab === "Billing History" && <FileText className="h-4 w-4" />}
              {tab === "Activity" && <TrendingUp className="h-4 w-4" />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {/* Account Tab */}
          {activeTab === "Account" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan" />
                  <h3 className="text-lg font-semibold text-white">Account Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Email Address</label>
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-night/50 px-4 py-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <p className="text-lg font-medium text-white">{user?.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">User ID</label>
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-night/50 px-4 py-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <p className="font-mono text-sm text-gray-300">{user?.id}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Account Role</label>
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-night/50 px-4 py-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="rounded-full bg-cyan/20 px-3 py-1 text-xs font-medium capitalize text-cyan">
                        {user?.role || "Client"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {user?.billing_address && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-cyan" />
                    <h3 className="text-lg font-semibold text-white">Billing Address</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>{user.billing_address.full_name}</p>
                    <p>{user.billing_address.address_line1}</p>
                    <p>
                      {user.billing_address.city}, {user.billing_address.state} {user.billing_address.postal_code}
                    </p>
                    <p>{user.billing_address.country}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Subscription & Billing Tab */}
          {activeTab === "Subscription & Billing" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Current Subscription</h3>
                    <p className="mt-1 text-sm text-gray-400">Manage your subscription plan</p>
                  </div>
                  <div className={`rounded-xl bg-gradient-to-br ${getPlanColor(user?.plan)} p-4`}>
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Plan</p>
                    <p className="mt-1 text-xl font-bold capitalize text-white">{user?.plan || "No Plan"}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Status</p>
                    <div className="mt-1 flex items-center gap-2">
                      {getStatusIcon(user?.subscription_status || "inactive")}
                      <p className="text-xl font-bold capitalize text-white">{user?.subscription_status || "Inactive"}</p>
                    </div>
                  </div>
                </div>

                {user?.subscription_status === "active" && (
                  <div className="mt-6">
                    <button
                      onClick={cancelSubscription}
                      className="flex items-center gap-2 rounded-xl border border-red-400/50 bg-red-400/10 px-4 py-3 text-red-300 transition hover:bg-red-400/20"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Cancel Subscription</span>
                    </button>
                    {cancelMessage && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-sm text-cyan"
                      >
                        {cancelMessage}
                      </motion.p>
                    )}
                  </div>
                )}

                {user?.subscription_status === "inactive" && (
                  <div className="mt-6 rounded-xl border border-cyan/30 bg-cyan/10 p-4">
                    <p className="text-sm text-cyan">
                      Your subscription is inactive. Visit the pricing page to activate a plan.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Billing History Tab */}
          {activeTab === "Billing History" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {loadingInvoices ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan border-t-transparent" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-500" />
                  <p className="mt-4 text-gray-400">No invoices found</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                            Plan
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                            Date
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {invoices.map((invoice, index) => (
                          <motion.tr
                            key={invoice.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="transition hover:bg-white/5"
                          >
                            <td className="px-4 py-4">
                              <span className="font-medium text-white">{invoice.plan_name}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-gray-300">{invoice.amount}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  invoice.status === "Paid"
                                    ? "bg-green-400/20 text-green-400"
                                    : "bg-yellow-400/20 text-yellow-400"
                                }`}
                              >
                                {invoice.status === "Paid" ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                {invoice.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="h-4 w-4" />
                                {new Date(invoice.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => downloadInvoice(invoice.id)}
                                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === "Activity" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {user?.subscription_status === "active" ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <List className="h-5 w-5 text-cyan" />
                      <h3 className="text-lg font-semibold text-white">Your Lead Lists</h3>
                    </div>
                    {loadingLists ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-cyan border-t-transparent" />
                      </div>
                    ) : leadLists.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <List className="h-12 w-12 text-gray-500" />
                        <p className="mt-4 text-gray-400">No lead lists created yet</p>
                        <p className="mt-1 text-sm text-gray-500">Create lists from the dashboard</p>
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {leadLists.map((list, index) => (
                          <motion.div
                            key={list.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-night/50 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-cyan/20 p-2">
                                <List className="h-4 w-4 text-cyan" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{list.list_name}</p>
                                <p className="text-xs text-gray-400">Lead List</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan" />
                      <h3 className="text-lg font-semibold text-white">Account Summary</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-night/50 p-4">
                        <p className="text-sm text-gray-400">Total Lead Lists</p>
                        <p className="mt-1 text-2xl font-bold text-white">{leadLists.length}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-night/50 p-4">
                        <p className="text-sm text-gray-400">Total Invoices</p>
                        <p className="mt-1 text-2xl font-bold text-white">{invoices.length}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-500" />
                  <p className="mt-4 text-gray-400">Activate your subscription to view activity</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
