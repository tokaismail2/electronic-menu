
// Load environment variables FIRST - before any other imports that might use them
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config();
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  }
} else if (!process.env.VERCEL) {
  console.warn('⚠️ .env file not found');
}
// Handle uncaught exceptions immediately
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import http from 'http';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { responseLogger } from './middleware/responseLogger';
import { initSocket } from './config/socketManager';
import { agenda } from "./config/agenda";
// import './jobs/agenda';
// import compression from 'compression';
import routes from './routes/index';


const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Debug CORS headers in development
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '3600');
  }
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/*' }));

// Request logging
app.use(requestLogger);
// Error response logging
app.use(responseLogger);

// Database Connection Middleware for Serverless / Dynamic connection
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('💥 MongoDB connection error in middleware:', error);
    next(error);
  }
});

// Routes
app.use('/api', routes);

// 404 handler → pass to errorLogger
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error('Route not found');
  (err as any).statusCode = 404;
  next(err);
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO on top of the HTTP server (real-time layer)
initSocket(server);
console.log('🔌 Socket.IO initialized');

// Start Agenda
(async () => {
  try {
    console.log('🔌 Initializing database connection for Agenda...');
    await connectDB();
    await agenda.start();
    console.log("✅ Agenda started");
  } catch (error) {
    console.error('💥 Failed to start Agenda:', error);
  }
})();

server.listen(PORT, () => {
  console.log('🚀 Backend Server Started');
  console.log(`🌐 Server running on ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (e.g. Heroku shutdown)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

export default app;

