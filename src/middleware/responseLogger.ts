import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const logFile = path.join(__dirname, "../../logs/errors.log");


const logsDir = path.dirname(logFile);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
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

      fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + "\n");
    }
  }

  res.json = function (body: any) {
    logIfError(body);
    return originalJson.call(this, body);
  };

  next();
};
