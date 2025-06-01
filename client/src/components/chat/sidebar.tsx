import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Settings, Image, Menu, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Chat } from "@shared/schema";

interface SidebarProps {
  currentChatId?: number;
  onChatSelect: (chatId: number) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentChatId, onChatSelect, onNewChat, isOpen, onToggle }: SidebarProps) {
  const { data: chats = [], isLoading } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:relative z-30 h-full
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-lg">🐝</span>
              </div>
              <h1 className="text-lg font-semibold">DreamBees Art</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 hover:text-white"
              onClick={onToggle}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            onClick={onNewChat}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Creation
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-gray-400 text-sm">Loading chats...</div>
            ) : chats.length === 0 ? (
              <div className="text-gray-400 text-sm">No chats yet</div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors
                    ${currentChatId === chat.id 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start space-x-2">
                    <Image className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{chat.title}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Settings Footer */}
        <div className="p-4 border-t border-gray-700">
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
    </>
  );
}
