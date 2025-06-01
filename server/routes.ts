import type { Express } from "express";
import { createServer, type Server } from "http";
import { container } from "./infrastructure/container";
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
  app.get("/api/chats", (req, res) => {
    container.chatController.getChats(req, res);
  });

  // Create new chat
  app.post("/api/chats", (req, res) => {
    container.chatController.createChat(req, res);
  });

  // Get messages for a chat
  app.get("/api/chats/:chatId/messages", (req, res) => {
    container.messageController.getMessages(req, res);
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
  app.post("/api/chats/:chatId/messages", (req, res) => {
    container.messageController.createMessage(req, res);
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


