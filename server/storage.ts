import { chats, messages, type Chat, type Message, type InsertChat, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChats(): Promise<Chat[]>;
  getChatById(id: number): Promise<Chat | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private currentChatId: number;
  private currentMessageId: number;

  constructor() {
    this.chats = new Map();
    this.messages = new Map();
    this.currentChatId = 1;
    this.currentMessageId = 1;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentChatId++;
    const chat: Chat = {
      ...insertChat,
      id,
      createdAt: new Date(),
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChats(): Promise<Chat[]> {
    return Array.from(this.chats.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getChatById(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      imageUrl: insertMessage.imageUrl || null,
      editedImageUrl: insertMessage.editedImageUrl || null,
      metadata: insertMessage.metadata || null,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...updates };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
