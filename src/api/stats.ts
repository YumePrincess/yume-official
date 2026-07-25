import { Env } from '../utils/types';
import { json } from '../utils/response';
import { getAllFiles } from '../utils/db';
import { getBucketUsage } from '../utils/bucket-usage';

export async function getStats(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
  const files = await getAllFiles(env);
  const usage = await getBucketUsage(env, ctx);

  let totalDownloads = 0;
  for (const f of files) {
    totalDownloads += f.downloads;
  }

  const recentUploads = [...files]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5);

  const topDownloaded = [...files]
    .filter(f => f.downloads > 0)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);

  return json({
    totalFiles: usage.totalFiles,
    totalSize: usage.totalSize,
    totalDownloads,
    recentUploads,
    topDownloaded,
  });
}
