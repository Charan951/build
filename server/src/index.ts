import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocketServer } from './services/socketService';

const PORT = process.env.PORT || 5000;

// Without these, an unhandled rejection anywhere (e.g. a Puppeteer/PDF render
// failure that escapes a promise chain) terminates the whole Node process on
// modern Node versions, taking down the API for every other route with it.
// Log and keep serving instead.
process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err);
});

const startServer = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(PORT, () => {
    console.log(`[Server] Build Your Thoughts API & Socket Engine running on http://localhost:${PORT}`);
  });
};

startServer();
