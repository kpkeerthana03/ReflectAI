import React, { useState } from "react";
import { Sparkles, ShieldCheck, Lock, ArrowRight, Brain, BookOpen, Layers, CheckCircle2, AlertCircle } from "lucide-react";

interface LandingPageProps {
  onLogin: () => Promise<void>;
  authError: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, authError }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignInClick = async () => {
    try {
      setIsSigningIn(true);
      await onLogin();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Banner / Privacy Guarantee */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI-Augmented Journaling &amp; Deep Inquiry
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            A private space for your thoughts, reflections, and insights.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Record your daily reflections, explore complex decisions, and converse with{" "}
            <span className="font-semibold text-gray-900">Gemini 3.6 Flash</span>. All entries are
            strictly isolated to your private Firestore vault.
          </p>

          {/* Authentication Call to Action */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <button
              id="sign-in-google-btn"
              onClick={handleSignInClick}
              disabled={isSigningIn}
              className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-md shadow-indigo-100 transition-all active:scale-98 disabled:opacity-75 cursor-pointer"
            >
              {/* Google G vector logo */}
              <div className="bg-white p-1 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
                  />
                </svg>
              </div>
              <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
              <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero passwords stored. Protected by Google Identity &amp; Firebase Auth.</span>
            </div>
          </div>

          {/* Auth Error Banner if popup blocked or network issue */}
          {authError && (
            <div className="mt-4 p-4 max-w-lg mx-auto bg-amber-50 border border-amber-300 rounded-xl text-left flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold">Sign-in Notice:</p>
                <p className="mt-0.5">{authError}</p>
                <p className="mt-1 text-[11px] text-amber-700">
                  Tip: If the preview iframe blocks the Google sign-in popup, try clicking again or opening this app in a new browser tab.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Empathetic AI Companion</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Powered by Google&apos;s latest <span className="font-medium text-gray-800">Gemini 3.6 Flash</span>. Choose from deep self-inquiry, executive summarization, or constructive brainstorming.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Owner-Bound Firestore</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Enforced by hardened Firestore Security Rules. Only your authenticated UID can read or write your personal reflection history. No cross-user access.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Multi-Turn Reflections</h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Continue the conversation beyond the initial entry. Ask follow-up questions, refine ideas, and retain complete session transcripts forever.
            </p>
          </div>
        </div>

        {/* Security & Verification Checklist */}
        <div className="mt-10 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Security &amp; Enterprise Compliance Checklist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Firebase Auth with Google Federated Identity</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Server-Side Gemini Proxy (Secret Manager &amp; Zero API Key Exposure)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Resilient Model Fallback Ladder (Flash 3.6 &rarr; Flash-Lite 3.1 &rarr; Flash 3.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Strict Undefined-Stripped Firestore Transaction Integrity</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 mt-12">
        ReflectAI &bull; Cloud Run &amp; Firebase Architecture &bull; Gemini 3.6 Flash
      </footer>
    </div>
  );
};
