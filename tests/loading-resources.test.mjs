import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const resourcesSource = await readFile(new URL('../frontend/js/loading-resources.js', import.meta.url), 'utf8');

test('image readiness waits for both network completion and decoding', async () => {
    const image = new EventTarget();
    image.getAttribute = () => '/slow-background.jpg';
    image.id = 'bg';
    let backgroundVisible = false;
    image.classList = { add() { backgroundVisible = true; } };
    image.complete = false;
    image.naturalWidth = 1;
    let finishDecode;
    image.decode = () => new Promise(resolve => { finishDecode = resolve; });
    const window = {};
    vm.runInNewContext(resourcesSource, { window, document: {} });
    let ready = false;
    const task = window.YumeLoadingResources.waitForImage(image).then(() => { ready = true; });
    await Promise.resolve();
    assert.equal(ready, false);
    image.dispatchEvent(new Event('load'));
    await Promise.resolve();
    assert.equal(ready, false);
    assert.equal(backgroundVisible, false);
    finishDecode();
    await task;
    assert.equal(ready, true);
    assert.equal(backgroundVisible, true);
});

test('homepage stays below 100% until every registered resource settles', async () => {
    const source = await readFile(new URL('../frontend/js/main.js', import.meta.url), 'utf8');
    const loader = source.slice(source.indexOf('const yumeLoading ='), source.indexOf('function revealPage()'));
    let displayedProgress = 0;
    let resolveTask;
    let resolvePage;
    const resource = new Promise(resolve => { resolveTask = resolve; });
    const pageResource = new Promise(resolve => { resolvePage = resolve; });
    const document = {
        getElementById: () => null,
        querySelector: () => ({ style: { setProperty() {} }, setAttribute(_, value) { displayedProgress = Number(value); } })
    };
    const window = { YumeLoadingResources: { waitForPageResources: () => pageResource } };
    vm.runInNewContext(loader, { document, window, console, safeLoadingText: (_, text) => text, setTimeout() {} });
    window.yumeLoading.track(resource, 94);
    const finish = window.yumeLoading.finish();
    assert.ok(displayedProgress < 100);
    resolveTask();
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(displayedProgress < 100);
    resolvePage();
    await finish;
    assert.equal(displayedProgress, 100);
});

test('homepage background initializes once without triggering a wallpaper click', async () => {
    const source = await readFile(new URL('../frontend/js/set.js', import.meta.url), 'utf8');
    const sources = [];
    let clickCalls = 0;
    let readyCallback;
    const selection = {
        prop() { return this; },
        attr(key, value) { if (key === 'src') sources.push(value); return this; },
        click() { clickCalls += 1; return this; },
        ready(callback) { readyCallback = callback; return this; },
        on() { return this; }
    };
    const window = { YumeLoadingResources: { waitForImage: () => Promise.resolve() } };
    vm.runInNewContext(source, {
        window,
        document: { getElementById: () => ({}) },
        $: () => selection,
        Cookies: { get: () => undefined, set() {} },
        Math
    });
    assert.equal(sources.length, 1);
    readyCallback();
    assert.equal(sources.length, 1);
    assert.equal(clickCalls, 0);
});
