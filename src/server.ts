import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import cors from 'cors';
import { MatchmakingService } from './websocket/matchmaking';
import { createLogger } from './utils/logger';

const logger = createLogger('Server');

// Load environment variables
const PORT = process.env.PORT || 3001;
const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = process.env.PROGRAM_ID || 'GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Create matchmaking service
const matchmakingService = new MatchmakingService(wss, RPC_URL, PROGRAM_ID);

// API routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get server time for client clock synchronization
app.get('/api/time', (req, res) => {
  res.json({ 
    timestamp: Date.now(),
    message: 'Current server time'
  });
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`WebSocket server running`);
});

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  logger.info('Shutting down server...');
  
  // Clean up matchmaking service
  matchmakingService.shutdown();
  
  // Close WebSocket server and HTTP server
  wss.close(() => {
    server.close(() => {
      logger.info('Server shut down completed');
      process.exit(0);
    });
  });
} 