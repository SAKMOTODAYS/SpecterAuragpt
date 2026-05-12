import { useState, useRef, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation,
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey
} from "@workspace/api-client-react";
import { Plus, MessageSquare, Trash2, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeId: number | null;
  onSelect: (id: number | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ activeId, onSelect, isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading } = useListOpenaiConversations();
  const createConv = useCreateOpenaiConversation();
  const deleteConv = useDeleteOpenaiConversation();

  const handleNewChat = () => {
    onSelect(null);
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const handleSelect = (id: number) => {
    onSelect(id);
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteConv.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    if (activeId === id) {
      onSelect(null);
    }
  };

  const sidebarClasses = cn(
    "fixed md:static inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={sidebarClasses}>
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient p-[1px]">
              <div className="w-full h-full bg-sidebar rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </div>
            <span className="font-semibold text-sidebar-foreground">AuraAI</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-3">
          <Button 
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-sidebar-primary/10 hover:bg-sidebar-primary/20 text-sidebar-primary-foreground border border-sidebar-primary/20"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-sidebar-accent/50 rounded-md animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-sm text-sidebar-foreground/50 text-center py-4">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={cn(
                  "group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors",
                  activeId === conv.id 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{conv.title || "New Chat"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={(e) => handleDelete(e, conv.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-sm font-medium">{user?.firstName?.[0] || user?.email?.[0] || "?"}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">{user?.firstName || "User"}</div>
                <div className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
