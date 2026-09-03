import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  Tag,
  Smile,
  Trash2,
  ArrowRight,
  MessageSquare,
  Sparkles,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { JournalEntry } from "../types";

interface EntryHistoryProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onNewReflection: () => void;
}

export const EntryHistory: React.FC<EntryHistoryProps> = ({
  entries,
  onSelectEntry,
  onDeleteEntry,
  onNewReflection,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derive categories from entries
  const categories = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ["All", ...Array.from(set)];
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        !searchQuery.trim() ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.aiResponse && entry.aiResponse.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "All" || entry.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [entries, searchQuery, selectedCategory]);

  // Total follow-up turns counter
  const totalTurns = useMemo(() => {
    return entries.reduce((acc, curr) => acc + (curr.turns?.length || 0), 0);
  }, [entries]);

  const confirmDelete = async (entryId: string) => {
    try {
      setIsDeleting(true);
      await onDeleteEntry(entryId);
      setEntryToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Past Reflections &amp; History
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Browse through your private Firestore journal entries and Gemini conversations.
          </p>
        </div>

        <button
          id="new-reflection-from-history-btn"
          onClick={onNewReflection}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-100 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span>New Reflection</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Total Reflections</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{entries.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Follow-Up Turns</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalTurns}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 font-medium">Cloud Isolation</p>
          <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Owner-Bound UID</span>
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-xl focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            id="history-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections, AI summaries, or insights..."
            className="w-full bg-transparent text-xs sm:text-sm outline-hidden text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-gray-400 flex items-center gap-1 mr-1 text-[11px] font-bold uppercase tracking-widest">
              <Filter className="w-3 h-3" />
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List / Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {entries.length === 0 ? "No reflections recorded yet" : "No matching reflections found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
              {entries.length === 0
                ? "Start your private journal by recording your first reflection. Gemini will accompany your thoughts with deep inquiry."
                : "Try adjusting your search terms or selecting a different category filter."}
            </p>
          </div>
          {entries.length === 0 && (
            <button
              onClick={onNewReflection}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-md shadow-indigo-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              Write First Reflection
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              id={`entry-card-${entry.id}`}
              className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group text-left"
            >
              <div
                onClick={() => onSelectEntry(entry)}
                className="p-5 flex-1 cursor-pointer"
              >
                {/* Meta tags & date */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {entry.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {entry.mood}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 capitalize">
                      {entry.mode}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {entry.title}
                </h3>

                {/* Content snippet */}
                <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {entry.content}
                </p>

                {/* AI response preview */}
                {entry.aiResponse && (
                  <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-[11px] text-gray-700 line-clamp-2">
                    <span className="font-bold text-indigo-900">Gemini: </span>
                    {entry.aiResponse.replace(/^[#*\-\s]+/, "").slice(0, 140)}...
                  </div>
                )}
              </div>

              {/* Bottom footer: Turns count and delete trigger */}
              <div className="px-5 py-2.5 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                  {entry.turns && entry.turns.length > 0 ? (
                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                      <MessageSquare className="w-3 h-3" />
                      {entry.turns.length} follow-up {entry.turns.length === 1 ? "turn" : "turns"}
                    </span>
                  ) : (
                    <span>1 initial interaction</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`delete-entry-btn-${entry.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEntryToDelete(entry.id);
                    }}
                    title="Delete Entry"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectEntry(entry)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-[#E5E7EB]">
            <h4 className="text-lg font-bold text-gray-900">
              Delete Reflection?
            </h4>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              This reflection and all follow-up conversations will be permanently deleted from your private Firestore database.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setEntryToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={() => confirmDelete(entryToDelete)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
