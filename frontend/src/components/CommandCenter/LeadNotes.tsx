import { useState, useEffect } from "react";
import { StickyNote, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeadNotesProps {
  leadId: string;
}

const LeadNotes = ({ leadId }: LeadNotesProps) => {
  const [note, setNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`leadnexus_note_${leadId}`);
      if (saved) {
        setNote(saved);
      }
    } catch (error) {
      console.error("Failed to load note", error);
    }
  }, [leadId]);

  const saveNote = () => {
    setSaving(true);
    if (note.trim()) {
      localStorage.setItem(`leadnexus_note_${leadId}`, note);
    } else {
      localStorage.removeItem(`leadnexus_note_${leadId}`);
    }
    setTimeout(() => {
      setSaving(false);
      setIsOpen(false);
    }, 300);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
        title={note ? "Edit note" : "Add note"}
      >
        <StickyNote className={`h-3.5 w-3.5 ${note ? "text-yellow-400" : ""}`} />
        {note && <span className="truncate max-w-[100px]">{note.substring(0, 20)}...</span>}
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute right-2 top-2 z-20 w-64 rounded-xl border border-white/20 bg-night p-3 shadow-xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-white">Note</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this lead..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan"
          rows={3}
          autoFocus
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={saveNote}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-cyan px-2 py-1 text-xs font-medium text-night transition hover:bg-cyan/90 disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            <span>Save</span>
          </button>
          <button
            onClick={() => {
              setNote("");
              setIsOpen(false);
            }}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-400 transition hover:bg-white/10"
          >
            Clear
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadNotes;

