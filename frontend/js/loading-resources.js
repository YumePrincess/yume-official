(function (global) {
    'use strict';

    function waitForImage(image) {
        if (!image || !image.getAttribute('src')) return Promise.resolve();
        return new Promise(function (resolve) {
            function settle() {
                image.removeEventListener('load', settle);
                image.removeEventListener('error', settle);
                resolve();
            }
            image.addEventListener('load', settle, { once: true });
            image.addEventListener('error', settle, { once: true });
            if (image.complete) settle();
        }).then(function () {
            if (image.naturalWidth > 0 && typeof image.decode === 'function') {
                return image.decode().catch(function () {});
            }
            // Failed images use the page's existing error/fallback presentation.
        });
    }

    function waitForWindowLoad() {
        if (document.readyState === 'complete') return Promise.resolve();
        return new Promise(function (resolve) {
            global.addEventListener('load', resolve, { once: true });
        });
    }

    async function waitForPageResources() {
        await waitForWindowLoad();
        await Promise.all(Array.from(document.images)
            .filter(function (image) { return image.loading !== 'lazy'; })
            .map(waitForImage));
        if (document.fonts) await document.fonts.ready;
    }

    global.YumeLoadingResources = Object.freeze({
        waitForImage: waitForImage,
        waitForPageResources: waitForPageResources
    });
})(window);
