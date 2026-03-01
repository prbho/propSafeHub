import fs from "node:fs";
import path from "node:path";
import {
  buildDatabasesClient,
  listAllCollections,
  streamCollectionDocuments,
} from "./appwrite";
import type { BackupConfig } from "./config";
import { createDriveContext, uploadBackupZip } from "./drive";
import { createLogger } from "./logger";
import { createNdjsonWriter } from "./ndjson";
import { enforceDriveRetention, type RetentionResult } from "./retention";
import { createBackupZip } from "./zip";

export type OverallStatus = "success" | "partial_success" | "failed";

export interface BackupRunResult {
  status: OverallStatus;
  outputDir?: string;
  manifestPath?: string;
}

interface CollectionManifestItem {
  collectionId: string;
  name?: string;
  totalFetched: number;
  pages: number;
  status: "success" | "failed";
  errors: string[];
}

interface Manifest {
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  appwrite: {
    endpoint: string;
    projectId: string;
    databaseId: string;
  };
  pageLimit: number;
  retrySettings: {
    maxRetries: number;
    retryBaseDelayMs: number;
  };
  collections: CollectionManifestItem[];
  driveUpload: {
    enabled: boolean;
    folderPath?: string;
    parentFolderId?: string;
    rootFolderId?: string;
    dateFolderId?: string;
    fileId?: string;
    fileName?: string;
    uploadedAt?: string;
    sizeBytes?: number;
    webViewLink?: string;
    error?: string;
    errorType?: "service_account_my_drive_quota" | "other";
    nonAppwriteFailure?: boolean;
    suggestedAction?: string;
  };
  retention?: RetentionResult;
  retentionSkippedReason?: string;
  overallStatus: OverallStatus;
  notes?: string[];
}

function formatDatePart(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTimestampForPath(date: Date): string {
  const datePart = formatDatePart(date);
  const hh = `${date.getHours()}`.padStart(2, "0");
  const mm = `${date.getMinutes()}`.padStart(2, "0");
  const ss = `${date.getSeconds()}`.padStart(2, "0");
  return `${datePart}_${hh}-${mm}-${ss}`;
}

async function writeManifest(manifestPath: string, manifest: Manifest): Promise<void> {
  await fs.promises.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function computeStatus(items: CollectionManifestItem[], driveFailed: boolean): OverallStatus {
  const successCount = items.filter((x) => x.status === "success").length;
  const failedCount = items.filter((x) => x.status === "failed").length;

  if (successCount === 0) {
    return "failed";
  }
  if (failedCount > 0 || driveFailed) {
    return "partial_success";
  }
  return "success";
}

function classifyDriveError(message: string): {
  errorType: "service_account_my_drive_quota" | "other";
  suggestedAction?: string;
} {
  const normalized = message.toLowerCase();
  if (normalized.includes("service accounts do not have storage quota")) {
    return {
      errorType: "service_account_my_drive_quota",
      suggestedAction:
        "Use a Shared Drive target or OAuth user credentials for My Drive uploads.",
    };
  }
  return { errorType: "other" };
}

export async function runBackup(config: BackupConfig): Promise<BackupRunResult> {
  const started = new Date();
  const startedAt = started.toISOString();
  const timestamp = formatTimestampForPath(started);
  const dateFolderName = formatDatePart(started);
  const runDir = path.join(config.outputDir, timestamp);
  const collectionsDir = path.join(runDir, "collections");
  const manifestPath = path.join(runDir, "manifest.json");
  const logPath = path.join(runDir, "logs.txt");
  const zipPath = path.join(runDir, "backup.zip");

  if (config.dryRun) {
    const logger = createLogger();
    try {
      const databases = buildDatabasesClient(config);
      const collections = await listAllCollections(databases, config, logger);
      const filtered = config.collectionFilter
        ? collections.filter((c) => c.$id === config.collectionFilter)
        : collections;

      if (filtered.length === 0) {
        logger.warn("Dry-run: no matching collections found.");
      } else {
        logger.info(`Dry-run: ${filtered.length} collection(s) available for backup.`);
        for (const col of filtered) {
          logger.info(`Dry-run collection: ${col.$id}${col.name ? ` (${col.name})` : ""}`);
        }
      }

      if (config.drive.enabled) {
        await createDriveContext(config);
        logger.info("Dry-run: Google Drive credentials validated.");
      } else {
        logger.info("Dry-run: Google Drive skipped (--no-drive).");
      }

      logger.info("Dry-run complete. No files were written.");
      return { status: "success" };
    } finally {
      await logger.close();
    }
  }

  await fs.promises.mkdir(collectionsDir, { recursive: true });
  const logger = createLogger(logPath);
  const notes: string[] = [];

  const manifest: Manifest = {
    startedAt,
    appwrite: {
      endpoint: config.appwriteEndpoint,
      projectId: config.appwriteProjectId,
      databaseId: config.appwriteDatabaseId,
    },
    pageLimit: config.pageLimit,
    retrySettings: {
      maxRetries: config.maxRetries,
      retryBaseDelayMs: config.retryBaseDelayMs,
    },
    collections: [],
    driveUpload: {
      enabled: config.drive.enabled,
      parentFolderId: config.drive.enabled ? config.drive.parentFolderId : undefined,
    },
    overallStatus: "failed",
  };

  let driveFailed = false;

  try {
    const databases = buildDatabasesClient(config);
    const allCollections = await listAllCollections(databases, config, logger);
    const targetCollections = config.collectionFilter
      ? allCollections.filter((c) => c.$id === config.collectionFilter)
      : allCollections;

    if (targetCollections.length === 0) {
      if (config.collectionFilter) {
        throw new Error(`Collection not found: ${config.collectionFilter}`);
      }
      throw new Error("No collections found in database.");
    }

    logger.info(`Found ${targetCollections.length} collection(s) to back up.`);

    for (const collection of targetCollections) {
      const item: CollectionManifestItem = {
        collectionId: collection.$id,
        name: collection.name,
        totalFetched: 0,
        pages: 0,
        status: "success",
        errors: [],
      };
      manifest.collections.push(item);

      const ndjsonPath = path.join(collectionsDir, `${collection.$id}.ndjson`);
      const writer = createNdjsonWriter(ndjsonPath);
      logger.info(`Backing up collection ${collection.$id} -> ${ndjsonPath}`);

      try {
        for await (const page of streamCollectionDocuments(
          databases,
          config,
          logger,
          collection.$id,
        )) {
          item.pages = page.page;
          for (const doc of page.documents) {
            await writer.write(doc);
            item.totalFetched += 1;
          }
          logger.info(
            `Collection ${collection.$id}: page ${page.page}, fetched so far ${item.totalFetched}/${page.total}`,
          );
        }
        logger.info(`Collection ${collection.$id} finished with ${item.totalFetched} documents.`);
      } catch (error) {
        item.status = "failed";
        const msg = error instanceof Error ? error.message : String(error);
        item.errors.push(msg);
        logger.error(`Collection ${collection.$id} failed: ${msg}`);
      } finally {
        await writer.close();
      }
    }

    manifest.overallStatus = computeStatus(manifest.collections, false);
    await writeManifest(manifestPath, manifest);

    const zipBytes = await createBackupZip(runDir, zipPath);
    logger.info(`ZIP created at ${zipPath} (${zipBytes} bytes).`);

    if (config.drive.enabled) {
      const fileName = `appwrite_backup_${config.appwriteProjectId}_${config.appwriteDatabaseId}_${timestamp}.zip`;
      try {
        const upload = await uploadBackupZip({
          config,
          logger,
          zipPath,
          fileName,
          dateFolderName,
        });
        manifest.driveUpload = {
          enabled: true,
          folderPath: upload.folderPath,
          parentFolderId: upload.parentFolderId,
          rootFolderId: upload.rootFolderId,
          dateFolderId: upload.dateFolderId,
          fileId: upload.fileId,
          fileName: upload.fileName,
          uploadedAt: upload.uploadedAt,
          sizeBytes: upload.sizeBytes,
          webViewLink: upload.webViewLink,
        };

        if (upload.rootFolderId) {
          const driveCtx = await createDriveContext(config);
          manifest.retention = await enforceDriveRetention({
            drive: driveCtx.drive,
            appwriteBackupsRootFolderId: upload.rootFolderId,
            keepCount: config.drive.retentionCount,
            logger,
          });
          logger.info(
            `Retention processed ${manifest.retention.scannedFiles} file(s); deleted ${manifest.retention.deleted.length}.`,
          );
        } else {
          const reason =
            "Retention skipped because AppwriteBackups root folder ID was not available.";
          manifest.retentionSkippedReason = reason;
          notes.push(reason);
        }
      } catch (error) {
        driveFailed = true;
        const msg = error instanceof Error ? error.message : String(error);
        const classified = classifyDriveError(msg);
        manifest.driveUpload = {
          enabled: true,
          parentFolderId: config.drive.parentFolderId,
          error: msg,
          errorType: classified.errorType,
          nonAppwriteFailure: true,
          suggestedAction: classified.suggestedAction,
        };
        manifest.retentionSkippedReason = "Retention skipped because Drive upload failed.";
        notes.push(`Drive upload failed: ${msg}`);
        logger.error(`Drive upload failed: ${msg}`);
      }
    } else {
      manifest.driveUpload = { enabled: false };
      notes.push("Drive upload disabled with --no-drive.");
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Backup failed before completion: ${msg}`);
    notes.push(msg);
  } finally {
    manifest.finishedAt = new Date().toISOString();
    manifest.durationMs = Date.parse(manifest.finishedAt) - Date.parse(startedAt);
    manifest.overallStatus = computeStatus(manifest.collections, driveFailed);
    if (notes.length > 0) {
      manifest.notes = notes;
    }

    await writeManifest(manifestPath, manifest);
    await logger.close();
  }

  return {
    status: manifest.overallStatus,
    outputDir: runDir,
    manifestPath,
  };
}
