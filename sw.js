/* Mercuriale — service worker.
   L'application s'ouvre tout de suite, même avec un réseau faible (chambre froide, quai) ou sans réseau :
   les fichiers de l'appli sont gardés sur le téléphone, par version. Quand une nouvelle version est publiée,
   ce fichier change (numéro ci-dessous), le téléphone télécharge la nouvelle version en arrière-plan
   et l'appli propose de recharger.
   Les appels au serveur Google (script.google.com) ne passent jamais par ce cache.
   IMPORTANT : après toute modification d'un fichier de l'appli, publier aussi ce fichier avec un nouveau numéro. */
const VERSION = 'merc-1.4.0-5837268923';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './app.css',
  './demo-data.js', './core.js', './ui.js', './views.js', './main.js',
  './barlow-condensed-latin-500-normal.woff2', './barlow-condensed-latin-600-normal.woff2', './barlow-condensed-latin-700-normal.woff2',
  './barlow-latin-400-normal.woff2', './barlow-latin-500-normal.woff2', './barlow-latin-700-normal.woff2',
  './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './favicon.svg'
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
