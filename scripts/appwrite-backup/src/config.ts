import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

export interface CliOptions {
  dbOverride?: string;
  outOverride?: string;
  limitOverride?: number;
  collectionOverride?: string;
  dryRun: boolean;
  noDrive: boolean;
  retentionOverride?: number;
}

export interface BackupConfig {
  appwriteEndpoint: string;
  appwriteProjectId: string;
  appwriteApiKey: string;
  appwriteDatabaseId: string;
  outputDir: string;
  pageLimit: number;
  maxRetries: number;
  retryBaseDelayMs: number;
  drive: {
    enabled: boolean;
    authMode: "service_account" | "oauth_user";
    parentFolderId: string;
    backupsRootName: string;
    retentionCount: number;
    serviceAccountJsonPath?: string;
    serviceAccountJsonBase64?: string;
    oauthClientId?: string;
    oauthClientSecret?: string;
    oauthRefreshToken?: string;
  };
  collectionFilter?: string;
  dryRun: boolean;
}

function loadEnvFiles(): void {
  const cwdEnv = path.resolve(process.cwd(), ".env");
  const localEnv = path.resolve(__dirname, "..", ".env");
  const repoEnv = path.resolve(__dirname, "..", "..", "..", ".env");

  [repoEnv, localEnv, cwdEnv].forEach((envPath) => {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
    }
  });
}

function parseIntSafe(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

export function loadConfig(options: CliOptions): BackupConfig {
  loadEnvFiles();

  const appwriteEndpoint = required("APPWRITE_ENDPOINT", process.env.APPWRITE_ENDPOINT);
  const appwriteProjectId = required("APPWRITE_PROJECT_ID", process.env.APPWRITE_PROJECT_ID);
  const appwriteApiKey = required("APPWRITE_API_KEY", process.env.APPWRITE_API_KEY);
  const appwriteDatabaseId = options.dbOverride
    ? options.dbOverride
    : required("APPWRITE_DATABASE_ID", process.env.APPWRITE_DATABASE_ID);

  const outputDirRaw = options.outOverride || process.env.OUTPUT_DIR || "backups";
  const outputDir = path.isAbsolute(outputDirRaw)
    ? outputDirRaw
    : path.resolve(process.cwd(), outputDirRaw);

  const pageLimit = options.limitOverride || parseIntSafe(process.env.PAGE_LIMIT, 100);
  const maxRetries = parseIntSafe(process.env.MAX_RETRIES, 5);
  const retryBaseDelayMs = parseIntSafe(process.env.RETRY_BASE_DELAY_MS, 500);

  const serviceAccountJsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  const serviceAccountJsonPathRaw =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH?.trim() || "./service-account.json";
  const serviceAccountJsonPath = path.isAbsolute(serviceAccountJsonPathRaw)
    ? serviceAccountJsonPathRaw
    : path.resolve(__dirname, "..", serviceAccountJsonPathRaw);

  const driveEnabled = !options.noDrive;
  const authModeRaw = process.env.GDRIVE_AUTH_MODE?.trim().toLowerCase();
  const authMode: "service_account" | "oauth_user" =
    authModeRaw === "oauth_user" ? "oauth_user" : "service_account";
  const parentFolderId = process.env.GDRIVE_PARENT_FOLDER_ID?.trim() || "";
  const backupsRootName = process.env.GDRIVE_BACKUPS_ROOT_NAME?.trim() || "AppwriteBackups";
  const retentionCount =
    options.retentionOverride ?? parseIntSafe(process.env.GDRIVE_RETENTION_COUNT, 14);
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  if (driveEnabled && !parentFolderId) {
    throw new Error("Missing required env: GDRIVE_PARENT_FOLDER_ID (or use --no-drive)");
  }
  if (driveEnabled && authMode === "service_account") {
    if (!serviceAccountJsonBase64 && !fs.existsSync(serviceAccountJsonPath)) {
      throw new Error(
        "Missing service account credentials. Set GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 or GOOGLE_SERVICE_ACCOUNT_JSON_PATH",
      );
    }
  }
  if (driveEnabled && authMode === "oauth_user") {
    if (!oauthClientId || !oauthClientSecret || !oauthRefreshToken) {
      throw new Error(
        "Missing OAuth user credentials. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN",
      );
    }
  }

  return {
    appwriteEndpoint,
    appwriteProjectId,
    appwriteApiKey,
    appwriteDatabaseId,
    outputDir,
    pageLimit,
    maxRetries,
    retryBaseDelayMs,
    drive: {
      enabled: driveEnabled,
      authMode,
      parentFolderId,
      backupsRootName,
      retentionCount,
      serviceAccountJsonBase64,
      serviceAccountJsonPath,
      oauthClientId,
      oauthClientSecret,
      oauthRefreshToken,
    },
    collectionFilter: options.collectionOverride,
    dryRun: options.dryRun,
  };
}
