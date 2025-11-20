import { useState, useEffect } from "react";
import { Bookmark, X, Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    job_title: string;
    company: string;
    location: string;
    domain: string;
  };
  sortBy: string;
  timestamp: number;
}

interface SavedSearchesProps {
  onLoadSearch: (search: SavedSearch) => void;
  currentFilters: {
    job_title: string;
    company: string;
    location: string;
    domain: string;
  };
  currentSortBy: string;
}

const SavedSearches = ({ onLoadSearch, currentFilters, currentSortBy }: SavedSearchesProps) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("leadnexus_saved_searches");
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load saved searches", error);
      }
    }
  }, []);

  const saveCurrentSearch = () => {
    if (!searchName.trim()) return;

    const hasFilters = Object.values(currentFilters).some((v) => v.trim() !== "") || currentSortBy !== "";
    if (!hasFilters) {
      alert("Please apply some filters before saving a search.");
      return;
    }

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: { ...currentFilters },
      sortBy: currentSortBy,
      timestamp: Date.now(),
    };

    const updated = [newSearch, ...savedSearches].slice(0, 10); // Keep max 10
    setSavedSearches(updated);
    localStorage.setItem("leadnexus_saved_searches", JSON.stringify(updated));
    setSearchName("");
    setShowSaveDialog(false);
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem("leadnexus_saved_searches", JSON.stringify(updated));
  };

  const isCurrentSearchSaved = () => {
    return savedSearches.some(
      (s) =>
        JSON.stringify(s.filters) === JSON.stringify(currentFilters) && s.sortBy === currentSortBy
    );
  };

  if (savedSearches.length === 0 && !showSaveDialog) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>Save Current Search</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-cyan" />
          <p className="text-sm font-medium text-white">Saved Searches</p>
        </div>
        {!showSaveDialog && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="text-xs text-cyan transition hover:text-cyan/80"
          >
            + Save
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search name..."
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCurrentSearch();
                if (e.key === "Escape") setShowSaveDialog(false);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={saveCurrentSearch}
                disabled={!searchName.trim()}
                className="flex-1 rounded-xl bg-cyan px-3 py-1.5 text-xs font-medium text-night transition hover:bg-cyan/90 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSearchName("");
                }}
                className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence>
          {savedSearches.map((search) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10"
            >
              <button
                onClick={() => onLoadSearch(search)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <Search className="h-3.5 w-3.5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">{search.name}</p>
                  <p className="text-xs text-gray-500">
                    {Object.values(search.filters).filter((v) => v).length} filters
                  </p>
                </div>
              </button>
              <button
                onClick={() => deleteSearch(search.id)}
                className="rounded p-1 text-gray-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                title="Delete search"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SavedSearches;

