import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocketServer } from './services/socketService';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(PORT, () => {
    console.log(`[Server] Build Your Thoughts API & Socket Engine running on http://localhost:${PORT}`);
  });
};

startServer();
