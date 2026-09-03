export type ReflectionMode = "reflect" | "summarize" | "brainstorm" | "chat";

export interface ConversationTurn {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  mood: string;
  mode: ReflectionMode;
  aiResponse: string;
  modelUsed: string;
  turns: ConversationTurn[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
