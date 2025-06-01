import { Message, CreateMessageData } from '../../domain/message.entity';
import { MessageRepository } from '../../domain/repositories/message.repository';

export class MemoryMessageRepository implements MessageRepository {
  private messages: Map<number, Message> = new Map();
  private currentId: number = 1;

  async create(data: CreateMessageData): Promise<Message> {
    const message = Message.create(data, this.currentId++);
    this.messages.set(message.id, message);
    return message;
  }

  async findByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async findById(id: number): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async update(id: number, updates: Partial<Message>): Promise<Message | null> {
    const message = this.messages.get(id);
    if (!message) return null;

    const updatedMessage = new Message(
      message.id,
      message.chatId,
      message.role,
      message.content,
      updates.imageUrl !== undefined ? updates.imageUrl : message.imageUrl,
      updates.editedImageUrl !== undefined ? updates.editedImageUrl : message.editedImageUrl,
      updates.metadata !== undefined ? updates.metadata : message.metadata,
      message.createdAt
    );

    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async delete(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }
}