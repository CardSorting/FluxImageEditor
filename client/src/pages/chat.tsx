import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/chat/sidebar";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { apiRequest } from "@/lib/queryClient";
import type { Chat, Message } from "@shared/schema";

export default function ChatPage() {
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get messages for current chat
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/chats", currentChatId, "messages"],
    enabled: !!currentChatId,
  });

  // Create new chat mutation
  const createChatMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/chats", { title });
      return response.json();
    },
    onSuccess: (newChat: Chat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setCurrentChatId(newChat.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, content, imageUrl }: { chatId: number; content: string; imageUrl?: string }) => {
      const response = await apiRequest("POST", `/api/chats/${chatId}/messages`, {
        role: "user",
        content,
        imageUrl,
      });
      return response.json();
    },
    onSuccess: (newMessages: Message[]) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", currentChatId, "messages"] });
      
      // If assistant is processing, show typing indicator briefly
      const assistantMessage = newMessages.find(m => m.role === "assistant");
      if (assistantMessage?.metadata?.status === "processing") {
        setShowTyping(true);
        setTimeout(() => setShowTyping(false), 2000);
        
        // Poll for updates
        const pollInterval = setInterval(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/chats", currentChatId, "messages"] });
          
          // Stop polling when message is complete
          const updatedMessages = queryClient.getQueryData<Message[]>(["/api/chats", currentChatId, "messages"]);
          const currentMessage = updatedMessages?.find(m => m.id === assistantMessage.id);
          if (currentMessage?.metadata?.status !== "processing") {
            clearInterval(pollInterval);
          }
        }, 3000);
        
        // Clear interval after 60 seconds to prevent infinite polling
        setTimeout(() => clearInterval(pollInterval), 60000);
      }
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  const handleNewChat = () => {
    const title = `Chat ${new Date().toLocaleDateString()}`;
    createChatMutation.mutate(title);
  };

  const handleChatSelect = (chatId: number) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!currentChatId) {
      // Create new chat first
      const title = content.length > 30 ? content.slice(0, 30) + "..." : content;
      const newChat = await createChatMutation.mutateAsync(title);
      sendMessageMutation.mutate({ chatId: newChat.id, content, imageUrl });
    } else {
      sendMessageMutation.mutate({ chatId: currentChatId, content, imageUrl });
    }
  };

  // Show welcome screen if no chat selected
  if (!currentChatId) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          currentChatId={currentChatId || undefined}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">DreamBees Art</h1>
            <div className="w-10" />
          </div>

          {/* Welcome Content */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🐝</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DreamBees Art</h1>
              <p className="text-gray-600 mb-6">
                Your creative AI companion for artistic image editing. Upload an image and describe your vision - we'll bring it to life.
              </p>
              <Button onClick={handleNewChat} className="bg-yellow-600 hover:bg-yellow-700">
                Start Creating
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Kontext AI</h1>
          <div className="w-10" />
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messagesLoading ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm max-w-2xl">
                    <p className="text-gray-800">
                      Hello! I'm Kontext AI, your intelligent image editing assistant. Upload an image and tell me what you'd like to change. I can understand context and make precise edits based on your natural language descriptions.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-colors"
                        onClick={() => handleSendMessage("Make sky more dramatic")}
                      >
                        Make sky more dramatic
                      </button>
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-colors"
                        onClick={() => handleSendMessage("Remove background")}
                      >
                        Remove background
                      </button>
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-colors"
                        onClick={() => handleSendMessage("Add warm lighting")}
                      >
                        Add warm lighting
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1}
                />
              ))
            )}

            {showTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending || createChatMutation.isPending}
        />
      </div>
    </div>
  );
}
