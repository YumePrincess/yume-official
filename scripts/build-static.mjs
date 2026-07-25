import { access, copyFile, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendRoot = path.join(projectRoot, 'frontend');
const distRoot = path.join(projectRoot, 'dist');
const staticConfigRoot = path.join(projectRoot, 'scripts', 'static');
const nestedSiteNames = ['search', 'pricing'];

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
    [
      access(frontendRoot),
      access(path.join(frontendRoot, 'index.html')),
      ...nestedSiteNames.flatMap((siteName) => [
        access(path.join(frontendRoot, siteName)),
        access(path.join(frontendRoot, siteName, 'index.html')),
      ]),
    ]
  );
}

async function installStaticMetadata(siteRoot) {
  await Promise.all([
    copyFile(path.join(staticConfigRoot, '404.html'), path.join(siteRoot, '404.html')),
    copyFile(path.join(staticConfigRoot, '_headers'), path.join(siteRoot, '_headers')),
    copyFile(path.join(staticConfigRoot, 'redirects-official'), path.join(siteRoot, '_redirects')),
  ]);
}

async function buildSite() {
  const siteRoot = path.join(distRoot, 'official');

  await rm(distRoot, { recursive: true, force: true });
  await mkdir(distRoot, { recursive: true });
  await copyTree(frontendRoot, siteRoot);
  await installStaticMetadata(siteRoot);
  await Promise.all(
    nestedSiteNames.map((siteName) => {
      return copyFile(
        path.join(staticConfigRoot, '404.html'),
        path.join(siteRoot, siteName, '404.html')
      );
    })
  );
}

await assertSourceLayout();
await buildSite();
console.log('Built asset-only site in dist/official.');
