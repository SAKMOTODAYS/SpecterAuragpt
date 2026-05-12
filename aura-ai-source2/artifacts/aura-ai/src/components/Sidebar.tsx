import { ChatSession } from "../hooks/use-sessions";
import { AuthUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, LogOut, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  user: AuthUser;
  sessions: ChatSession[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
  onDeleteSession: (id: number) => void;
  onLogout: () => void;
}

export function Sidebar({ user, sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession, onLogout }: SidebarProps) {
  return (
    <>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <span className="font-bold text-lg tracking-tight">AuraAI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onNewChat} title="New chat">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-4 pb-2">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 bg-background border-border/50 text-foreground/80 font-normal hover:bg-muted"
          onClick={onNewChat}
        >
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-3 uppercase tracking-wider">Recents</h3>
        {sessions.map((s) => (
          <div 
            key={s.id}
            className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              activeSessionId === s.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            onClick={() => onSelectSession(s.id)}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate text-sm flex-1">{s.title}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6 opacity-0 group-hover:opacity-100 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(s.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="px-2 text-sm text-muted-foreground/60 italic">No recent chats</div>
        )}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-full border border-border/50">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary rounded-full">
              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground" onClick={onLogout} title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
