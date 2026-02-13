import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import { connectDatabase } from './startup/database';
import { socketService } from './socket';

dotenv.config();

// Connect to Database
connectDatabase();

const port = process.env.PORT || 4200;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket Service
socketService.init(httpServer);

httpServer.listen(port, () => {
  console.log(`✅ Chat Service running on port ${port}`);
});
