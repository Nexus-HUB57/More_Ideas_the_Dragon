import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import crypto from "crypto";

/**
 * Tipos de canais de comunicação
 */
export type NucleusType = "nexus_in" | "nexus_hub" | "fundo_nexus";

/**
 * Interface para mensagens de sincronização
 */
export interface SyncMessage {
  id: string;
  origin: NucleusType;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  signature: string;
  requiresAck: boolean;
}

/**
 * Interface para reconhecimento de mensagens
 */
export interface MessageAck {
  messageId: string;
  status: "received" | "processed" | "error";
  timestamp: Date;
  error?: string;
}

/**
 * Interface para métricas de latência
 */
export interface LatencyMetrics {
  nucleus: NucleusType;
  messageId: string;
  sentAt: Date;
  receivedAt: Date;
  processedAt?: Date;
  latencyMs: number;
  roundTripMs?: number;
}

/**
 * Gerenciador de WebSocket para sincronização tri-nuclear
 */
export class WebSocketOrchestrator {
  private io: SocketIOServer;
  private pendingMessages: Map<string, SyncMessage> = new Map();
  private latencyMetrics: LatencyMetrics[] = [];
  private nucleusConnections: Map<NucleusType, Socket | null> = new Map([
    ["nexus_in", null],
    ["nexus_hub", null],
    ["fundo_nexus", null],
  ]);
  private messageQueue: SyncMessage[] = [];
  private apiSecret: string;
  private isProcessing = false;

  constructor(httpServer: HTTPServer, apiSecret: string) {
    this.apiSecret = apiSecret;
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    } as any);

    this.setupEventHandlers();
    this.startMessageProcessor();
  }

  /**
   * Configurar manipuladores de eventos
   */
  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket<any, any>) => {
      const nucleusType = socket.handshake.auth.nucleus as NucleusType;

      if (!nucleusType || !this.nucleusConnections.has(nucleusType)) {
        console.error(`❌ Conexão inválida: ${nucleusType}`);
        socket.disconnect();
        return;
      }

      console.log(`✅ ${nucleusType} conectado ao Nexus Genesis`);
      this.nucleusConnections.set(nucleusType, socket);

      // Emitir evento de conexão
      this.io.emit("nucleus:connected", {
        nucleus: nucleusType,
        timestamp: new Date(),
      });

      // Manipulador para sincronização
      socket.on("sync:message", (message: SyncMessage) => {
        this.handleSyncMessage(nucleusType, message, socket);
      });

      // Manipulador para reconhecimento
      socket.on("sync:ack", (ack: MessageAck) => {
        this.handleMessageAck(nucleusType, ack);
      });

      // Manipulador para heartbeat
      socket.on("heartbeat", () => {
        socket.emit("heartbeat:response", { timestamp: new Date() });
      });

      // Manipulador para desconexão
      socket.on("disconnect", () => {
        console.log(`⚠️ ${nucleusType} desconectado`);
        this.nucleusConnections.set(nucleusType, null);

        // Emitir evento de desconexão
        this.io.emit("nucleus:disconnected", {
          nucleus: nucleusType,
          timestamp: new Date(),
        });

        // Tentar reconectar após 5 segundos
        setTimeout(() => {
          console.log(`🔄 Tentando reconectar ${nucleusType}...`);
        }, 5000);
      });

      // Manipulador para erro
      socket.on("error", (error: any) => {
        console.error(`❌ Erro em ${nucleusType}:`, error);
      });
    });
  }

  /**
   * Manipular mensagem de sincronização
   */
  private handleSyncMessage(
    nucleus: NucleusType,
    message: SyncMessage,
    socket: Socket
  ): void {
    // Validar assinatura
    if (!this.validateSignature(message)) {
      console.error(`❌ Assinatura inválida de ${nucleus}`);
      socket.emit("sync:error", {
        messageId: message.id,
        error: "Invalid signature",
      });
      return;
    }

    // Registrar métrica de latência
    const latencyMs = Date.now() - message.timestamp.getTime();
    this.recordLatency({
      nucleus,
      messageId: message.id,
      sentAt: message.timestamp,
      receivedAt: new Date(),
      latencyMs,
    });

    // Enfileirar mensagem
    this.messageQueue.push(message);
    this.pendingMessages.set(message.id, message);

    // Emitir reconhecimento imediato se necessário
    if (message.requiresAck) {
      socket.emit("sync:ack_request", {
        messageId: message.id,
        status: "received",
        timestamp: new Date(),
      });
    }

    // Transmitir para Genesis e outros núcleos
    this.io.emit("sync:broadcast", {
      origin: nucleus,
      message,
      receivedAt: new Date(),
    });

    console.log(
      `📨 Mensagem de ${nucleus}: ${message.type} (latência: ${latencyMs}ms)`
    );
  }

  /**
   * Manipular reconhecimento de mensagem
   */
  private handleMessageAck(nucleus: NucleusType, ack: MessageAck): void {
    const message = this.pendingMessages.get(ack.messageId);

    if (!message) {
      console.warn(`⚠️ ACK recebido para mensagem desconhecida: ${ack.messageId}`);
      return;
    }

    // Atualizar métrica de latência com tempo de processamento
    const metric = this.latencyMetrics.find(
      (m) => m.messageId === ack.messageId
    );
    if (metric && ack.status === "processed") {
      metric.processedAt = ack.timestamp;
      metric.roundTripMs = ack.timestamp.getTime() - metric.sentAt.getTime();
    }

    // Remover mensagem da fila de pendentes
    this.pendingMessages.delete(ack.messageId);

    console.log(
      `✅ ACK de ${nucleus}: ${ack.messageId} (${ack.status}) - RTT: ${metric?.roundTripMs}ms`
    );

    // Emitir evento de confirmação
    this.io.emit("sync:confirmed", {
      nucleus,
      messageId: ack.messageId,
      status: ack.status,
      timestamp: ack.timestamp,
    });
  }

  /**
   * Enviar mensagem de sincronização para um núcleo
   */
  public sendSyncMessage(
    destination: NucleusType,
    type: string,
    data: Record<string, any>,
    requiresAck: boolean = true
  ): string {
    const messageId = crypto.randomUUID();
    const timestamp = new Date();

    const message: SyncMessage = {
      id: messageId,
      origin: "nexus_hub", // Genesis é o remetente
      type,
      data,
      timestamp,
      signature: "",
      requiresAck,
    };

    // Assinar mensagem
    message.signature = this.signMessage(message);

    // Registrar métrica
    this.recordLatency({
      nucleus: destination,
      messageId,
      sentAt: timestamp,
      receivedAt: new Date(),
      latencyMs: 0,
    });

    // Enviar para o núcleo
    const socket = this.nucleusConnections.get(destination);
    if (socket && socket.connected) {
      socket.emit("sync:message", message);
      this.pendingMessages.set(messageId, message);
      console.log(`📤 Mensagem enviada para ${destination}: ${type}`);
    } else {
      console.error(`❌ ${destination} não está conectado`);
    }

    return messageId;
  }

  /**
   * Transmitir mensagem para todos os núcleos
   */
  public broadcastMessage(
    type: string,
    data: Record<string, any>,
    exclude?: NucleusType
  ): string[] {
    const messageIds: string[] = [];

    for (const nucleus of ["nexus_in", "nexus_hub", "fundo_nexus"] as NucleusType[]) {
      if (nucleus !== exclude) {
        const messageId = this.sendSyncMessage(nucleus, type, data, true);
        messageIds.push(messageId);
      }
    }

    return messageIds;
  }

  /**
   * Assinar mensagem com HMAC-SHA256
   */
  private signMessage(message: Omit<SyncMessage, "signature">): string {
    const payload = JSON.stringify({
      id: message.id,
      origin: message.origin,
      type: message.type,
      data: message.data,
      timestamp: message.timestamp,
    });

    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(payload)
      .digest("hex");
  }

  /**
   * Validar assinatura de mensagem
   */
  private validateSignature(message: SyncMessage): boolean {
    const messageWithoutSignature = { ...message, signature: "" };
    const expectedSignature = this.signMessage(messageWithoutSignature);
    return message.signature === expectedSignature;
  }

  /**
   * Registrar métrica de latência
   */
  private recordLatency(metric: LatencyMetrics): void {
    this.latencyMetrics.push(metric);

    // Manter apenas últimas 1000 métricas
    if (this.latencyMetrics.length > 1000) {
      this.latencyMetrics.shift();
    }
  }

  /**
   * Obter métricas de latência
   */
  public getLatencyMetrics(nucleus?: NucleusType): LatencyMetrics[] {
    if (nucleus) {
      return this.latencyMetrics.filter((m) => m.nucleus === nucleus);
    }
    return this.latencyMetrics;
  }

  /**
   * Obter latência média
   */
  public getAverageLatency(nucleus?: NucleusType): number {
    const metrics = this.getLatencyMetrics(nucleus);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.latencyMs, 0);
    return sum / metrics.length;
  }

  /**
   * Obter status de conexão dos núcleos
   */
  public getConnectionStatus(): Record<NucleusType, boolean> {
    return {
      nexus_in: this.nucleusConnections.get("nexus_in")?.connected ?? false,
      nexus_hub: this.nucleusConnections.get("nexus_hub")?.connected ?? false,
      fundo_nexus: this.nucleusConnections.get("fundo_nexus")?.connected ?? false,
    };
  }

  /**
   * Obter estatísticas de fila
   */
  public getQueueStats() {
    return {
      pendingMessages: this.pendingMessages.size,
      queuedMessages: this.messageQueue.length,
      totalLatencyMetrics: this.latencyMetrics.length,
    };
  }

  /**
   * Processar fila de mensagens
   */
  private startMessageProcessor(): void {
    setInterval(() => {
      if (this.isProcessing || this.messageQueue.length === 0) return;

      this.isProcessing = true;

      try {
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) {
            // Processar mensagem
            this.io.emit("sync:processed", {
              messageId: message.id,
              origin: message.origin,
              type: message.type,
              processedAt: new Date(),
            });
          }
        }
      } finally {
        this.isProcessing = false;
      }
    }, 100); // Processar a cada 100ms
  }

  /**
   * Obter instância do Socket.io
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Fechar conexões
   */
  public close(): void {
    this.io.close();
  }
}

export default WebSocketOrchestrator;
