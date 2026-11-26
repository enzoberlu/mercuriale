/* Mercuriale — navigation et démarrage */
'use strict';
(function () {
  const M = window.M, S = M.S, I = M.I, esc = M.esc;
  const NAV = [
    { r: 'accueil', l: 'Accueil', i: 'home' },
    { r: 'comparer', l: 'Comparer', i: 'compare' },
    { r: 'saisir', l: 'Saisir', i: 'plus', fab: true },
    { r: 'optimiser', l: 'Optimiser', i: 'route' },
    { r: 'saisies', l: 'Historique', i: 'list' },
    { r: 'reglages', l: 'Réglages', i: 'gear', desk: true }
  ];
  M.applyTheme = () => {
    const t = (S.cfg && S.cfg.theme) || 'auto';
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? '#0e1611' : '#eef3ec';
  };
  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const q = {}; (qs || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' ')); });
    return { route: parts[0] || '', arg: parts[1], q };
  }
  function shell() {
    const app = document.getElementById('app');
    app.innerHTML = `<header class="topbar"><a class="brand" href="#/accueil" aria-label="Mercuriale, accueil">${M.mark()}<span class="brand-name">Mercuriale</span></a><span class="spacer"></span>
        <span id="medep"></span><button class="sync-pill" id="sync" type="button" aria-live="polite"></button><a class="iconbtn" href="#/reglages" id="gear" aria-label="Réglages">${I.gear}</a></header>
      <nav class="nav" id="nav" aria-label="Navigation principale"></nav>
      <main id="view" tabindex="-1"></main>`;
    document.getElementById('sync').onclick = async () => {
      if (!S.cfg || S.cfg.mode !== 'live') { location.hash = '#/reglages'; return; }
      await M.sync({}); if (!S.sync.error) M.toast(S.queue.length ? 'Envoi en cours' : 'Tout est à jour');
    };
  }
  function drawChrome(route) {
    const nav = document.getElementById('nav'); const desk = window.matchMedia('(min-width: 1000px)').matches;
    // « Saisir » est visible pour tout le monde ; l'écran explique si l'accès (lecture seule) ne permet pas de saisir
    const items = NAV.filter(n => desk || !n.desk);
    nav.style.gridTemplateColumns = desk ? '' : `repeat(${items.length}, 1fr)`;
    nav.innerHTML = items.map(n => n.fab ? `<a href="#/saisir" class="fab" ${route === n.r ? 'aria-current="page"' : ''}><span class="fab-c">${I[n.i]}</span><span class="lbl">${n.l}</span></a>`
      : `<a href="#/${n.r}" ${route === n.r || (route === 'produit' && n.r === 'comparer') || (route === 'admin' && n.r === 'reglages') ? 'aria-current="page"' : ''}>${I[n.i]}<span>${n.l}</span></a>`).join('');
    document.getElementById('gear').hidden = desk;
    const d = M.myDep(); document.getElementById('medep').innerHTML = S.cfg ? `<span class="depchip c-${esc(d)}"><i></i><span class="dc-code">${esc(d)}</span><span class="dc-full">${esc(M.DEPN[d] || d)}</span></span>` : '';
    drawSync();
  }
  function drawSync() {
    const b = document.getElementById('sync'); if (!b) return;
    if (!S.cfg) { b.hidden = true; return; } b.hidden = false;
    let cls = '', txt;
    if (S.cfg.mode === 'demo') { txt = 'Démo'; }
    else if (!S.sync.online) { cls = 'off'; txt = S.queue.length ? S.queue.length + ' en attente' : 'Hors ligne'; }
    else if (S.sync.busy) { cls = 'busy'; txt = 'Synchro…'; }
    else if (S.sync.error) { cls = 'err'; txt = 'À vérifier'; }
    else if (S.queue.length) { cls = 'off'; txt = S.queue.length + ' à envoyer'; }
    else { txt = 'À jour'; }
    b.className = 'sync-pill ' + cls; b.innerHTML = `<span class="dotst"></span><span>${esc(txt)}</span>`;
    b.title = S.sync.error ? 'Erreur : ' + S.sync.error : (S.cfg.lastSync ? 'Dernière synchronisation : ' + new Date(S.cfg.lastSync).toLocaleString('fr-FR') : '');
  }
  let lastRoute = null, inviteShown = false;
  function render() {
    const { route, arg, q } = parse();
    if (route === 'rejoindre') {
      if (!S.cfg) { M.V.bienvenue(document.getElementById('view')); drawChrome(''); }
      if (q.jeton) M.openInvite({ api: q.api, jeton: q.jeton }); else M.connectSheet({ api: q.api, code: q.code, admin: !!q.code });
      history.replaceState(null, '', location.pathname + location.search + '#/' + (S.cfg ? 'accueil' : 'bienvenue'));
      return;
    }
    if (!S.cfg) {
      document.body.classList.add('no-cfg');
      document.getElementById('nav').innerHTML = ''; document.getElementById('medep').innerHTML = ''; drawSync();
      M.V.bienvenue(document.getElementById('view'));
      // invitation mise de côté (ouverte dans Safari avant l'installation) : on la propose une fois
      const inv = M.pendingInvite();
      if (inv && !inviteShown && !document.querySelector('.sheet-bg')) { inviteShown = true; M.joinSheet(Object.assign({ found: true }, inv)); }
      return;
    }
    document.body.classList.remove('no-cfg');
    const r = M.V[route] && route !== 'bienvenue' ? route : 'accueil';
    if (route !== r && route) { location.replace('#/' + r); return; }
    drawChrome(r);
    const view = document.getElementById('view');
    try { M.V[r](view, q, arg); }
    catch (e) { console.error(e); view.innerHTML = `<div class="empty"><h3>Cet écran n’a pas pu s’afficher</h3><p class="small">${esc(e.message)}</p><a class="btn" href="#/accueil">Retour à l’accueil</a></div>`; }
    if (lastRoute !== location.hash) {
      window.scrollTo(0, 0);
      // changement d'écran : le lecteur d'écran repart du début de la page (pas pendant une saisie : le champ produit a déjà le focus)
      if (lastRoute !== null && r !== 'saisir' && !document.querySelector('.sheet-bg')) { try { view.focus({ preventScroll: true }); } catch (e) {} }
      lastRoute = location.hash;
    }
    document.title = 'Mercuriale' + ({ comparer: ' — Comparer', saisir: ' — Saisir', optimiser: ' — Optimiser', saisies: ' — Historique', reglages: ' — Réglages' }[r] || '');
  }
  M.on('route', render);
  M.on('sync', () => { drawSync(); });
  // rafraîchir l'écran courant quand de nouvelles données arrivent (sauf pendant une saisie)
  let pendingData = false;
  M.on('data', () => {
    const { route } = parse();
    if (route === 'saisir' || document.querySelector('.sheet-bg')) { pendingData = true; return; }
    if (S.cfg && booted) scheduleRender();
  });
  let rt = null; function scheduleRender() { clearTimeout(rt); rt = setTimeout(render, 60); }
  M.on('rejected', () => M.toast('Une saisie a été refusée par le serveur : voir Réglages', 'bad'));

  let booted = false;
  async function boot() {
    shell();
    await M.load();
    M.applyTheme();
    if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', M.applyTheme);
    booted = true;
    window.addEventListener('hashchange', () => { pendingData = false; document.querySelectorAll('.sheet-bg').forEach(e => e.remove()); render(); });
    // on ne redessine qu'au passage téléphone ↔ ordinateur : l'ouverture du clavier (qui rétrécit la fenêtre) ne doit rien effacer
    const mq = window.matchMedia('(min-width: 1000px)');
    const onBp = () => { const { route } = parse(); if (route !== 'saisir') render(); else drawChrome(route); };
    if (mq.addEventListener) mq.addEventListener('change', onBp); else if (mq.addListener) mq.addListener(onBp);
    render();
    window.addEventListener('online', () => { S.sync.online = true; drawSync(); M.sync({ quiet: true }); });
    window.addEventListener('offline', () => { S.sync.online = false; drawSync(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') M.sync({ quiet: true }); });
    setInterval(() => { if (document.visibilityState === 'visible') M.sync({ quiet: true }); }, 120000);
    if (S.cfg && S.cfg.mode === 'live') { M.sync({ quiet: true }); M.persist(); }
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__mercInstall = e; });
    const swOk = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && swOk && !window.__mercNoSW) {
      try {
        const hadSW = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
          // vérifier les mises à jour quand on revient sur l'appli
          document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
        }).catch(() => {});
        // nouvelle version installée : proposer de recharger (jamais pendant une saisie)
        let shown = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!hadSW || shown) return; shown = true;
          M.toast('Nouvelle version de Mercuriale installée', '', { label: 'Recharger', fn: () => location.reload() });
        });
      } catch (e) {}
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
