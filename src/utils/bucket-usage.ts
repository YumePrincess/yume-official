import { Env } from './types';
import { getSetting, putSetting } from './db';

const BUCKET_USAGE_SNAPSHOT_KEY = 'system/bucket-usage-snapshot';
const BUCKET_USAGE_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

interface BucketUsageSnapshot {
  totalFiles: number;
  totalSize: number;
  computedAt: string;
  dirty?: boolean;
}

export interface BucketUsage {
  totalFiles: number;
  totalSize: number;
  computedAt: string;
}

function parseSnapshot(raw: string | null): BucketUsageSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BucketUsageSnapshot>;
    if (
      typeof parsed.totalFiles !== 'number' ||
      typeof parsed.totalSize !== 'number' ||
      typeof parsed.computedAt !== 'string'
    ) {
      return null;
    }
    return {
      totalFiles: parsed.totalFiles,
      totalSize: parsed.totalSize,
      computedAt: parsed.computedAt,
      dirty: !!parsed.dirty,
    };
  } catch {
    return null;
  }
}

async function readSnapshot(env: Env): Promise<BucketUsageSnapshot | null> {
  return parseSnapshot(await getSetting(env, BUCKET_USAGE_SNAPSHOT_KEY));
}

async function writeSnapshot(env: Env, snapshot: BucketUsageSnapshot): Promise<void> {
  await putSetting(env, BUCKET_USAGE_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function isSnapshotFresh(snapshot: BucketUsageSnapshot): boolean {
  if (snapshot.dirty) return false;
  const computedAtMs = Date.parse(snapshot.computedAt);
  if (!Number.isFinite(computedAtMs)) return false;
  return Date.now() - computedAtMs < BUCKET_USAGE_REFRESH_INTERVAL_MS;
}

async function scanBucketUsage(env: Env): Promise<BucketUsage> {
  let totalFiles = 0;
  let totalSize = 0;
  let cursor: string | undefined;

  for (;;) {
    const result = await env.VAULT_BUCKET.list({
      cursor,
      limit: 1000,
    });

    for (const object of result.objects) {
      if (!object.key || object.key.endsWith('/')) continue;
      totalFiles += 1;
      totalSize += object.size;
    }

    if (!result.truncated || !result.cursor) break;
    cursor = result.cursor;
  }

  return {
    totalFiles,
    totalSize,
    computedAt: new Date().toISOString(),
  };
}

async function refreshBucketUsageSnapshot(env: Env): Promise<BucketUsage> {
  const usage = await scanBucketUsage(env);
  await writeSnapshot(env, usage);
  return usage;
}

export async function markBucketUsageDirty(env: Env): Promise<void> {
  const existing = await readSnapshot(env);
  if (!existing) return;
  if (existing.dirty) return;
  await writeSnapshot(env, {
    ...existing,
    dirty: true,
  });
}

export async function getBucketUsage(env: Env, ctx?: ExecutionContext): Promise<BucketUsage> {
  const cached = await readSnapshot(env);

  if (!cached) {
    return refreshBucketUsageSnapshot(env);
  }

  if (cached.dirty) {
    return refreshBucketUsageSnapshot(env);
  }

  if (!isSnapshotFresh(cached)) {
    if (ctx) {
      ctx.waitUntil(refreshBucketUsageSnapshot(env));
      return {
        totalFiles: cached.totalFiles,
        totalSize: cached.totalSize,
        computedAt: cached.computedAt,
      };
    }
    return refreshBucketUsageSnapshot(env);
  }

  return {
    totalFiles: cached.totalFiles,
    totalSize: cached.totalSize,
    computedAt: cached.computedAt,
  };
}
