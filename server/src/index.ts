import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { bookingRoutes } from './routes/booking';
import { availabilityRoutes } from './routes/availability';
import { errorHandler } from './middleware/error';
import { categoryRoutes } from './routes/category';
import { serviceRoutes } from './routes/service';
import { securityHeaders } from './middleware/security';

const app = express();
export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Health check endpoint (MOVED UP)
app.get('/api/health', (req, res) => {
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
app.use('/api/availability', availabilityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);

// Add before routes
app.use(securityHeaders);

// Error handling
app.use(errorHandler);

// Add after all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 