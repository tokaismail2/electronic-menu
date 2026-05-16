import pino, { Logger } from "pino";
import path from "path";
import fs from "fs";

const logsDir: string = path.join(__dirname, "");

// ✅ Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
} 

// ✅ Console logger (pretty output in dev)
export const logger: Logger = pino({
  transport:
    process.env.NODE_ENV !== "production"
      ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
      : undefined,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

// ✅ File logger (sync write — avoids crash with nodemon)
let errorLogStream: any;
let errorFileLogger: Logger;

try {
  // Try to create the error log stream
  errorLogStream = pino.destination({
    dest: path.join(logsDir, "errors.log"),
    sync: true, // ✅ use sync mode to prevent SonicBoom crash
  });

  errorFileLogger = pino(
    { level: "error" },
    errorLogStream
  );
} catch (error) {
  console.warn('⚠️ Could not create file logger, using console logger instead:', error);
  // Fallback to console logger if file logging fails
  errorFileLogger = pino({
    level: "error",
    transport: process.env.NODE_ENV !== "production" ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    } : undefined,
  });
}

export { errorFileLogger };

// ✅ SMS Logger
let smsLogStream: any;
let smsFileLogger: Logger;

try {
  smsLogStream = pino.destination({
    dest: path.join(logsDir, "smsLogs.txt"),
    sync: true,
  });

  smsFileLogger = pino(
    { level: "info" },
    smsLogStream
  );
} catch (error) {
  console.warn('⚠️ Could not create SMS logger, using console logger instead:', error);
  smsFileLogger = pino({
    level: "info",
    transport: process.env.NODE_ENV !== "production" ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    } : undefined,
  });
}

export { smsFileLogger };
