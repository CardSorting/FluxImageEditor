import { Chat, CreateChatData } from '../chat.entity';

export interface ChatRepository {
  create(data: CreateChatData): Promise<Chat>;
  findAll(): Promise<Chat[]>;
  findById(id: number): Promise<Chat | null>;
  delete(id: number): Promise<boolean>;
}