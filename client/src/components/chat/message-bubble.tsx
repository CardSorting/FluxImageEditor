import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Share2, Bot, User } from "lucide-react";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isProcessing = message.metadata?.status === "processing";

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `kontext-edit-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className={`flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300 ${
      isUser ? 'justify-end' : ''
    }`}>
      {!isUser && (
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-2xl rounded-2xl p-4 shadow-sm ${
        isUser 
          ? 'bg-green-600 text-white rounded-tr-md' 
          : 'bg-white text-gray-800 rounded-tl-md'
      }`}>
        {/* Image Upload */}
        {message.imageUrl && (
          <div className="mb-3">
            <img 
              src={message.imageUrl} 
              alt="Uploaded image" 
              className="rounded-lg max-w-md w-full"
            />
          </div>
        )}

        {/* Message Content */}
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-gray-50 rounded-lg p-4 mt-3">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm text-gray-600">Processing your image...</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all duration-1000" style={{width: '75%'}}></div>
            </div>
          </div>
        )}

        {/* Before/After Images */}
        {message.editedImageUrl && message.imageUrl && (
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Before</p>
                <img 
                  src={message.imageUrl} 
                  alt="Original image" 
                  className="rounded-lg w-full"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">After</p>
                <img 
                  src={message.editedImageUrl} 
                  alt="Edited image" 
                  className="rounded-lg w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 pt-2">
              <Button 
                onClick={() => handleDownload(message.editedImageUrl!)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
