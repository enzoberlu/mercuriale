/* Mercuriale — cœur : utilitaires, stockage, synchronisation, calculs */
'use strict';
const M = window.M = {};

/* ------------------------------------------------------------ constantes */
M.VERSION = '1.4.0';
M.DEPS = ['HBA', 'HBO', 'RV', 'DYN'];                // ordre des lignes de navette (outil existant)
M.DEPN = { HBA: 'HBA', HBO: 'HBO', RV: 'Relais Vert', DYN: 'DYNAMIS' };
M.DEPCITY = { HBA: 'Saint-Médard-d’Eyrans (33)', HBO: 'Vendargues (34)', RV: 'Carpentras (84)', DYN: 'Rungis (94)' };
M.DEPC = { HBA: [44.7167, -0.45], HBO: [43.6469, 3.9989], RV: [44.0552, 5.0493], DYN: [48.7519, 2.3536] };
M.UNITS = { kg: '€/kg', colis: '€/colis', piece: '€/pièce', botte: '€/botte' };
M.UNIT_SHORT = { kg: 'kg', colis: 'colis', piece: 'pièce', botte: 'botte' };
M.ORIGINS = ['France', 'Espagne', 'Italie', 'Maroc', 'Pays-Bas', 'Portugal'];
M.QUALS = ['Extra', 'Cat. I', 'Cat. II'];
M.CATS = ['Fruits', 'Légumes', 'Herbes aromatiques'];
M.PARAM_DEFS = [
  { g: 'Navettes (outil de calcul existant)' },
  { k: 'diesel', l: 'Gasoil (HT)', u: '€/L', d: 1.95, s: 0.01 }, { k: 'cons', l: 'Consommation camion', u: 'L/100 km', d: 32, s: 0.5 },
  { k: 'toll', l: 'Péage 40 t (km à péage)', u: '€/km', d: 0.27, s: 0.01 }, { k: 'driver', l: 'Chauffeur, coût chargé', u: '€/h', d: 32, s: 0.5 },
  { k: 'night', l: 'Indemnité par nuitée', u: '€', d: 90, s: 5 }, { k: 'truckMonth', l: 'Camion (location / amortissement)', u: '€/mois', d: 3000, s: 50 },
  { k: 'handling', l: 'Chargement / déchargement par arrêt', u: 'h', d: 1, s: 0.25 }, { k: 'vHw', l: 'Vitesse autoroute', u: 'km/h', d: 82, s: 1 },
  { k: 'vOther', l: 'Vitesse autres routes', u: 'km/h', d: 55, s: 1 }, { k: 'maxDrive', l: 'Conduite max par jour', u: 'h', d: 9, s: 0.5 },
  { k: 'cap', l: 'Capacité camion', u: 'pal.', d: 33, s: 1 }, { k: 'palSens', l: 'Palettes par sens (remplissage habituel)', u: 'pal.', d: 20, s: 1 },
  { k: 'L1_rot', l: 'Ligne HBA ⇄ HBO : rotations', u: '/sem.', d: 2, s: 1 }, { k: 'L1_km', l: 'Ligne HBA ⇄ HBO : distance', u: 'km', d: 480, s: 5 },
  { k: 'L2_rot', l: 'Ligne HBO ⇄ RV : rotations', u: '/sem.', d: 3, s: 1 }, { k: 'L2_km', l: 'Ligne HBO ⇄ RV : distance', u: 'km', d: 130, s: 5 },
  { k: 'L3_rot', l: 'Ligne RV ⇄ DYNAMIS : rotations', u: '/sem.', d: 2, s: 1 }, { k: 'L3_km', l: 'Ligne RV ⇄ DYNAMIS : distance', u: 'km', d: 660, s: 5 },
  { g: 'Délais de transfert entre dépôts' },
  { k: 'L1_delai', l: 'HBA ⇄ HBO', u: 'jours', d: 1, s: 1 }, { k: 'L2_delai', l: 'HBO ⇄ RV', u: 'jours', d: 1, s: 1 }, { k: 'L3_delai', l: 'RV ⇄ DYNAMIS', u: 'jours', d: 1, s: 1 },
  { g: 'Comparaison des prix' },
  { k: 'fenetre', l: 'Prix comparés : saisies des derniers', u: 'jours', d: 14, s: 1 },
  { k: 'minGain', l: 'Économie mini pour recommander', u: '%', d: 3, s: 1 },
  { k: 'kgPal', l: 'Poids moyen d’une palette F&L', u: 'kg', d: 600, s: 25 },
  { k: 'unitesPal', l: 'Pièces ou bottes par palette (si inconnu)', u: 'u.', d: 1200, s: 50 },
  { k: 'colisPal', l: 'Colis par palette (si inconnu)', u: 'colis', d: 100, s: 5 },
  { k: 'marg', l: 'Coût d’une palette en place libre, par ligne', u: '€/pal', d: 8, s: 1 },
  { g: 'Transport du marché (pour comparer)' },
  { k: 'msg1', l: 'Messagerie 1 palette < 200 km', u: '€/pal', d: 95, s: 5 }, { k: 'msg2', l: 'Messagerie 1 palette 200–500 km', u: '€/pal', d: 145, s: 5 },
  { k: 'msg3', l: 'Messagerie 1 palette 500–1 000 km', u: '€/pal', d: 210, s: 5 }, { k: 'msg4', l: 'Messagerie 1 palette > 1 000 km', u: '€/pal', d: 260, s: 5 },
  { k: 'affr', l: 'Affrètement camion complet', u: '€/km', d: 2.15, s: 0.05 }, { k: 'floor', l: 'Plancher dégressivité (15+ pal.)', u: '%', d: 59, s: 1 },
];
M.PARAM_HIDDEN = { L1_hw: 0.97, L1_toll: 0.9, L2_hw: 0.6, L2_toll: 0.48, L3_hw: 0.95, L3_toll: 0.9, navMode: 'full', historique: 150 };
M.defaultParams = function () { const p = Object.assign({}, M.PARAM_HIDDEN); M.PARAM_DEFS.forEach(d => { if (d.k) p[d.k] = d.d; }); return p; };

/* ------------------------------------------------------------ formats */
const nfc = (min, max) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: min, maximumFractionDigits: max });
const nf0 = nfc(0, 0), nf1 = nfc(1, 1), nf2 = nfc(2, 2), nf3 = nfc(3, 3);
M.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
M.n0 = v => v == null || !isFinite(v) ? '—' : nf0.format(v);
M.n1 = v => v == null || !isFinite(v) ? '—' : nf1.format(v);
M.n2 = v => v == null || !isFinite(v) ? '—' : nf2.format(v);
M.px = v => v == null || !isFinite(v) ? '—' : (Math.abs(v) < 1 ? nf3.format(v) : nf2.format(v));
M.eur = v => v == null || !isFinite(v) ? '—' : nf0.format(Math.round(v)) + ' €';
M.eur2 = v => v == null || !isFinite(v) ? '—' : nf2.format(v) + ' €';
M.pct = (v, sign) => v == null || !isFinite(v) ? '—' : ((sign && v > 0) ? '+' : (v < 0 ? '−' : '')) + nf1.format(Math.abs(v * 100)) + ' %';
M.num = s => { if (s == null || s === '') return NaN; const n = Number(String(s).replace(/\s/g, '').replace(',', '.')); return n; };
M.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
M.slug = s => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
M.norm = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
M.pad = n => String(n).padStart(2, '0');
M.iso = d => d.getFullYear() + '-' + M.pad(d.getMonth() + 1) + '-' + M.pad(d.getDate());
M.today = () => M.iso(new Date());
M.addDays = (iso, k) => { const d = M.parseD(iso); d.setDate(d.getDate() + k); return M.iso(d); };
M.parseD = iso => { const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
M.daysAgo = iso => Math.round((M.parseD(M.today()) - M.parseD(iso)) / 864e5);
M.ago = iso => { const k = M.daysAgo(iso); if (k <= 0) return 'aujourd’hui'; if (k === 1) return 'hier'; if (k < 7) return 'il y a ' + k + ' j'; if (k < 60) return 'il y a ' + Math.round(k / 7) + ' sem.'; return 'il y a ' + Math.round(k / 30) + ' mois'; };
M.dShort = iso => { const d = M.parseD(iso); return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }); };
M.dNum = iso => { const d = M.parseD(iso); return M.pad(d.getDate()) + '/' + M.pad(d.getMonth() + 1); };
M.mondayOf = iso => { const d = M.parseD(iso); const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return M.iso(d); };

/* ------------------------------------------------------------ événements */
const listeners = {};
M.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
M.emit = (ev, data) => { (listeners[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); };

/* ------------------------------------------------------------ stockage (IndexedDB, repli mémoire) */
const mem = {};
let dbp = null;
function idb() {
  if (dbp) return dbp;
  dbp = new Promise(res => {
    try {
      const rq = indexedDB.open('mercuriale', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => res(null);
      setTimeout(() => res(null), 3000);
    } catch (e) { res(null); }
  });
  return dbp;
}
M.kvGet = async k => {
  const db = await idb(); if (!db) return mem[k];
  return new Promise(res => { try { const r = db.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => res(r.result); r.onerror = () => res(mem[k]); } catch (e) { res(mem[k]); } });
};
M.kvSet = async (k, v) => {
  mem[k] = v; const db = await idb(); if (!db) return;
  return new Promise(res => { try { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { res(); } });
};
M.kvClear = async () => { Object.keys(mem).forEach(k => delete mem[k]); const db = await idb(); if (!db) return; return new Promise(res => { try { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').clear(); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { res(); } }); };
const lsMem = {};
M.lsGet = (k, d) => { try { const v = localStorage.getItem('merc.' + k); return v == null ? (k in lsMem ? lsMem[k] : d) : JSON.parse(v); } catch (e) { return k in lsMem ? lsMem[k] : d; } };
M.lsSet = (k, v) => { lsMem[k] = v; try { localStorage.setItem('merc.' + k, JSON.stringify(v)); } catch (e) {} };

/* ------------------------------------------------------------ état de l'application */
const S = M.S = {
  cfg: null,                  // {mode:'demo'|'live', apiUrl, code, me:{depot, role, nom}, buyer, lastSync, theme}
  data: { prix: [], produits: [], fournisseurs: [], volumes: [], params: M.defaultParams(), acces: [] },
  queue: [], rejected: [],
  sync: { busy: false, last: null, error: null, online: navigator.onLine !== false },
  adm: null,                  // session administrateur : en mémoire seulement, jamais enregistrée sur l'appareil
  ix: null
};
M.P = () => S.data.params;
M.myDep = () => (S.cfg && S.cfg.me && S.cfg.me.depot) || (S.cfg && S.cfg.depot) || 'RV';   // dépôt affiché
M.ownDep = () => (S.cfg && S.cfg.me && S.cfg.me.depot) || '';                                // dépôt pour lequel ce code peut saisir
M.role = () => (S.cfg && S.cfg.me && S.cfg.me.role) || 'lecture';
M.isAdmin = () => M.role() === 'admin';
/* mode administrateur : code administrateur + mot de passe, se reverrouille seul après 15 min sans action */
M.ADMIN_MIN = 15;
M.adminOn = () => M.isAdmin() && !!S.adm && Date.now() < S.adm.until;
M.adminTouch = () => { if (S.adm) S.adm.until = Date.now() + M.ADMIN_MIN * 60000; };
M.canEditDep = d => M.adminOn() || (M.role() !== 'lecture' && !!M.ownDep() && d === M.ownDep());
M.canWrite = () => M.role() !== 'lecture' && (!!M.ownDep() || M.adminOn());

M.load = async () => {
  S.cfg = M.lsGet('cfg', null);
  const [prix, produits, fournisseurs, volumes, params, queue, rejected, acces] = await Promise.all(['prix', 'produits', 'fournisseurs', 'volumes', 'params', 'queue', 'rejected', 'acces'].map(M.kvGet));
  S.data.prix = prix || []; S.data.produits = produits || []; S.data.fournisseurs = fournisseurs || []; S.data.volumes = volumes || [];
  S.data.params = Object.assign(M.defaultParams(), params || {}); S.data.acces = acces || [];
  S.queue = queue || []; S.rejected = rejected || [];
  M.reindex();
};
M.saveCfg = () => M.lsSet('cfg', S.cfg);
M.persist = async () => { try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch (e) {} };
M.saveData = async (keys) => { await Promise.all((keys || ['prix', 'produits', 'fournisseurs', 'volumes', 'params', 'acces']).map(k => M.kvSet(k, S.data[k]))); };
M.saveQueue = async () => { await M.kvSet('queue', S.queue); await M.kvSet('rejected', S.rejected); };

/* ------------------------------------------------------------ index dérivés */
M.reindex = () => {
  const ix = { prod: new Map(), byProd: new Map(), sup: new Map(), vol: new Map(), fam: new Map() };
  S.data.produits.forEach(p => { if (String(p.actif) !== '0') ix.prod.set(String(p.id), p); });
  S.data.fournisseurs.forEach(f => ix.sup.set(M.norm(f.nom), f));
  S.data.prix.forEach(r => {
    if (Number(r.supprime) === 1) return;
    const k = String(r.produit_id);
    if (!ix.byProd.has(k)) ix.byProd.set(k, []);
    ix.byProd.get(k).push(r);
    if (!ix.prod.has(k)) ix.prod.set(k, { id: k, nom: r.produit || k, famille: '', categorie: '', unite: r.unite_ref || 'kg' });
  });
  ix.byProd.forEach(list => list.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : (String(b.maj) > String(a.maj) ? 1 : -1))));
  S.data.volumes.forEach(v => { const k = String(v.produit_id); if (!ix.vol.has(k)) ix.vol.set(k, {}); ix.vol.get(k)[v.depot] = v; });
  ix.prod.forEach(p => { const f = p.famille || ''; if (!ix.fam.has(f)) ix.fam.set(f, 0); ix.fam.set(f, ix.fam.get(f) + 1); });
  S.ix = ix;
  M.emit('data');
};

/* ------------------------------------------------------------ prix de référence */
M.refOf = (r, prod) => {
  const p = M.num(r.prix); if (!(p > 0)) return null;
  const u = r.unite || 'kg';
  if (u === 'kg') return { v: p, u: 'kg' };
  if (u === 'colis') {
    const w = M.num(r.poids_colis) > 0 ? M.num(r.poids_colis) : (prod && M.num(prod.poids_colis) > 0 && (prod.unite === 'kg') ? M.num(prod.poids_colis) : NaN);
    if (w > 0) return { v: p / w, u: 'kg' };
    return { v: p, u: 'colis' };
  }
  return { v: p, u };
};
M.rowRef = r => {
  const v = M.num(r.prix_ref), u = r.unite_ref;
  if (v > 0 && u) return { v, u };
  return M.refOf(r, S.ix && S.ix.prod.get(String(r.produit_id)));
};

/* comparaison d'un produit entre dépôts sur la fenêtre */
M.compare = (pid, days) => {
  const list = (S.ix.byProd.get(String(pid)) || []);
  const today = M.today(), since = M.addDays(today, -(days || M.P().fenetre || 14)), until = M.addDays(today, 1);
  const inWin = list.filter(r => r.date >= since && r.date <= until && !M.isExpired(r, today));
  if (!inWin.length) return null;
  const cnt = {}; inWin.forEach(r => { const rf = M.rowRef(r); if (rf) cnt[rf.u] = (cnt[rf.u] || 0) + 1; });
  const basis = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
  if (!basis) return null;
  const per = {};
  M.DEPS.forEach(d => {
    const all = inWin.filter(r => r.depot === d).map(r => ({ r, rf: M.rowRef(r) })).filter(x => x.rf && x.rf.u === basis);
    const ach = all.filter(x => !M.isOffer(x.r));
    const rows = ach.length ? ach : all;
    if (!rows.length) return;
    const lastDate = rows[0].r.date;
    const lastDay = rows.filter(x => x.r.date === lastDate);
    const best = lastDay.reduce((a, b) => (b.rf.v < a.rf.v ? b : a));
    const vals = rows.map(x => x.rf.v);
    per[d] = { v: best.rf.v, date: lastDate, row: best.r, n: rows.length, min: Math.min.apply(null, vals), max: Math.max.apply(null, vals), offer: !ach.length };
  });
  const deps = Object.keys(per);
  if (!deps.length) return null;
  const bestDep = deps.reduce((a, b) => (per[b].v < per[a].v ? b : a));
  const worst = deps.reduce((a, b) => (per[b].v > per[a].v ? b : a));
  return { pid: String(pid), basis, per, best: bestDep, spread: deps.length > 1 ? per[worst].v / per[bestDep].v - 1 : 0, ndeps: deps.length, last: inWin[0].date };
};

/* toutes les offres récentes d'un produit, une par fournisseur et par dépôt, classées par prix rendu chez dest */
M.suppliersFor = (pid, dest, days, basis) => {
  const list = S.ix.byProd.get(String(pid)) || [];
  const today = M.today(), since = M.addDays(today, -(days || 30));
  const seen = new Map();
  list.forEach(r => {
    if (r.date < since || !r.fournisseur || M.isExpired(r, today)) return;
    const rf = M.rowRef(r); if (!rf || (basis && rf.u !== basis)) return;
    const k = M.norm(r.fournisseur) + '|' + r.depot;
    if (!seen.has(k)) seen.set(k, { r, rf });
  });
  return Array.from(seen.values()).map(({ r, rf }) => {
    const tr = dest && r.depot !== dest ? M.transportUnit(pid, r.depot, dest, rf.u) : 0;
    return { r, v: rf.v, u: rf.u, tr, landed: rf.v + tr, delai: dest ? M.transferDays(r.depot, dest) : 0, arrive: dest ? M.arrival(r, dest, true) : '' };
  }).sort((a, b) => a.landed - b.landed);
};
M.isOffer = r => r && r.type === 'offre';
/* une proposition dont la date de validité est passée ne compte plus */
M.isExpired = (r, today) => M.isOffer(r) && !!r.validite && String(r.validite).slice(0, 10) < (today || M.today());

/* ------------------------------------------------------------ modèle navettes (repris de l'outil existant) */
M.lines = () => {
  const P = M.P();
  return [
    { id: 'L1', a: 'HBA', b: 'HBO', km: +P.L1_km, hw: +P.L1_hw, tollShare: +P.L1_toll, rot: +P.L1_rot, delai: P.L1_delai == null ? 1 : +P.L1_delai },
    { id: 'L2', a: 'HBO', b: 'RV', km: +P.L2_km, hw: +P.L2_hw, tollShare: +P.L2_toll, rot: +P.L2_rot, delai: P.L2_delai == null ? 1 : +P.L2_delai },
    { id: 'L3', a: 'RV', b: 'DYN', km: +P.L3_km, hw: +P.L3_hw, tollShare: +P.L3_toll, rot: +P.L3_rot, delai: P.L3_delai == null ? 1 : +P.L3_delai }
  ];
};
M.lineCost = (L, over) => {
  const P = Object.assign({}, M.P(), over || {});
  const rot = over && over.rot != null ? over.rot : L.rot;
  const oneWay = L.km * L.hw / P.vHw + L.km * (1 - L.hw) / P.vOther;
  const drive = 2 * oneWay, breaks = Math.floor(drive / 4.5) * 0.75, handling = 2 * P.handling;
  const nights = Math.max(0, Math.ceil(drive / P.maxDrive - 1e-9) - 1);
  const paid = drive + breaks + handling, kmRot = 2 * L.km;
  const fuel = kmRot * P.cons / 100 * P.diesel, toll = kmRot * L.tollShare * P.toll, driverC = paid * P.driver, nightC = nights * P.night;
  const truckC = rot > 0 ? P.truckMonth * 12 / 52 / rot : 0;
  const total = fuel + toll + driverC + nightC + truckC;
  return { oneWay, drive, paid, nights, fuel, toll, driverC, nightC, truckC, total, sens: total / 2, perPal: total / 2 / Math.max(1, P.palSens), rot };
};
M.pathLines = (s, d) => { const i = M.DEPS.indexOf(s), j = M.DEPS.indexOf(d); const L = M.lines(); const out = []; for (let k = Math.min(i, j); k < Math.max(i, j); k++) out.push(L[k]); return out; };
M.navPal = (s, d, mode) => {
  if (s === d) return 0;
  const P = M.P(); const pl = M.pathLines(s, d);
  return (mode || P.navMode) === 'marg' ? pl.length * P.marg : pl.reduce((a, L) => a + M.lineCost(L).perPal, 0);
};
M.transferDays = (s, d) => s === d ? 0 : M.pathLines(s, d).reduce((a, L) => a + (L.delai || 0), 0);
M.jplus = k => k ? 'J+' + k : 'sur place';
M.via = (s, d) => { const i = M.DEPS.indexOf(s), j = M.DEPS.indexOf(d); const st = []; for (let k = Math.min(i, j) + 1; k < Math.max(i, j); k++) st.push(M.DEPS[k]); return i < j ? st : st.reverse(); };
/* date d'arrivée chez le dépôt dest d'un achat fait au dépôt de la ligne r : livraison au dépôt source puis transfert */
M.arrival = (r, dest, fromToday) => {
  const today = M.today();
  let base = (r && (r.livraison || r.date)) || today;
  if (fromToday && base < today) base = today;
  return M.addDays(base, M.transferDays(r ? r.depot : dest, dest));
};
M.hav = (a, b) => { const R = 6371, t = Math.PI / 180; const dLa = (b[0] - a[0]) * t, dLo = (b[1] - a[1]) * t; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
M.depKm = (s, d) => M.pathLines(s, d).reduce((a, L) => a + L.km, 0);
const DEG = [[1, 1], [2, 0.875], [3, 0.8125], [5, 0.75], [10, 0.656], [15, null]];
M.degFactor = n => { const fl = M.P().floor / 100; const pts = DEG.map(([x, y]) => [x, y === null ? fl : Math.max(y, fl)]); if (n <= 1) return 1; if (n >= 15) return fl; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; if (n <= x1) return y0 + (y1 - y0) * (n - x0) / (x1 - x0); } return fl; };
M.msgBase = km => { const P = M.P(); return km < 200 ? P.msg1 : km < 500 ? P.msg2 : km < 1000 ? P.msg3 : P.msg4; };
M.market = (n, km) => { if (n <= 0) return { v: 0, how: '—' }; const m = n * M.msgBase(km) * M.degFactor(Math.max(1, n)), a = Math.max(km, 30) * M.P().affr; return m <= a ? { v: m, how: 'messagerie' } : { v: a, how: 'affrètement' }; };

/* unités par palette pour un produit et une base de prix */
M.unitsPerPal = (prod, basis) => {
  const P = M.P(); prod = prod || {};
  const kgp = M.num(prod.kg_palette), cpp = M.num(prod.colis_palette), wc = M.num(prod.poids_colis), pc = M.num(prod.pieces_colis);
  if (basis === 'kg') return kgp > 0 ? kgp : (cpp > 0 && wc > 0 ? cpp * wc : P.kgPal);
  if (basis === 'colis') return cpp > 0 ? cpp : P.colisPal;
  return cpp > 0 && pc > 0 ? cpp * pc : P.unitesPal;
};
M.transportUnit = (pid, s, d, basis, mode) => { const prod = S.ix.prod.get(String(pid)); return M.navPal(s, d, mode) / M.unitsPerPal(prod, basis); };

/* opportunités d'achat pour un dépôt de destination */
M.opportunities = (dest, opts) => {
  opts = opts || {}; const P = M.P(); const days = opts.days || P.fenetre; const minG = (opts.minGain != null ? opts.minGain : P.minGain) / 100;
  const out = [];
  S.ix.prod.forEach((prod, pid) => {
    const c = M.compare(pid, days); if (!c) return;
    const loc = c.per[dest];
    const vol = (S.ix.vol.get(pid) || {})[dest];
    M.DEPS.forEach(src => {
      if (src === dest || !c.per[src]) return;
      const tr = M.transportUnit(pid, src, dest, c.basis, opts.mode);
      const landed = c.per[src].v + tr;
      if (!loc) return;
      const gain = loc.v - landed; const g = gain / loc.v;
      if (g < minG) return;
      const q = vol && vol.unite === c.basis ? M.num(vol.quantite_semaine) : NaN;
      const upp = M.unitsPerPal(prod, c.basis);
      const delai = M.transferDays(src, dest);
      out.push({ pid, prod, basis: c.basis, src, dest, srcRow: c.per[src].row, srcV: c.per[src].v, srcDate: c.per[src].date, locV: loc.v, locDate: loc.date, locRow: loc.row,
        tr, landed, gain, g, q, upp, pal: q > 0 ? q / upp : NaN, gainWeek: q > 0 ? gain * q : NaN, delai, arrive: M.arrival(c.per[src].row, dest, true) });
    });
  });
  // un seul dépôt source par produit : le meilleur rendu
  const best = new Map();
  out.forEach(o => { const b = best.get(o.pid); if (!b || o.landed < b.landed) best.set(o.pid, o); });
  return Array.from(best.values()).sort((a, b) => ((b.gainWeek || 0) - (a.gainWeek || 0)) || (b.g - a.g));
};

/* ------------------------------------------------------------ API Google Apps Script */
async function fetchT(url, opt, ms) {
  const ctl = 'AbortController' in window ? new AbortController() : null;
  const t = setTimeout(() => ctl && ctl.abort(), ms || 30000);
  try { const r = await fetch(url, Object.assign({ redirect: 'follow', signal: ctl ? ctl.signal : undefined }, opt || {})); return r; }
  finally { clearTimeout(t); }
}
/* lit la réponse du serveur ; une page HTML au lieu de données = déploiement mal réglé */
async function readJ(r) {
  const txt = await r.text(); let j;
  try { j = JSON.parse(txt); } catch (e) {
    if (/<html|<!doctype/i.test(txt)) throw new Error('Le serveur a renvoyé une page Google au lieu des données : dans Apps Script, le déploiement doit être « Qui a accès : Tout le monde ».');
    throw new Error('Réponse illisible du serveur (code ' + r.status + ')');
  }
  if (!j.ok) {
    const er = new Error(j.error || 'Erreur serveur');
    if (/code d.acc[eè]s (inconnu|manquant|r[eé]voqu[eé])/i.test(er.message)) er.auth = true;
    if (j.revoked) er.revoked = true;
    if (j.session) er.session = true;
    throw er;
  }
  return j;
}
M.api = {
  async ping(url) { const r = await fetchT(url + (url.includes('?') ? '&' : '?') + 'action=ping', {}, 20000); return readJ(r); },
  async pull(since, cfg) {
    const c = cfg || S.cfg; const u = c.apiUrl + (c.apiUrl.includes('?') ? '&' : '?') + 'action=pull&code=' + encodeURIComponent(c.code) + '&since=' + encodeURIComponent(since || '');
    return readJ(await fetchT(u, {}, since ? 60000 : 150000)); // premier chargement (tout l'historique) : jusqu'à 2 min 30
  },
  async push(ops) {
    const c = S.cfg;
    return readJ(await fetchT(c.apiUrl, { method: 'POST', body: JSON.stringify({ action: 'push', code: c.code, adm: M.adminOn() ? S.adm.token : undefined, ops }) }, 60000));
  },
  async call(body, apiUrl) { return readJ(await fetchT(apiUrl || S.cfg.apiUrl, { method: 'POST', body: JSON.stringify(body) }, 60000)); }
};

/* ------------------------------------------------------------ administration (mot de passe) */
const demoAdmin = () => S.demoAdm || (S.demoAdm = {
  people: [
    { id: 'd1', nom: 'Toi (démo)', depot: '', role: 'admin', actif: true, dernier_acces: new Date().toISOString(), fin: 'K7', appareils: 1, moi: true },
    { id: 'd2', nom: 'Camille', depot: 'HBA', role: 'acheteur', actif: true, dernier_acces: new Date(Date.now() - 3600e3).toISOString(), fin: 'Q2', appareils: 1 },
    { id: 'd3', nom: 'Sofiane', depot: 'HBO', role: 'acheteur', actif: true, dernier_acces: new Date(Date.now() - 86400e3).toISOString(), fin: 'M9', appareils: 1 },
    { id: 'd4', nom: 'Léa', depot: 'RV', role: 'acheteur', actif: true, dernier_acces: new Date(Date.now() - 7200e3).toISOString(), fin: 'XA', appareils: 2 },
    { id: 'd5', nom: 'Hugo', depot: 'DYN', role: 'acheteur', actif: true, dernier_acces: '', fin: 'P4', appareils: 0, invitation: new Date(Date.now() + 48 * 3600e3).toISOString() },
    { id: 'd6', nom: 'Direction', depot: '', role: 'lecture', actif: true, dernier_acces: new Date(Date.now() - 3 * 86400e3).toISOString(), fin: 'H3', appareils: 1 }
  ],
  journal: null
});
/* historique de démonstration : fabriqué à partir des prix fictifs, avec quelques modifications et actions d'accès */
function demoJournal() {
  const D = demoAdmin(); if (D.journal) return D.journal;
  const byDep = {}; D.people.forEach(p => { if (p.depot && p.role === 'acheteur') byDep[p.depot] = p; });
  const recent = S.data.prix.filter(r => !Number(r.supprime) && r.date >= M.addDays(M.today(), -12)).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 70);
  const obj = r => [r.produit, r.depot, M.px(M.num(r.prix)) + '/' + (r.unite === 'piece' ? 'pièce' : r.unite), r.fournisseur, r.type === 'offre' ? 'proposition' : ''].filter(Boolean).join(', ');
  const J = []; let k = 0;
  recent.forEach(r => {
    const p = byDep[r.depot] || D.people[0]; const t = new Date(Date.parse(r.date + 'T07:00:00') + (k++ % 9) * 1800e3).toISOString();
    J.push({ t, acces_id: p.id, nom: p.nom, role: p.role, depot: p.depot, action: 'prix_cree', objet: obj(r), detail: '' });
    if (k % 11 === 0) J.push({ t: new Date(Date.parse(t) + 900e3).toISOString(), acces_id: p.id, nom: p.nom, role: p.role, depot: p.depot, action: 'prix_modifie', objet: obj(r), detail: 'prix : ' + String(Math.round(M.num(r.prix) * 1.08 * 100) / 100).replace('.', ',') + ' → ' + String(M.num(r.prix)).replace('.', ',') });
    if (k % 23 === 0) J.push({ t: new Date(Date.parse(t) + 1200e3).toISOString(), acces_id: p.id, nom: p.nom, role: p.role, depot: p.depot, action: 'prix_supprime', objet: obj(r), detail: '' });
  });
  const me = D.people[0], d = h => new Date(Date.now() - h * 3600e3).toISOString();
  J.push({ t: d(2), acces_id: me.id, nom: me.nom, role: 'admin', depot: '', action: 'parametre', objet: 'Gasoil (HT), €/L', detail: '1,92 → 1,95' });
  J.push({ t: d(26), acces_id: me.id, nom: me.nom, role: 'admin', depot: '', action: 'produit_modifie', objet: 'Tomate ronde', detail: 'colis par palette : (vide) → 96' });
  J.push({ t: d(30), acces_id: 'd4', nom: 'Léa', role: 'acheteur', depot: 'RV', action: 'fournisseur_cree', objet: 'Ferme du Ventoux (démo)', detail: 'dépôts livrés : RV' });
  J.push({ t: d(50), acces_id: me.id, nom: me.nom, role: 'admin', depot: '', action: 'invitation_creee', objet: 'Hugo', detail: 'acheteur, DYN' });
  J.push({ t: d(70), acces_id: 'd4', nom: 'Léa', role: 'acheteur', depot: 'RV', action: 'invitation_utilisee', objet: 'Léa', detail: 'nouvel appareil' });
  J.push({ t: d(71), acces_id: me.id, nom: me.nom, role: 'admin', depot: '', action: 'admin_echec', objet: '', detail: 'mauvais mot de passe (1/5)' });
  J.push({ t: d(96), acces_id: me.id, nom: me.nom, role: 'admin', depot: '', action: 'acces_desactive', objet: 'Ancien stagiaire', detail: '' });
  J.sort((a, b) => (a.t < b.t ? 1 : -1));
  return (D.journal = J);
}
M.adminLogin = async pwd => {
  if (!M.isAdmin()) throw new Error('Ce code n’est pas un code administrateur');
  if (S.cfg.mode === 'demo') {
    if (pwd !== 'demo') { await new Promise(r => setTimeout(r, 600)); throw new Error('Mot de passe incorrect (en démo : demo)'); }
    S.adm = { token: 'demo', until: 0 }; M.adminTouch(); demoJournal().unshift({ t: new Date().toISOString(), acces_id: 'd1', nom: 'Toi (démo)', role: 'admin', depot: '', action: 'admin_ouverture', objet: '', detail: 'session administrateur ouverte' }); M.emit('admin'); return;
  }
  const j = await M.api.call({ action: 'admin_login', code: S.cfg.code, password: pwd });
  S.adm = { token: j.token, until: 0 }; M.adminTouch(); M.emit('admin');
};
M.adminLock = (why) => {
  const t = S.adm && S.adm.token; S.adm = null;
  if (t && S.cfg && S.cfg.mode === 'live') M.api.call({ action: 'admin', op: 'logout', code: S.cfg.code, adm: t }).catch(() => {});
  M.emit('admin', why || 'lock');
};
M.adminOp = async (op, args) => {
  if (!M.adminOn()) { const e = new Error('Mode administrateur verrouillé'); e.session = true; throw e; }
  M.adminTouch();
  if (S.cfg.mode === 'demo') return demoOp(op, args || {});
  try { return await M.api.call(Object.assign({ action: 'admin', op, code: S.cfg.code, adm: S.adm.token }, args || {})); }
  catch (e) { if (e.session) M.adminLock('expired'); throw e; }
};
function demoOp(op, a) {
  const D = demoAdmin(); demoJournal();
  const log = (action, detail, objet) => D.journal.unshift({ t: new Date().toISOString(), acces_id: 'd1', nom: 'Toi (démo)', role: 'admin', depot: '', action, objet: objet || '', detail: detail || '' });
  if (op === 'list') {
    const d30 = new Date(Date.now() - 30 * 864e5).toISOString();
    D.people.forEach(p => { p.actions30 = D.journal.filter(x => x.acces_id === p.id && x.t >= d30 && /^(prix_|produit_|fournisseur_|parametre)/.test(x.action)).length; p.cree_par = p.cree_par || (p.moi ? 'Installation' : 'Toi (démo)'); p.inscrit_le = p.inscrit_le || (p.dernier_acces ? new Date(Date.parse(p.dernier_acces) - 20 * 864e5).toISOString() : ''); });
    return { ok: true, people: D.people };
  }
  if (op === 'activity') {
    const K = { prix: /^prix_/, catalogue: /^(produit_|fournisseur_|parametre)/, acces: /^(invitation_|acces_|admin_|mot_de_passe|connexion)/ };
    let rows = D.journal.slice(); if (a.person) rows = rows.filter(x => x.acces_id === a.person); if (a.kind && K[a.kind]) rows = rows.filter(x => K[a.kind].test(x.action));
    const off = a.offset || 0, lim = a.limit || 150; return { ok: true, total: rows.length, rows: rows.slice(off, off + lim) };
  }
  if (op === 'invite') { if (!String(a.nom || '').trim()) throw new Error('Indique le prénom de la personne'); if (a.role === 'acheteur' && M.DEPS.indexOf(a.depot) < 0) throw new Error('Choisis le dépôt de l’acheteur');
    const id = 'd' + M.uid(); D.people.push({ id, nom: a.nom.trim(), depot: a.depot || '', role: a.role || 'acheteur', actif: true, dernier_acces: '', fin: '··', appareils: 0, invitation: new Date(Date.now() + 72 * 3600e3).toISOString() });
    log('invitation_creee', a.role + (a.depot ? ', ' + a.depot : ''), a.nom); return { ok: true, id, jeton: 'demo' + M.uid() + M.uid(), expire: new Date(Date.now() + 72 * 3600e3).toISOString() }; }
  const p = D.people.find(x => x.id === a.id);
  if (op === 'reinvite') { p.invitation = new Date(Date.now() + 72 * 3600e3).toISOString(); log('invitation_creee', 'nouvel appareil', p.nom); return { ok: true, jeton: 'demo' + M.uid() + M.uid(), expire: p.invitation }; }
  if (op === 'revoke' || op === 'restore') { if (p.moi) throw new Error('Tu ne peux pas désactiver ton propre accès'); p.actif = op === 'restore'; log(op === 'revoke' ? 'acces_desactive' : 'acces_reactive', '', p.nom); return { ok: true }; }
  if (op === 'param') { const d = M.PARAM_DEFS.find(x => x.k === a.key); log('parametre', String(S.data.params[a.key]).replace('.', ',') + ' → ' + String(a.value).replace('.', ','), d ? d.l : a.key); return { ok: true, key: a.key, value: a.value }; }
  if (op === 'product') { const pr = S.ix.prod.get(a.row.id) || {}; log('produit_modifie', ['colis_palette', 'kg_palette', 'poids_colis', 'pieces_colis'].filter(k => a.row[k] !== undefined && String(a.row[k]) !== String(pr[k] == null ? '' : pr[k])).map(k => ({ colis_palette: 'colis par palette', kg_palette: 'kg par palette', poids_colis: 'poids du colis', pieces_colis: 'pièces par colis' })[k] + ' : ' + (pr[k] || '(vide)') + ' → ' + (a.row[k] || '(vide)')).join(' ; '), pr.nom || a.row.id); return { ok: true }; }
  throw new Error('Action inconnue');
}
/* marge de recouvrement : un envoi d'un autre dépôt écrit pendant notre lecture n'est jamais manqué */
M.sinceWithMargin = iso => { if (!iso) return ''; const t = Date.parse(iso); return isFinite(t) ? new Date(t - 10 * 60000).toISOString() : ''; };

/* ------------------------------------------------------------ écriture locale + file d'attente */
const PRIX_COLS = ['id', 'maj', 'cree', 'date', 'depot', 'acheteur', 'produit_id', 'produit', 'origine', 'categorie_qualite', 'calibre', 'fournisseur', 'unite', 'prix', 'poids_colis', 'prix_ref', 'unite_ref', 'quantite', 'quantite_unite', 'validite', 'commentaire', 'supprime', 'type', 'livraison', 'stock', 'stock_unite', 'prix_vente'];
M.PRIX_COLS = PRIX_COLS;
M.savePrice = async row => {
  const now = new Date().toISOString();
  const i = S.data.prix.findIndex(r => r.id === row.id);
  if (i >= 0) { row.cree = S.data.prix[i].cree; S.data.prix[i] = Object.assign({}, S.data.prix[i], row, { maj: now }); }
  else { row.cree = row.cree || now; row.maj = now; S.data.prix.push(row); }
  if (S.cfg.mode === 'live') S.queue.push({ t: 'prix', op: 'upsert', row: Object.assign({}, row), ts: now });
  else if (S.demoAdm && S.demoAdm.journal) { const me = S.cfg.me || {}; S.demoAdm.journal.unshift({ t: now, acces_id: 'd1', nom: 'Toi (démo)', role: me.role, depot: row.depot, action: i >= 0 ? 'prix_modifie' : 'prix_cree', objet: [row.produit, row.depot, M.px(M.num(row.prix)) + '/' + row.unite, row.fournisseur].filter(Boolean).join(', '), detail: i >= 0 ? 'modifié dans la démo' : '' }); }
  await M.commit(['prix']);
};
M.deletePrice = async id => {
  const r = S.data.prix.find(x => x.id === id); if (!r) return;
  r.supprime = 1; r.maj = new Date().toISOString();
  if (S.cfg.mode === 'live') S.queue.push({ t: 'prix', op: 'delete', id, ts: r.maj });
  await M.commit(['prix']);
};
M.restorePrice = async id => {
  const r = S.data.prix.find(x => x.id === id); if (!r) return;
  r.supprime = 0; await M.savePrice(Object.assign({}, r));
};
M.saveProduct = async p => {
  const i = S.data.produits.findIndex(x => String(x.id) === String(p.id));
  if (i >= 0) {
    // produit existant (palettisation…) : réservé à l'administrateur, envoyé tout de suite au serveur
    await M.adminOp('product', { row: Object.assign({}, p) });
    S.data.produits[i] = Object.assign({}, S.data.produits[i], p, { maj: new Date().toISOString() });
    await M.saveData(['produits']); M.reindex(); return;
  }
  p.maj = new Date().toISOString();
  if (i >= 0) S.data.produits[i] = Object.assign({}, S.data.produits[i], p); else S.data.produits.push(p);
  if (S.cfg.mode === 'live') S.queue.push({ t: 'produits', op: 'upsert', row: Object.assign({}, S.data.produits[i >= 0 ? i : S.data.produits.length - 1]) });
  await M.commit(['produits']);
};
M.saveSupplier = async f => {
  const i = S.data.fournisseurs.findIndex(x => String(x.id) === String(f.id));
  f.maj = new Date().toISOString();
  if (i >= 0) S.data.fournisseurs[i] = Object.assign({}, S.data.fournisseurs[i], f); else S.data.fournisseurs.push(f);
  if (S.cfg.mode === 'live') S.queue.push({ t: 'fournisseurs', op: 'upsert', row: Object.assign({}, S.data.fournisseurs[i >= 0 ? i : S.data.fournisseurs.length - 1]) });
  await M.commit(['fournisseurs']);
};
M.setParam = async (k, v) => {
  // paramètre de calcul : réservé à l'administrateur, enregistré par le serveur avant d'être appliqué ici
  const j = await M.adminOp('param', { key: k, value: v });
  S.data.params[k] = j.value != null ? j.value : v;
  await M.saveData(['params']); M.reindex();
};
M.commit = async keys => {
  await M.saveData(keys); await M.saveQueue(); M.reindex();
  if (S.cfg.mode === 'live') M.sync({ quiet: true });
};
M.ensureSupplier = async (nom, depot) => {
  nom = String(nom || '').trim(); if (!nom) return;
  const f = S.ix.sup.get(M.norm(nom));
  if (!f) { await M.saveSupplier({ id: M.slug(nom) || M.uid(), nom, depots: depot, ville: '', dept: '', contact: '', actif: 1 }); return; }
  const deps = String(f.depots || '').split(',').map(s => s.trim()).filter(Boolean);
  if (depot && deps.indexOf(depot) < 0) { deps.push(depot); await M.saveSupplier({ id: f.id, nom: f.nom, depots: deps.join(',') }); }
};

/* ------------------------------------------------------------ synchronisation */
let syncP = null;
M.sync = (o) => {
  if (!S.cfg || S.cfg.mode !== 'live') return Promise.resolve();
  if (syncP) { syncP.again = true; return syncP; }
  const cfg0 = S.cfg;
  syncP = (async () => {
    S.sync.busy = true; M.emit('sync');
    try {
      do {
        if (syncP) syncP.again = false;
        while (S.queue.length) {
          const batch = S.queue.slice(0, 150);
          const res = await M.api.push(batch.map(({ ts, ...op }) => op));
          if (S.cfg !== cfg0) return; // déconnexion ou nouvelle connexion pendant l'envoi
          (res.results || []).forEach((r, i) => { if (!r.ok) S.rejected.push({ op: batch[i], error: r.error, at: new Date().toISOString() }); });
          S.queue.splice(0, batch.length);
          await M.saveQueue();
          if ((res.results || []).some(r => !r.ok)) M.emit('rejected');
        }
        const full = !cfg0.lastSync;
        const j = await M.api.pull(M.sinceWithMargin(cfg0.lastSync), cfg0);
        if (S.cfg !== cfg0) return; // la connexion a changé pendant le chargement : on n'applique pas ce résultat
        mergePull(j, full);
        S.cfg.lastSync = j.now; S.cfg.me = j.me; M.saveCfg();
        await M.saveData();
        M.reindex();
      } while (syncP && syncP.again);
      S.sync.error = null; S.sync.auth = false; S.sync.last = new Date().toISOString();
    } catch (e) {
      if (S.cfg !== cfg0) return;
      if (e && e.revoked) { await M.wipe('revoked'); return; }
      S.sync.auth = !!(e && e.auth);
      S.sync.error = (e && e.name === 'AbortError') ? 'Le serveur ne répond pas' : (e && e.name === 'TypeError') ? 'Pas de réseau ou serveur injoignable' : (e && e.message) || String(e);
      if (o && !o.quiet) M.emit('toast', { msg: 'Synchronisation impossible : ' + S.sync.error, kind: 'bad' });
    } finally { S.sync.busy = false; syncP = null; M.emit('sync'); }
  })();
  return syncP;
};
function mergePull(j, full) {
  const cols = j.prix.cols; const rows = j.prix.rows.map(a => { const o = {}; cols.forEach((c, i) => o[c] = a[i]); return o; });
  if (full || j.prix.full) {
    const pendingIds = new Set(S.queue.filter(q => q.t === 'prix').map(q => q.row ? q.row.id : q.id));
    const keep = S.data.prix.filter(r => pendingIds.has(r.id));
    const map = new Map(rows.map(r => [r.id, r]));
    keep.forEach(r => map.set(r.id, r));
    S.data.prix = Array.from(map.values());
  } else {
    // une ligne modifiée ici et pas encore envoyée n'est pas écrasée par l'ancienne version du serveur
    const pendingIds = new Set(S.queue.filter(q => q.t === 'prix').map(q => q.row ? q.row.id : q.id));
    const map = new Map(S.data.prix.map(r => [r.id, r]));
    rows.forEach(r => { if (!pendingIds.has(r.id)) map.set(r.id, r); });
    S.data.prix = Array.from(map.values());
  }
  S.data.prix.forEach(r => { r.prix = M.num(r.prix); r.prix_ref = M.num(r.prix_ref); r.supprime = Number(r.supprime) || 0; r.date = String(r.date).slice(0, 10); if (r.livraison) r.livraison = String(r.livraison).slice(0, 10); if (r.validite) r.validite = String(r.validite).slice(0, 10); if (!r.type) r.type = 'achat'; });
  // on ne garde sur l'appareil que l'historique utile (paramètre « historique »), plus les saisies pas encore envoyées
  const keepDays = (Number(j.params && j.params.historique) || 150) + 7, cut = M.addDays(M.today(), -keepDays);
  const pend = new Set(S.queue.filter(q => q.t === 'prix').map(q => q.row ? q.row.id : q.id));
  S.data.prix = S.data.prix.filter(r => (r.date >= cut && !(r.supprime && r.date < M.addDays(M.today(), -30))) || pend.has(r.id));
  S.data.produits = j.produits || S.data.produits;
  S.data.fournisseurs = j.fournisseurs || S.data.fournisseurs;
  S.data.volumes = j.volumes || S.data.volumes;
  S.data.params = Object.assign(M.defaultParams(), j.params || {});
  S.data.acces = [];
}

/* ------------------------------------------------------------ démo */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
M.buildDemo = (myDepot, buyer) => {
  const D = window.MERC_DEMO; const R = rng(20261124);
  const depF = { HBA: 1.04, HBO: 0.99, RV: 0.95, DYN: 1.08 };
  const buyers = { HBA: 'Camille (démo)', HBO: 'Sofiane (démo)', RV: 'Léa (démo)', DYN: 'Hugo (démo)' };
  const produits = D.products.map(p => ({ id: p.id, nom: p.nom, famille: p.famille, categorie: p.categorie, unite: p.unite, poids_colis: p.poids_colis || '', pieces_colis: p.pieces_colis || '', colis_palette: '', kg_palette: '', actif: 1, maj: '', cree_par: 'démo' }));
  const fournisseurs = D.suppliers.map(s => ({ id: M.slug(s.nom), nom: s.nom, depots: s.depots, ville: '', dept: '', contact: '', actif: 1 }));
  const prix = []; const today = M.today();
  M.DEPS.forEach(dep => {
    const sups = D.suppliers.filter(s => s.depots.split(',').indexOf(dep) >= 0).map(s => s.nom);
    D.products.forEach(p => {
      const has = D.volumes.some(v => v.produit_id === p.id && v.depot === dep);
      if (!has && R() < 0.5) return;
      const pf = 0.9 + (hash(p.id + dep) % 1000) / 1000 * 0.2;
      const phase = (hash(p.id) % 628) / 100;
      for (let w = 9; w >= 0; w--) {
        const nE = R() < 0.35 ? 2 : 1;
        for (let e = 0; e < nE; e++) {
          const day = Math.floor(R() * 5);
          const monday = M.mondayOf(M.addDays(today, -7 * w));
          const date = M.addDays(monday, day);
          if (date > today) continue;
          const v = p.base * depF[dep] * pf * (1 + 0.07 * Math.sin(w * 0.8 + phase)) * (1 + (R() - 0.5) * 0.06);
          const pkg = Math.round(v * 100) / 100;
          const asColis = p.unite === 'kg' && p.poids_colis && R() < 0.35;
          const org = (p.origine && p.origine !== 'France') ? p.origine : (R() < 0.9 ? 'France' : 'Espagne');
          const ts = date + 'T' + M.pad(7 + Math.floor(R() * 10)) + ':' + M.pad(Math.floor(R() * 60)) + ':00.000Z';
          const sup = sups[Math.floor(R() * sups.length)] || 'Fournisseur démo';
          const pv = R() < 0.5 ? Math.round(pkg * (1.25 + R() * 0.2) * 100) / 100 : '';
          prix.push({ id: 'd' + M.uid() + prix.length, maj: ts, cree: ts, date, depot: dep, acheteur: buyers[dep], produit_id: p.id, produit: p.nom, origine: org,
            categorie_qualite: R() < 0.7 ? 'Cat. I' : 'Cat. II', calibre: '', fournisseur: sup,
            unite: asColis ? 'colis' : p.unite, prix: asColis ? Math.round(pkg * p.poids_colis * 100) / 100 : pkg, poids_colis: asColis ? p.poids_colis : '',
            prix_ref: pkg, unite_ref: p.unite, quantite: '', quantite_unite: '', validite: '', commentaire: '', supprime: 0,
            type: 'achat', livraison: M.addDays(date, R() < 0.7 ? 1 : 2), stock: R() < 0.5 ? Math.round(R() * 40) : '', stock_unite: 'colis', prix_vente: asColis || !pv ? '' : pv });
          // propositions d'autres fournisseurs (prix proposés, pas encore achetés)
          if (w <= 2 && R() < 0.45 && sups.length > 1) {
            const other = sups.filter(s => s !== sup)[Math.floor(R() * (sups.length - 1))];
            const po = Math.round(pkg * (0.92 + R() * 0.14) * 100) / 100;
            prix.push({ id: 'o' + M.uid() + prix.length, maj: ts, cree: ts, date, depot: dep, acheteur: buyers[dep], produit_id: p.id, produit: p.nom, origine: org,
              categorie_qualite: 'Cat. I', calibre: '', fournisseur: other, unite: p.unite, prix: po, poids_colis: '', prix_ref: po, unite_ref: p.unite,
              quantite: '', quantite_unite: '', validite: M.addDays(date, 5), commentaire: '', supprime: 0, type: 'offre', livraison: M.addDays(date, 2), stock: '', stock_unite: '', prix_vente: '' });
          }
        }
      }
    });
  });
  const volumes = D.volumes.map(v => Object.assign({}, v));
  return { prix, produits, fournisseurs, volumes, params: M.defaultParams(), acces: [] };
};
M.startDemo = async (depot, buyer) => {
  const d = M.buildDemo(depot, buyer);
  S.data = d; S.queue = []; S.rejected = []; S.adm = null; S.demoAdm = null;
  S.cfg = { mode: 'demo', me: { depot, role: 'admin', nom: 'Démo' }, buyer: buyer || 'Moi', theme: (S.cfg && S.cfg.theme) || 'auto', depot };
  M.saveCfg(); await M.saveData(); await M.saveQueue(); M.reindex();
};
M.connect = async (apiUrl, code, buyer) => {
  apiUrl = String(apiUrl || '').trim(); code = String(code || '').trim().toUpperCase();
  if (!/^https:\/\//.test(apiUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(apiUrl)) throw new Error('L’adresse du serveur doit commencer par https://');
  const prev = S.cfg;
  if (prev && prev.mode === 'live' && S.queue.length) throw new Error(S.queue.length + ' saisie(s) pas encore envoyée(s) sur cet appareil : synchronise d’abord.');
  const gen = ++connectGen;
  const nc = { mode: 'live', apiUrl, code, buyer: buyer || '', theme: (prev && prev.theme) || 'auto', lastSync: '' };
  // le premier chargement (tout l'historique) peut être long : l'appli ne change rien tant que le serveur n'a pas répondu
  const j = await M.api.pull('', nc);
  if (gen !== connectGen) { const e = new Error('Une autre connexion a été lancée entre-temps.'); e.superseded = true; throw e; }
  const keep = { cfg: S.cfg, data: S.data, queue: S.queue, rejected: S.rejected };
  try {
    S.adm = null; S.cfg = nc; S.data = { prix: [], produits: [], fournisseurs: [], volumes: [], params: M.defaultParams(), acces: [] }; S.queue = []; S.rejected = [];
    mergePull(j, true); nc.lastSync = j.now; nc.me = j.me;
    M.saveCfg(); await M.saveData(); await M.saveQueue(); M.reindex();
    return j.me;
  } catch (e) { S.cfg = keep.cfg; S.data = keep.data; S.queue = keep.queue; S.rejected = keep.rejected; M.reindex(); throw e; }
};
let connectGen = 0;
/* invitation à usage unique : le serveur donne le code personnel une seule fois, il reste sur ce téléphone */
M.join = async (apiUrl, jeton, buyer) => {
  apiUrl = String(apiUrl || '').trim();
  if (!/^https:\/\//.test(apiUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(apiUrl)) throw new Error('Lien d’invitation incomplet');
  if (S.cfg && S.cfg.mode === 'live' && S.queue.length) throw new Error(S.queue.length + ' saisie(s) pas encore envoyée(s) sur cet appareil : synchronise d’abord.');
  // si un essai précédent a déjà utilisé l'invitation mais que le chargement a échoué, on reprend le code reçu
  const done = M.lsGet('joined', null);
  let code, nom = '';
  if (done && done.jeton === String(jeton) && done.api === apiUrl && Date.now() - done.t < 72 * 3600e3) { code = done.code; nom = done.nom || ''; }
  else {
    const j = await M.api.call({ action: 'join', jeton: String(jeton || '') }, apiUrl);
    code = j.code; nom = (j.me && j.me.nom) || '';
    M.lsSet('joined', { api: apiUrl, jeton: String(jeton), code, nom, t: Date.now() });
  }
  const me = await M.connect(apiUrl, code, buyer || nom);
  M.lsSet('joined', null); M.clearInvite();
  return me;
};
/* invitation en attente : gardée dans l'appareil ET dans un cookie, car sur iPhone l'appli ajoutée à l'écran d'accueil
   ne voit pas le stockage de Safari, mais récupère ses cookies (iOS 17.2 et plus) */
M.isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
M.isStandalone = () => window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
M.keepInvite = (api, jeton) => {
  const v = { api, jeton, t: Date.now() }; M.lsSet('invite', v);
  try { document.cookie = 'merc_inv=' + encodeURIComponent(JSON.stringify(v)) + '; max-age=' + 72 * 3600 + '; path=/; samesite=lax' + (location.protocol === 'https:' ? '; secure' : ''); } catch (e) {}
};
M.pendingInvite = () => {
  let v = M.lsGet('invite', null);
  if (!v) { try { const m = document.cookie.match(/(?:^|;\s*)merc_inv=([^;]+)/); if (m) v = JSON.parse(decodeURIComponent(m[1])); } catch (e) {} }
  return v && v.jeton && v.api && Date.now() - (v.t || 0) < 72 * 3600e3 ? v : null;
};
M.clearInvite = () => { M.lsSet('invite', null); try { document.cookie = 'merc_inv=; max-age=0; path=/'; } catch (e) {} };
/* lien d'invitation collé : on y retrouve l'adresse du serveur et le jeton */
M.parseInvite = txt => {
  const m = String(txt || '').match(/https?:\/\/\S+/); if (!m) return null;
  const h = m[0].split('#')[1] || ''; const qs = h.split('?')[1] || '';
  const q = {}; qs.split('&').forEach(kv => { const [k, v] = kv.split('='); if (k) q[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' ')); });
  return q.api && q.jeton ? { api: q.api, jeton: q.jeton } : null;
};

/* effacement de l'appareil (déconnexion, code désactivé par l'administrateur) */
M.wipe = async why => { await M.reset(); if (why) M.lsSet('wiped', why); M.emit('route'); if (location.hash !== '#/bienvenue') location.hash = '#/bienvenue'; };
M.reset = async () => { await M.kvClear(); S.cfg = null; S.adm = null; S.demoAdm = null; M.lsSet('cfg', null); M.lsSet('cart', []); M.lsSet('draft', null); S.data = { prix: [], produits: [], fournisseurs: [], volumes: [], params: M.defaultParams(), acces: [] }; S.queue = []; S.rejected = []; M.reindex(); };

/* ------------------------------------------------------------ export CSV */
M.csv = (rows, cols, heads) => {
  const q = v => { const s = v == null ? '' : String(v); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const fmtv = v => typeof v === 'number' ? String(v).replace('.', ',') : (typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'" + v : v);
  return '﻿' + [(heads || cols).map(q).join(';')].concat(rows.map(r => cols.map(c => q(fmtv(r[c]))).join(';'))).join('\r\n');
};
M.download = async (name, text, type) => {
  const blob = new Blob([text], { type: type || 'text/csv;charset=utf-8' });
  const standaloneIOS = window.navigator.standalone === true;
  if (standaloneIOS && navigator.canShare && window.File) {
    try { const f = new File([blob], name, { type: blob.type }); if (navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
};
