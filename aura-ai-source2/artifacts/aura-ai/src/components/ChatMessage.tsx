import { Check } from "lucide-react";
import React from "react";

interface ChatMessageProps {
  role: "user" | "model";
  text: string;
  isError?: boolean;
  isTyping?: boolean;
  isWaiting?: boolean;
}

function parseMessageText(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const code = match ? match[2] : part.slice(3, -3);
      const lang = match ? match[1] : "";
      return (
        <div key={index} className="my-3 rounded-md overflow-hidden border border-border/50 bg-black/50">
          {lang && (
            <div className="bg-muted px-3 py-1 text-xs text-muted-foreground font-mono">
              {lang}
            </div>
          )}
          <pre className="p-3 overflow-x-auto text-sm font-mono text-foreground/90">
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    
    // Split by single backticks for inline code
    const inlineParts = part.split(/(`[^`]+`)/g);
    return (
      <React.Fragment key={index}>
        {inlineParts.map((inlinePart, i) => {
          if (inlinePart.startsWith("`") && inlinePart.endsWith("`")) {
            return (
              <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary-foreground">
                {inlinePart.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{inlinePart}</span>;
        })}
      </React.Fragment>
    );
  });
}

export function ChatMessage({ role, text, isError, isTyping, isWaiting }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end w-full">
        <div className="bg-bubble max-w-[85%] rounded-3xl rounded-tr-sm px-5 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center shrink-0 mt-0.5">
        <Check className="w-4 h-4 text-white" strokeWidth={3} />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        {isWaiting ? (
          <div className="flex items-center gap-1.5 h-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isError ? 'text-destructive' : 'text-foreground'}`}>
            {parseMessageText(text)}
            {isTyping && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse" />}
          </div>
        )}
      </div>
    </div>
  );
}

