import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, and, or } from "drizzle-orm";
import { getDb } from "../db";
import { gnoxMessages, InsertGnoxMessage } from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const GNOX_ALGORITHM = "aes-256-cbc";
const GNOX_KEY_LENGTH = 32;
const GNOX_IV_LENGTH = 16;

/**
 * Gerar chave de criptografia a partir de uma senha
 */
function deriveKey(password: string): Buffer {
  return scryptSync(password, "gnox_salt", GNOX_KEY_LENGTH);
}

/**
 * Criptografar mensagem com AES-256-CBC
 */
function encryptGnoxMessage(content: string, key: Buffer): string {
  const iv = randomBytes(GNOX_IV_LENGTH);
  const cipher = createCipheriv(GNOX_ALGORITHM, key, iv);
  let encrypted = cipher.update(content, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Descriptografar mensagem com AES-256-CBC
 */
function decryptGnoxMessage(encryptedData: string, key: Buffer): string {
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(GNOX_ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export const gnoxRouter = router({
  /**
   * Enviar mensagem Gnox's criptografada
   */
  sendMessage: protectedProcedure
    .input(z.object({
      senderId: z.string(),
      recipientId: z.string(),
      content: z.string().min(1),
      messageType: z.string(),
      encryptionKey: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const messageId = nanoid();
      const key = deriveKey(input.encryptionKey);
      const encryptedContent = encryptGnoxMessage(input.content, key);

      const newMessage: InsertGnoxMessage = {
        messageId,
        senderId: input.senderId,
        recipientId: input.recipientId,
        encryptedContent,
        messageType: input.messageType,
        isRead: false,
      };

      await db.insert(gnoxMessages).values(newMessage);

      return { messageId };
    }),

  /**
   * Obter mensagens recebidas por um agente
   */
  getReceivedMessages: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(gnoxMessages)
        .where(eq(gnoxMessages.recipientId, input.agentId))
        .orderBy(gnoxMessages.createdAt)
        .limit(input.limit);
    }),

  /**
   * Obter mensagens enviadas por um agente
   */
  getSentMessages: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(gnoxMessages)
        .where(eq(gnoxMessages.senderId, input.agentId))
        .orderBy(gnoxMessages.createdAt)
        .limit(input.limit);
    }),

  /**
   * Descriptografar mensagem com chave root (apenas para arquiteto)
   */
  decryptMessage: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      encryptionKey: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select().from(gnoxMessages).where(eq(gnoxMessages.messageId, input.messageId)).limit(1);
      if (result.length === 0) return null;

      const message = result[0];
      const key = deriveKey(input.encryptionKey);

      try {
        const decrypted = decryptGnoxMessage(message.encryptedContent, key);
        return {
          ...message,
          decryptedContent: decrypted,
        };
      } catch (error) {
        throw new Error("Failed to decrypt message - invalid key");
      }
    }),

  /**
   * Marcar mensagem como lida
   */
  markAsRead: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(gnoxMessages).set({ isRead: true }).where(eq(gnoxMessages.messageId, input.messageId));

      return { success: true };
    }),

  /**
   * Obter conversa entre dois agentes
   */
  getConversation: protectedProcedure
    .input(z.object({
      agentId1: z.string(),
      agentId2: z.string(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const messages = await db.select().from(gnoxMessages)
        .where(
          and(
            or(
              and(
                eq(gnoxMessages.senderId, input.agentId1),
                eq(gnoxMessages.recipientId, input.agentId2)
              ),
              and(
                eq(gnoxMessages.senderId, input.agentId2),
                eq(gnoxMessages.recipientId, input.agentId1)
              )
            )
          )
        )
        .orderBy(gnoxMessages.createdAt)
        .limit(input.limit);

      return messages;
    }),
});
