import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Sun, Palette, Crop, Sparkles } from "lucide-react";
import { ImageUpload } from "./image-upload";

interface ChatInputProps {
  onSendMessage: (content: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleSend = () => {
    if (!message.trim() && !uploadedImageUrl) return;

    onSendMessage(message.trim() || "Please edit this image", uploadedImageUrl || undefined);
    setMessage("");
    setUploadedImageUrl(null);
    setShowUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        {/* Image Upload Area */}
        {showUpload && (
          <ImageUpload
            onImageUploaded={(url) => {
              setUploadedImageUrl(url);
              setShowUpload(false);
            }}
            onClose={() => setShowUpload(false)}
          />
        )}

        {/* Uploaded Image Preview */}
        {uploadedImageUrl && (
          <div className="mb-4 relative">
            <img 
              src={uploadedImageUrl} 
              alt="Uploaded preview" 
              className="rounded-lg max-h-32 object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={() => setUploadedImageUrl(null)}
            >
              ×
            </Button>
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-end space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-green-600"
            onClick={() => setShowUpload(!showUpload)}
            disabled={disabled}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you'd like to edit about your image..."
              className="resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:border-green-600 transition-colors max-h-32"
              rows={1}
              disabled={disabled}
            />
            
            <Button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && !uploadedImageUrl)}
              size="icon"
              className="absolute right-2 bottom-2 bg-green-600 hover:bg-green-700 text-white rounded-full disabled:bg-gray-300"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={() => handleQuickAction("Make the lighting brighter and more vibrant")}
            disabled={disabled}
          >
            <Sun className="w-3 h-3 mr-1" />
            Brighten
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={() => handleQuickAction("Enhance the colors to be more vivid and saturated")}
            disabled={disabled}
          >
            <Palette className="w-3 h-3 mr-1" />
            Colorize
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={() => handleQuickAction("Remove the background completely")}
            disabled={disabled}
          >
            <Crop className="w-3 h-3 mr-1" />
            Remove BG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            onClick={() => handleQuickAction("Enhance and improve the overall quality of this image")}
            disabled={disabled}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Enhance
          </Button>
        </div>
      </div>
    </div>
  );
}
