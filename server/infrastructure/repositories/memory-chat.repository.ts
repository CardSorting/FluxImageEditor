import { Chat, CreateChatData } from '../../domain/chat.entity';
import { ChatRepository } from '../../domain/repositories/chat.repository';

export class MemoryChatRepository implements ChatRepository {
  private chats: Map<number, Chat> = new Map();
  private currentId: number = 1;

  async create(data: CreateChatData): Promise<Chat> {
    const chat = Chat.create(data, this.currentId++);
    this.chats.set(chat.id, chat);
    return chat;
  }

  async findAll(): Promise<Chat[]> {
    return Array.from(this.chats.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: number): Promise<Chat | null> {
    return this.chats.get(id) || null;
  }

  async delete(id: number): Promise<boolean> {
    return this.chats.delete(id);
  }
}