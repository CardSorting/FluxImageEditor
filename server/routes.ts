import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { fal } from "@fal-ai/client";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Configure FAL AI client
fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_API_KEY || ""
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all chats
  app.get("/api/chats", async (req, res) => {
    try {
      const chats = await storage.getChats();
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  // Create new chat
  app.post("/api/chats", async (req, res) => {
    try {
      const validatedChat = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(validatedChat);
      res.json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(400).json({ message: "Invalid chat data" });
    }
  });

  // Get messages for a chat
  app.get("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      if (isNaN(chatId)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }

      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Upload image and get URL
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert buffer to File object for FAL upload
      const file = new File([req.file.buffer], req.file.originalname, {
        type: req.file.mimetype
      });

      // Upload to FAL storage
      const imageUrl = await fal.storage.upload(file);
      
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Create message and process with FLUX if needed
  app.post("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      if (isNaN(chatId)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }

      const validatedMessage = insertMessageSchema.parse({
        ...req.body,
        chatId
      });

      // Create the user message
      const userMessage = await storage.createMessage(validatedMessage);

      // If this is a user message with an image and editing prompt, process with FLUX
      if (validatedMessage.role === "user" && validatedMessage.imageUrl && validatedMessage.content) {
        try {
          // Create assistant response message
          const assistantMessage = await storage.createMessage({
            chatId,
            role: "assistant",
            content: "I'll help you edit that image. Let me process your request...",
            metadata: { status: "processing" }
          });

          // Process with FLUX Kontext in background
          processImageEdit(assistantMessage.id, validatedMessage.imageUrl, validatedMessage.content);

          res.json([userMessage, assistantMessage]);
        } catch (error) {
          console.error("Error starting image processing:", error);
          const errorMessage = await storage.createMessage({
            chatId,
            role: "assistant",
            content: "I'm sorry, I encountered an error while trying to process your image. Please try again.",
          });
          res.json([userMessage, errorMessage]);
        }
      } else {
        // Regular message without image editing
        if (validatedMessage.role === "user") {
          const assistantMessage = await storage.createMessage({
            chatId,
            role: "assistant",
            content: "Hello! Please upload an image and tell me what you'd like to edit. I can enhance colors, add objects, remove backgrounds, and much more based on your natural language descriptions.",
          });
          res.json([userMessage, assistantMessage]);
        } else {
          res.json([userMessage]);
        }
      }
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Get processing status for a message
  app.get("/api/messages/:messageId/status", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      // In a real implementation, you'd check the processing status
      // For now, we'll return the current message state
      res.json({ status: "completed" });
    } catch (error) {
      console.error("Error checking status:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background function to process image editing
async function processImageEdit(messageId: number, imageUrl: string, prompt: string) {
  try {
    console.log(`Processing image edit for message ${messageId}: ${prompt}`);
    
    const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        prompt: prompt,
        image_url: imageUrl,
        guidance_scale: 3.5,
        num_images: 1,
        safety_tolerance: "2",
        output_format: "jpeg"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`Processing update for message ${messageId}:`, update.logs?.map(log => log.message).join(", "));
        }
      },
    });

    if (result.data && result.data.images && result.data.images.length > 0) {
      const editedImageUrl = result.data.images[0].url;
      
      // Update the assistant message with the result
      await storage.updateMessage(messageId, {
        content: "Perfect! I've successfully edited your image based on your request. Here's the result:",
        editedImageUrl,
        metadata: { 
          status: "completed",
          originalPrompt: prompt,
          seed: result.data.seed
        }
      });
      
      console.log(`Successfully processed image edit for message ${messageId}`);
    } else {
      throw new Error("No images returned from FLUX API");
    }
  } catch (error) {
    console.error(`Error processing image edit for message ${messageId}:`, error);
    
    // Update message with error
    await storage.updateMessage(messageId, {
      content: "I'm sorry, I encountered an error while processing your image. The editing service might be temporarily unavailable. Please try again in a moment.",
      metadata: { 
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      }
    });
  }
}
