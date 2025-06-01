import { Request, Response } from 'express';
import { CreateChatCommandHandler } from '../../application/commands/create-chat.command';
import { CreateMessageCommandHandler } from '../../application/commands/create-message.command';
import { GetChatsQueryHandler } from '../../application/queries/get-chats.query';

export class ChatController {
  constructor(
    private readonly createChatHandler: CreateChatCommandHandler,
    private readonly createMessageHandler: CreateMessageCommandHandler,
    private readonly getChatsHandler: GetChatsQueryHandler
  ) {}

  async createChat(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.body;
      
      const chat = await this.createChatHandler.execute({ title });
      
      // Create initial welcome message
      await this.createMessageHandler.execute({
        chatId: chat.id,
        role: "assistant",
        content: "Hello! I'm your DreamBees Art assistant, ready to transform your images into artistic visions. Upload an image and describe your creative ideas - I'll bring them to life with AI-powered editing."
      });
      
      res.status(201).json(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  }

  async getChats(req: Request, res: Response): Promise<void> {
    try {
      const chats = await this.getChatsHandler.execute({});
      
      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  }
}