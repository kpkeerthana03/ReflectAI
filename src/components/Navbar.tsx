import React from "react";
import { Sparkles, ShieldCheck, LogOut, User, BookOpen, Clock, AlertCircle } from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  activeTab: "editor" | "history";
  onTabChange: (tab: "editor" | "history") => void;
  onLogout: () => void;
  entriesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
  entriesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight italic text-indigo-900">
                Reflect AI
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Isolated
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Authenticated Gemini 3.6 Flash &amp; Firestore Vault
            </p>
          </div>
        </div>

        {/* Navigation Tabs when logged in */}
        {user && (
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-[#E5E7EB]">
            <button
              id="nav-editor-btn"
              onClick={() => onTabChange("editor")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "editor"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              New Reflection
            </button>
            <button
              id="nav-history-btn"
              onClick={() => onTabChange("history")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              History
              {entriesCount > 0 && (
                <span className="ml-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                  {entriesCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-right">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">
                    {user.displayName || "Authenticated User"}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight truncate max-w-[140px]">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                id="sign-out-btn"
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-medium text-gray-500">Firebase Auth Protected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
