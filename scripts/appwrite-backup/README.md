# Appwrite Cloud Backup Tool

Automated backup script for an Appwrite Database that:

1. Exports all documents from collections to NDJSON
2. Zips the backup folder
3. Uploads the ZIP to Google Drive (My Drive) via service account
4. Applies retention (keep latest `N` backups)

## Folder Structure

Output format:

```text
backups/
  YYYY-MM-DD_HH-mm-ss/
    manifest.json
    collections/
      <collectionId>.ndjson
    logs.txt
    backup.zip
```

## Setup

1. Install dependencies:

```bash
cd scripts/appwrite-backup
npm install
```

2. Create `.env` in `scripts/appwrite-backup/` (or use repo root `.env`) from `.env.example`:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=

OUTPUT_DIR=backups
PAGE_LIMIT=100
MAX_RETRIES=5
RETRY_BASE_DELAY_MS=500

GDRIVE_PARENT_FOLDER_ID=
GDRIVE_BACKUPS_ROOT_NAME=AppwriteBackups
GDRIVE_RETENTION_COUNT=14
GDRIVE_AUTH_MODE=service_account

GOOGLE_SERVICE_ACCOUNT_JSON_PATH=./service-account.json
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=

GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
```

## Appwrite API Key (Least Privilege)

Create an Appwrite API key with minimum scopes needed to read data:

1. In Appwrite Console, create API key for the target project.
2. Grant database read scopes for:
   - listing collections
   - listing documents
3. Put it in `APPWRITE_API_KEY`.

Use a dedicated key for backup automation.

## Google Drive (My Drive) Setup

Service accounts do not automatically see your My Drive. You must share a folder with the service account.

1. In My Drive, create a folder (example: `Cofellow Backups`).
2. Share that folder with the service account email as **Editor**.
3. Copy that folder ID into `GDRIVE_PARENT_FOLDER_ID`.
4. Enable Google Drive API in the service account's Google Cloud project.
5. Choose auth mode with `GDRIVE_AUTH_MODE`:
   - `service_account` (default):
     - `GOOGLE_SERVICE_ACCOUNT_JSON_PATH=./service-account.json`, or
     - `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=<base64-json>`
   - `oauth_user` (recommended for My Drive):
     - `GOOGLE_OAUTH_CLIENT_ID`
     - `GOOGLE_OAUTH_CLIENT_SECRET`
     - `GOOGLE_OAUTH_REFRESH_TOKEN`

Important limitation:

- Some Google setups return `Service Accounts do not have storage quota` when uploading to My Drive with service-account auth only.
- The script records this clearly in `manifest.json` (`driveUpload.errorType=service_account_my_drive_quota`) and marks run as `partial_success` if local backup succeeded.
- In this scenario, retention is skipped because there is no uploaded file target.

Practical alternatives:

1. Use a Shared Drive as the destination and grant the service account access there.
2. Use OAuth user credentials (offline refresh token) to upload into a real user My Drive (`GDRIVE_AUTH_MODE=oauth_user`).
3. Keep `--no-drive` and sync `backup.zip` using another trusted uploader process.

### OAuth User Setup (Option 2 for My Drive)

1. In Google Cloud Console, create OAuth 2.0 Client ID credentials (Desktop app is simplest).
2. Enable Google Drive API in the same project.
3. Generate a refresh token for scope `https://www.googleapis.com/auth/drive`.
4. Set:
   - `GDRIVE_AUTH_MODE=oauth_user`
   - `GOOGLE_OAUTH_CLIENT_ID=...`
   - `GOOGLE_OAUTH_CLIENT_SECRET=...`
   - `GOOGLE_OAUTH_REFRESH_TOKEN=...`
5. Keep `GDRIVE_PARENT_FOLDER_ID` pointing to your My Drive folder ID.

Drive upload path created by the script:

```text
<GDRIVE_PARENT_FOLDER_ID>/
  AppwriteBackups/
    YYYY-MM-DD/
      appwrite_backup_<projectId>_<databaseId>_<YYYY-MM-DD_HH-mm-ss>.zip
```

## Run

From `scripts/appwrite-backup`:

```bash
npm run backup -- --no-drive
```

From repo root:

```bash
npm --prefix scripts/appwrite-backup run backup -- --no-drive
```

### CLI Flags

- `--db=<id>`: override database id
- `--out=<dir>`: override output directory
- `--limit=<n>`: override page size
- `--collection=<id>`: back up one collection
- `--dry-run`: validate credentials and list collections; writes nothing
- `--no-drive`: skip Google Drive upload
- `--retention=<n>`: override retention count

### Exit Codes

- `0`: `success` or `partial_success`
- non-zero: `failed`

## Retry and Pagination

- Uses cursor pagination and incremental NDJSON writes (no full-collection memory load).
- Retries transient errors (`429`, `5xx`, timeout-like failures) with exponential backoff + jitter.

## Retention Behavior

- Scope: recursive across all subfolders under `AppwriteBackups/`.
- Lists files with `name contains 'appwrite_backup_'`.
- Sorts by `createdTime` descending.
- Deletes older files beyond `GDRIVE_RETENTION_COUNT`.
- Logs deleted files in `logs.txt` and records them in `manifest.json`.
- Retention only runs after a successful upload in the current run.

## Manifest

`manifest.json` includes:

- `startedAt`, `finishedAt`, `durationMs`
- appwrite metadata (`endpoint`, `projectId`, `databaseId`)
- paging/retry settings
- per-collection results (`totalFetched`, `pages`, `status`, `errors`)
- drive upload metadata (folder ids, file id/name, uploaded time, size, optional `webViewLink`)
- retention result
- overall status (`success | partial_success | failed`)

## Scheduling with Cron (Linux/macOS)

Run daily at 2:30 AM:

```cron
30 2 * * * cd /path/to/repo/scripts/appwrite-backup && /usr/bin/npm run backup >> /path/to/repo/scripts/appwrite-backup/cron.log 2>&1
```

## Restore Guidance

Restore by reading each `.ndjson` line-by-line and calling Appwrite `createDocument` per line.

Notes:

- Preserve original IDs only if your restore strategy requires it.
- Permissions/ACL fields may need custom handling; review document schema and permission model before restore.
- Validate in a staging project first.
