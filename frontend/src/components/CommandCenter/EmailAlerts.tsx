import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, X, Plus, Trash2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

interface EmailAlert {
  id: string;
  name: string;
  filters: {
    job_title?: string;
    company?: string;
    location?: string;
    domain?: string;
  };
  enabled: boolean;
  lastTriggered?: number;
  triggerCount: number;
}

interface EmailAlertsProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailAlerts = ({ isOpen, onClose }: EmailAlertsProps) => {
  const { showNotification } = useNotification();
  const [alerts, setAlerts] = useState<EmailAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    job_title: "",
    company: "",
    location: "",
    domain: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const loadAlerts = () => {
    try {
      const stored = localStorage.getItem("leadnexus_email_alerts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAlerts(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load email alerts", error);
      setAlerts([]);
    }
  };

  const saveAlerts = (newAlerts: EmailAlert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem("leadnexus_email_alerts", JSON.stringify(newAlerts));
  };

  const handleCreateAlert = () => {
    if (!formData.name.trim()) {
      showNotification({
        type: "error",
        title: "Name Required",
        message: "Please enter a name for the alert.",
      });
      return;
    }

    const hasFilters = Object.values(formData).some((v, i) => i > 0 && v.trim() !== "");
    if (!hasFilters) {
      showNotification({
        type: "error",
        title: "Filters Required",
        message: "Please specify at least one filter criteria.",
      });
      return;
    }

    const newAlert: EmailAlert = {
      id: `alert-${Date.now()}`,
      name: formData.name,
      filters: {
        job_title: formData.job_title || undefined,
        company: formData.company || undefined,
        location: formData.location || undefined,
        domain: formData.domain || undefined,
      },
      enabled: true,
      triggerCount: 0,
    };

    saveAlerts([...alerts, newAlert]);
    setFormData({ name: "", job_title: "", company: "", location: "", domain: "" });
    setShowForm(false);
    
    showNotification({
      type: "success",
      title: "Alert Created",
      message: `Email alert "${newAlert.name}" has been created.`,
    });
  };

  const handleToggleAlert = (id: string) => {
    const updated = alerts.map((alert) =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    );
    saveAlerts(updated);
  };

  const handleDeleteAlert = (id: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    const updated = alerts.filter((alert) => alert.id !== id);
    saveAlerts(updated);
    showNotification({
      type: "success",
      title: "Alert Deleted",
      message: "Email alert has been deleted.",
    });
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl border border-white/10 bg-night/95 backdrop-blur-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan/20">
              <Bell className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Email Alerts</h2>
              <p className="text-sm text-gray-400">Get notified when new leads match your criteria</p>
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
          {!showForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {alerts.length} alert(s) configured
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-magenta px-4 py-2 text-sm font-semibold text-night hover:opacity-90 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Alert</span>
                </button>
              </div>

              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Alerts Configured</h3>
                  <p className="text-gray-400 mb-4">Create an alert to get notified when new leads match your criteria.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="rounded-xl bg-gradient-to-r from-cyan to-magenta px-6 py-3 font-semibold text-night hover:opacity-90 transition"
                  >
                    Create First Alert
                  </button>
                </div>
              ) : (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{alert.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              alert.enabled
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {alert.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-400">
                          {alert.filters.job_title && (
                            <p>Job Title: <span className="text-white">{alert.filters.job_title}</span></p>
                          )}
                          {alert.filters.company && (
                            <p>Company: <span className="text-white">{alert.filters.company}</span></p>
                          )}
                          {alert.filters.location && (
                            <p>Location: <span className="text-white">{alert.filters.location}</span></p>
                          )}
                          {alert.filters.domain && (
                            <p>Domain: <span className="text-white">{alert.filters.domain}</span></p>
                          )}
                        </div>
                        {alert.triggerCount > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Triggered {alert.triggerCount} time(s)
                            {alert.lastTriggered && (
                              <> • Last: {new Date(alert.lastTriggered).toLocaleDateString()}</>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAlert(alert.id)}
                          className={`p-2 rounded-lg transition ${
                            alert.enabled
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          }`}
                          title={alert.enabled ? "Disable" : "Enable"}
                        >
                          {alert.enabled ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Create New Alert</h3>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Alert Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New Tech Leads"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="e.g., CEO"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Pune"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Domain</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="e.g., gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan to-magenta px-6 py-3 font-semibold text-night hover:opacity-90 transition"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", job_title: "", company: "", location: "", domain: "" });
                  }}
                  className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="rounded-xl border border-cyan/30 bg-cyan/10 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-cyan mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">How Email Alerts Work</p>
                <p className="text-xs text-gray-400">
                  Alerts are checked automatically. When new leads matching your criteria are added to the database,
                  you'll receive an email notification. Make sure your email address is verified in your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailAlerts;

