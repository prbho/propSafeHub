import fs from "node:fs";
import path from "node:path";

export interface NdjsonWriter {
  write(doc: unknown): Promise<void>;
  close(): Promise<void>;
}

function waitForDrain(stream: fs.WriteStream): Promise<void> {
  return new Promise((resolve) => stream.once("drain", resolve));
}

export function createNdjsonWriter(filePath: string): NdjsonWriter {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const stream = fs.createWriteStream(filePath, { flags: "w", encoding: "utf8" });

  return {
    async write(doc: unknown): Promise<void> {
      const line = `${JSON.stringify(doc)}\n`;
      if (!stream.write(line)) {
        await waitForDrain(stream);
      }
    },
    close: async () =>
      new Promise<void>((resolve, reject) => {
        stream.end((err?: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      }),
  };
}

