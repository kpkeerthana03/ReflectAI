import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  auth,
  loginWithGoogle,
  logout,
  saveJournalEntry,
  deleteJournalEntry,
  appendTurnToEntry,
  subscribeToUserEntries,
} from "./lib/firebase";
import { callGeminiReflect } from "./lib/gemini";
import { JournalEntry, UserProfile, ReflectionMode, ConversationTurn } from "./types";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { ReflectionEditor } from "./components/ReflectionEditor";
import { ConversationView } from "./components/ConversationView";
import { EntryHistory } from "./components/EntryHistory";
import { SecurityStatusBanner } from "./components/SecurityStatusBanner";
import { Loader2 } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Navigation and active view
  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor");
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);

  // User's journal entries from Firestore
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Multi-turn state
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pending unsaved entry for retry
  const [pendingSaveEntry, setPendingSaveEntry] = useState<JournalEntry | null>(null);

  // 1. Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setCurrentUser(null);
        setActiveEntry(null);
        setEntries([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Firestore entries for the authenticated user
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserEntries(
      currentUser.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        // If an active entry is being viewed, keep it in sync with Firestore updates
        setActiveEntry((current) => {
          if (!current) return null;
          const updated = fetchedEntries.find((e) => e.id === current.id);
          return updated || current;
        });
      },
      (error) => {
        console.error("Failed to subscribe to entries:", error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Handle Login
  const handleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      if (err.code === "auth/popup-blocked") {
        setAuthError(
          "The login popup was blocked by your browser or iframe security settings. Please allow popups or open the app in a new tab."
        );
      } else if (err.code === "auth/cancelled-popup-request" || err.code === "auth/popup-closed-by-user") {
        setAuthError("Login window was closed before completing authentication. Please try again.");
      } else {
        setAuthError(err.message || "Failed to authenticate with Google.");
      }
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab("editor");
      setActiveEntry(null);
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  // Generate Reflection & Save to Firestore
  const handleGenerateReflection = async (formData: {
    title: string;
    content: string;
    category: string;
    mood: string;
    mode: ReflectionMode;
  }) => {
    if (!currentUser) return;
    setIsGenerating(true);
    setGenerationError(null);
    setSaveError(null);

    try {
      // Step 1: Call Gemini API via backend proxy
      const geminiResult = await callGeminiReflect({
        prompt: formData.content,
        mode: formData.mode,
      });

      // Step 2: Assemble complete JournalEntry
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        userId: currentUser.uid,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        mood: formData.mood,
        mode: formData.mode,
        aiResponse: geminiResult.text,
        modelUsed: geminiResult.modelUsed || "gemini-3.6-flash",
        turns: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Step 3: Guaranteed Transaction Verification (Persist to Firestore)
      try {
        await saveJournalEntry(currentUser.uid, newEntry);
        setPendingSaveEntry(null);
      } catch (dbErr: any) {
        console.error("Firestore persistence error:", dbErr);
        setPendingSaveEntry(newEntry);
        setSaveError(
          "Reflection generated, but saving to your Firestore vault failed. Click 'Retry Save' to securely persist."
        );
      }

      // Transition to viewing the newly created reflection
      setActiveEntry(newEntry);
    } catch (err: any) {
      console.error("Generation error:", err);
      setGenerationError(err.message || "Failed to generate reflection with Gemini AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Retry Save in case of transient network failure
  const handleRetrySave = async () => {
    if (!currentUser || !pendingSaveEntry) return;
    try {
      await saveJournalEntry(currentUser.uid, pendingSaveEntry);
      setPendingSaveEntry(null);
      setSaveError(null);
    } catch (err: any) {
      setSaveError(`Retry save failed: ${err.message || "Unknown error"}`);
    }
  };

  // Multi-Turn Follow-Up Dialogue
  const handleSendFollowUp = async (userText: string) => {
    if (!currentUser || !activeEntry) return;
    setIsSendingFollowUp(true);
    setFollowUpError(null);

    try {
      // Build conversation history for context
      const history: Array<{ role: "user" | "model"; content: string }> = [
        { role: "user", content: activeEntry.content },
        { role: "model", content: activeEntry.aiResponse },
      ];

      activeEntry.turns?.forEach((t) => {
        history.push({ role: t.role, content: t.content });
      });

      // Call Gemini in conversational chat mode
      const result = await callGeminiReflect({
        prompt: userText,
        mode: "chat",
        history,
      });

      // User turn
      const userTurn: ConversationTurn = {
        id: crypto.randomUUID(),
        role: "user",
        content: userText,
        timestamp: new Date().toISOString(),
      };

      // Model turn
      const modelTurn: ConversationTurn = {
        id: crypto.randomUUID(),
        role: "model",
        content: result.text,
        timestamp: new Date().toISOString(),
        modelUsed: result.modelUsed,
      };

      const updatedTurns = [...(activeEntry.turns || []), userTurn, modelTurn];

      // Update Firestore
      const updatedEntry: JournalEntry = {
        ...activeEntry,
        turns: updatedTurns,
        updatedAt: new Date().toISOString(),
      };

      await saveJournalEntry(currentUser.uid, updatedEntry);
      setActiveEntry(updatedEntry);
    } catch (err: any) {
      console.error("Follow-up error:", err);
      setFollowUpError(err.message || "Failed to process follow-up with Gemini.");
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    await deleteJournalEntry(currentUser.uid, entryId);
    if (activeEntry?.id === entryId) {
      setActiveEntry(null);
      setActiveTab("history");
    }
  };

  // Render Loading Splash while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
            Initializing Secure Firebase Environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "editor") setActiveEntry(null);
        }}
        onLogout={handleLogout}
        entriesCount={entries.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentUser ? (
          <LandingPage onLogin={handleLogin} authError={authError} />
        ) : (
          <div className="space-y-6">
            {/* Top Security & Isolation Status Bar */}
            <SecurityStatusBanner user={currentUser} />

            {/* Dashboard Content */}
            {activeEntry ? (
              <ConversationView
                entry={activeEntry}
                onBack={() => {
                  setActiveEntry(null);
                  setActiveTab("history");
                }}
                onSendFollowUp={handleSendFollowUp}
                isSendingFollowUp={isSendingFollowUp}
                followUpError={followUpError}
                onRetrySave={pendingSaveEntry ? handleRetrySave : undefined}
                saveError={saveError}
              />
            ) : activeTab === "editor" ? (
              <ReflectionEditor
                onGenerate={handleGenerateReflection}
                isLoading={isGenerating}
                errorMessage={generationError}
                onClearError={() => setGenerationError(null)}
              />
            ) : (
              <EntryHistory
                entries={entries}
                onSelectEntry={(entry) => setActiveEntry(entry)}
                onDeleteEntry={handleDeleteEntry}
                onNewReflection={() => {
                  setActiveTab("editor");
                  setActiveEntry(null);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
