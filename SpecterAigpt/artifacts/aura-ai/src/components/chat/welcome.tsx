import { Sparkles } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";

interface WelcomeProps {
  onSuggestionClick: (text: string) => void;
}

const SUGGESTIONS = [
  "Explain quantum computing simply",
  "Write a polite rejection email",
  "How do I center a div in CSS?",
  "Plan a 3-day trip to Kyoto",
  "Tell me a creative bedtime story"
];

export function Welcome({ onSuggestionClick }: WelcomeProps) {
  const { user } = useAuth();
  const firstName = user?.firstName || "there";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 rounded-3xl bg-brand-gradient p-[1px] mb-8 shadow-2xl shadow-primary/20 relative group">
        <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="w-full h-full bg-background rounded-3xl flex items-center justify-center relative z-10">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h2 className="text-3xl font-semibold mb-2 text-foreground">
        Good evening, {firstName}
      </h2>
      <p className="text-muted-foreground mb-12 max-w-md">
        I'm AuraAI, your personal companion. How can I help you today?
      </p>

      <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
        {SUGGESTIONS.map((text, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(text)}
            className="px-4 py-2.5 rounded-full bg-muted/50 border border-border text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
