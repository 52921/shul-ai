import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  conversations,
  messages,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";

export interface IStorage {
  getConversations(sessionId: string): Promise<Conversation[]>;
  getConversation(id: number, sessionId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, sessionId: string, updates: Partial<InsertConversation>): Promise<Conversation>;
  deleteConversation(id: number, sessionId: string): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getConversations(sessionId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.sessionId, sessionId))
      .orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: number, sessionId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.sessionId, sessionId)));
    return conversation;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async updateConversation(id: number, sessionId: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    const [conversation] = await db
      .update(conversations)
      .set(updates)
      .where(and(eq(conversations.id, id), eq(conversations.sessionId, sessionId)))
      .returning();
    return conversation;
  }

  async deleteConversation(id: number, sessionId: string): Promise<void> {
    await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.sessionId, sessionId)));
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
