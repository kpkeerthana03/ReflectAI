import React, { useState } from "react";
import {
  Sparkles,
  Brain,
  FileText,
  Lightbulb,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Tag,
  Smile,
  RefreshCw,
} from "lucide-react";
import { ReflectionMode } from "../types";

interface ReflectionEditorProps {
  onGenerate: (data: {
    title: string;
    content: string;
    category: string;
    mood: string;
    mode: ReflectionMode;
  }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

const MODES: Array<{
  id: ReflectionMode;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    id: "reflect",
    title: "Deep Reflection",
    description: "Empathetic inquiry, perspective reframing & thoughtful questions",
    icon: Brain,
    color: "amber",
  },
  {
    id: "summarize",
    title: "Executive Summary",
    description: "Core themes, emotional state & critical key takeaways",
    icon: FileText,
    color: "indigo",
  },
  {
    id: "brainstorm",
    title: "Brainstorm Ideas",
    description: "Actionable micro-steps, creative options & low-effort wins",
    icon: Lightbulb,
    color: "emerald",
  },
  {
    id: "chat",
    title: "Dialogue",
    description: "Conversational journaling exploring thought threads",
    icon: MessageSquare,
    color: "rose",
  },
];

const CATEGORIES = ["Personal", "Work", "Mindset", "Ideas", "Gratitude", "Decisions", "Health"];
const MOODS = [
  { label: "Reflective", emoji: "💭" },
  { label: "Calm", emoji: "🌿" },
  { label: "Grateful", emoji: "🙏" },
  { label: "Inspired", emoji: "✨" },
  { label: "Focused", emoji: "🎯" },
  { label: "Challenged", emoji: "⚡" },
  { label: "Restless", emoji: "🌊" },
];

const INSPIRATION_PROMPTS = [
  "What gave me energy today, and what silently drained it?",
  "A challenging decision I am currently deliberating between two paths...",
  "An assumption I realized I was making, and how reality differed...",
  "Three small things that grounded me today, and why they mattered...",
  "I feel stuck on a project and need fresh angles to unblock myself...",
];

export const ReflectionEditor: React.FC<ReflectionEditorProps> = ({
  onGenerate,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [mood, setMood] = useState("Reflective");
  const [mode, setMode] = useState<ReflectionMode>("reflect");

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    await onGenerate({
      title: title.trim() || `Reflection on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      content: content.trim(),
      category,
      mood,
      mode,
    });
  };

  const applyInspiration = (promptText: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${promptText}` : promptText));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header and instruction */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Write a Reflection
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Express what is on your mind. Gemini 3.6 Flash will provide insights, inquiry, or summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Gemini 3.6 Flash Engine</span>
        </div>
      </div>

      {/* Error alert with retry indicator */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">Generation Notice:</p>
              <p className="mt-0.5">{errorMessage}</p>
              <p className="mt-1 text-xs text-red-600">
                Your draft is safely retained. You can modify your prompt or retry immediately.
              </p>
            </div>
          </div>
          <button
            onClick={onClearError}
            className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded-md hover:bg-red-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reflection Mode Switcher Cards */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Select AI Companion Mode
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  id={`mode-btn-${m.id}`}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs ring-1 ring-indigo-400"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-[#E5E7EB]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? "text-indigo-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-indigo-900" : "text-gray-800"
                      }`}
                    >
                      {m.title}
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-tight ${isSelected ? "text-indigo-600/80" : "text-gray-400"}`}>
                    {m.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title, Category & Mood Row */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div>
            <label htmlFor="reflection-title" className="block text-xs font-semibold text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              id="reflection-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your reflection a title, or leave blank to auto-date..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-sm bg-white text-gray-800 placeholder-gray-400 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-gray-100">
            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    id={`cat-btn-${cat.toLowerCase()}`}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      category === cat
                        ? "bg-indigo-600 text-white border-indigo-600 font-medium"
                        : "bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                <Smile className="w-3.5 h-3.5 text-gray-400" />
                Current Mindset / Mood
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    id={`mood-btn-${m.label.toLowerCase()}`}
                    type="button"
                    onClick={() => setMood(m.label)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      mood === m.label
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium"
                        : "bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-1">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with Prompts */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="reflection-content" className="block text-xs font-semibold text-gray-700">
              Journal Content / Reflection Thoughts *
            </label>
            <span className="text-xs text-gray-400">
              {wordCount} words &bull; {content.length} characters
            </span>
          </div>

          <textarea
            id="reflection-content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your unfiltered thoughts, what happened today, or an idea you are exploring. Take as much space as you need..."
            className="w-full p-4 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-sm sm:text-base leading-relaxed resize-y bg-white text-gray-800 placeholder-gray-400 shadow-xs"
            required
          />

          {/* Quick inspiration prompts */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Writing Prompts &amp; Inspiration:
            </p>
            <div className="flex flex-wrap gap-2">
              {INSPIRATION_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  id={`prompt-btn-${idx}`}
                  type="button"
                  onClick={() => applyInspiration(p)}
                  className="text-xs text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-left transition-colors border border-gray-200/80 cursor-pointer"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setContent("");
            }}
            disabled={isLoading || (!title && !content)}
            className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40 cursor-pointer"
          >
            Clear Draft
          </button>

          <button
            id="submit-reflection-btn"
            type="submit"
            disabled={!content.trim() || isLoading}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-100 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating with Gemini 3.6 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>
                  {mode === "reflect" && "Reflect & Inquire with Gemini"}
                  {mode === "summarize" && "Summarize Insights with Gemini"}
                  {mode === "brainstorm" && "Brainstorm Solutions with Gemini"}
                  {mode === "chat" && "Begin Dialogue with Gemini"}
                </span>
                <Send className="w-3.5 h-3.5 text-indigo-200" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
