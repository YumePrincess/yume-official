import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function exists(relativePath) {
  try {
    await readFile(path.join(projectRoot, relativePath));
    return true;
  } catch (error) {
    if (error?.code === 'EISDIR') return true;
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function listFiles(rootPath, currentPath = '') {
  const absolutePath = path.join(rootPath, currentPath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;
    const relativePath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(rootPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}

async function hashFile(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

async function readConfig(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));
}

test('frontend source contains exactly the three maintained sites and payment entries', async () => {
  const entries = await readdir(path.join(projectRoot, 'frontend'), { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.name !== '.DS_Store')
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(names, ['official', 'pricing', 'search']);
  assert.equal(await exists('frontend/official/paddle/index.html'), true);
  assert.equal(await exists('frontend/official/paddle/test/index.html'), true);
});

test('official output exposes search and pricing without nesting official twice', async () => {
  const requiredFiles = [
    'dist/official/index.html',
    'dist/official/search/index.html',
    'dist/official/pricing/index.html',
    'dist/search/index.html',
    'dist/pricing/index.html',
  ];

  for (const relativePath of requiredFiles) {
    assert.equal(await exists(relativePath), true, `${relativePath} should exist`);
  }

  assert.equal(await exists('dist/official/official/index.html'), false);
});

test('official path aliases are byte-identical copies of their source sites', async () => {
  for (const siteName of ['search', 'pricing']) {
    const sourceRoot = path.join(projectRoot, 'frontend', siteName);
    const aliasRoot = path.join(projectRoot, 'dist', 'official', siteName);
    const sourceFiles = await listFiles(sourceRoot);
    const aliasFiles = (await listFiles(aliasRoot)).filter((file) => file !== '404.html');

    assert.deepEqual(aliasFiles, sourceFiles);

    for (const relativePath of sourceFiles) {
      assert.equal(
        await hashFile(path.join(aliasRoot, relativePath)),
        await hashFile(path.join(sourceRoot, relativePath)),
        `${siteName}/${relativePath} should not be rewritten during the build`
      );
    }
  }
});

test('every public site path has the self-contained Yume 404 page', async () => {
  const errorPages = [
    'dist/official/404.html',
    'dist/official/search/404.html',
    'dist/official/pricing/404.html',
    'dist/search/404.html',
    'dist/pricing/404.html',
  ];

  const expectedHash = await hashFile(path.join(projectRoot, 'scripts/static/404.html'));

  for (const relativePath of errorPages) {
    assert.equal(await hashFile(path.join(projectRoot, relativePath)), expectedHash);
    const html = await readFile(path.join(projectRoot, relativePath), 'utf8');
    assert.match(html, /data-yume-error-page/);
    assert.match(html, /yume-preference-language/);
    assert.match(html, /yume-preference-theme/);
  }
});

test('three static configs are asset-only and the API config has no assets', async () => {
  const staticConfigs = [
    ['wrangler.jsonc', './dist/official', 'official'],
    ['wrangler.search.jsonc', './dist/search', 'search'],
    ['wrangler.pricing.jsonc', './dist/pricing', 'pricing'],
  ];

  for (const [configPath, directory, siteName] of staticConfigs) {
    const config = await readConfig(configPath);
    assert.equal('main' in config, false, `${configPath} must not have main`);
    assert.equal(config.build.command, `node ./scripts/build-static.mjs --site ${siteName}`);
    assert.equal(config.assets.directory, directory);
    assert.equal(config.assets.not_found_handling, '404-page');
    assert.equal(config.assets.html_handling, 'auto-trailing-slash');
    assert.equal('binding' in config.assets, false);
    assert.equal('run_worker_first' in config.assets, false);
    assert.equal(config.workers_dev, false);
  }

  const apiConfig = await readConfig('wrangler.api.jsonc');
  assert.equal(apiConfig.main, 'backend/worker.js');
  assert.equal('assets' in apiConfig, false);
  assert.deepEqual(
    apiConfig.routes.map((route) => route.pattern),
    [
      'yume.zone/api/*',
      'www.yume.zone/api/*',
      'search.yume.zone/api/*',
      'pricing.yume.zone/api/*',
    ]
  );
});

test('the shared language and theme preference module stays identical', async () => {
  const hashes = await Promise.all(
    ['official', 'search', 'pricing'].map((siteName) => {
      return hashFile(path.join(projectRoot, 'frontend', siteName, 'js', 'preferences.js'));
    })
  );

  assert.equal(new Set(hashes).size, 1);
});

test('backend contains API code only', async () => {
  const source = await readFile(path.join(projectRoot, 'backend/worker.js'), 'utf8');
  assert.doesNotMatch(source, /env\.ASSETS|handleSiteRequest|serveSiteAsset|SITE_BY_HOSTNAME/);
});
