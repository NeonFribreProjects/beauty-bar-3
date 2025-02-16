import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';
import * as Sentry from "@sentry/node";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error('Unhandled error:', {
    error: err,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }

  return res.status(500).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
  });
}; 