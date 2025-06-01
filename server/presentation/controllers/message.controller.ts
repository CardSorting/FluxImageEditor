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
      const { chatId, role, content, imageUrl, editedImageUrl, metadata } = req.body;
      
      const message = await this.createMessageHandler.execute({
        chatId,
        role,
        content,
        imageUrl,
        editedImageUrl,
        metadata
      });

      // If this is a user message with an image and content (edit request)
      if (role === 'user' && imageUrl && content.trim()) {
        // Process image editing asynchronously
        this.imageEditingService.processImageEdit({
          messageId: message.id,
          imageUrl,
          prompt: content,
          chatId
        }).catch(error => {
          console.error('Image editing failed:', error);
        });
      }
      
      res.status(201).json(message);
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