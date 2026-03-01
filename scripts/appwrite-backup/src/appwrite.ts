import { Client, Databases, Query } from "node-appwrite";
import type { Models } from "node-appwrite";
import type { BackupConfig } from "./config";
import type { Logger } from "./logger";

export interface RetrySettings {
  maxRetries: number;
  baseDelayMs: number;
}

export interface CollectionResult {
  $id: string;
  name?: string;
}

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || !error) return undefined;
  const maybeCode = (error as { code?: unknown }).code;
  return typeof maybeCode === "number" ? maybeCode : undefined;
}

function isRetryableError(error: unknown): boolean {
  const code = getStatusCode(error);
  if (code === 429) return true;
  if (typeof code === "number" && code >= 500) return true;

  const asAny = error as { message?: string; cause?: { code?: string } };
  const msg = (asAny.message || "").toLowerCase();
  const transient = ["timeout", "timed out", "econnreset", "enotfound", "eai_again"];
  return transient.some((x) => msg.includes(x)) || Boolean(asAny.cause?.code);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  taskName: string,
  logger: Logger,
  settings: RetrySettings,
  fn: () => Promise<T>,
): Promise<T> {
  let attempt = 0;
  // Attempts = initial + maxRetries.
  const maxAttempts = settings.maxRetries + 1;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      const retryable = isRetryableError(error);
      const code = getStatusCode(error);
      const msg = error instanceof Error ? error.message : String(error);

      if (!retryable || attempt >= maxAttempts) {
        throw error;
      }

      const exp = settings.baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * settings.baseDelayMs);
      const delayMs = exp + jitter;
      logger.warn(
        `${taskName} failed (attempt ${attempt}/${maxAttempts}, code=${code ?? "n/a"}). Retrying in ${delayMs}ms. Error: ${msg}`,
      );
      await wait(delayMs);
    }
  }

  throw new Error(`Retry loop ended unexpectedly for task: ${taskName}`);
}

export function buildDatabasesClient(config: BackupConfig): Databases {
  const client = new Client()
    .setEndpoint(config.appwriteEndpoint)
    .setProject(config.appwriteProjectId)
    .setKey(config.appwriteApiKey);

  return new Databases(client);
}

export async function listAllCollections(
  databases: Databases,
  config: BackupConfig,
  logger: Logger,
): Promise<CollectionResult[]> {
  const limit = 100;
  let offset = 0;
  const out: CollectionResult[] = [];

  while (true) {
    const response = await withRetry(
      `listCollections(offset=${offset})`,
      logger,
      { maxRetries: config.maxRetries, baseDelayMs: config.retryBaseDelayMs },
      () =>
        databases.listCollections(config.appwriteDatabaseId, [
          Query.limit(limit),
          Query.offset(offset),
        ]),
    );

    const batch = response.collections.map((c) => ({ $id: c.$id, name: c.name }));
    out.push(...batch);
    if (response.collections.length < limit) break;
    offset += limit;
  }

  return out;
}

export interface DocumentPage {
  page: number;
  total: number;
  documents: Models.Document[];
}

export async function* streamCollectionDocuments(
  databases: Databases,
  config: BackupConfig,
  logger: Logger,
  collectionId: string,
): AsyncGenerator<DocumentPage, void, void> {
  let cursorAfter: string | undefined;
  let page = 0;

  while (true) {
    const queries = [Query.limit(config.pageLimit), Query.orderAsc("$id")];
    if (cursorAfter) {
      queries.push(Query.cursorAfter(cursorAfter));
    }

    const response = await withRetry(
      `listDocuments(collection=${collectionId}, page=${page + 1})`,
      logger,
      { maxRetries: config.maxRetries, baseDelayMs: config.retryBaseDelayMs },
      () =>
        databases.listDocuments(config.appwriteDatabaseId, collectionId, queries),
    );

    const docs = response.documents;
    if (docs.length === 0) {
      break;
    }

    page += 1;
    yield { page, total: response.total, documents: docs };

    const last = docs[docs.length - 1];
    if (!last?.$id) {
      throw new Error(
        `Collection ${collectionId} returned a document without $id; cannot continue cursor pagination safely.`,
      );
    }
    cursorAfter = last.$id;

    if (docs.length < config.pageLimit) {
      break;
    }
  }
}

