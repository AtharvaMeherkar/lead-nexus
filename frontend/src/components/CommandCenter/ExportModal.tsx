import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, FileText, FileSpreadsheet, FileJson, File, CheckSquare, Square } from "lucide-react";
import { Lead } from "../../types";
import { useNotification } from "../../context/NotificationContext";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  selectedLeads?: Set<string>;
}

type ExportFormat = "csv" | "excel" | "json" | "pdf";

const AVAILABLE_FIELDS = [
  { key: "full_name", label: "Full Name", default: true },
  { key: "email", label: "Email", default: true },
  { key: "job_title", label: "Job Title", default: true },
  { key: "company_name", label: "Company", default: true },
  { key: "location", label: "Location", default: true },
  { key: "domain", label: "Domain", default: false },
  { key: "lead_score", label: "Lead Score", default: false },
  { key: "id", label: "Lead ID", default: false },
] as const;

const ExportModal = ({ isOpen, onClose, leads, selectedLeads }: ExportModalProps) => {
  const { showNotification } = useNotification();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(AVAILABLE_FIELDS.filter((f) => f.default).map((f) => f.key))
  );
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const leadsToExport = selectedLeads && selectedLeads.size > 0
    ? leads.filter((l) => selectedLeads.has(l.id))
    : leads;

  const toggleField = (fieldKey: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldKey)) {
      newSelected.delete(fieldKey);
    } else {
      newSelected.add(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const exportToCSV = () => {
    const headers = Array.from(selectedFields).map((key) => 
      AVAILABLE_FIELDS.find((f) => f.key === key)?.label || key
    );
    const rows = leadsToExport.map((lead) =>
      Array.from(selectedFields).map((key) => {
        const value = (lead as any)[key] || "";
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      })
    );

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = leadsToExport.map((lead) => {
      const obj: any = {};
      Array.from(selectedFields).forEach((key) => {
        obj[key] = (lead as any)[key] || null;
      });
      return obj;
    });

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // For Excel, we'll create a CSV with .xlsx extension
    // In production, you'd use a library like xlsx or exceljs
    exportToCSV();
    showNotification({
      type: "info",
      title: "Excel Export",
      message: "Excel format uses CSV structure. For full Excel support, install exceljs library.",
    });
  };

  const exportToPDF = () => {
    // For PDF, we'll create an HTML table and print it
    // In production, you'd use a library like jsPDF or pdfmake
    const headers = Array.from(selectedFields).map((key) => 
      AVAILABLE_FIELDS.find((f) => f.key === key)?.label || key
    );
    
    let html = `
      <html>
        <head>
          <title>Leads Export</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Leads Export</h1>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${leadsToExport.map((lead) => 
                `<tr>${Array.from(selectedFields).map((key) => 
                  `<td>${String((lead as any)[key] || "")}</td>`
                ).join("")}</tr>`
              ).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        win.print();
      };
    }
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedFields.size === 0) {
      showNotification({
        type: "error",
        title: "No Fields Selected",
        message: "Please select at least one field to export.",
      });
      return;
    }

    if (leadsToExport.length === 0) {
      showNotification({
        type: "error",
        title: "No Leads to Export",
        message: "There are no leads to export.",
      });
      return;
    }

    setExporting(true);
    try {
      switch (format) {
        case "csv":
          exportToCSV();
          break;
        case "json":
          exportToJSON();
          break;
        case "excel":
          exportToExcel();
          break;
        case "pdf":
          exportToPDF();
          break;
      }
      
      showNotification({
        type: "success",
        title: "Export Successful",
        message: `Exported ${leadsToExport.length} lead(s) as ${format.toUpperCase()}.`,
      });
      
      // Track export history
      try {
        const exportHistory = JSON.parse(localStorage.getItem("leadnexus_export_history") || "[]");
        if (Array.isArray(exportHistory)) {
          exportHistory.unshift({
            id: Date.now().toString(),
            format,
            count: leadsToExport.length,
            fields: Array.from(selectedFields),
            timestamp: Date.now(),
          });
          localStorage.setItem("leadnexus_export_history", JSON.stringify(exportHistory.slice(0, 50)));
        }
      } catch (error) {
        console.error("Failed to save export history", error);
      }
      
      onClose();
    } catch (error) {
      showNotification({
        type: "error",
        title: "Export Failed",
        message: "An error occurred while exporting. Please try again.",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 bg-night/95 backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan/20">
                  <Download className="h-6 w-6 text-cyan" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Export Leads</h2>
                  <p className="text-sm text-gray-400">{leadsToExport.length} lead(s) ready to export</p>
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
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Export Format</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: "csv", label: "CSV", icon: FileText },
                    { value: "excel", label: "Excel", icon: FileSpreadsheet },
                    { value: "json", label: "JSON", icon: FileJson },
                    { value: "pdf", label: "PDF", icon: File },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setFormat(value as ExportFormat)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                        format === value
                          ? "border-cyan bg-cyan/20 text-cyan"
                          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Select Fields</label>
                <div className="space-y-2">
                  {AVAILABLE_FIELDS.map((field) => (
                    <button
                      key={field.key}
                      onClick={() => toggleField(field.key)}
                      className="w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition text-left"
                    >
                      {selectedFields.has(field.key) ? (
                        <CheckSquare className="h-5 w-5 text-cyan" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-white">{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || selectedFields.size === 0}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-magenta px-6 py-3 font-semibold text-night hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-night border-t-transparent" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export {leadsToExport.length} Lead(s)</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;

