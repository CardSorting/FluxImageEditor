import { Request, Response } from 'express';
import { CreateChatCommandHandler } from '../../application/commands/create-chat.command';
import { GetChatsQueryHandler } from '../../application/queries/get-chats.query';
import { ChatRepository } from '../../domain/repositories/chat.repository';

export class ChatController {
  constructor(
    private readonly createChatHandler: CreateChatCommandHandler,
    private readonly getChatsHandler: GetChatsQueryHandler
  ) {}

  async createChat(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.body;
      
      const chat = await this.createChatHandler.execute({ title });
      
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