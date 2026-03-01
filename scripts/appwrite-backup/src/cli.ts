#!/usr/bin/env node
import { loadConfig, type CliOptions } from "./config";
import { runBackup } from "./backup";

function parsePositiveInt(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid numeric value: ${raw}`);
  }
  return n;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    noDrive: false,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--no-drive") {
      options.noDrive = true;
      continue;
    }
    if (arg.startsWith("--db=")) {
      options.dbOverride = arg.slice("--db=".length);
      continue;
    }
    if (arg.startsWith("--out=")) {
      options.outOverride = arg.slice("--out=".length);
      continue;
    }
    if (arg.startsWith("--limit=")) {
      options.limitOverride = parsePositiveInt(arg.slice("--limit=".length));
      continue;
    }
    if (arg.startsWith("--collection=")) {
      options.collectionOverride = arg.slice("--collection=".length);
      continue;
    }
    if (arg.startsWith("--retention=")) {
      options.retentionOverride = parsePositiveInt(arg.slice("--retention=".length));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage: npm run backup -- [options]

Options:
  --db=<id>             Override APPWRITE_DATABASE_ID
  --out=<dir>           Override OUTPUT_DIR
  --limit=<n>           Override PAGE_LIMIT
  --collection=<id>     Back up only one collection
  --dry-run             Validate credentials + list collections only
  --no-drive            Skip Google Drive upload
  --retention=<n>       Override GDRIVE_RETENTION_COUNT
`);
}

async function main(): Promise<void> {
  try {
    const rawArgs = process.argv.slice(2);
    if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
      printHelp();
      process.exit(0);
    }

    const cliOptions = parseArgs(rawArgs);
    const config = loadConfig(cliOptions);
    const result = await runBackup(config);

    console.log(`Backup finished with status: ${result.status}`);
    if (result.outputDir) {
      console.log(`Output directory: ${result.outputDir}`);
    }
    if (result.manifestPath) {
      console.log(`Manifest: ${result.manifestPath}`);
    }

    if (result.status === "failed") {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Backup command failed: ${message}`);
    process.exit(1);
  }
}

void main();

