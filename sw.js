/* Mercuriale — service worker.
   L'application s'ouvre tout de suite, même avec un réseau faible (chambre froide, quai) ou sans réseau :
   les fichiers de l'appli sont gardés sur le téléphone, par version. Quand une nouvelle version est publiée,
   ce fichier change (numéro ci-dessous), le téléphone télécharge la nouvelle version en arrière-plan
   et l'appli propose de recharger.
   Les appels au serveur Google (script.google.com) ne passent jamais par ce cache.
   IMPORTANT : après toute modification d'un fichier de l'appli, publier aussi ce fichier avec un nouveau numéro. */
const VERSION = 'merc-1.3.0-072b06a0bc';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/demo-data.js', './js/core.js', './js/ui.js', './js/views.js', './js/main.js',
  './fonts/barlow-condensed-latin-500-normal.woff2', './fonts/barlow-condensed-latin-600-normal.woff2', './fonts/barlow-condensed-latin-700-normal.woff2',
  './fonts/barlow-latin-400-normal.woff2', './fonts/barlow-latin-500-normal.woff2', './fonts/barlow-latin-700-normal.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.svg'
];
self.addEventListener('install', e => {
  // { cache: 'reload' } : on va chercher les fichiers sur le serveur, pas dans le cache du navigateur
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('merc-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // API Google : réseau direct
  if (req.mode === 'navigate') {
    // ouverture de l'appli : la page gardée sur le téléphone, tout de suite
    e.respondWith(caches.open(VERSION).then(c => c.match('./index.html')).then(m => m || fetch(req)).catch(() => fetch(req)));
    return;
  }
  e.respondWith(caches.open(VERSION).then(c => c.match(req, { ignoreSearch: true }).then(m => m || fetch(req).then(r => {
    if (r && r.ok && r.type === 'basic') c.put(req, r.clone());
    return r;
  }))));
});
