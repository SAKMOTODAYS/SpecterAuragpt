import { useEffect, useRef } from "react";
import { Markdown } from "./markdown";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenaiMessage } from "@workspace/api-client-react/src/generated/api.schemas";

interface MessageListProps {
  messages: OpenaiMessage[];
  isStreaming: boolean;
  streamingContent: string;
  isWaiting: boolean;
}

export function MessageList({ messages, isStreaming, streamingContent, isWaiting }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isWaiting]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {isWaiting && (
        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-8 h-8 rounded-full bg-brand-gradient p-[1px] shrink-0">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex-1 space-y-2 mt-1.5">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      {isStreaming && streamingContent && (
        <MessageBubble 
          message={{ 
            id: Date.now(), 
            role: "assistant", 
            content: streamingContent,
            createdAt: new Date().toISOString(),
            conversationId: 0
          }} 
        />
      )}
      <div ref={bottomRef} className="h-px" />
    </div>
  );
}

function MessageBubble({ message }: { message: OpenaiMessage }) {
  const isUser = message.role === "user";
  
  return (
    <div className={cn("flex gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-gradient p-[1px] shrink-0 mt-1">
          <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}
      
      <div 
        className={cn(
          "max-w-[85%] px-4 py-3 rounded-2xl",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-muted text-foreground rounded-tl-sm border border-border"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <Markdown content={message.content} />
        )}
      </div>
    </div>
  );
}
