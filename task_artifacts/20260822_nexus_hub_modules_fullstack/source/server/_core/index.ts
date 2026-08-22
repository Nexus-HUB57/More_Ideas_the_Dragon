import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { WebSocketServer, WebSocket } from "ws";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { realtimeHub, serializeRealtimeEvent } from "../realtime";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function attachRealtimeTransport(server: ReturnType<typeof createServer>) {
  const realtimeServer = new WebSocketServer({ noServer: true });

  realtimeServer.on("connection", socket => {
    const unsubscribe = realtimeHub.subscribe(event => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(serializeRealtimeEvent(event));
      }
    });

    socket.send(
      JSON.stringify({
        type: "realtime.connected",
        occurredAt: Date.now(),
      })
    );

    socket.on("close", unsubscribe);
    socket.on("error", unsubscribe);
  });

  server.on("upgrade", (request, socket, head) => {
    const host = request.headers.host ?? "localhost";
    const pathname = new URL(request.url ?? "/", `http://${host}`).pathname;
    if (pathname !== "/api/realtime") return;

    realtimeServer.handleUpgrade(request, socket, head, client => {
      realtimeServer.emit("connection", client, request);
    });
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  attachRealtimeTransport(server);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
