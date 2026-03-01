# Appwrite Backup Agent Instructions

## Goals

- Produce a reliable backup script that can run on a schedule.
- Prefer correctness, pagination safety, and incremental writes over speed.

## Non-negotiables

- Never load entire collections into memory.
- Always paginate until completion.
- Include retries with exponential backoff.
- Write a manifest.json with counts and errors.
- Provide a dry-run mode.

## Output format

- Use NDJSON per collection if size might be large.
- Include a zip of the backup folder.

## Code quality

- Keep code modular: config, appwrite client, collection backup, manifest, zip, cli.
- Add clear logs.
