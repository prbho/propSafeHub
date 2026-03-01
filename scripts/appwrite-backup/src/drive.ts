import fs from "node:fs";
import path from "node:path";
import { google, drive_v3 } from "googleapis";
import type { BackupConfig } from "./config";
import type { Logger } from "./logger";

export interface DriveContext {
  drive: drive_v3.Drive;
}

export interface DriveUploadResult {
  enabled: boolean;
  folderPath: string;
  parentFolderId: string;
  rootFolderId?: string;
  dateFolderId?: string;
  fileId?: string;
  fileName?: string;
  uploadedAt?: string;
  sizeBytes?: number;
  webViewLink?: string;
  error?: string;
}

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

function parseServiceAccount(config: BackupConfig): ServiceAccountKey {
  if (config.drive.serviceAccountJsonBase64) {
    const json = Buffer.from(config.drive.serviceAccountJsonBase64, "base64").toString("utf8");
    return JSON.parse(json) as ServiceAccountKey;
  }
  const p = config.drive.serviceAccountJsonPath;
  if (!p) {
    throw new Error("Service account path is not configured");
  }
  const raw = fs.readFileSync(path.resolve(p), "utf8");
  return JSON.parse(raw) as ServiceAccountKey;
}

function escapeQueryLiteral(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function createDriveContext(config: BackupConfig): Promise<DriveContext> {
  if (config.drive.authMode === "oauth_user") {
    const oauthClient = new google.auth.OAuth2(
      config.drive.oauthClientId,
      config.drive.oauthClientSecret,
    );
    oauthClient.setCredentials({
      refresh_token: config.drive.oauthRefreshToken,
    });
    await oauthClient.getAccessToken();
    const drive = google.drive({ version: "v3", auth: oauthClient });
    return { drive };
  }

  const key = parseServiceAccount(config);
  const jwt = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  await jwt.authorize();
  const drive = google.drive({ version: "v3", auth: jwt });
  return { drive };
}

async function findFolderByName(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string,
): Promise<drive_v3.Schema$File | null> {
  const q = [
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `'${escapeQueryLiteral(parentId)}' in parents`,
    `name='${escapeQueryLiteral(folderName)}'`,
  ].join(" and ");

  const result = await drive.files.list({
    q,
    fields: "files(id,name,createdTime)",
    pageSize: 10,
    includeItemsFromAllDrives: false,
    supportsAllDrives: false,
  });

  return result.data.files?.[0] ?? null;
}

async function createFolder(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string,
): Promise<drive_v3.Schema$File> {
  const result = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id,name,createdTime",
    supportsAllDrives: false,
  });
  if (!result.data.id) {
    throw new Error(`Failed to create folder "${folderName}" under parent ${parentId}`);
  }
  return result.data;
}

export async function findOrCreateFolder(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string,
): Promise<drive_v3.Schema$File> {
  const existing = await findFolderByName(drive, parentId, folderName);
  if (existing) return existing;
  return createFolder(drive, parentId, folderName);
}

export async function uploadBackupZip(params: {
  config: BackupConfig;
  logger: Logger;
  zipPath: string;
  fileName: string;
  dateFolderName: string;
}): Promise<DriveUploadResult> {
  const { config, logger, zipPath, fileName, dateFolderName } = params;

  if (!config.drive.enabled) {
    return {
      enabled: false,
      folderPath: "",
      parentFolderId: "",
    };
  }

  const { drive } = await createDriveContext(config);
  logger.info("Google Drive auth validated.");

  const rootFolder = await findOrCreateFolder(
    drive,
    config.drive.parentFolderId,
    config.drive.backupsRootName,
  );

  if (!rootFolder.id) {
    throw new Error("Unable to resolve backups root folder ID.");
  }

  const dateFolder = await findOrCreateFolder(drive, rootFolder.id, dateFolderName);
  if (!dateFolder.id) {
    throw new Error("Unable to resolve date folder ID.");
  }

  logger.info(
    `Uploading ZIP to Google Drive folder path: ${config.drive.backupsRootName}/${dateFolderName}`,
  );

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [dateFolder.id],
    },
    media: {
      mimeType: "application/zip",
      body: fs.createReadStream(zipPath),
    },
    fields: "id,name,size,createdTime,webViewLink",
    supportsAllDrives: false,
    uploadType: "resumable",
  });

  const stat = await fs.promises.stat(zipPath);

  return {
    enabled: true,
    folderPath: `${config.drive.backupsRootName}/${dateFolderName}`,
    parentFolderId: config.drive.parentFolderId,
    rootFolderId: rootFolder.id,
    dateFolderId: dateFolder.id,
    fileId: response.data.id ?? undefined,
    fileName: response.data.name ?? fileName,
    uploadedAt: response.data.createdTime ?? new Date().toISOString(),
    sizeBytes: Number(response.data.size ?? stat.size),
    webViewLink: response.data.webViewLink ?? undefined,
  };
}
