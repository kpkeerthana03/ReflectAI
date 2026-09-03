import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  Tag,
  Smile,
  ShieldCheck,
  Send,
  Loader2,
  Copy,
  Check,
  Download,
  AlertCircle,
  RefreshCw,
  User,
  Bot,
} from "lucide-react";
import { JournalEntry, ConversationTurn } from "../types";

interface ConversationViewProps {
  entry: JournalEntry;
  onBack: () => void;
  onSendFollowUp: (userText: string) => Promise<void>;
  isSendingFollowUp: boolean;
  followUpError: string | null;
  onRetrySave?: () => Promise<void>;
  saveError: string | null;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  entry,
  onBack,
  onSendFollowUp,
  isSendingFollowUp,
  followUpError,
  onRetrySave,
  saveError,
}) => {
  const [followUpText, setFollowUpText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim() || isSendingFollowUp) return;
    const textToSend = followUpText.trim();
    setFollowUpText("");
    await onSendFollowUp(textToSend);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const lines = [
      `# ${entry.title}`,
      `Date: ${new Date(entry.createdAt).toLocaleString()}`,
      `Category: ${entry.category} | Mood: ${entry.mood} | Mode: ${entry.mode}`,
      `AI Model: ${entry.modelUsed}`,
      "",
      "## Original Reflection",
      entry.content,
      "",
      "## Gemini AI Response",
      entry.aiResponse,
      "",
      ...(entry.turns && entry.turns.length > 0
        ? [
            "## Follow-up Dialogue",
            ...entry.turns.map(
              (t) => `### [${t.role.toUpperCase()}] (${new Date(t.timestamp).toLocaleTimeString()})\n${t.content}\n`
            ),
          ]
        : []),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-reflection.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <button
            id="back-to-entries-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-white hover:bg-gray-50 px-3.5 py-2 rounded-xl border border-[#E5E7EB] transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reflections
          </button>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest hidden md:inline">
            Current Session
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-reflection-btn"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 bg-white hover:bg-gray-50 px-3.5 py-2 rounded-xl border border-[#E5E7EB] transition-colors shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Copy Response</span>
              </>
            )}
          </button>

          <button
            id="export-reflection-btn"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/50 px-3.5 py-2 rounded-xl border border-indigo-100 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Save Error Notification with Retry option */}
      {saveError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">Firestore Sync Notice:</p>
              <p className="mt-0.5">{saveError}</p>
            </div>
          </div>
          {onRetrySave && (
            <button
              onClick={onRetrySave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Save
            </button>
          )}
        </div>
      )}

      {/* Session Title & Tags Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Tag className="w-3 h-3 text-indigo-500" />
            {entry.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
            <Smile className="w-3 h-3 text-gray-500" />
            {entry.mood}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Vault Isolated
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {new Date(entry.createdAt).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {entry.title}
        </h2>
      </div>

      {/* Conversation / Dialogue Flow matching Clean Minimalism theme */}
      <div className="flex flex-col gap-6">
        {/* User's Original Prompt Bubble */}
        <div className="flex flex-col gap-1.5 max-w-[85%]">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1 flex items-center gap-1">
            <User className="w-3 h-3 text-gray-400" />
            <span>Your Reflection</span>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl rounded-tl-none border border-gray-200/80 text-gray-800 leading-relaxed shadow-xs">
            <p className="text-sm sm:text-base whitespace-pre-wrap">{entry.content}</p>
          </div>
        </div>

        {/* Gemini AI Initial Response Bubble */}
        <div className="flex flex-col gap-1.5 max-w-[90%] self-end items-end">
          <div className="text-[10px] text-indigo-600 uppercase font-bold tracking-widest mr-1 flex items-center gap-1">
            <span>Gemini AI ({entry.modelUsed || "gemini-3.6-flash"})</span>
            <Bot className="w-3 h-3 text-indigo-600" />
          </div>
          <div className="bg-indigo-600 p-6 rounded-2xl rounded-tr-none text-white leading-relaxed shadow-lg shadow-indigo-100 w-full">
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-white leading-relaxed [&_p]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white [&_ul]:text-white [&_ol]:text-white [&_li]:text-white [&_code]:bg-indigo-700 [&_code]:text-indigo-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_pre]:bg-indigo-800 [&_blockquote]:border-l-indigo-300 [&_blockquote]:text-indigo-100">
              <Markdown>{entry.aiResponse}</Markdown>
            </div>
          </div>
        </div>

        {/* Multi-Turn Follow-Up Dialogue */}
        {entry.turns && entry.turns.length > 0 && (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center gap-2 justify-center my-2">
              <div className="h-px bg-gray-200 flex-1 max-w-[120px]" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Continued Exploration ({entry.turns.length} turns)
              </span>
              <div className="h-px bg-gray-200 flex-1 max-w-[120px]" />
            </div>

            {entry.turns.map((turn) => {
              const isUser = turn.role === "user";
              return (
                <div
                  key={turn.id}
                  className={`flex flex-col gap-1.5 ${
                    isUser
                      ? "max-w-[85%]"
                      : "max-w-[90%] self-end items-end"
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 ${
                      isUser
                        ? "text-gray-400 ml-1"
                        : "text-indigo-600 mr-1"
                    }`}
                  >
                    {isUser ? (
                      <>
                        <User className="w-3 h-3 text-gray-400" />
                        <span>You</span>
                        <span className="text-gray-400 text-[10px] font-normal lowercase ml-1">
                          ({new Date(turn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Gemini AI {turn.modelUsed ? `(${turn.modelUsed})` : ""}</span>
                        <Bot className="w-3 h-3 text-indigo-600" />
                        <span className="text-indigo-400 text-[10px] font-normal lowercase ml-1">
                          ({new Date(turn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    className={`p-5 rounded-2xl leading-relaxed ${
                      isUser
                        ? "bg-gray-50 rounded-tl-none border border-gray-200/80 text-gray-800 shadow-xs"
                        : "bg-indigo-600 rounded-tr-none text-white shadow-lg shadow-indigo-100/60 w-full"
                    }`}
                  >
                    <div
                      className={`prose prose-sm max-w-none leading-relaxed ${
                        isUser
                          ? "text-gray-800"
                          : "prose-invert text-white [&_p]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white [&_ul]:text-white [&_ol]:text-white [&_li]:text-white [&_code]:bg-indigo-700 [&_code]:text-indigo-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_pre]:bg-indigo-800"
                      }`}
                    >
                      <Markdown>{turn.content}</Markdown>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Minimalism Input Area */}
      <div className="pt-4">
        <div className="relative group bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="follow-up-input"
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Continue Your Reflection
            </label>
            <span className="text-[10px] text-gray-400">Multi-turn session active</span>
          </div>

          {followUpError && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {followUpError}
            </p>
          )}

          <form onSubmit={handleFollowUpSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              id="follow-up-input"
              type="text"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              placeholder="Continue your reflection here or ask Gemini for deeper perspectives..."
              disabled={isSendingFollowUp}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-sm text-gray-800 placeholder-gray-400 shadow-xs"
            />
            <button
              id="send-follow-up-btn"
              type="submit"
              disabled={!followUpText.trim() || isSendingFollowUp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSendingFollowUp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Send Reflection</span>
                  <Send className="w-3.5 h-3.5 text-indigo-200" />
                </>
              )}
            </button>
          </form>

          <div className="pt-1 text-center">
            <p className="text-[10px] text-gray-400 italic">
              Session securely isolated to your account. Powered by Gemini 3.6 Flash.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
