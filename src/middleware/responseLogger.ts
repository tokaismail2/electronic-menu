import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const logFile = path.join(__dirname, "../../logs/errors.log");
const logsDir = path.dirname(logFile);

let isWritable = false;
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  isWritable = true;
} catch (error) {
  console.warn("⚠️ Could not create response logs directory, file logging disabled:", (error as Error).message);
}

export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  function logIfError(body: any) {
    if (res.statusCode >= 400) {
      const logEntry = {
        time: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        body: typeof body === "object" ? body : body?.toString(),
      };

      if (isWritable) {
        try {
          fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + "\n");
        } catch (err) {
          console.error("❌ Failed to write to response log file:", (err as Error).message);
          console.error("Error Details:", JSON.stringify(logEntry));
        }
      } else {
        // Fallback to standard console logging for serverless/read-only environments
        console.error("❌ Error Response:", JSON.stringify(logEntry));
      }
    }
  }

  res.json = function (body: any) {
    logIfError(body);
    return originalJson.call(this, body);
  };

  next();
};
