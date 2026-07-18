import { access, copyFile, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendRoot = path.join(projectRoot, 'frontend');
const distRoot = path.join(projectRoot, 'dist');
const staticConfigRoot = path.join(projectRoot, 'scripts', 'static');
const siteNames = ['official', 'search', 'pricing'];
const siteArgumentIndex = process.argv.indexOf('--site');
const requestedSite = siteArgumentIndex >= 0 ? process.argv[siteArgumentIndex + 1] : '';

if (requestedSite && !siteNames.includes(requestedSite)) {
  throw new Error(`Unknown static site: ${requestedSite}`);
}

function shouldCopy(sourcePath) {
  return path.basename(sourcePath) !== '.DS_Store';
}

async function copyTree(source, destination) {
  await cp(source, destination, {
    recursive: true,
    force: true,
    filter: shouldCopy,
  });
}

async function assertSourceLayout() {
  await Promise.all(
    siteNames.flatMap((siteName) => [
      access(path.join(frontendRoot, siteName)),
      access(path.join(frontendRoot, siteName, 'index.html')),
    ])
  );
}

async function installStaticMetadata(siteName) {
  const siteRoot = path.join(distRoot, siteName);
  const redirectsSource = siteName === 'official'
    ? 'redirects-official'
    : 'redirects-site';

  await Promise.all([
    copyFile(path.join(staticConfigRoot, '404.html'), path.join(siteRoot, '404.html')),
    copyFile(path.join(staticConfigRoot, '_headers'), path.join(siteRoot, '_headers')),
    copyFile(path.join(staticConfigRoot, redirectsSource), path.join(siteRoot, '_redirects')),
  ]);
}

async function buildSite(siteName) {
  const siteRoot = path.join(distRoot, siteName);

  await rm(siteRoot, { recursive: true, force: true });
  await mkdir(distRoot, { recursive: true });
  await copyTree(path.join(frontendRoot, siteName), siteRoot);

  if (siteName === 'official') {
    await Promise.all([
      copyTree(
        path.join(frontendRoot, 'search'),
        path.join(siteRoot, 'search')
      ),
      copyTree(
        path.join(frontendRoot, 'pricing'),
        path.join(siteRoot, 'pricing')
      ),
    ]);
  }

  await installStaticMetadata(siteName);

  if (siteName === 'official') {
    await Promise.all([
      copyFile(
        path.join(staticConfigRoot, '404.html'),
        path.join(siteRoot, 'search', '404.html')
      ),
      copyFile(
        path.join(staticConfigRoot, '404.html'),
        path.join(siteRoot, 'pricing', '404.html')
      ),
    ]);
  }
}

await assertSourceLayout();

if (requestedSite) {
  await buildSite(requestedSite);
} else {
  await rm(distRoot, { recursive: true, force: true });
  await Promise.all(siteNames.map(buildSite));
}

console.log(requestedSite
  ? `Built asset-only site in dist/${requestedSite}.`
  : 'Built asset-only sites in dist/official, dist/search, and dist/pricing.');
