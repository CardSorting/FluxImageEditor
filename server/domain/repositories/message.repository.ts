import { Message, CreateMessageData } from '../message.entity';

export interface MessageRepository {
  create(data: CreateMessageData): Promise<Message>;
  findByChatId(chatId: number): Promise<Message[]>;
  findById(id: number): Promise<Message | null>;
  update(id: number, updates: Partial<Message>): Promise<Message | null>;
  delete(id: number): Promise<boolean>;
}