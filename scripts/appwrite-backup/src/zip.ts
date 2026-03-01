import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";

export async function createBackupZip(sourceDir: string, zipPath: string): Promise<number> {
  await fs.promises.mkdir(path.dirname(zipPath), { recursive: true });

  return new Promise<number>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve(archive.pointer()));
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.glob("**/*", {
      cwd: sourceDir,
      dot: true,
      ignore: [path.basename(zipPath)],
    });
    void archive.finalize();
  });
}

