import { useState, useRef, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useSessions, ChatSession } from "../hooks/use-sessions";
import { useTheme } from "../hooks/use-theme";
import { generateGeminiResponse } from "../lib/gemini";
import { Sidebar } from "../components/Sidebar";
import { ChatMessage } from "../components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Sun, Moon, Send, Square, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to reverse a string",
  "Give me 5 tips for better productivity",
  "Tell me a short interesting story",
  "What are the best practices for web design?",
  "Explain machine learning in simple terms",
];

export function ChatPage() {
  const { user, logout } = useAuth();

  // All hooks must be called unconditionally before any return
  const { sessions, activeSessionId, setActiveSessionId, createSession, updateSession, deleteSession } = useSessions(user?.id || "guest");
  const { theme, setTheme } = useTheme();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [isWaitingForAPI, setIsWaitingForAPI] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, currentTypingText, isWaitingForAPI]);

  // Guard AFTER all hooks
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-xl brand-gradient animate-pulse flex items-center justify-center">
          <Check className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
      </div>
    );
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping || isWaitingForAPI) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    const userText = text.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    updateSession(sessionId, (s) => {
      const isFirst = s.messages.length === 0;
      return {
        ...s,
        title: isFirst ? userText.slice(0, 45) + (userText.length > 45 ? "..." : "") : s.title,
        messages: [...s.messages, { role: "user" as const, text: userText }],
        history: [...s.history, { role: "user", parts: [{ text: userText }] }],
      };
    });

    setIsTyping(true);
    setIsWaitingForAPI(true);
    setCurrentTypingText("");
    stoppedRef.current = false;
    abortControllerRef.current = new AbortController();

    try {
      const stored = localStorage.getItem(`aura-sessions-${user.id || "guest"}`);
      const storedSessions: ChatSession[] = stored ? JSON.parse(stored) : [];
      const currentSession = storedSessions.find((s) => s.id === sessionId);
      const history = currentSession?.history || [];

      const { text: aiText } = await generateGeminiResponse(
        history,
        0,
        abortControllerRef.current.signal,
      );

      setIsWaitingForAPI(false);
      if (stoppedRef.current) return;

      let i = 0;
      let revealedText = "";

      const typeNext = () => {
        if (stoppedRef.current) {
          finishTyping(sessionId!, revealedText, true);
          return;
        }
        if (i < aiText.length) {
          revealedText += aiText.slice(i, i + 4);
          setCurrentTypingText(revealedText);
          i += 4;
          setTimeout(typeNext, 12 + (Math.random() < 0.05 ? 50 : 0));
        } else {
          finishTyping(sessionId!, revealedText, false);
        }
      };

      typeNext();
    } catch (e: unknown) {
      const err = e as { name?: string };
      if (err.name === "AbortError" || stoppedRef.current) {
        setIsWaitingForAPI(false);
        finishTyping(sessionId!, currentTypingText, true);
      } else {
        setIsWaitingForAPI(false);
        setIsTyping(false);
        updateSession(sessionId!, (s) => ({
          ...s,
          messages: [
            ...s.messages,
            { role: "model" as const, text: "Sorry, something went wrong. Please try again.", isError: true },
          ],
        }));
      }
    }
  };

  const finishTyping = (sessionId: number, finalResult: string, wasStopped: boolean) => {
    setIsTyping(false);
    setCurrentTypingText("");
    const finalText = finalResult + (wasStopped && finalResult ? "\n\n*(stopped)*" : "");
    updateSession(sessionId, (s) => ({
      ...s,
      messages: [...s.messages, { role: "model" as const, text: finalText }],
      history: [...s.history, { role: "model", parts: [{ text: finalText }] }],
    }));
  };

  const handleStop = () => {
    stoppedRef.current = true;
    abortControllerRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-sidebar transform transition-transform duration-200 ease-in-out flex flex-col border-r border-border",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <Sidebar
          user={user}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setIsSidebarOpen(false);
          }}
          onNewChat={() => {
            setActiveSessionId(null);
            setIsSidebarOpen(false);
          }}
          onDeleteSession={deleteSession}
          onLogout={logout}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ai 2.5
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden" ref={scrollRef}>
          {!activeSession?.messages.length && !isTyping && !isWaitingForAPI ? (
            <div className="h-full flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
              <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Hello, {user.firstName || "there"}!
              </h2>
              <p className="text-muted-foreground mb-10 text-center">How can I help you today?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="p-4 text-left border border-border rounded-xl hover:bg-muted transition-colors text-sm text-foreground/80 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
              {activeSession?.messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} text={m.text} isError={m.isError} />
              ))}
              {(isWaitingForAPI || isTyping) && (
                <ChatMessage
                  role="model"
                  text={currentTypingText}
                  isTyping={isTyping}
                  isWaiting={isWaitingForAPI}
                />
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-background shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-muted rounded-2xl border border-border p-2 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow shadow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message AuraAI..."
                className="min-h-[44px] max-h-[180px] w-full resize-none border-0 bg-transparent py-3 px-3 shadow-none focus-visible:ring-0 text-base"
                rows={1}
              />
              <div className="p-1 shrink-0">
                {isTyping || isWaitingForAPI ? (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="rounded-full w-10 h-10"
                    onClick={handleStop}
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className="rounded-full w-10 h-10 brand-gradient text-white shadow-sm disabled:opacity-50"
                    disabled={!input.trim()}
                    onClick={() => handleSend()}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              AuraAI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
