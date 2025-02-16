import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const availabilitySchema = z.object({
  duration: z.number().min(1),
  breakTime: z.number().min(0),
  maxBookingsPerDay: z.number().min(1),
  daysAvailable: z.array(z.number().min(0).max(6))
});

export const validateAvailability = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    availabilitySchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
}; 