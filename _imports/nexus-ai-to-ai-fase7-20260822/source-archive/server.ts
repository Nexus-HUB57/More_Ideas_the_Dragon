/**
 * Nexus Hub - Main Server
 * Servidor Express com suporte a WebSocket via Socket.IO
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config, validateConfig } from './utils/config';
import { logger } from './utils/logger';
import { nexusEngine } from './ai/nexus-engine';
import { ApiResponse } from './types';

// Validar configuração
validateConfig();

// Criar aplicação Express
const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error: ${err.message}`, err);
  const response: ApiResponse<null> = {
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date(),
  };
  res.status(err.status || 500).json(response);
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  const response: ApiResponse<{ status: string; timestamp: Date }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
    },
    timestamp: new Date(),
  };
  res.json(response);
});

// API version
app.get('/api/version', (_req: Request, res: Response) => {
  const response: ApiResponse<{ version: string; environment: string }> = {
    success: true,
    data: {
      version: '1.0.0',
      environment: config.nodeEnv,
    },
    timestamp: new Date(),
  };
  res.json(response);
});

// ============================================================================
// WEBSOCKET
// ============================================================================

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Subscribe to channel
  socket.on('subscribe', (channel: string) => {
    socket.join(channel);
    logger.info(`Client ${socket.id} subscribed to ${channel}`);
    socket.emit('subscribed', { channel, timestamp: new Date() });
  });

  // Unsubscribe from channel
  socket.on('unsubscribe', (channel: string) => {
    socket.leave(channel);
    logger.info(`Client ${socket.id} unsubscribed from ${channel}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}`, error);
  });
});

// ============================================================================
// EXPORT
// ============================================================================

export { app, httpServer, io };

// ============================================================================
// START SERVER
// ============================================================================

if (require.main === module) {
  const PORT = config.port;

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Nexus Hub Server running on port ${PORT}`, {
      environment: config.nodeEnv,
      websocketPort: config.websocketPort,
    });
    nexusEngine.start(); // Iniciar o Nexus Engine
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    logger.info("Shutting down gracefully...");
    nexusEngine.stop(); // Parar o Nexus Engine
    httpServer.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });
}
