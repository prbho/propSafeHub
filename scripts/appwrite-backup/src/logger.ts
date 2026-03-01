import fs from "node:fs";
import path from "node:path";

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  close(): Promise<void>;
}

function formatLine(level: "INFO" | "WARN" | "ERROR", message: string): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level}] ${message}`;
}

export function createLogger(logFilePath?: string): Logger {
  let stream: fs.WriteStream | null = null;

  if (logFilePath) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    stream = fs.createWriteStream(logFilePath, { flags: "a", encoding: "utf8" });
  }

  const write = (level: "INFO" | "WARN" | "ERROR", message: string): void => {
    const line = formatLine(level, message);
    if (level === "ERROR") {
      console.error(line);
    } else if (level === "WARN") {
      console.warn(line);
    } else {
      console.log(line);
    }
    if (stream) {
      stream.write(`${line}\n`);
    }
  };

  return {
    info: (message: string) => write("INFO", message),
    warn: (message: string) => write("WARN", message),
    error: (message: string) => write("ERROR", message),
    close: async () =>
      new Promise<void>((resolve, reject) => {
        if (!stream) {
          resolve();
          return;
        }
        stream.end((err?: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      }),
  };
}

