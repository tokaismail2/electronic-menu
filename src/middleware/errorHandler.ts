import { Request, Response, NextFunction } from "express";

// Optional custom error interface for better typing
interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};
