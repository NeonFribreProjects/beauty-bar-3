import { Request, Response, NextFunction } from 'express';
import { config } from '../config/timezone';

export const normalizeDates = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.startTime) {
    req.body.startTime = new Date(req.body.startTime).toISOString();
  }
  next();
};

export const formatResponseDates = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (data?.availability) {
      data.availability = data.availability.map((avail: any) => ({
        ...avail,
        startTime: config.formatForClient(new Date(avail.startTime)),
        endTime: config.formatForClient(new Date(avail.endTime))
      }));
    }
    return originalJson.call(this, data);
  };
  next();
}; 