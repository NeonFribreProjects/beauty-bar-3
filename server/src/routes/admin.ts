import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      throw error;
    }
  }
});

// Create admin (protected route)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const adminData = adminSchema.parse(req.body);

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const admin = await prisma.admin.create({
      data: {
        ...adminData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    res.status(201).json(admin);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      throw error;
    }
  }
});

// Get admin profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  });

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }

  res.json(admin);
});

// Update admin profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, password } = req.body;

  const data: any = {};
  if (name) data.name = name;
  if (password) data.password = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.update({
    where: { id: req.adminId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  });

  res.json(admin);
});

export { router as adminRoutes }; 