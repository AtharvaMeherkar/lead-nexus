import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Plus, Edit2, Trash2, Copy, X, FileText, Send, Save } from "lucide-react";
import { Lead } from "../../types";

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

interface EmailTemplatesProps {
  lead?: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSend?: (email: string, subject: string, body: string) => void;
}

const TEMPLATE_CATEGORIES = ["Cold Outreach", "Follow-up", "Introduction", "Custom"];

const DEFAULT_TEMPLATES: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Cold Outreach - Product Introduction",
    category: "Cold Outreach",
    subject: "Quick question about {{company}}",
    body: `Hi {{name}},

I noticed that {{company}} is in the {{industry}} space, and I thought you might be interested in learning about how we help companies like yours [achieve specific goal].

Would you be open to a brief 15-minute conversation this week?

Best regards,
[Your Name]`,
  },
  {
    name: "Follow-up - After Initial Contact",
    category: "Follow-up",
    subject: "Following up on our conversation",
    body: `Hi {{name}},

I wanted to follow up on our recent conversation about [topic]. I believe {{company}} could benefit from [specific value proposition].

Would you be available for a quick call to discuss this further?

Best regards,
[Your Name]`,
  },
  {
    name: "Introduction - Mutual Connection",
    category: "Introduction",
    subject: "Introduction from [Mutual Contact]",
    body: `Hi {{name}},

[Mutual Contact] suggested I reach out to you. I work with companies in the {{industry}} space, and I thought you might find [specific value] interesting.

Would you be open to a brief conversation?

Best regards,
[Your Name]`,
  },
];

const EmailTemplates = ({ lead, isOpen, onClose, onSend }: EmailTemplatesProps) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "Cold Outreach", subject: "", body: "" });
  const [previewEmail, setPreviewEmail] = useState({ subject: "", body: "" });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplate && lead) {
      generatePreview(selectedTemplate, lead);
    } else if (selectedTemplate && !lead) {
      // If no lead provided, just show template without preview
      setPreviewEmail({ subject: selectedTemplate.subject, body: selectedTemplate.body });
    }
  }, [selectedTemplate, lead]);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem("leadnexus_email_templates");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTemplates(parsed);
        } else {
          throw new Error("Invalid template data");
        }
      } else {
        // Initialize with default templates
        const defaultTemplates: EmailTemplate[] = DEFAULT_TEMPLATES.map((t, idx) => ({
          ...t,
          id: `default-${idx}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        setTemplates(defaultTemplates);
        localStorage.setItem("leadnexus_email_templates", JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error("Failed to load templates, initializing defaults", error);
      // Initialize with default templates on error
      const defaultTemplates: EmailTemplate[] = DEFAULT_TEMPLATES.map((t, idx) => ({
        ...t,
        id: `default-${idx}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      setTemplates(defaultTemplates);
      localStorage.setItem("leadnexus_email_templates", JSON.stringify(defaultTemplates));
    }
  };

  const saveTemplates = (newTemplates: EmailTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem("leadnexus_email_templates", JSON.stringify(newTemplates));
  };

  const generatePreview = (template: EmailTemplate, leadData: Lead) => {
    let subject = template.subject;
    let body = template.body;

    // Replace variables
    const variables: Record<string, string> = {
      "{{name}}": leadData.full_name.split(" ")[0] || leadData.full_name,
      "{{full_name}}": leadData.full_name,
      "{{company}}": leadData.company_name,
      "{{job_title}}": (leadData.job_title || "Unknown").split(',').map((t: string) => t.trim()).join(', '),
      "{{location}}": leadData.location || "[Location]",
      "{{email}}": leadData.email,
      "{{industry}}": "[Industry]", // Can be enhanced with backend data
    };

    Object.entries(variables).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
      body = body.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value);
    });

    setPreviewEmail({ subject, body });
  };

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({ name: "", category: "Cold Outreach", subject: "", body: "" });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setIsEditing(true);
    setIsCreating(false);
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
    });
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      alert("Please fill in all required fields");
      return;
    }

    const now = Date.now();
    if (isEditing && selectedTemplate) {
      const updated = templates.map((t) =>
        t.id === selectedTemplate.id
          ? { ...t, ...formData, updatedAt: now }
          : t
      );
      saveTemplates(updated);
      setSelectedTemplate(updated.find((t) => t.id === selectedTemplate.id) || null);
    } else {
      const newTemplate: EmailTemplate = {
        id: `template-${now}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      saveTemplates([...templates, newTemplate]);
      setSelectedTemplate(newTemplate);
    }

    setIsEditing(false);
    setIsCreating(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const updated = templates.filter((t) => t.id !== id);
    saveTemplates(updated);
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const handleCopyToClipboard = () => {
    const text = `Subject: ${previewEmail.subject}\n\n${previewEmail.body}`;
    navigator.clipboard.writeText(text);
    alert("Email copied to clipboard!");
  };

  const handleSendEmail = () => {
    if (onSend && lead) {
      onSend(lead.email, previewEmail.subject, previewEmail.body);
    } else {
      // Fallback: copy to clipboard
      handleCopyToClipboard();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-6xl max-h-[90vh] rounded-3xl border border-white/10 bg-night/95 backdrop-blur-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan/20">
              <Mail className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Email Templates</h2>
              <p className="text-sm text-gray-400">Create and manage email templates for outreach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Templates Sidebar */}
          <div className="w-80 border-r border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <button
                onClick={handleCreateTemplate}
                className="w-full flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-magenta px-4 py-3 text-sm font-semibold text-night hover:opacity-90 transition"
              >
                <Plus className="h-4 w-4" />
                <span>New Template</span>
              </button>
            </div>

            <div className="p-4 space-y-2">
              {TEMPLATE_CATEGORIES.map((category) => {
                const categoryTemplates = templates.filter((t) => t.category === category);
                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</p>
                    <div className="space-y-1">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsEditing(false);
                            setIsCreating(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            selectedTemplate?.id === template.id
                              ? "bg-cyan/20 border border-cyan/30"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{template.name}</p>
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.subject}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTemplate(template);
                                }}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-cyan transition"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(template.id);
                                }}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isCreating || isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan/50 focus:outline-none"
                    placeholder="e.g., Cold Outreach - Product Introduction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-cyan/50 focus:outline-none"
                  >
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan/50 focus:outline-none"
                    placeholder="e.g., Quick question about {{company}}"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Available variables: {`{{name}}, {{company}}, {{job_title}}, {{location}}, {{email}}`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Body</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={12}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan/50 focus:outline-none font-mono text-sm"
                    placeholder="Hi {{name}},&#10;&#10;I noticed that {{company}}..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveTemplate}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-magenta px-6 py-3 font-semibold text-night hover:opacity-90 transition"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Template</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                      setSelectedTemplate(null);
                    }}
                    className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{selectedTemplate.category}</p>
                  </div>
                  <button
                    onClick={() => handleEditTemplate(selectedTemplate)}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>

                {lead && (
                  <div className="rounded-xl border border-cyan/30 bg-cyan/10 p-4">
                    <p className="text-sm font-medium text-cyan mb-2">Preview for: {lead.full_name}</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Subject:</p>
                        <p className="text-white font-medium">{previewEmail.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Body:</p>
                        <div className="rounded-lg bg-night/50 p-4 text-gray-300 whitespace-pre-wrap font-mono text-sm">
                          {previewEmail.body}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {lead && (
                    <button
                      onClick={handleSendEmail}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-magenta px-6 py-3 font-semibold text-night hover:opacity-90 transition"
                    >
                      <Send className="h-4 w-4" />
                      <span>Copy to Clipboard</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Email</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileText className="h-16 w-16 text-gray-500 mb-4" />
                <p className="text-gray-400">Select a template to preview or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailTemplates;

