import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { bookingRoutes } from './routes/booking';
import { availabilityRoutes } from './routes/availability';
import { errorHandler } from './middleware/error';
import { categoryRoutes } from './routes/category';
import { serviceRoutes } from './routes/service';
import { securityHeaders } from './middleware/security';
import path from 'path';

const app = express();
export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Middleware
app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
    'http://bookpal.ca'  // Add your domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log('CORS configuration applied');

app.use(express.json());

// Health check endpoint (MOVED UP)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: prisma ? 'connected' : 'disconnected',
      redis: redis ? 'connected' : 'disconnected'
    }
  });
});

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/categories', categoryRoutes);

// Add before routes
app.use(securityHeaders);

// Error handling
app.use(errorHandler);

// Update static file serving with proper path import
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Add after all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Add error logging middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${req.method}] ${req.path} Error:`, err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = parseInt(process.env.PORT || '3000', 10);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

// Add error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
}); 