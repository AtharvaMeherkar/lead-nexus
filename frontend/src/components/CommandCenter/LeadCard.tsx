import { useState } from "react";
import { Copy, Mail, User, Building2, MapPin, Globe, ChevronDown, ChevronUp, Check, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Lead, LeadList } from "../../types";
import LeadNotes from "./LeadNotes";
import EmailTemplates from "./EmailTemplates";

interface LeadCardProps {
  lead: Lead;
  leadLists: LeadList[];
  onAdd: (leadId: string, listId: string) => Promise<void>;
}

const LeadCard = ({ lead, leadLists, onAdd }: LeadCardProps) => {
  const [selectedList, setSelectedList] = useState<string>(leadLists[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<"email" | "contact" | null>(null);
  const [showEmailTemplates, setShowEmailTemplates] = useState(false);

  const handleAdd = async () => {
    if (!selectedList) return;
    setPending(true);
    await onAdd(lead.id, selectedList);
    setPending(false);
  };

  const copyToClipboard = async (text: string, type: "email" | "contact") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyEmail = () => {
    copyToClipboard(lead.email, "email");
  };

  const handleCopyContact = () => {
    // Format job titles nicely for contact info
    const jobTitles = (lead.job_title || "Unknown").split(',').map((t: string) => t.trim()).join(', ');
    const contactInfo = `${lead.full_name}\n${lead.email}\n${jobTitles}\n${lead.company_name}\n${lead.location || "Remote"}\n${lead.domain || ""}`;
    copyToClipboard(contactInfo, "contact");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-panel space-y-4 rounded-2xl md:rounded-3xl border border-white/10 p-4 md:p-5 transition-all hover:border-cyan/30"
    >
      {/* Header with Quick Actions */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-cyan/60" />
            <p className="text-lg font-semibold text-white">{lead.full_name}</p>
            {lead.lead_score !== undefined && lead.lead_score !== null && (
              <span
                className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${
                  lead.lead_score >= 70
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : lead.lead_score >= 50
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                }`}
                title="ML-based Lead Quality Score"
              >
                {Math.round(lead.lead_score)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {(lead.job_title || "Unknown").split(',').map((title, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-lg border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-xs font-medium text-cyan"
              >
                {title.trim()}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-medium text-cyan">
            {lead.company_name}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/10 p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="relative flex flex-wrap gap-2">
        <button
          onClick={handleCopyEmail}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
          title="Copy email"
        >
          {copied === "email" ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" />
              <span>Copy Email</span>
            </>
          )}
        </button>
        <button
          onClick={handleCopyContact}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
          title="Copy full contact info"
        >
          {copied === "contact" ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Contact</span>
            </>
          )}
        </button>
        <div className="relative">
          <LeadNotes leadId={lead.id} />
        </div>
        <button
          onClick={() => setShowEmailTemplates(true)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
          title="Email templates"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Email</span>
        </button>
      </div>

      {/* Basic Info (Always Visible) */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Mail className="h-4 w-4 text-cyan/60" />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <MapPin className="h-4 w-4 text-cyan/60" />
          <span>{lead.location ?? "Remote"}</span>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Building2 className="h-4 w-4 text-cyan/60" />
                <span className="font-medium text-gray-300">Company:</span>
                <span>{lead.company_name}</span>
              </div>
              {lead.domain && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="h-4 w-4 text-cyan/60" />
                  <span className="font-medium text-gray-300">Domain:</span>
                  <span className="text-cyan">{lead.domain}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="h-4 w-4 text-cyan/60" />
                <span className="font-medium text-gray-300">Role:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(lead.job_title || "Unknown").split(',').map((title, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md border border-cyan/20 bg-cyan/10 px-2 py-0.5 text-xs font-medium text-cyan"
                    >
                      {title.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to List Section */}
      <div className="flex flex-col gap-2 text-sm">
        {leadLists.length > 0 ? (
          <>
            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-cyan focus:bg-white/10"
            >
              {leadLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.list_name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={pending || !selectedList}
              className="flex items-center justify-center gap-2 rounded-2xl border border-cyan/40 bg-cyan/10 px-3 py-2 font-semibold text-cyan transition hover:bg-cyan/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add to list</span>
              )}
            </button>
          </>
        ) : (
          <p className="text-center text-xs text-gray-500">Create a list to add leads</p>
        )}
      </div>

      {/* Email Templates Modal */}
      <EmailTemplates
        lead={lead}
        isOpen={showEmailTemplates}
        onClose={() => setShowEmailTemplates(false)}
      />
    </motion.div>
  );
};

export default LeadCard;


