import { Request, Response } from 'express';
import { CreateMessageCommandHandler } from '../../application/commands/create-message.command';
import { GetMessagesQueryHandler } from '../../application/queries/get-messages.query';
import { ImageEditingService } from '../../application/services/image-editing.service';

export class MessageController {
  constructor(
    private readonly createMessageHandler: CreateMessageCommandHandler,
    private readonly getMessagesHandler: GetMessagesQueryHandler,
    private readonly imageEditingService: ImageEditingService
  ) {}

  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const chatId = parseInt(req.params.chatId);
      if (isNaN(chatId)) {
        res.status(400).json({ error: 'Invalid chat ID' });
        return;
      }

      const { role, content, imageUrl, editedImageUrl, metadata } = req.body;
      
      // Create the user message
      const userMessage = await this.createMessageHandler.execute({
        chatId,
        role,
        content,
        imageUrl,
        editedImageUrl,
        metadata
      });

      // If this is a user message with an image and editing prompt, process with FLUX
      if (role === "user" && imageUrl && content.trim()) {
        try {
          // Create assistant response message
          const assistantMessage = await this.createMessageHandler.execute({
            chatId,
            role: "assistant",
            content: "I'll help you edit that image. Let me process your request...",
            metadata: { status: "processing" }
          });

          // Process with FLUX Kontext in background
          this.imageEditingService.processImageEdit({
            messageId: assistantMessage.id,
            imageUrl,
            prompt: content,
            chatId
          }).catch(error => {
            console.error('Image editing failed:', error);
          });

          res.status(201).json([userMessage, assistantMessage]);
        } catch (error) {
          console.error("Error starting image processing:", error);
          const errorMessage = await this.createMessageHandler.execute({
            chatId,
            role: "assistant",
            content: "I'm sorry, I encountered an error while trying to process your image. Please try again.",
          });
          res.status(201).json([userMessage, errorMessage]);
        }
      } else {
        // Regular message without image editing
        if (role === "user") {
          const assistantMessage = await this.createMessageHandler.execute({
            chatId,
            role: "assistant",
            content: "Hello! I'm your DreamBees Art assistant. Please upload an image and describe your creative vision. I can enhance colors, transform scenes, add artistic effects, and bring your imagination to life through AI-powered editing.",
          });
          res.status(201).json([userMessage, assistantMessage]);
        } else {
          res.status(201).json([userMessage]);
        }
      }
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const chatId = parseInt(req.params.chatId);
      
      if (isNaN(chatId)) {
        res.status(400).json({ error: 'Invalid chat ID' });
        return;
      }

      const messages = await this.getMessagesHandler.execute({ chatId });
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
}