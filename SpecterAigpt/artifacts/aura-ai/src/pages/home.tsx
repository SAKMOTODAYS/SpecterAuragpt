import { useState } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { LoginScreen } from "@/components/auth/login";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { Welcome } from "@/components/chat/welcome";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { 
  useGetOpenaiConversation, 
  useCreateOpenaiConversation,
  getGetOpenaiConversationQueryKey,
  getListOpenaiConversationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { OpenaiMessage } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [isWaiting, setIsWaiting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const createConv = useCreateOpenaiConversation();
  
  const { data: conversation } = useGetOpenaiConversation(
    activeId!, 
    { query: { enabled: !!activeId, queryKey: getGetOpenaiConversationQueryKey(activeId!) } }
  );

  const sendMessage = async (convId: number, content: string) => {
    setIsWaiting(true);
    setStreamingContent("");
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/openai/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setIsWaiting(false);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim().startsWith("data: "));
        
        for (const line of lines) {
          const dataStr = line.replace("data: ", "").trim();
          if (!dataStr) continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              console.error(data.error);
            } else if (data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            } else if (data.done) {
              // Done streaming
            }
          } catch (e) {
            console.error("Error parsing stream chunk", e, dataStr);
          }
        }
      }

      // Invalidate to fetch the final messages
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(convId) });
    } catch (e) {
      console.error(e);
    } finally {
      setIsWaiting(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleSend = async (content: string) => {
    let convId = activeId;

    // Optimistically add user message to UI
    if (convId && conversation) {
      queryClient.setQueryData(getGetOpenaiConversationQueryKey(convId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, {
            id: Date.now(),
            conversationId: convId,
            role: "user",
            content,
            createdAt: new Date().toISOString()
          }]
        };
      });
    }

    if (!convId) {
      // Create new conversation
      const title = content.length > 40 ? content.substring(0, 40) + "..." : content;
      setIsWaiting(true);
      const newConv = await createConv.mutateAsync({ data: { title } });
      convId = newConv.id;
      setActiveId(convId);
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    }

    await sendMessage(convId, content);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-background text-foreground">
      <Sidebar 
        activeId={activeId} 
        onSelect={setActiveId} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            {activeId && (
              <div className="px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                gpt-5.4
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </header>

        {/* Content */}
        {activeId && conversation ? (
          <MessageList 
            messages={conversation.messages || []}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            isWaiting={isWaiting}
          />
        ) : (
          <Welcome onSuggestionClick={handleSend} />
        )}

        {/* Input */}
        <MessageInput 
          onSend={handleSend} 
          disabled={isWaiting || isStreaming} 
        />
      </main>
    </div>
  );
}
