import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border">
      <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-muted/50 rounded-3xl border border-border p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message AuraAI..."
          disabled={disabled}
          className="w-full max-h-[200px] min-h-[44px] bg-transparent border-0 focus:ring-0 resize-none py-3 px-4 text-foreground placeholder:text-muted-foreground"
          rows={1}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className={cn(
            "shrink-0 h-10 w-10 rounded-full transition-all duration-300",
            input.trim() && !disabled 
              ? "bg-brand-gradient text-white hover:scale-105 shadow-lg shadow-primary/20" 
              : "bg-muted-foreground/20 text-muted-foreground"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-3">
        AuraAI can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
}
