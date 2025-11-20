import { useState } from "react";
import { Filter, X, ArrowUpDown, Settings, Plus, Trash2 } from "lucide-react";
import SavedSearches from "./SavedSearches";

interface Props {
  filters: {
    job_title: string;
    company: string;
    location: string;
    domain: string;
  };
  sortBy: string;
  resultsPerPage: number;
  groupByCompany: boolean;
  onChange: (key: keyof Props["filters"], value: string) => void;
  onFiltersChange?: (filters: Props["filters"]) => void;
  onSortChange: (value: string) => void;
  onResultsPerPageChange: (value: number) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  onToggleGroup: (value: boolean) => void;
}

const SearchFilters = ({
  filters,
  sortBy,
  resultsPerPage,
  groupByCompany,
  onChange,
  onFiltersChange,
  onSortChange,
  onResultsPerPageChange,
  onSearch,
  onClearFilters,
  onToggleGroup,
}: Props) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [booleanOperator, setBooleanOperator] = useState<"AND" | "OR" | "NOT">("AND");
  const [multiJobTitles, setMultiJobTitles] = useState<string[]>([]);
  const [multiCompanies, setMultiCompanies] = useState<string[]>([]);
  const [multiLocations, setMultiLocations] = useState<string[]>([]);

  const inputs = [
    { key: "job_title" as const, label: "Job Title", placeholder: "e.g. Growth Lead", icon: "👤" },
    { key: "company" as const, label: "Company", placeholder: "e.g. Figma", icon: "🏢" },
    { key: "location" as const, label: "Location", placeholder: "e.g. Pune", icon: "📍" },
    { key: "domain" as const, label: "Domain", placeholder: "e.g. gmail.com", icon: "🌐" },
  ];

  const hasActiveFilters = Object.values(filters).some((v) => v.trim() !== "") || sortBy !== "" || 
    multiJobTitles.length > 0 || multiCompanies.length > 0 || multiLocations.length > 0;

  const presets = [
    { name: "Remote Only", filters: { job_title: "", company: "", location: "Remote", domain: "" } },
    { name: "Tech Companies", filters: { job_title: "", company: "Tech", location: "", domain: "" } },
    { name: "Senior Roles", filters: { job_title: "Senior", company: "", location: "", domain: "" } },
    { name: "Startups", filters: { job_title: "", company: "Startup", location: "", domain: "" } },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    if (onFiltersChange) {
      onFiltersChange(preset.filters);
    } else {
      Object.keys(preset.filters).forEach((key) => {
        onChange(key as keyof Props["filters"], preset.filters[key as keyof typeof preset.filters]);
      });
    }
    setTimeout(() => onSearch(), 100);
  };

  const handleAdvancedSearch = () => {
    // Build query params with advanced filters
    const params = new URLSearchParams();
    
    // Clear single filters when using multi-select
    if (multiJobTitles.length > 0) {
      multiJobTitles.forEach(jt => params.append("job_titles", jt));
      params.set("boolean_operator", booleanOperator);
    } else if (filters.job_title) {
      params.set("job_title", filters.job_title);
    }
    
    if (multiCompanies.length > 0) {
      multiCompanies.forEach(c => params.append("companies", c));
      params.set("boolean_operator", booleanOperator);
    } else if (filters.company) {
      params.set("company", filters.company);
    }
    
    if (multiLocations.length > 0) {
      multiLocations.forEach(l => params.append("locations", l));
      params.set("boolean_operator", booleanOperator);
    } else if (filters.location) {
      params.set("location", filters.location);
    }
    
    if (filters.domain) params.set("domain", filters.domain);
    if (sortBy) params.set("sort_by", sortBy);
    params.set("limit", resultsPerPage.toString());
    params.set("page", "1");
    params.set("group_by_company", groupByCompany.toString());
    
    // Trigger search with advanced params
    window.dispatchEvent(new CustomEvent("advancedSearch", { detail: params }));
    // Don't call onSearch() here - let the event handler in DashboardPage handle it
  };

  const addMultiValue = (type: "job_title" | "company" | "location") => {
    const input = document.getElementById(`multi-${type}-input`) as HTMLInputElement;
    const value = input?.value.trim();
    if (!value) return;
    
    if (type === "job_title") {
      if (!multiJobTitles.includes(value)) {
        setMultiJobTitles([...multiJobTitles, value]);
      }
    } else if (type === "company") {
      if (!multiCompanies.includes(value)) {
        setMultiCompanies([...multiCompanies, value]);
      }
    } else if (type === "location") {
      if (!multiLocations.includes(value)) {
        setMultiLocations([...multiLocations, value]);
      }
    }
    input.value = "";
  };

  const removeMultiValue = (type: "job_title" | "company" | "location", value: string) => {
    if (type === "job_title") {
      setMultiJobTitles(multiJobTitles.filter(v => v !== value));
    } else if (type === "company") {
      setMultiCompanies(multiCompanies.filter(v => v !== value));
    } else if (type === "location") {
      setMultiLocations(multiLocations.filter(v => v !== value));
    }
  };

  return (
    <div className="glass-panel rounded-2xl md:rounded-3xl border border-white/10 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Filters</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Precision Targeting</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
            title="Clear all filters"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filter Presets */}
      <div className="mt-4">
        <p className="mb-2 text-xs text-gray-400">Quick Filters</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {inputs.map((input) => (
          <label key={input.key} className="block text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>{input.icon}</span>
              <span>{input.label}</span>
            </div>
            <input
              value={filters[input.key]}
              placeholder={input.placeholder}
              onChange={(e) => onChange(input.key, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan focus:bg-white/10"
            />
          </label>
        ))}
      </div>

      {/* Advanced Search Toggle */}
      <div className="mt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Advanced Search</span>
          </div>
          <span className={`transition ${showAdvanced ? "rotate-180" : ""}`}>▼</span>
        </button>
      </div>

      {/* Advanced Search Options */}
      {showAdvanced && (
        <div className="mt-4 space-y-4 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">Boolean Operator</label>
            <select
              value={booleanOperator}
              onChange={(e) => setBooleanOperator(e.target.value as "AND" | "OR" | "NOT")}
              className="w-full rounded-xl border border-white/10 bg-night/90 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan hover:bg-night/95"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '10px',
                paddingRight: '2rem',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              <option value="AND" className="bg-night text-white">AND (all conditions must match)</option>
              <option value="OR" className="bg-night text-white">OR (any condition can match)</option>
              <option value="NOT" className="bg-night text-white">NOT (exclude these values)</option>
            </select>
          </div>

          {/* Multi-select Job Titles */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">Multiple Job Titles</label>
            <div className="flex gap-2">
              <input
                id="multi-job_title-input"
                type="text"
                placeholder="e.g. CEO, CTO"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMultiValue("job_title");
                  }
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan"
              />
              <button
                onClick={() => addMultiValue("job_title")}
                className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-cyan transition hover:bg-cyan/20"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {multiJobTitles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {multiJobTitles.map((jt) => (
                  <span
                    key={jt}
                    className="flex items-center gap-1 rounded-lg border border-cyan/30 bg-cyan/10 px-2 py-1 text-xs text-cyan"
                  >
                    {jt}
                    <button
                      onClick={() => removeMultiValue("job_title", jt)}
                      className="hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Multi-select Companies */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">Multiple Companies</label>
            <div className="flex gap-2">
              <input
                id="multi-company-input"
                type="text"
                placeholder="e.g. Google, Microsoft"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMultiValue("company");
                  }
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan"
              />
              <button
                onClick={() => addMultiValue("company")}
                className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-cyan transition hover:bg-cyan/20"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {multiCompanies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {multiCompanies.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1 rounded-lg border border-cyan/30 bg-cyan/10 px-2 py-1 text-xs text-cyan"
                  >
                    {c}
                    <button
                      onClick={() => removeMultiValue("company", c)}
                      className="hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Multi-select Locations */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">Multiple Locations</label>
            <div className="flex gap-2">
              <input
                id="multi-location-input"
                type="text"
                placeholder="e.g. Pune, Mumbai"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMultiValue("location");
                  }
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan"
              />
              <button
                onClick={() => addMultiValue("location")}
                className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-cyan transition hover:bg-cyan/20"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {multiLocations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {multiLocations.map((l) => (
                  <span
                    key={l}
                    className="flex items-center gap-1 rounded-lg border border-cyan/30 bg-cyan/10 px-2 py-1 text-xs text-cyan"
                  >
                    {l}
                    <button
                      onClick={() => removeMultiValue("location", l)}
                      className="hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="mt-6">
        <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort By</span>
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-night/90 px-4 py-3 text-white outline-none transition focus:border-cyan focus:bg-night hover:bg-night/95"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '12px',
            paddingRight: '2.5rem',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        >
          <option value="" className="bg-night text-white">Default (Company)</option>
          <option value="name" className="bg-night text-white">Name</option>
          <option value="company" className="bg-night text-white">Company</option>
          <option value="job_title" className="bg-night text-white">Job Title</option>
          <option value="location" className="bg-night text-white">Location</option>
          <option value="score" className="bg-night text-white">Lead Score (High to Low)</option>
        </select>
      </div>

      {/* Results Per Page */}
      <div className="mt-6">
        <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Filter className="h-4 w-4" />
          <span>Results Per Page</span>
        </label>
        <select
          value={resultsPerPage}
          onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-night/90 px-4 py-3 text-white outline-none transition focus:border-cyan focus:bg-night hover:bg-night/95"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '12px',
            paddingRight: '2.5rem',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        >
          <option value={12} className="bg-night text-white">12</option>
          <option value={24} className="bg-night text-white">24</option>
          <option value={50} className="bg-night text-white">50</option>
          <option value={100} className="bg-night text-white">100</option>
        </select>
      </div>

      {/* Smart View Toggle */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-sm font-medium text-white">Smart View</p>
          <p className="text-xs text-gray-400">Group leads by company</p>
        </div>
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={groupByCompany}
            onChange={(e) => onToggleGroup(e.target.checked)}
            className="sr-only"
          />
          <span className="relative h-6 w-12 rounded-full bg-white/20 transition">
            <span
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition ${
                groupByCompany ? "translate-x-7 bg-cyan" : "translate-x-1"
              }`}
            />
          </span>
        </label>
      </div>

      {/* Search Button */}
      <button
        onClick={() => {
          if (showAdvanced && (multiJobTitles.length > 0 || multiCompanies.length > 0 || multiLocations.length > 0)) {
            handleAdvancedSearch();
          } else {
            onSearch();
          }
        }}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan to-magenta px-4 py-3 font-semibold text-night transition hover:shadow-lg hover:shadow-cyan/20"
      >
        Search
      </button>

      {/* Saved Searches */}
      <SavedSearches
        onLoadSearch={(search) => {
          // Update all filters at once if callback available, otherwise update individually
          if (onFiltersChange) {
            onFiltersChange(search.filters);
          } else {
            Object.keys(search.filters).forEach((key) => {
              onChange(key as keyof Props["filters"], search.filters[key as keyof typeof search.filters]);
            });
          }
          onSortChange(search.sortBy);
          // Trigger search after a brief delay to ensure state updates
          setTimeout(() => onSearch(), 100);
        }}
        currentFilters={filters}
        currentSortBy={sortBy}
      />
    </div>
  );
};

export default SearchFilters;
