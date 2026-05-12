import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function LoginScreen() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gradient rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-gradient rounded-full opacity-[0.05] blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 rounded-2xl bg-brand-gradient p-[1px] mb-8 shadow-2xl shadow-primary/20">
          <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Meet <span className="text-brand-gradient">AuraAI</span>
        </h1>
        
        <p className="text-muted-foreground text-lg mb-10">
          Your personal, luminous AI companion.
        </p>
        
        <Button 
          onClick={login} 
          size="lg"
          className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-14 text-lg font-medium shadow-xl shadow-foreground/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign in with Replit
        </Button>
      </div>
    </div>
  );
}
