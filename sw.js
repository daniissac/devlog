const CACHE_NAME = 'devlog-v1';
const ASSETS = [
    '/devlog/',
    '/devlog/index.html',
    '/devlog/style.css',
    '/devlog/app.js',
    '/devlog/manifest.json',
    '/devlog/icons/icon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
