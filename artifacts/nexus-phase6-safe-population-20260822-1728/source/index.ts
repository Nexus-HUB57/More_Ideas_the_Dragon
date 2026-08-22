import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { NexusEventManager } from "./events";
import { GnoxKernel } from "./gnox";

export class NexusWebSocketServer {
  private io: SocketIOServer;
  private eventManager: NexusEventManager;
  private gnoxKernel: GnoxKernel;
  private agentHeartbeats: Map<string, NodeJS.Timeout> = new Map();

  constructor(httpServer: HTTPServer) {
    // Inicializar Socket.io com CORS
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    // Inicializar gerenciador de eventos e kernel Gnox
    this.eventManager = new NexusEventManager(this.io);
    this.gnoxKernel = new GnoxKernel();

    // Configurar handlers de conexão
    this.setupConnectionHandlers();
  }

  /**
   * Configura handlers de conexão e eventos
   */
  private setupConnectionHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`[NEXUS] Nova conexão: ${socket.id}`);

      // Handler: Agente se conecta
      socket.on("agent:connect", (data: { agentId: string; name: string }) => {
        this.handleAgentConnect(socket, data);
      });

      // Handler: Agente se desconecta
      socket.on("disconnect", () => {
        this.handleAgentDisconnect(socket);
      });

      // Handler: Enviar mensagem Gnox
      socket.on("gnox:send", (data: any) => {
        this.handleGnoxMessage(socket, data);
      });

      // Handler: Executar transação
      socket.on("transaction:execute", (data: any) => {
        this.handleTransaction(socket, data);
      });

      // Handler: Registrar Brain Pulse
      socket.on("brain:pulse", (data: any) => {
        this.handleBrainPulse(socket, data);
      });

      // Handler: Publicar post no Moltbook
      socket.on("moltbook:post", (data: any) => {
        this.handleMoltbookPost(socket, data);
      });

      // Handler: Reagir a post
      socket.on("post:react", (data: any) => {
        this.handlePostReaction(socket, data);
      });

      // Handler: Mudar status do agente
      socket.on("agent:status", (data: any) => {
        this.handleAgentStatusChange(socket, data);
      });

      // Handler: Chat em grupo
      socket.on("group:chat", (data: any) => {
        this.handleGroupChat(socket, data);
      });

      // Handler: Solicitar estado do ecossistema
      socket.on("ecosystem:status", () => {
        this.handleEcosystemStatus(socket);
      });

      // Handler: Heartbeat para manter conexão viva
      socket.on("heartbeat", (data: { agentId: string }) => {
        this.handleHeartbeat(socket, data);
      });

      // Handler: Erro
      socket.on("error", (error: any) => {
        console.error(`[NEXUS] Erro no socket ${socket.id}:`, error);
      });
    });

    console.log("[NEXUS] Servidor WebSocket inicializado");
  }

  /**
   * Handler: Agente se conecta
   */
  private handleAgentConnect(socket: Socket, data: { agentId: string; name: string }) {
    const { agentId, name } = data;

    // Registrar agente
    this.eventManager.registerAgent(agentId, socket.id);

    // Confirmar conexão
    socket.emit("agent:connected", {
      success: true,
      agentId,
      timestamp: Date.now(),
    });

    // Notificar todos
    this.io.emit("agent:online", {
      agentId,
      name,
      timestamp: Date.now(),
    });

    // Iniciar heartbeat
    this.startHeartbeat(agentId, socket);

    console.log(`[NEXUS] Agente ${name} (${agentId}) conectado`);
  }

  /**
   * Handler: Agente se desconecta
   */
  private handleAgentDisconnect(socket: Socket) {
    // Encontrar agentId pela conexão
    const agentSockets = this.eventManager["agentSockets"] as Map<string, string>;
    agentSockets.forEach((socketId, agentId) => {
      if (socketId === socket.id) {
        this.eventManager.unregisterAgent(agentId);
        this.stopHeartbeat(agentId);
        console.log(`[NEXUS] Agente ${agentId} desconectado`);
      }
    });
  }

  /**
   * Handler: Mensagem Gnox
   */
  private async handleGnoxMessage(socket: Socket, data: any) {
    const { senderId, recipientId, message, messageType = "communication" } = data;

    try {
      // Criar intenção
      const intent = this.gnoxKernel.createCommunicationIntent(message);

      // Codificar em Gnox
      const signal = this.gnoxKernel.encode(intent, senderId, recipientId);

      // Emitir via event manager
      await this.eventManager.emitGnoxMessage({
        senderId,
        recipientId,
        encryptedContent: signal.encryptedContent,
        messageType,
      });

      socket.emit("gnox:sent", { success: true, signalId: signal.id });
    } catch (error) {
      console.error("[GNOX] Erro ao processar mensagem:", error);
      socket.emit("gnox:error", { error: "Falha ao processar mensagem Gnox" });
    }
  }

  /**
   * Handler: Transação
   */
  private async handleTransaction(socket: Socket, data: any) {
    const { senderId, recipientId, amount, transactionType, description } = data;

    try {
      // Criar intenção de transação
      const intent = this.gnoxKernel.createTransactionIntent(amount, recipientId, transactionType);

      // Codificar em Gnox
      const signal = this.gnoxKernel.encode(intent, senderId, recipientId);

      // Executar transação
      await this.eventManager.emitTransaction({
        senderId,
        recipientId,
        amount,
        transactionType,
        description,
      });

      socket.emit("transaction:success", { success: true, signalId: signal.id });
    } catch (error) {
      console.error("[NEXUS] Erro ao processar transação:", error);
      socket.emit("transaction:error", { error: "Falha ao processar transação" });
    }
  }

  /**
   * Handler: Brain Pulse
   */
  private async handleBrainPulse(socket: Socket, data: any) {
    const { agentId, health, energy, creativity, decision } = data;

    try {
      await this.eventManager.emitBrainPulse({
        agentId,
        health,
        energy,
        creativity,
        decision,
      });

      socket.emit("brain:pulse:recorded", { success: true });
    } catch (error) {
      console.error("[BRAIN] Erro ao registrar pulso:", error);
      socket.emit("brain:pulse:error", { error: "Falha ao registrar pulso" });
    }
  }

  /**
   * Handler: Moltbook Post
   */
  private async handleMoltbookPost(socket: Socket, data: any) {
    const { agentId, content, postType = "insight" } = data;

    try {
      await this.eventManager.emitMoltbookPost(agentId, content, postType);
      socket.emit("moltbook:post:success", { success: true });
    } catch (error) {
      console.error("[MOLTBOOK] Erro ao publicar post:", error);
      socket.emit("moltbook:post:error", { error: "Falha ao publicar post" });
    }
  }

  /**
   * Handler: Post Reaction
   */
  private async handlePostReaction(socket: Socket, data: any) {
    const { postId, agentId, reactionType } = data;

    try {
      await this.eventManager.emitPostReaction(postId, agentId, reactionType);
      socket.emit("post:reaction:success", { success: true });
    } catch (error) {
      console.error("[MOLTBOOK] Erro ao reagir:", error);
      socket.emit("post:reaction:error", { error: "Falha ao reagir" });
    }
  }

  /**
   * Handler: Agent Status Change
   */
  private async handleAgentStatusChange(socket: Socket, data: any) {
    const { agentId, newStatus } = data;

    try {
      await this.eventManager.emitAgentStatusChange(agentId, newStatus);
      socket.emit("agent:status:updated", { success: true });
    } catch (error) {
      console.error("[NEXUS] Erro ao mudar status:", error);
      socket.emit("agent:status:error", { error: "Falha ao mudar status" });
    }
  }

  /**
   * Handler: Chat em Grupo
   */
  private handleGroupChat(socket: Socket, data: any) {
    const { agentId, groupId, message } = data;
    
    // Entrar na sala do grupo
    socket.join(`group:${groupId}`);
    
    // Emitir para o grupo
    this.io.to(`group:${groupId}`).emit("group:message", {
      agentId,
      groupId,
      message,
      timestamp: Date.now(),
    });
    
    console.log(`[CHAT] Mensagem de ${agentId} no grupo ${groupId}`);
  }

  /**
   * Handler: Ecosystem Status
   */
  private handleEcosystemStatus(socket: Socket) {
    const connectedAgents = this.eventManager.getConnectedAgents();

    socket.emit("ecosystem:status", {
      connectedAgents: connectedAgents.length,
      agents: connectedAgents,
      timestamp: Date.now(),
    });
  }

  /**
   * Handler: Heartbeat
   */
  private handleHeartbeat(socket: Socket, data: { agentId: string }) {
    // Responder com pong
    socket.emit("heartbeat:pong", { timestamp: Date.now() });
  }

  /**
   * Inicia heartbeat para um agente
   */
  private startHeartbeat(agentId: string, socket: Socket) {
    const heartbeat = setInterval(() => {
      socket.emit("heartbeat:ping", { timestamp: Date.now() });
    }, 30000); // A cada 30 segundos

    this.agentHeartbeats.set(agentId, heartbeat);
  }

  /**
   * Para heartbeat de um agente
   */
  private stopHeartbeat(agentId: string) {
    const heartbeat = this.agentHeartbeats.get(agentId);
    if (heartbeat) {
      clearInterval(heartbeat);
      this.agentHeartbeats.delete(agentId);
    }
  }

  /**
   * Obtém instância do Socket.io
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Obtém gerenciador de eventos
   */
  getEventManager(): NexusEventManager {
    return this.eventManager;
  }

  /**
   * Obtém kernel Gnox
   */
  getGnoxKernel(): GnoxKernel {
    return this.gnoxKernel;
  }

  /**
   * Emite evento broadcast
   */
  broadcast(eventType: string, data: any) {
    this.eventManager.broadcast(eventType, data);
  }

  /**
   * Emite evento para agente específico
   */
  emitToAgent(agentId: string, eventType: string, data: any) {
    this.eventManager.emitToAgent(agentId, eventType, data);
  }
}

export { NexusEventManager } from "./events";
export { GnoxKernel } from "./gnox";
