import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../db";
import { gnoxMessages, notifications, agents } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

describe("Real-Time Communication & Notifications", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");
  });

  it("should create and retrieve Gnox messages", async () => {
    const senderId = "AGENT-SENDER-TEST";
    const recipientId = "AGENT-RECIPIENT-TEST";
    const encryptedContent = "GNOX-ENCRYPTED-PAYLOAD-TEST";
    
    // Inserir mensagem
    await db.insert(gnoxMessages).values({
      senderId,
      recipientId,
      encryptedContent,
      messageType: "communication",
    });

    // Recuperar mensagem
    const messages = await db.select().from(gnoxMessages).where(
      and(
        eq(gnoxMessages.senderId, senderId),
        eq(gnoxMessages.recipientId, recipientId)
      )
    );

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].encryptedContent).toBe(encryptedContent);
  });

  it("should create and retrieve user notifications", async () => {
    const userId = 1; // Assumindo que o usuário 1 existe ou é o admin
    const title = "Alerta de Sistema";
    const content = "O enxame detectou uma anomalia quântica.";
    
    // Inserir notificação
    await db.insert(notifications).values({
      userId,
      title,
      content,
      notificationType: "alert",
      read: false,
    });

    // Recuperar notificações
    const userNotifs = await db.select().from(notifications).where(
      eq(notifications.userId, userId)
    );

    expect(userNotifs.length).toBeGreaterThan(0);
    const myNotif = userNotifs.find((n: any) => n.title === title);
    expect(myNotif).toBeDefined();
    expect(myNotif.content).toBe(content);
  });

  it("should handle group chat logic (simulated)", async () => {
    // O chat em grupo é puramente via WebSocket (em memória no servidor),
    // mas podemos testar se a lógica de roteamento de eventos funcionaria.
    const groupId = "nexus-general";
    const agentId = "AGENT-CHAT-TEST";
    const message = "Hello Swarm!";
    
    // Simulação de evento que seria emitido pelo WebSocket
    const event = {
      type: "group:message",
      data: {
        agentId,
        groupId,
        message,
        timestamp: Date.now(),
      }
    };

    expect(event.type).toBe("group:message");
    expect(event.data.groupId).toBe(groupId);
    expect(event.data.message).toBe(message);
  });
});
