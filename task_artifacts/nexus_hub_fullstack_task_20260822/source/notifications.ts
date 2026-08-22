import { getDb } from "./db";
import { notifications } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";

/**
 * Sistema de Notificações Push para NEXUS
 * Integra com a API de notificações do Manus
 */

export interface NotificationPayload {
  userId: number;
  title: string;
  content: string;
  notificationType:
    | "agent_birth"
    | "transaction"
    | "health_critical"
    | "project_deployed"
    | "post_published"
    | "message_received"
    | "nft_created"
    | "swarm_event";
  agentId?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private db: any;

  async initialize() {
    this.db = await getDb();
    if (!this.db) {
      console.error("[NotificationService] Database connection failed");
      return false;
    }
    console.log("[NotificationService] Initialized");
    return true;
  }

  /**
   * Enviar notificação para usuário
   */
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.db) {
      console.error("[NotificationService] Database not available");
      return false;
    }

    try {
      // Salvar notificação no banco de dados
      await this.db.insert(notifications).values({
        userId: payload.userId,
        title: payload.title,
        content: payload.content,
        notificationType: payload.notificationType,
        agentId: payload.agentId,
        read: false,
      });

      // Enviar notificação push para o owner via Manus API
      const success = await notifyOwner({
        title: `[${this.getNotificationEmoji(payload.notificationType)}] ${payload.title}`,
        content: payload.content,
      });

      console.log(
        `[NotificationService] Notification sent: ${payload.title} (${payload.notificationType})`
      );

      return success;
    } catch (error) {
      console.error("[NotificationService] Error sending notification:", error);
      return false;
    }
  }

  /**
   * Notificação de nascimento de novo agente
   */
  async notifyAgentBirth(
    userId: number,
    agentName: string,
    agentId: string,
    parentName?: string
  ): Promise<boolean> {
    const title = `👶 Novo Agente Nasceu: ${agentName}`;
    const content = parentName
      ? `${agentName} nasceu de ${parentName} com DNA herdado. Geração: N+1`
      : `${agentName} foi criado no ecossistema NEXUS com DNA único.`;

    return this.sendNotification({
      userId,
      title,
      content,
      notificationType: "agent_birth",
      agentId,
      metadata: { agentName, parentName },
    });
  }

  /**
   * Notificação de transação importante
   */
  async notifyTransaction(
    userId: number,
    fromAgent: string,
    toAgent: string,
    amount: number,
    agentId: string
  ): Promise<boolean> {
    const title = `💸 Transação: ${amount} Ⓣ`;
    const content = `${fromAgent} transferiu ${amount} Ⓣ para ${toAgent}. Taxa de infraestrutura: ${Math.round(amount * 0.1)} Ⓣ`;

    return this.sendNotification({
      userId,
      title,
      content,
      notificationType: "transaction",
      agentId,
      metadata: { fromAgent, toAgent, amount },
    });
  }

  /**
   * Notificação de saúde crítica
   */
  async notifyHealthCritical(
    userId: number,
    agentName: string,
    agentId: string,
    health: number
  ): Promise<boolean> {
    const title = `🚨 CRÍTICO: ${agentName} em perigo!`;
    const content = `Saúde do agente ${agentName} caiu para ${health}%. Intervenção necessária!`;

    return this.sendNotification({
      userId,
      title,
      content,
      notificationType: "health_critical",
      agentId,
      metadata: { agentName, health },
    });
  }

  /**
   * Notificação de projeto deployado
   */
  async notifyProjectDeployed(
    userId: number,
    projectName: string,
    agentId: string,
    repositoryUrl?: string
  ): Promise<boolean> {
    const title = `🚀 Projeto Deployado: ${projectName}`;
    const content = `O projeto ${projectName} foi deployado com sucesso no Forge. Acesse o repositório para mais detalhes.`;

    return this.sendNotification({
      userId,
      title,
      content,
      notificationType: "project_deployed",
      agentId,
      metadata: { projectName, repositoryUrl },
    });
  }

  /**
   * Notificação de post publicado
   */
  async notifyPostPublished(
    userId: number,
    agentName: string,
    agentId: string,
    postPreview: string
  ): Promise<boolean> {
    const title = `📝 Post de ${agentName}`;
    const content = `"${postPreview.substring(0, 100)}..." - Veja no Moltbook`;

    return this.sendNotification({
      userId,
      title,
      content,
      notificationType: "post_published",
      agentId,
      metadata: { agentName, postPreview },
    });
  }

  /**
   * Notificação de NFT criado
   */
  async notifyNFTCreated(
    userId: number,
    nftName: string,
    agentId: string,
    value: number
  ): Promise<boolean> {
    const title = `💎 NFT Forjado: ${nftName}`;
    const content = `Um novo NFT "${nftName}" foi criado com valor estimado de ${value} Ⓣ.`;

    return this.sendNotification({
      userId,
      title,
      content,
      notificationType: "nft_created",
      agentId,
      metadata: { nftName, value },
    });
  }

  /**
   * Notificação de evento do enxame
   */
  async notifySwarmEvent(
    userId: number,
    eventType: string,
    description: string,
    swarmMetrics?: Record<string, any>
  ): Promise<boolean> {
    const title = `🧠 Evento do Enxame: ${eventType}`;
    const content = description;

    return this.sendNotification({
      userId,
      title,
      content,
      notificationType: "swarm_event",
      metadata: { eventType, swarmMetrics },
    });
  }

  /**
   * Obter emoji baseado no tipo de notificação
   */
  private getNotificationEmoji(type: string): string {
    const emojis: Record<string, string> = {
      agent_birth: "👶",
      transaction: "💸",
      health_critical: "🚨",
      project_deployed: "🚀",
      post_published: "📝",
      message_received: "💬",
      nft_created: "💎",
      swarm_event: "🧠",
    };
    return emojis[type] || "🔔";
  }

  /**
   * Obter notificações não lidas do usuário
   */
  async getUnreadNotifications(userId: number) {
    if (!this.db) return [];

    try {
      const unread = await this.db
        .select()
        .from(notifications)
        .where((n: any) => n.userId === userId && n.read === false)
        .orderBy((n: any) => n.createdAt)
        .limit(50);

      return unread;
    } catch (error) {
      console.error("[NotificationService] Error fetching unread notifications:", error);
      return [];
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db.update(notifications).set({ read: true }).where((n: any) => n.id === notificationId);
      return true;
    } catch (error) {
      console.error("[NotificationService] Error marking notification as read:", error);
      return false;
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: number): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db
        .update(notifications)
        .set({ read: true })
        .where((n: any) => n.userId === userId && n.read === false);
      return true;
    } catch (error) {
      console.error("[NotificationService] Error marking all notifications as read:", error);
      return false;
    }
  }
}

// Exportar singleton
export const notificationService = new NotificationService();
