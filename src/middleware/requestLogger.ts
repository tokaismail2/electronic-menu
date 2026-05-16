import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body || {},
    params: req.params || {},
    query: req.query || {},
    timestamp: new Date().toISOString(),
  };

  logger.info({
    message: "Incoming request",
    ...requestData,
  });

  next();
};
