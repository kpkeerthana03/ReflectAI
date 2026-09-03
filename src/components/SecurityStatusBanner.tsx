import React, { useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, Lock, Key, Database, Cpu } from "lucide-react";
import { UserProfile } from "../types";

interface SecurityStatusBannerProps {
  user: UserProfile;
}

export const SecurityStatusBanner: React.FC<SecurityStatusBannerProps> = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white text-gray-800 rounded-2xl p-4 shadow-xs border border-[#E5E7EB] transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 tracking-tight">
                User-Isolated Architecture Active
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-gray-500">
              Vault Bound to UID:{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded-sm font-mono text-emerald-700">
                {user.uid.slice(0, 10)}...{user.uid.slice(-6)}
              </code>
            </p>
          </div>
        </div>

        <button
          id="toggle-security-details-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? "Hide Details" : "Security Specs"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <Database className="w-3.5 h-3.5" />
              <span>Owner-Bound Storage</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Path: <code className="text-gray-800 font-mono">/users/{user.uid.slice(0, 6)}.../reflections/</code>. Enforced by rules: <code className="text-gray-800 font-mono">request.auth.uid == userId</code>.
            </p>
          </div>

          <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
              <Key className="w-3.5 h-3.5" />
              <span>Server-Side Secret Hygiene</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Gemini API keys are maintained purely in Secret Manager / server environment and are strictly hidden from the browser client.
            </p>
          </div>

          <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
              <Cpu className="w-3.5 h-3.5" />
              <span>Resilient Model Fallback Ladder</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Primary: <code className="text-gray-800 font-mono">gemini-3.6-flash</code> with automated fallback to <code className="text-gray-800 font-mono">gemini-3.1-flash-lite</code> &amp; <code className="text-gray-800 font-mono">gemini-3.7-flash</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
