import { chats, messages, type Chat, type Message, type InsertChat, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values(insertChat)
      .returning();
    return chat;
  }

  async getChats(): Promise<Chat[]> {
    return await db.select().from(chats).orderBy(chats.createdAt);
  }

  async getChatById(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat || undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt);
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
    return message || undefined;
  }
}

export const storage = new DatabaseStorage();
