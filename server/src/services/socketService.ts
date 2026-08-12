import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketUser {
  id: string;
  username?: string;
  role?: string;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

let io: Server | null = null;

// Rate limiting map for sockets: socket.id -> array of timestamps
const socketRateLimits = new Map<string, number[]>();
const MAX_EVENTS_PER_WINDOW = 30;
const WINDOW_MS = 10000; // 10 seconds

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    maxHttpBufferSize: 1e6, // 1MB payload limit
  });

  // Middleware: Authentication & Security Handshake
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.headers?.cookie
          ?.split(';')
          .find((c) => c.trim().startsWith('token='))
          ?.split('=')[1];

      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'fallback_secret_key_build_your_thoughts'
        ) as SocketUser;
        socket.user = decoded;
      }
      return next();
    } catch {
      // Allow unauthenticated clients for public live updates, but mark user as guest
      socket.user = { id: 'guest', role: 'guest' };
      return next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const isUserAdmin = socket.user?.role === 'admin' || socket.user?.role === 'editor';

    // Join admin notifications room if authenticated admin
    if (isUserAdmin) {
      socket.join('admin-notifications');
    }

    // Join public analytics room
    socket.join('live-analytics');

    // Project workspace rooms: used to signal admin <-> client portal live
    // updates (client to-dos, meetings, progress updates) without leaking
    // one side's data shape to the other — payloads are always sanitized by
    // the emitting controller, sockets only carry a "something changed"
    // signal and each side re-fetches through its own scoped REST endpoint.
    socket.on('join_project', (projectId: string) => {
      if (typeof projectId === 'string' && projectId.length < 64) {
        socket.join(`project-${projectId}`);
      }
    });
    socket.on('leave_project', (projectId: string) => {
      if (typeof projectId === 'string') {
        socket.leave(`project-${projectId}`);
      }
    });

    // Socket Level Rate Limiter Middleware
    socket.use(([event, ...args], next) => {
      const now = Date.now();
      const timestamps = socketRateLimits.get(socket.id) || [];
      const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

      if (validTimestamps.length >= MAX_EVENTS_PER_WINDOW) {
        return next(new Error('Rate limit exceeded on WebSocket connection. Slow down.'));
      }

      validTimestamps.push(now);
      socketRateLimits.set(socket.id, validTimestamps);
      return next();
    });

    socket.on('ping_keepalive', () => {
      socket.emit('pong_keepalive', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      socketRateLimits.delete(socket.id);
    });
  });

  return io;
};

export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized on server.');
  }
  return io;
};

/**
 * Emit real-time lead submission notification to connected Admin users
 */
export const notifyAdmins = (event: string, data: any): void => {
  if (io) {
    io.to('admin-notifications').emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Signal a project workspace room (admin viewers + the client portal) that
 * something changed, so both sides can re-fetch through their own scoped
 * endpoint. Never put internal-only fields in `data` — clients share this room.
 */
export const notifyProjectRoom = (projectId: string, event: string, data: Record<string, any> = {}): void => {
  if (io) {
    io.to(`project-${projectId}`).emit(event, {
      projectId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Broadcast live system or CMS update to public rooms
 */
export const broadcastRealtimeUpdate = (event: string, data: any): void => {
  if (io) {
    io.to('live-analytics').emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
};
