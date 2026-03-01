import type { drive_v3 } from "googleapis";
import type { Logger } from "./logger";

export interface DeletedBackupItem {
  fileId: string;
  name: string;
  createdTime?: string;
}

export interface RetentionResult {
  enabled: boolean;
  scope: "root_recursive";
  keepCount: number;
  scannedFiles: number;
  deleted: DeletedBackupItem[];
  errors: string[];
}

interface BackupFile {
  id: string;
  name: string;
  createdTime?: string;
}

function createdMs(createdTime?: string): number {
  if (!createdTime) return 0;
  const ms = Date.parse(createdTime);
  return Number.isFinite(ms) ? ms : 0;
}

async function listFolders(
  drive: drive_v3.Drive,
  parentId: string,
): Promise<Array<{ id: string; name: string }>> {
  const out: Array<{ id: string; name: string }> = [];
  let pageToken: string | undefined;
  const q = [
    `mimeType='application/vnd.google-apps.folder'`,
    `trashed=false`,
    `'${parentId}' in parents`,
  ].join(" and ");

  do {
    const response = await drive.files.list({
      q,
      pageToken,
      pageSize: 1000,
      fields: "nextPageToken,files(id,name)",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false,
    });
    const items = response.data.files ?? [];
    for (const item of items) {
      if (item.id) {
        out.push({ id: item.id, name: item.name ?? item.id });
      }
    }
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return out;
}

async function listBackupFilesInFolder(
  drive: drive_v3.Drive,
  folderId: string,
): Promise<BackupFile[]> {
  const out: BackupFile[] = [];
  let pageToken: string | undefined;
  const q = [
    `trashed=false`,
    `'${folderId}' in parents`,
    `name contains 'appwrite_backup_'`,
    `mimeType!='application/vnd.google-apps.folder'`,
  ].join(" and ");

  do {
    const response = await drive.files.list({
      q,
      pageToken,
      pageSize: 1000,
      fields: "nextPageToken,files(id,name,createdTime)",
      includeItemsFromAllDrives: false,
      supportsAllDrives: false,
    });
    const items = response.data.files ?? [];
    for (const item of items) {
      if (item.id && item.name) {
        out.push({ id: item.id, name: item.name, createdTime: item.createdTime ?? undefined });
      }
    }
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return out;
}

export async function enforceDriveRetention(params: {
  drive: drive_v3.Drive;
  appwriteBackupsRootFolderId: string;
  keepCount: number;
  logger: Logger;
}): Promise<RetentionResult> {
  const { drive, appwriteBackupsRootFolderId, keepCount, logger } = params;

  if (keepCount < 1) {
    return {
      enabled: true,
      scope: "root_recursive",
      keepCount,
      scannedFiles: 0,
      deleted: [],
      errors: ["Retention skipped because keepCount < 1."],
    };
  }

  const allFolders: string[] = [appwriteBackupsRootFolderId];
  for (let i = 0; i < allFolders.length; i += 1) {
    const folderId = allFolders[i];
    const children = await listFolders(drive, folderId);
    for (const child of children) {
      allFolders.push(child.id);
    }
  }

  const allFiles: BackupFile[] = [];
  for (const folderId of allFolders) {
    const files = await listBackupFilesInFolder(drive, folderId);
    allFiles.push(...files);
  }

  allFiles.sort((a, b) => createdMs(b.createdTime) - createdMs(a.createdTime));

  const toDelete = allFiles.slice(keepCount);
  const deleted: DeletedBackupItem[] = [];
  const errors: string[] = [];

  for (const file of toDelete) {
    try {
      await drive.files.delete({
        fileId: file.id,
        supportsAllDrives: false,
      });
      logger.info(`Retention deleted old backup: ${file.name} (${file.id})`);
      deleted.push({ fileId: file.id, name: file.name, createdTime: file.createdTime });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn(`Retention failed deleting ${file.name} (${file.id}): ${msg}`);
      errors.push(`delete ${file.id}: ${msg}`);
    }
  }

  return {
    enabled: true,
    scope: "root_recursive",
    keepCount,
    scannedFiles: allFiles.length,
    deleted,
    errors,
  };
}

