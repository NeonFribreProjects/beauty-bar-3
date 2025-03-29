import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { bookingRoutes } from './routes/booking';
import { availabilityRoutes } from './routes/availability';
import { errorHandler } from './middleware/error';
import { categoryRoutes } from './routes/category';
import { serviceRoutes } from './routes/service';

const app = express();
export const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);

// Health check endpoint
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

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 