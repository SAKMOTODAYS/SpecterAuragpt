import { useState, useEffect, useRef, useCallback } from "react";

export type MessageRole = "user" | "model";

export interface GeminiMessage {
  role: MessageRole;
  parts: { text: string }[];
}

export interface ChatSession {
  id: number;
  title: string;
  messages: { role: MessageRole; text: string; isError?: boolean }[];
  history: GeminiMessage[];
}

const STORAGE_PREFIX = "aura-sessions-";

export function useSessions(userId: number | string) {
  const key = `${STORAGE_PREFIX}${userId}`;
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  }, [key]);

  const saveSessions = (newSessions: ChatSession[]) => {
    const trimmed = newSessions.slice(0, 50);
    setSessions(trimmed);
    localStorage.setItem(key, JSON.stringify(trimmed));
  };

  const createSession = () => {
    const newSession: ChatSession = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      history: [],
    };
    saveSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const updateSession = (id: number, updater: (session: ChatSession) => ChatSession) => {
    saveSessions(
      sessions.map((s) => (s.id === id ? updater(s) : s))
    );
  };

  const deleteSession = (id: number) => {
    saveSessions(sessions.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    updateSession,
    deleteSession,
  };
}
