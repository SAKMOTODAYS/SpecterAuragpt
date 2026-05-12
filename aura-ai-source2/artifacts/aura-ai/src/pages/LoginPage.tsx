import { Button } from "@/components/ui/button";

export function LoginPage({ login }: { login: () => void }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E879F9]/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700 ease-out p-8 max-w-sm w-full">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
            <rect width="100" height="100" rx="24" fill="url(#brand-grad)"/>
            <path d="M35 50L45 60L65 40" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="brand-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C6DFA"/>
                <stop offset="1" stopColor="#E879F9"/>
              </linearGradient>
            </defs>
          </svg>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AuraAI</h1>
          <p className="text-muted-foreground mt-2 text-center">Your intelligent AI companion</p>
        </div>

        <Button 
          onClick={login}
          className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full py-6 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
