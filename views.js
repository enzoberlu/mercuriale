/* Mercuriale — écrans */
'use strict';
(function () {
  const M = window.M, S = M.S, esc = M.esc, I = M.I;
  const V = M.V = {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  M.ui = M.lsGet('ui', null) || { cmp: { q: '', cat: '', days: 0, sort: 'spread', mine: false }, his: { dep: '', days: 30, q: '', mine: false }, opt: { tab: 'ou', dest: '', days: 0, mode: 'full' }, prod: { days: 90 } };
  const saveUi = () => M.lsSet('ui', M.ui);
  const segH = (name, opts, cur) => `<div class="seg" role="group" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" data-v="${esc(v)}" aria-pressed="${String(v) === String(cur)}">${esc(l)}</button>`).join('')}</div>`;
  const bindSeg = (root, name, fn) => { const g = $(`[data-seg="${name}"]`, root); if (!g) return; g.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', g).forEach(x => x.setAttribute('aria-pressed', String(x === b))); fn(b.dataset.v); }); };
  const prodName = pid => { const p = S.ix.prod.get(String(pid)); return p ? p.nom : pid; };
  const banners = (home) => {
    let h = '';
    if (S.cfg && S.cfg.mode === 'demo' && home) h += window.__mercDemoFile
      ? `<div class="banner demo">${I.info}<span>Version de test : données fictives, rien n’est envoyé.</span><button class="btn sm" type="button" data-avis>Donner mon avis</button></div>`
      : `<div class="banner demo">${I.info}<span>Données de démonstration : tes saisies restent sur cet appareil.</span><a class="btn sm" href="#/reglages">Connecter l’équipe</a></div>`;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (home && ios && !standalone && location.protocol === 'https:' && !M.lsGet('a2hsDone', false)) h += `<div class="banner demo">${I.share}<span>Pour l’avoir comme une appli : bouton <b>Partager</b> de Safari, puis <b>Sur l’écran d’accueil</b>.</span><button class="btn sm" type="button" data-a2hs>OK</button></div>`;
    if (S.cfg && S.cfg.mode === 'live' && !S.sync.online) h += `<div class="banner">${I.wifiOff}<span>Hors ligne. Tes saisies sont gardées et partiront dès le retour du réseau.</span></div>`;
    if (S.cfg && S.cfg.mode === 'live' && S.sync.auth) h += `<div class="banner" style="background:var(--bad-soft)">${I.info}<span>Ton code d’accès n’est plus reconnu par le serveur. Demande un nouveau lien à l’administrateur, puis ouvre-le.</span><a class="btn sm" href="#/reglages">Réglages</a></div>`;
    if (S.rejected.length) h += `<div class="banner" style="background:var(--bad-soft)">${I.info}<span>${S.rejected.length} saisie(s) refusée(s) par le serveur.</span><a class="btn sm" href="#/reglages">Voir</a></div>`;
    return h;
  };
  M.banners = banners;
  const daysOpts = [[7, '7 j'], [14, '14 j'], [30, '30 j'], [90, '90 j']];
  const winDays = d => d || M.P().fenetre || 14;

  /* ============================================================ ACCUEIL */
  V.accueil = (root) => {
    const dep = M.myDep(), P = M.P(), today = M.today(), monday = M.mondayOf(today);
    const live = S.data.prix.filter(r => !Number(r.supprime));
    const week = {}; M.DEPS.forEach(d => week[d] = 0);
    live.forEach(r => { if (r.date >= monday && r.date <= today && week[r.depot] != null) week[r.depot]++; });
    const maxW = Math.max(1, ...Object.values(week));
    let oppDays = winDays(); let opps = M.opportunities(dep).slice(0, 4);
    if (!opps.length) { const o90 = M.opportunities(dep, { days: 90 }); if (o90.length) { opps = o90.slice(0, 4); oppDays = 90; } }
    const since = M.addDays(today, -winDays());
    const todo = [];
    S.ix.vol.forEach((v, pid) => {
      const mine = v[dep]; if (!mine || !S.ix.prod.has(pid)) return;
      const rows = S.ix.byProd.get(pid) || [];
      if (rows.some(r => r.depot === dep && r.date >= since)) return;
      const last = rows.find(r => r.depot === dep);
      const lref = last && M.rowRef(last);
      todo.push({ pid, w: M.num(mine.achats_eur_semaine) || (M.num(mine.quantite_semaine) || 0) * (lref ? lref.v : 1), last });
    });
    todo.sort((a, b) => b.w - a.w);
    const newer = (a, b) => (a.date > b.date || (a.date === b.date && String(a.cree || a.maj) > String(b.cree || b.maj)));
    const feed = [];
    live.forEach(r => { if (feed.length < 7) { feed.push(r); feed.sort((a, b) => newer(a, b) ? -1 : 1); } else if (newer(r, feed[6])) { feed[6] = r; feed.sort((a, b) => newer(a, b) ? -1 : 1); } });
    const hour = new Date().getHours();
    const hi = hour < 5 ? 'Bonsoir' : hour < 18 ? 'Bonjour' : 'Bonsoir';
    root.innerHTML = `${banners(true)}
      <div class="hello"><div><h1>${hi}${S.cfg.buyer ? ' ' + esc(S.cfg.buyer) : ''}</h1>
        <p class="muted" style="margin-top:6px">${M.depFull(dep)} <span class="faint">${esc(M.DEPCITY[dep])}</span>, ${esc(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))}</p></div>
        ${M.canWrite() ? `<a class="btn primary big" href="#/saisir">${I.plus}Saisir un prix</a>` : ''}</div>
      ${window.__mercDemoFile && !M.lsGet('tourDone', false) ? tourH() : ''}
      <div class="section"><div class="sh"><h2>Prix saisis cette semaine</h2><a href="#/saisies">Historique</a></div>
        <div class="statgrid">${M.DEPS.map(d => `<div class="stat c-${d}"><div class="v">${week[d]}</div><div class="l">${M.dep(d)} ${d === dep ? '<span class="faint">(toi)</span>' : ''}</div><div class="bar"><i style="width:${Math.round(week[d] / maxW * 100)}%;background:var(--c)"></i></div></div>`).join('')}</div></div>
      <div class="grid2 wide-left">
        <div class="section"><div class="sh"><h2>Moins cher ailleurs, pour ${esc(M.DEPN[dep])}</h2><a href="#/optimiser">Tout voir</a></div>${oppDays !== winDays() ? `<p class="small muted" style="margin:-4px 2px 8px">Aucun prix récent : calcul sur les prix des 90 derniers jours.</p>` : ''}
          <div class="panel flush">${opps.length ? opps.map(o => `<a class="deal" href="#/produit/${encodeURIComponent(o.pid)}">
              <span class="t">${esc(o.prod.nom)}</span>
              <span class="s">${M.dep(o.src)} ${M.isOffer(o.srcRow) ? 'proposé ' : ''}${M.px(o.srcV)} + transport ${M.px(o.tr)} = <b>${M.px(o.landed)} ${esc(M.UNITS[o.basis])}</b> rendu à ${esc(M.jplus(o.delai))}, contre ${M.px(o.locV)} chez toi</span>
              <span class="g"><span class="badge good">${M.pct(-o.g)}</span>${isFinite(o.gainWeek) ? `<div class="small muted" style="margin-top:4px">≈ ${M.eur(o.gainWeek)} / sem.</div>` : ''}</span></a>`).join('')
            : `<div class="empty"><h2 class="h3">Rien de moins cher pour l’instant</h2><p>Dès que les autres dépôts saisissent leurs prix, les bonnes affaires apparaissent ici.</p></div>`}</div></div>
        <div class="section"><div class="sh"><h2>À mettre à jour</h2></div>
          <div class="panel flush">${todo.length ? todo.slice(0, 6).map(t => `<a class="li" href="#/saisir?p=${encodeURIComponent(t.pid)}"><div class="main"><div class="t">${esc(prodName(t.pid))}</div>
              <div class="s">${t.last ? 'Dernier prix ' + esc(M.ago(t.last.date)) : 'Jamais saisi chez toi'}</div></div><span class="btn sm">${I.plus}Saisir</span></a>`).join('')
            : `<div class="empty"><h2 class="h3">Tout est à jour</h2><p>Tes produits principaux ont un prix récent.</p></div>`}</div></div>
      </div>
      <div class="section"><div class="sh"><h2>Derniers prix saisis</h2><a href="#/comparer">Comparer</a></div>
        <div class="panel flush">${feed.length ? feed.map(r => { const rf = M.rowRef(r); return `<a class="li" href="#/produit/${encodeURIComponent(r.produit_id)}">${M.dep(r.depot)}<div class="main"><div class="t">${esc(r.produit)}</div><div class="s">${esc(r.fournisseur || 'Fournisseur non précisé')}${r.origine ? ', ' + esc(r.origine) : ''}, ${esc(M.ago(r.date))}</div></div><div class="r">${rf ? M.priceV(rf.v, rf.u) : ''}</div></a>`; }).join('')
          : `<div class="empty"><h2 class="h3">Aucun prix pour l’instant</h2><p>Commence par saisir le prix d’un produit acheté aujourd’hui.</p>${M.canWrite() ? '<a class="btn primary" href="#/saisir">Saisir un prix</a>' : ''}</div>`}</div></div>`;
  };

  function tourH() {
    const steps = [
      ['#/saisir', 'Saisir un prix', 'Achat ou proposition fournisseur : choisis un produit, puis un fournisseur parmi ceux qui le proposent. Livraison, stock et prix de vente en une case chacun.'],
      ['#/comparer', 'Comparer les dépôts', 'Le dernier prix de chaque dépôt, le meilleur en jaune, l’écart entre dépôts.'],
      ['#/produit/' + encodeURIComponent((Array.from(S.ix.prod.keys())[0]) || ''), 'Ouvrir une fiche produit', 'Toutes les offres par fournisseur, rendues chez toi avec le délai de transfert, et l’évolution des prix.'],
      ['#/optimiser', 'Optimiser les achats', 'Où acheter moins cher, coche des produits, puis l’onglet Navette : palettes, gain net, rotations.'],
      ['#/optimiser?sim=1', 'Simuler une navette', 'Change les rotations et les palettes : coût par palette, chauffeurs, comparaison avec le marché.'],
      ['#/reglages', 'Essayer le mode administrateur', 'Paramètres, palettisation et accès des acheteurs sont protégés par un mot de passe (en démo : demo). Invite un acheteur, désactive un accès, regarde le journal.']
    ];
    return `<div class="section"><div class="sh"><h2>Que tester ?</h2><button class="linkbtn" type="button" data-tourdone>Masquer</button></div>
      <div class="panel flush"><ol class="list" style="counter-reset:t">${steps.map(([h, t, s], i) => `<li><a class="li" href="${h}"><span class="tour-n num">${i + 1}</span><div class="main"><div class="t">${esc(t)}</div><div class="s" style="white-space:normal">${esc(s)}</div></div>${I.chev}</a></li>`).join('')}
      <li><button class="li" type="button" data-avis><span class="tour-n num">${steps.length + 1}</span><div class="main"><div class="t">Noter tes remarques</div><div class="s" style="white-space:normal">Ce qui te plaît, ce qui manque, ce qu’il faut changer : envoie-les par mail en un clic.</div></div>${I.chev}</button></li></ol></div></div>`;
  }
  M.avis = () => {
    const txt = M.lsGet('avis', '');
    const s = M.sheet(`<p class="muted small" style="margin-bottom:12px">Note au fil du test ce qui te plaît, ce qui manque ou ce qu’il faudrait changer. Tes notes restent sur cet ordinateur tant que tu ne les envoies pas.</p>
      <div class="field"><label for="avis-t">Tes remarques</label><textarea class="input" id="avis-t" style="min-height:200px" placeholder="ex. ajouter le prix de vente, voir les prix par fournisseur, alerte quand un prix baisse…">${esc(txt)}</textarea></div>
      <div class="two"><button class="btn" type="button" id="avis-c">${I.copy}Copier</button><a class="btn primary" id="avis-m" href="#">${I.share}Envoyer par mail</a></div>`, { title: 'Ton avis sur Mercuriale' });
    const ta = $('#avis-t', s.el), mail = $('#avis-m', s.el);
    const upd = () => { M.lsSet('avis', ta.value); const body = 'Remarques sur Mercuriale (version de test) :\n\n' + ta.value; mail.href = 'mailto:?subject=' + encodeURIComponent('Mercuriale : mes remarques') + '&body=' + encodeURIComponent(body); };
    ta.addEventListener('input', upd); upd();
    $('#avis-c', s.el).onclick = async () => { try { await navigator.clipboard.writeText(ta.value); M.toast('Remarques copiées'); } catch (e) { ta.select(); M.toast('Sélectionne le texte et copie-le'); } };
  };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-avis]')) { e.preventDefault(); M.avis(); }
    if (e.target.closest('[data-tourdone]')) { M.lsSet('tourDone', true); M.emit('route'); }
    if (e.target.closest('[data-a2hs]')) { M.lsSet('a2hsDone', true); M.emit('route'); }
  });

  /* ============================================================ SAISIR */
  V.saisir = (root, q) => {
    if (!M.canWrite()) {
      root.innerHTML = M.isAdmin() ? `<div class="empty"><h2 class="h3">Mode administrateur verrouillé</h2><p>Ton code administrateur n’est rattaché à aucun dépôt : déverrouille le mode administrateur pour saisir un prix.</p><button class="btn primary" type="button" id="unl">${I.edit}Déverrouiller</button></div>`
        : `<div class="empty"><h2 class="h3">Lecture seule</h2><p>Ton code d’accès permet de consulter les prix, pas d’en saisir.</p></div>`;
      const u = $('#unl', root); if (u) u.onclick = () => M.unlockSheet(() => M.emit('route')); return;
    }
    const edit = q.id ? S.data.prix.find(r => r.id === q.id) : null;
    if (q.id && !edit) { root.innerHTML = `<div class="empty"><h2 class="h3">Prix introuvable</h2><a class="btn" href="#/saisies">Retour à l’historique</a></div>`; return; }
    if (edit && !M.canEditDep(edit.depot)) { root.innerHTML = `<div class="empty"><h2 class="h3">Ce prix appartient au dépôt ${esc(edit.depot)}</h2><p>Seul ce dépôt (ou l’administrateur) peut le modifier.</p></div>`; return; }
    const keep = M.lsGet('keep', { on: true, fournisseur: '', date: '' });
    const F = edit ? Object.assign({}, edit) : {
      id: M.uid(), date: (keep.on && keep.date === M.today()) ? keep.date : M.today(), depot: M.ownDep() || M.myDep(), acheteur: S.cfg.buyer || '',
      produit_id: '', produit: '', origine: 'France', categorie_qualite: '', calibre: '', fournisseur: keep.on ? keep.fournisseur : '', unite: 'kg', prix: '', poids_colis: '',
      quantite: '', quantite_unite: 'colis', validite: '', commentaire: '', supprime: 0,
      type: 'achat', livraison: '', stock: '', stock_unite: 'colis', prix_vente: ''
    };
    if (!F.type) F.type = 'achat'; if (!F.stock_unite) F.stock_unite = 'colis';
    // brouillon : une saisie interrompue (appel, autre écran) est retrouvée pendant 2 heures
    const dr = M.lsGet('draft', null);
    let restored = false;
    if (!edit && !q.p && dr && dr.F && dr.dep === M.myDep() && Date.now() - dr.t < 2 * 3600e3 && (dr.F.produit_id || dr.F.prix)) { Object.assign(F, dr.F, { id: M.uid() }); restored = true; }
    const saveDraft = () => { if (!edit) M.lsSet('draft', { t: Date.now(), dep: M.myDep(), F: Object.assign({}, F) }); };
    if (!edit && q.p && S.ix.prod.has(q.p)) pickProduct(S.ix.prod.get(q.p), true);
    let more = !!(edit && (edit.calibre || edit.quantite || edit.validite || edit.commentaire));

    function pickProduct(p, silent) {
      F.produit_id = String(p.id); F.produit = p.nom;
      F.unite = p.unite === 'piece' || p.unite === 'botte' ? p.unite : (F.unite === 'colis' ? 'colis' : 'kg');
      if (M.num(p.poids_colis) > 0) F.poids_colis = p.poids_colis;
      const last = (S.ix.byProd.get(String(p.id)) || []).find(r => r.depot === F.depot);
      if (last && !edit) { if (last.origine) F.origine = last.origine; if (last.unite) F.unite = last.unite; if (last.categorie_qualite) F.categorie_qualite = last.categorie_qualite; if (!F.fournisseur && last.fournisseur) F.fournisseur = last.fournisseur; }
      if (!silent) draw();
    }
    const recents = M.lsGet('recents', []).filter(id => S.ix.prod.has(id)).slice(0, 8);
    const favs = M.lsGet('favs', []).filter(id => S.ix.prod.has(id));
    const draw = () => {
      const prod = F.produit_id ? S.ix.prod.get(F.produit_id) : null;
      const quick = Array.from(new Set(favs.concat(recents))).slice(0, 10);
      root.innerHTML = `${banners()}
        <div class="page-head"><div><h1>${edit ? 'Modifier le prix' : 'Saisir un prix'}</h1><p class="sub">${M.depFull(F.depot)} <span class="faint">${esc(M.dShort(F.date))}</span></p></div>
          ${edit ? `<button class="btn danger sm" type="button" id="del">${I.trash}Supprimer</button>` : ''}</div>
        <div class="form-layout">
          <form class="panel" id="pf" autocomplete="off" novalidate>
            <div class="field">${segH('ptype', [['achat', 'Achat'], ['offre', 'Proposition fournisseur']], F.type)}
              <span class="hint">${F.type === 'offre' ? 'Prix proposé par un fournisseur, pas encore acheté.' : 'Prix d’un achat passé.'}</span></div>
            <div class="field"><span class="lbl">Produit</span>
              ${prod ? `<div class="picked"><div class="t">${esc(prod.nom)}<div class="f">${esc([prod.famille, prod.categorie].filter(Boolean).join(', '))}</div></div><button type="button" class="btn sm" id="chg">Changer</button></div>`
                : `<div id="pcombo"></div>${quick.length ? `<div class="chips" style="margin-top:8px">${quick.map(id => `<button type="button" class="chip" data-pq="${esc(id)}">${favs.includes(id) ? I.star.replace('class="i"', 'class="i s"') : ''}${esc(prodName(id))}</button>`).join('')}</div>` : ''}`}
            </div>
            <div class="field"><label for="fsup">Fournisseur</label><div id="scombo"></div>${prod ? supSugH(prod) : ''}</div>
            <div class="field"><label for="fprix">${F.type === 'offre' ? 'Prix proposé' : 'Prix d’achat'}</label>
              <div class="row wrap"><input class="input price grow" id="fprix" inputmode="decimal" placeholder="0,00" value="${esc(F.prix === '' ? '' : String(F.prix).replace('.', ','))}" style="max-width:220px">
              ${segH('unite', [['kg', '€/kg'], ['colis', '€/colis'], ['piece', '€/pièce'], ['botte', '€/botte']], F.unite)}</div></div>
            ${F.unite === 'colis' ? `<div class="field"><label for="fpoids">Poids du colis (kg)</label><input class="input" id="fpoids" inputmode="decimal" placeholder="ex. 6" value="${esc(F.poids_colis === '' ? '' : String(F.poids_colis).replace('.', ','))}" style="max-width:220px"><span class="hint">Sert à comparer en €/kg avec les autres dépôts.</span></div>` : ''}
            <div class="two">
              <div class="field"><label for="fpv">Prix de vente <span class="faint small">${esc(M.UNITS[F.unite])}</span></label><input class="input" id="fpv" inputmode="decimal" placeholder="optionnel" value="${esc(F.prix_vente === '' || F.prix_vente == null ? '' : String(F.prix_vente).replace('.', ','))}"><span class="hint" id="marge"></span></div>
              <div class="field"><label for="fstock">Stock</label><div class="row"><input class="input grow" id="fstock" inputmode="decimal" placeholder="optionnel" value="${esc(F.stock === '' || F.stock == null ? '' : String(F.stock).replace('.', ','))}"><select class="input" id="fstu" style="width:auto" aria-label="Unité du stock">${[['colis', 'colis'], ['kg', 'kg'], ['palette', 'pal.']].map(([x, l]) => `<option value="${x}"${F.stock_unite === x ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>
            </div>
            <div class="field"><span class="lbl">${F.type === 'offre' ? 'Livraison possible le' : 'Livraison au dépôt'}</span>
              <div class="chips" id="livs">${[[0, 'Aujourd’hui'], [1, 'Demain'], [2, 'Après-demain']].map(([k, l]) => { const d = M.addDays(F.date || M.today(), k); return `<button type="button" class="chip" data-liv="${d}" aria-pressed="${F.livraison === d}">${l} <span class="faint small">${esc(M.dNum(d))}</span></button>`; }).join('')}
              <input class="input" type="date" id="flivr" value="${esc(F.livraison || '')}" style="width:auto;min-height:38px;padding:4px 10px" aria-label="Autre date de livraison"></div>
              <span class="hint">Quand la marchandise arrive au dépôt ${esc(F.depot)}.</span></div>
            ${F.type === 'offre' ? `<div class="field"><label for="fval">Proposition valable jusqu’au</label><input class="input" type="date" id="fval" value="${esc(F.validite)}" style="max-width:220px"><span class="hint">Après cette date, la proposition n’est plus comptée dans les comparaisons.</span></div>` : ''}
            <div class="field"><span class="lbl">Origine</span><div class="chips" id="origs">${M.ORIGINS.map(o => `<button type="button" class="chip" aria-pressed="${F.origine === o}" data-o="${esc(o)}">${esc(o)}</button>`).join('')}
              <button type="button" class="chip" aria-pressed="${F.origine && !M.ORIGINS.includes(F.origine)}" data-o="__autre">${F.origine && !M.ORIGINS.includes(F.origine) ? esc(F.origine) : 'Autre…'}</button></div></div>
            <div class="field"><span class="lbl">Catégorie</span>${segH('qual', [['', 'Non précisée'], ['Extra', 'Extra'], ['Cat. I', 'Cat. I'], ['Cat. II', 'Cat. II']], F.categorie_qualite)}</div>
            <button type="button" class="linkbtn more-toggle" id="more" aria-expanded="${more}">${more ? 'Moins de détails' : 'Plus de détails : calibre, quantité, date, commentaire'}</button>
            <div id="morebox" ${more ? '' : 'hidden'} style="margin-top:14px">
              <div class="two"><div class="field"><label for="fcal">Calibre</label><input class="input" id="fcal" value="${esc(F.calibre)}" placeholder="ex. 60/80"></div>
                <div class="field"><label for="fdate">Date d’achat</label><input class="input" type="date" id="fdate" value="${esc(F.date)}" max="${M.addDays(M.today(), 1)}"></div></div>
              <div class="two"><div class="field"><label for="fqte">Quantité achetée</label><input class="input" id="fqte" inputmode="decimal" value="${esc(F.quantite)}" placeholder="optionnel"></div>
                <div class="field"><label for="fqu">Unité</label><select class="input" id="fqu">${[['colis', 'colis'], ['kg', 'kg'], ['palette', 'palettes'], ['piece', 'pièces'], ['botte', 'bottes']].map(([v, l]) => `<option value="${v}"${F.quantite_unite === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>
              ${F.type === 'offre' ? '' : `<div class="field"><label for="fval">Prix valable jusqu’au</label><input class="input" type="date" id="fval" value="${esc(F.validite)}" style="max-width:220px"></div>`}
              ${M.adminOn() ? `<div class="field"><span class="lbl">Dépôt <span class="badge leaf">administrateur</span></span>${segH('dep', M.DEPS.map(d => [d, d]), F.depot)}</div>` : ''}
              <div class="field"><label for="fcom">Commentaire</label><textarea class="input" id="fcom" placeholder="ex. promo, qualité, conditions">${esc(F.commentaire)}</textarea></div>
            </div>
            <div class="formbar">
              <button class="btn primary big block" type="submit" id="save">${I.check}${edit ? 'Enregistrer les modifications' : 'Enregistrer le prix'}</button>
            </div>
            ${edit ? '' : `<label class="check small keepline"><input type="checkbox" id="keep" ${keep.on ? 'checked' : ''}>Garder le fournisseur et la date pour le prix suivant</label>`}
          </form>
          <aside class="live" id="live" aria-live="polite"></aside>
        </div>`;
      bind(prod);
      live();
      saveDraft();
    };
    const readForm = () => {
      const v = id => { const e = $('#' + id, root); return e ? e.value : undefined; };
      if (v('fprix') !== undefined) F.prix = v('fprix');
      if (v('fpoids') !== undefined) F.poids_colis = v('fpoids');
      if (v('fcal') !== undefined) F.calibre = v('fcal');
      if (v('fdate') !== undefined && v('fdate')) F.date = v('fdate');
      if (v('fqte') !== undefined) F.quantite = v('fqte');
      if (v('fqu') !== undefined) F.quantite_unite = v('fqu');
      if (v('fval') !== undefined) F.validite = v('fval');
      if (v('fcom') !== undefined) F.commentaire = v('fcom');
      if (v('fpv') !== undefined) F.prix_vente = v('fpv');
      if (v('fstock') !== undefined) F.stock = v('fstock');
      if (v('fstu') !== undefined) F.stock_unite = v('fstu');
      if (v('flivr') !== undefined) F.livraison = v('flivr');
      const sc = $('#scombo input', root); if (sc) F.fournisseur = sc.value.trim();
    };
    function supSugH(prod) {
      const L = M.suppliersFor(prod.id, F.depot, 30).filter(x => M.norm(x.r.fournisseur) !== M.norm(F.fournisseur || '')).slice(0, 6);
      if (!L.length) return '';
      return `<div class="supsug"><span class="small muted">Ils proposent ce produit (30 derniers jours) :</span>${L.map(x => `<button type="button" class="supb" data-sup="${esc(x.r.fournisseur)}">
        <span class="sn">${esc(x.r.fournisseur)}</span><span class="sp num">${M.px(x.v)} <span class="u">${esc(M.UNITS[x.u])}</span></span>
        <span class="sm">${M.dep(x.r.depot)}${M.isOffer(x.r) ? ' <span class="badge">proposition</span>' : ''} ${esc(M.ago(x.r.date))}${x.delai ? `, ${esc(M.jplus(x.delai))} jusqu’à ${esc(F.depot)}` : ''}</span></button>`).join('')}</div>`;
    }
    const plaus = (rf) => {
      if (!rf || !F.produit_id) return null;
      const since = M.addDays(M.today(), -45);
      const vals = (S.ix.byProd.get(F.produit_id) || []).filter(r => r.date >= since && r.id !== F.id).map(M.rowRef).filter(x => x && x.u === rf.u).map(x => x.v).sort((a, b) => a - b);
      if (vals.length < 3) return null;
      const med = vals[Math.floor(vals.length / 2)];
      const ratio = rf.v / med;
      return (ratio < 0.5 || ratio > 2) ? { med, ratio } : null;
    };
    const live = () => {
      const box = $('#live', root); if (!box) return;
      readForm(); saveDraft();
      const prod = F.produit_id ? S.ix.prod.get(F.produit_id) : null;
      if (!prod) { box.innerHTML = `<div class="panel"><h2 class="h3">Comparaison immédiate</h2><p class="muted">Choisis un produit : tu verras tout de suite les prix des trois autres dépôts et le coût rendu chez toi.</p></div>`; return; }
      const rf = M.refOf({ prix: M.num(F.prix), unite: F.unite, poids_colis: M.num(F.poids_colis) }, prod);
      const c = M.compare(F.produit_id, 30);
      const others = c ? M.DEPS.filter(d => d !== F.depot && c.per[d] && c.per[d].v > 0) : [];
      let verdict = '';
      if (rf && c && c.basis === rf.u && others.length) {
        const landed = others.map(d => ({ d, v: c.per[d].v + M.transportUnit(F.produit_id, d, F.depot, c.basis) })).sort((a, b) => a.v - b.v);
        const b = landed[0];
        if (plaus(rf)) verdict = '';
        else if (rf.v <= Math.min(...others.map(d => c.per[d].v))) verdict = `<p class="verdict" style="color:var(--good)">Meilleur prix de tous les dépôts qui l’ont saisi.</p>`;
        else if (b.v < rf.v) verdict = `<p class="verdict" style="color:var(--bad)">Rendu depuis ${esc(M.DEPN[b.d])}, ce produit reviendrait à ${M.px(b.v)} ${esc(M.UNITS[c.basis])}, soit ${M.pct(b.v / rf.v - 1)}.</p>`;
        else verdict = `<p class="verdict">Moins cher ailleurs, mais pas une fois le transport compté.</p>`;
      }
      box.innerHTML = `<div class="panel">
        <div class="row" style="justify-content:space-between;align-items:flex-start"><h2 class="h3">${esc(prod.nom)}</h2><a class="linkbtn" href="#/produit/${encodeURIComponent(prod.id)}">Fiche</a></div>
        <div>${rf ? M.priceTag(rf.v, rf.u, 'xl') : `<span class="tagp xl empty" aria-label="Prix pas encore saisi">—<span class="u">${esc(M.UNITS[F.unite])}</span></span>`}
          ${rf && F.unite === 'colis' && rf.u === 'kg' ? `<p class="small muted" style="margin-top:6px">${M.px(M.num(F.prix))} € le colis de ${M.n1(M.num(F.poids_colis) || M.num(prod.poids_colis))} kg</p>` : ''}</div>
        ${(() => { const pl = plaus(rf); return pl ? `<div class="callout warn"><b>Prix ${pl.ratio < 1 ? 'très bas' : 'très haut'} : vérifie l’unité.</b> Les saisies récentes tournent autour de ${M.px(pl.med)} ${esc(M.UNITS[rf.u])}${F.unite === 'colis' ? ' : as-tu tapé le prix au kilo au lieu du prix du colis ?' : F.unite === 'kg' ? ' : as-tu tapé le prix du colis au lieu du prix au kilo ?' : '.'}</div>` : ''; })()}
        ${verdict}
        <div>${others.length ? others.map(d => { const x = c.per[d]; const tr = M.transportUnit(F.produit_id, d, F.depot, c.basis); const dl = M.transferDays(d, F.depot); return `<div class="cmpline">${M.dep(d)}<div><span class="num" style="font-size:19px;font-weight:600">${M.px(x.v)}</span> <span class="small faint">${esc(M.UNITS[c.basis])}, ${x.offer ? 'proposition, ' : ''}${esc(M.ago(x.date))}</span><div class="small muted">rendu chez toi ${M.px(x.v + tr)}, délai ${esc(M.jplus(dl))}</div></div>${rf && rf.u === c.basis ? M.deltaH(rf.v / (x.v + tr) - 1) : ''}</div>`; }).join('')
          : `<p class="muted small">Aucun autre dépôt n’a saisi ce produit depuis 30 jours.</p>`}</div>
        ${rf && c && c.basis !== rf.u ? `<p class="small muted">Les autres dépôts l’achètent en ${esc(M.UNITS[c.basis])} : indique le poids du colis pour comparer.</p>` : ''}
        ${(() => { const L = rf ? M.suppliersFor(F.produit_id, F.depot, 30, rf.u).filter(x => M.norm(x.r.fournisseur) !== M.norm(F.fournisseur || '')).slice(0, 4) : []; if (!L.length) return '';
          return `<div><h2 class="h3" style="margin-bottom:4px">Autres fournisseurs</h2>${L.map(x => `<div class="cmpline">${M.dep(x.r.depot)}<div><b>${esc(x.r.fournisseur)}</b>${M.isOffer(x.r) ? ' <span class="badge">proposition</span>' : ''}<div class="small muted">${M.px(x.v)} ${esc(M.UNITS[x.u])}, ${esc(M.ago(x.r.date))}${x.r.depot !== F.depot ? `, rendu ${M.px(x.landed)} à ${esc(M.jplus(x.delai))}` : ''}</div></div>${M.deltaH(rf.v / x.landed - 1)}</div>`).join('')}</div>`; })()}
      </div>`;
      const mg = $('#marge', root); if (mg) { const pv = M.num(F.prix_vente), pa = M.num(F.prix); mg.textContent = pv > 0 && pa > 0 ? `Marge ${M.pct((pv - pa) / pv)} du prix de vente, coefficient ${M.n2(pv / pa)}` : ''; }
    };
    const bind = (prod) => {
      if (!prod) {
        const items = () => Array.from(S.ix.prod.values()).map(p => ({ id: p.id, label: p.nom, sub: p.famille || p.categorie || '', score: (S.ix.byProd.get(String(p.id)) || []).length }));
        const cb = M.combo($('#pcombo', root), { id: 'fprod', label: 'Produit', placeholder: 'Rechercher : carotte, tomate grappe…', items, onPick: it => pickProduct(S.ix.prod.get(String(it.id))), onNew: txt => newProduct(txt), newLabel: t => 'Nouveau produit : « ' + t + ' »' });
        if (!edit) setTimeout(() => cb.input.focus(), 30);
        $$('[data-pq]', root).forEach(b => b.onclick = () => pickProduct(S.ix.prod.get(b.dataset.pq)));
      } else { $('#chg', root).onclick = () => { readForm(); F.produit_id = ''; F.produit = ''; draw(); }; }
      const supItems = () => S.data.fournisseurs.filter(f => String(f.actif) !== '0').map(f => { const mine = String(f.depots || '').split(',').includes(F.depot); return { id: f.id, label: f.nom, sub: mine ? 'ton dépôt' : (f.depots || ''), score: mine ? 1 : 0 }; }).sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
      const sc = M.combo($('#scombo', root), { id: 'fsup', label: 'Fournisseur', placeholder: 'Nom du fournisseur', items: supItems, onPick: it => { sc.input.value = it.label; F.fournisseur = it.label; live(); }, emptyCount: 8 });
      sc.input.value = F.fournisseur || '';
      sc.input.addEventListener('input', () => { F.fournisseur = sc.input.value; saveDraft(); });
      bindSeg(root, 'unite', v => { readForm(); F.unite = v; draw(); setTimeout(() => { const e = $('#fprix', root); if (e) e.focus(); }, 0); });
      bindSeg(root, 'qual', v => { F.categorie_qualite = v; });
      bindSeg(root, 'dep', v => { readForm(); F.depot = v; draw(); });
      $('#origs', root).addEventListener('click', e => {
        const b = e.target.closest('[data-o]'); if (!b) return;
        if (b.dataset.o === '__autre') {
          const s = M.sheet(`<div class="field"><label for="oth">Pays ou région d’origine</label><input class="input" id="oth" value="${esc(M.ORIGINS.includes(F.origine) ? '' : F.origine)}" placeholder="ex. Pérou"></div><button class="btn primary block" id="ok" type="button">Valider</button>`, { title: 'Autre origine' });
          const done = () => { const v = $('#oth', s.el).value.trim(); if (v) { readForm(); F.origine = v; s.close(); draw(); } };
          $('#ok', s.el).onclick = done; $('#oth', s.el).addEventListener('keydown', e2 => { if (e2.key === 'Enter') done(); });
          return;
        }
        F.origine = b.dataset.o; $$('[data-o]', root).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      });
      $('#more', root).onclick = () => { readForm(); more = !more; draw(); };
      ['fprix', 'fpoids', 'fpv'].forEach(id => { const e = $('#' + id, root); if (e) e.addEventListener('input', live); });
      bindSeg(root, 'ptype', val => { readForm(); F.type = val; draw(); });
      $$('[data-sup]', root).forEach(b => b.onclick = () => { readForm(); F.fournisseur = b.dataset.sup; draw(); });
      $('#livs', root).addEventListener('click', e => { const b = e.target.closest('[data-liv]'); if (!b) return; readForm(); F.livraison = F.livraison === b.dataset.liv ? '' : b.dataset.liv; draw(); });
      const fl = $('#flivr', root); if (fl) fl.addEventListener('change', () => { readForm(); draw(); });
      const del = $('#del', root);
      if (del) del.onclick = async () => { if (await M.confirm('Supprimer ce prix ?', 'Il disparaîtra de la comparaison pour tous les dépôts.', 'Supprimer', true)) { await M.deletePrice(F.id); M.toast('Prix supprimé'); location.hash = '#/saisies'; } };
      $('#pf', root).addEventListener('submit', async e => {
        e.preventDefault(); readForm();
        const prodx = F.produit_id ? S.ix.prod.get(F.produit_id) : null;
        if (!prodx) { M.toast('Choisis d’abord un produit', 'bad'); const i = $('#fprod', root); if (i) i.focus(); return; }
        const p = M.num(F.prix);
        if (!(p > 0)) { M.toast('Indique un prix supérieur à 0', 'bad'); $('#fprix', root).focus(); return; }
        const rf = M.refOf({ prix: p, unite: F.unite, poids_colis: M.num(F.poids_colis) }, prodx);
        const pl = plaus(rf);
        if (pl || p > 500) { if (!(await M.confirm('Prix inhabituel', `${M.px(p)} ${M.UNITS[F.unite]}${rf.u !== F.unite ? ' (soit ' + M.px(rf.v) + ' ' + M.UNITS[rf.u] + ')' : ''}, alors que les saisies récentes tournent autour de ${pl ? M.px(pl.med) + ' ' + M.UNITS[rf.u] : 'beaucoup moins'}. C’est bien ça ?`, 'Oui, enregistrer'))) return; }
        const row = Object.assign({}, F, { prix: p, poids_colis: M.num(F.poids_colis) > 0 ? M.num(F.poids_colis) : '', prix_ref: Math.round(rf.v * 10000) / 10000, unite_ref: rf.u,
          quantite: M.num(F.quantite) > 0 ? M.num(F.quantite) : '', acheteur: edit ? F.acheteur : (S.cfg.buyer || ''), produit: prodx.nom, supprime: 0,
          type: F.type === 'offre' ? 'offre' : 'achat', livraison: F.livraison || '', stock: M.num(F.stock) >= 0 ? M.num(F.stock) : '', stock_unite: F.stock_unite || 'colis', prix_vente: M.num(F.prix_vente) > 0 ? M.num(F.prix_vente) : '' });
        await M.savePrice(row); M.lsSet('draft', null);
        if (row.fournisseur) await M.ensureSupplier(row.fournisseur, row.depot);
        const rec = [row.produit_id].concat(M.lsGet('recents', []).filter(x => x !== row.produit_id)).slice(0, 12); M.lsSet('recents', rec);
        if (edit) { M.toast('Modifications enregistrées'); if (history.length > 1) history.back(); else location.hash = '#/saisies'; return; }
        const k = $('#keep', root); const on = k ? k.checked : true;
        M.lsSet('keep', { on, fournisseur: on ? row.fournisseur : '', date: row.date });
        M.toast(`${prodx.nom} : ${M.px(rf.v)} ${M.UNITS[rf.u]} ${row.type === 'offre' ? 'proposé, enregistré' : 'enregistré'}`, '', { label: 'Annuler', fn: async () => { await M.deletePrice(row.id); M.toast('Saisie annulée'); } });
        Object.assign(F, { id: M.uid(), produit_id: '', produit: '', prix: '', poids_colis: '', calibre: '', quantite: '', validite: '', commentaire: '', fournisseur: on ? row.fournisseur : '', date: on ? row.date : M.today(), prix_vente: '', stock: '', livraison: on ? row.livraison : '' });
        draw(); M.lsSet('draft', null); window.scrollTo(0, 0);
      });
    };
    const newProduct = (txt) => {
      const fams = Array.from(S.ix.fam.keys()).filter(Boolean).sort();
      let cat = 'Légumes', un = 'kg';
      const s = M.sheet(`<div class="field"><label for="np-n">Nom du produit</label><input class="input" id="np-n" value="${esc(txt)}"></div>
        <div class="field"><label for="np-f">Famille</label><input class="input" id="np-f" list="np-fl" placeholder="ex. Tomate"><datalist id="np-fl">${fams.map(f => `<option value="${esc(f)}">`).join('')}</datalist></div>
        <div class="field"><span class="lbl">Catégorie</span>${segH('npc', M.CATS.map(c => [c, c]), cat)}</div>
        <div class="field"><span class="lbl">Acheté surtout</span>${segH('npu', [['kg', 'au kilo'], ['piece', 'à la pièce'], ['botte', 'à la botte']], un)}</div>
        <div class="field"><label for="np-w">Poids habituel d’un colis (kg)</label><input class="input" id="np-w" inputmode="decimal" placeholder="optionnel"></div>
        <button class="btn primary block big" id="np-ok" type="button">Ajouter au catalogue</button>`, { title: 'Nouveau produit' });
      bindSeg(s.el, 'npc', v => cat = v); bindSeg(s.el, 'npu', v => un = v);
      $('#np-ok', s.el).onclick = async () => {
        const nom = $('#np-n', s.el).value.trim(); if (!nom) { M.toast('Indique un nom', 'bad'); return; }
        const ex = Array.from(S.ix.prod.values()).find(p => M.norm(p.nom) === M.norm(nom));
        if (ex) { s.close(); pickProduct(ex); return; }
        let id = M.slug(nom) || M.uid(); if (S.ix.prod.has(id)) id += '-' + M.uid().slice(-4);
        const p = { id, nom: nom.charAt(0).toUpperCase() + nom.slice(1), famille: $('#np-f', s.el).value.trim(), categorie: cat, unite: un, poids_colis: M.num($('#np-w', s.el).value) > 0 ? M.num($('#np-w', s.el).value) : '', pieces_colis: '', colis_palette: '', kg_palette: '', actif: 1, cree_par: S.cfg.buyer || M.myDep() };
        await M.saveProduct(p); s.close(); readForm(); pickProduct(S.ix.prod.get(id)); M.toast('Produit ajouté au catalogue');
      };
    };
    draw();
    if (restored) M.toast('Saisie en cours reprise', '', { label: 'Effacer', fn: () => { M.lsSet('draft', null); M.emit('route'); } });
  };

  /* ============================================================ COMPARER */
  V.comparer = (root) => {
    const U = M.ui.cmp; const dep = M.myDep();
    const days = winDays(U.days);
    const cats = [['', 'Tous']].concat(M.CATS.map(c => [c, c === 'Herbes aromatiques' ? 'Herbes' : c]));
    root.innerHTML = `${banners()}
      <div class="page-head"><div><h1>Comparer les dépôts</h1><p class="sub">Dernier prix saisi par chaque dépôt sur les ${days} derniers jours.</p></div></div>
      <div class="row wrap" style="gap:10px;margin-bottom:10px">
        <div class="grow" style="min-width:220px;position:relative"><input class="input" type="search" id="cq" enterkeyhint="search" placeholder="Rechercher un produit" value="${esc(U.q)}" aria-label="Rechercher un produit" aria-controls="cres"></div>
        ${segH('days', daysOpts, days)}
        <select class="input" id="csort" style="width:auto;min-height:44px" aria-label="Trier">${[['spread', 'Plus gros écarts'], ['recent', 'Prix les plus récents'], ['nom', 'Ordre alphabétique']].map(([v, l]) => `<option value="${v}"${U.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
      </div>
      <div class="row wrap" style="justify-content:space-between;margin-bottom:12px">
        <div class="chips">${cats.map(([v, l]) => `<button type="button" class="chip" data-cat="${esc(v)}" aria-pressed="${U.cat === v}">${esc(l)}</button>`).join('')}</div>
        <label class="check small"><input type="checkbox" id="cmine" ${U.mine ? 'checked' : ''}>Seulement les produits de ${esc(M.DEPN[dep])}</label>
      </div>
      <div id="cres" aria-live="polite"></div>`;
    const results = () => {
      const all = [];
      S.ix.prod.forEach((p, pid) => {
        if (U.cat && p.categorie !== U.cat) return;
        if (U.q && !M.norm(p.nom + ' ' + (p.famille || '')).includes(M.norm(U.q))) return;
        if (U.mine && !((S.ix.vol.get(pid) || {})[dep] || (S.ix.byProd.get(pid) || []).some(r => r.depot === dep))) return;
        const c = M.compare(pid, days); if (!c) return;
        all.push({ p, c });
      });
      const sorts = { spread: (a, b) => (b.c.ndeps > 1) - (a.c.ndeps > 1) || b.c.spread - a.c.spread, nom: (a, b) => a.p.nom.localeCompare(b.p.nom, 'fr'), recent: (a, b) => (b.c.last > a.c.last ? 1 : -1) };
      all.sort(sorts[U.sort] || sorts.spread);
      const multi = all.filter(x => x.c.ndeps > 1).length;
      const limit = M.ui.cmpLimit || 80;
      const box = $('#cres', root);
      box.innerHTML = `<p class="small muted" style="margin:0 2px 10px">${all.length} produit(s) avec un prix, dont ${multi} comparable(s) entre au moins deux dépôts.</p>
      ${all.length ? `<div class="panel flush">${all.slice(0, limit).map(({ p, c }) => `<a class="cmp-row" href="#/produit/${encodeURIComponent(p.id)}">
          <div class="cmp-head"><span class="t">${esc(p.nom)}</span><span class="small faint">${esc(p.famille || p.categorie || '')}, ${esc(M.UNITS[c.basis])}</span></div>
          <div class="cmp-cells">${M.DEPS.map(d => { const x = c.per[d]; return x ? `<div class="cell${d === c.best && c.ndeps > 1 ? ' best' : ''}${d === dep ? ' me' : ''}" title="${esc([x.row.fournisseur, x.row.origine, x.row.categorie_qualite].filter(Boolean).join(', '))}">${M.dep(d)}<div class="v">${M.px(x.v)}</div><div class="a">${originAbbr(x.row.origine)}${x.offer ? 'proposé, ' : ''}${esc(M.ago(x.date))}</div></div>` : `<div class="cell none${d === dep ? ' me' : ''}">${M.dep(d)}<div class="v">—</div><div class="a">pas de prix</div></div>`; }).join('')}</div>
          <div class="cmp-spread">${c.ndeps > 1 ? `<span class="badge ${c.spread > 1 ? 'bad' : c.spread > 0.15 ? 'warn' : ''}">écart ${M.pct(c.spread)}${c.spread > 1 ? ', à vérifier' : ''}</span>` : '<span class="small faint">un seul dépôt</span>'}</div></a>`).join('')}</div>
        ${all.length > limit ? `<div style="text-align:center;margin-top:14px"><button class="btn" id="cmore" type="button">Afficher ${Math.min(80, all.length - limit)} de plus</button></div>` : ''}
        <div class="cmp-legend"><span><span class="sw"></span>Meilleur prix</span><span><span class="sw me"></span>Ton dépôt</span><span>Écart = prix le plus haut ÷ le plus bas, sans transport. Origine indiquée quand ce n’est pas la France.</span></div>`
        : `<div class="panel"><div class="empty"><h2 class="h3">Aucun prix sur cette période</h2><p>${U.q || U.cat || U.mine ? 'Essaie d’enlever un filtre ou ' : ''}élargis la période pour retrouver l’historique.</p><button class="btn" id="widen" type="button">Voir les 90 derniers jours</button></div></div>`}`;
      const more = $('#cmore', box); if (more) more.onclick = () => { M.ui.cmpLimit = limit + 80; results(); };
      const w = $('#widen', box); if (w) w.onclick = () => { U.days = 90; U.q = ''; U.cat = ''; U.mine = false; re(); };
    };
    const re = () => { saveUi(); V.comparer(root); };
    let tq; $('#cq', root).addEventListener('input', e => { clearTimeout(tq); tq = setTimeout(() => { U.q = e.target.value; M.ui.cmpLimit = 80; saveUi(); results(); }, 200); });
    bindSeg(root, 'days', v => { U.days = +v; re(); });
    $('#csort', root).onchange = e => { U.sort = e.target.value; re(); };
    $$('[data-cat]', root).forEach(b => b.onclick = () => { U.cat = b.dataset.cat; re(); });
    $('#cmine', root).onchange = e => { U.mine = e.target.checked; re(); };
    results();
  };
  const ORIG_AB = { 'Espagne': 'ESP', 'Italie': 'ITA', 'Maroc': 'MAR', 'Pays-Bas': 'NL', 'Portugal': 'POR', 'Belgique': 'BEL', 'Allemagne': 'ALL' };
  const originAbbr = o => !o || o === 'France' ? '' : esc(ORIG_AB[o] || String(o).slice(0, 3).toUpperCase()) + ', ';

  /* ============================================================ FICHE PRODUIT */
  V.produit = (root, q, pid) => {
    const p = S.ix.prod.get(String(pid));
    if (!p) { root.innerHTML = `<div class="empty"><h2 class="h3">Produit introuvable</h2><a class="btn" href="#/comparer">Retour</a></div>`; return; }
    const dep = M.myDep(); const U = M.ui.prod; const mode = M.ui.opt.mode || 'full';
    const c = M.compare(pid, Math.max(30, winDays()));
    const rows = (S.ix.byProd.get(String(pid)) || []);
    const favs = M.lsGet('favs', []); const isFav = favs.includes(String(pid));
    let landed = '';
    if (c) {
      const loc = c.per[dep];
      landed = `<div class="tablewrap"><table class="t"><thead><tr><th>Acheté à</th><th class="n">Prix</th><th class="hs">Saisi</th><th class="hs">Fournisseur</th><th class="n hs">Transport</th><th class="n">Rendu ${esc(dep)}</th><th>Délai</th><th class="n">vs ${esc(dep)}</th></tr></thead><tbody>
        ${M.DEPS.filter(d => c.per[d]).map(d => { const x = c.per[d]; const tr = d === dep ? 0 : M.transportUnit(pid, d, dep, c.basis, mode); const ld = x.v + tr; const best = d === c.best;
          return `<tr class="${best ? 'hl' : ''}"><td>${M.depFull(d)}${x.offer ? ' <span class="badge">proposition</span>' : ''}</td><td class="n">${M.px(x.v)}</td><td class="hs">${esc(M.ago(x.date))}</td><td class="hs">${esc(x.row.fournisseur || '—')}${x.row.origine ? ` <span class="faint">${esc(x.row.origine)}</span>` : ''}</td><td class="n hs">${d === dep ? '—' : M.px(tr)}</td><td class="n"><b>${M.px(ld)}</b></td><td>${esc(M.jplus(M.transferDays(d, dep)))}</td><td class="n">${loc ? (d === dep ? '—' : M.deltaH(ld / loc.v - 1)) : ''}</td></tr>`; }).join('')}
        </tbody></table></div>
        <p class="small muted" style="margin-top:8px">Prix en ${esc(M.UNITS[c.basis])}. Transport = coût navette par palette (${mode === 'marg' ? 'place libre' : 'coût complet'}) ÷ ${M.n0(M.unitsPerPal(p, c.basis))} ${esc(M.UNIT_SHORT[c.basis])} par palette. Délai = temps de transfert entre dépôts (Réglages).</p>`;
    }
    const limit = M.ui.prodLimit || 30;
    root.innerHTML = `${banners()}
      <a class="linkbtn" href="#/comparer" style="display:inline-flex;align-items:center;gap:4px;margin-bottom:10px">${I.back.replace('class="i"', 'class="i s"')}Comparer</a>
      <div class="prod-hero"><div><h1>${esc(p.nom)}</h1><p class="sub muted" style="margin-top:6px">${esc([p.famille, p.categorie].filter(Boolean).join(', ') || 'Produit')}</p>
          <div class="row wrap" style="margin-top:12px">${M.canWrite() ? `<a class="btn primary" href="#/saisir?p=${encodeURIComponent(p.id)}">${I.plus}Saisir un prix</a>` : ''}
          <button class="btn" type="button" id="fav" aria-pressed="${isFav}">${I.star}${isFav ? 'Dans mes favoris' : 'Ajouter aux favoris'}</button>
          ${M.isAdmin() ? `<button class="btn" type="button" id="pal">${I.truck}Palettisation</button>` : ''}</div></div>
        ${c ? `<div style="text-align:right"><p class="small muted" style="margin-bottom:6px">Meilleur prix récent, ${M.depFull(c.best)}</p>${M.priceTag(c.per[c.best].v, c.basis, 'xl')}</div>` : ''}</div>
      <div class="section"><div class="sh"><h2>Rendu chez ${esc(M.DEPN[dep])}</h2>${segH('pmode', [['full', 'Coût complet'], ['marg', 'Place libre']], mode)}</div>
        ${landed || `<div class="panel"><p class="muted">Aucun prix sur les 30 derniers jours.</p></div>`}</div>
      ${(() => { const L = M.suppliersFor(pid, dep, Math.max(30, winDays()), c ? c.basis : null); if (!L.length) return '';
        return `<div class="section"><div class="sh"><h2>Par fournisseur</h2><span class="small muted">${L.length} offre(s) sur ${Math.max(30, winDays())} jours, rendu chez ${esc(dep)}</span></div>
        <div class="tablewrap"><table class="t"><thead><tr><th>Fournisseur</th><th>Dépôt</th><th class="n hs">Prix</th><th class="hs">Saisi</th><th class="n">Rendu ${esc(dep)}</th><th>Délai</th><th class="hs">Arrivée possible</th></tr></thead><tbody>
        ${L.slice(0, 25).map((x, i) => `<tr class="${i === 0 ? 'hl' : ''}"><td class="w"><b>${esc(x.r.fournisseur)}</b><div class="small faint">${M.isOffer(x.r) ? '<span class="badge">proposition</span> ' : ''}${esc(x.r.origine || '')}${x.r.categorie_qualite ? (x.r.origine ? ', ' : '') + esc(x.r.categorie_qualite) : ''}</div></td><td>${M.dep(x.r.depot)}</td><td class="n hs">${M.px(x.v)}</td><td class="hs">${esc(M.ago(x.r.date))}</td><td class="n"><b>${M.px(x.landed)}</b></td><td>${esc(M.jplus(x.delai))}</td><td class="hs">${esc(M.dShort(x.arrive))}</td></tr>`).join('')}
        </tbody></table></div><p class="small muted" style="margin-top:8px">Prix en ${esc(M.UNITS[L[0].u])}. Arrivée possible = livraison chez le dépôt acheteur, puis transfert jusqu’à ${esc(M.DEPN[dep])}.</p></div>`; })()}
      <div class="section"><div class="sh"><h2>Évolution des prix</h2>${segH('pdays', [[30, '30 j'], [90, '90 j'], [150, '150 j']], U.days)}</div>
        <div class="panel"><div class="chart" id="chart"></div><p class="small muted" style="margin-top:6px">Moyenne par semaine et par dépôt.</p></div></div>
      <div class="section"><div class="sh"><h2>Prix saisis</h2><span class="small muted">${rows.length} au total</span></div>
        <div class="panel flush">${rows.length ? rows.slice(0, limit).map(r => { const rf = M.rowRef(r); const can = M.canEditDep(r.depot) && M.canWrite();
          return `<${can ? 'a' : 'div'} class="li" ${can ? `href="#/saisir?id=${encodeURIComponent(r.id)}"` : ''}>${M.dep(r.depot)}<div class="main"><div class="t">${esc(r.fournisseur || 'Fournisseur non précisé')}</div>
            <div class="s">${M.isOffer(r) ? `<span class="badge">${M.isExpired(r) ? 'proposition expirée' : 'proposition'}</span> ` : ''}${esc(M.dShort(r.date))}${r.livraison ? ', livré ' + esc(M.dNum(r.livraison)) : ''}${r.origine ? ', ' + esc(r.origine) : ''}${r.categorie_qualite ? ', ' + esc(r.categorie_qualite) : ''}${r.calibre ? ', cal. ' + esc(r.calibre) : ''}${M.num(r.stock) >= 0 && r.stock !== '' ? ', stock ' + esc(M.n0(M.num(r.stock))) + ' ' + esc(r.stock_unite || '') : ''}${M.num(r.prix_vente) > 0 ? ', vente ' + esc(M.px(M.num(r.prix_vente))) : ''}${r.acheteur ? ', ' + esc(r.acheteur) : ''}</div></div>
            <div class="r">${rf ? M.priceV(rf.v, rf.u) : ''}${r.unite === 'colis' ? `<div class="small faint">${M.px(r.prix)} €/colis</div>` : ''}</div>${can ? I.chev : ''}</${can ? 'a' : 'div'}>`; }).join('')
          : '<div class="empty"><p>Aucun prix saisi.</p></div>'}</div>
        ${rows.length > limit ? `<div style="text-align:center;margin-top:12px"><button class="btn" id="pmore" type="button">Afficher plus</button></div>` : ''}</div>`;
    // graphique : moyenne hebdo par dépôt
    const since = M.addDays(M.today(), -U.days);
    const basis = c ? c.basis : (rows[0] && M.rowRef(rows[0]) ? M.rowRef(rows[0]).u : 'kg');
    const series = M.DEPS.map(d => {
      const by = {};
      rows.forEach(r => { if (r.depot !== d || r.date < since) return; const rf = M.rowRef(r); if (!rf || rf.u !== basis) return; const w = M.mondayOf(r.date); (by[w] = by[w] || []).push(rf.v); });
      return { dep: d, points: Object.keys(by).map(w => ({ x: w, y: by[w].reduce((a, b) => a + b, 0) / by[w].length })) };
    }).filter(s => s.points.length);
    requestAnimationFrame(() => { const el = $('#chart', root); if (el) M.lineChart(el, series, basis); });
    bindSeg(root, 'pdays', v => { U.days = +v; saveUi(); V.produit(root, q, pid); });
    bindSeg(root, 'pmode', v => { M.ui.opt.mode = v; saveUi(); V.produit(root, q, pid); });
    $('#fav', root).onclick = () => { const f = M.lsGet('favs', []); const i = f.indexOf(String(pid)); if (i >= 0) f.splice(i, 1); else f.unshift(String(pid)); M.lsSet('favs', f); V.produit(root, q, pid); };
    const pm = $('#pmore', root); if (pm) pm.onclick = () => { M.ui.prodLimit = limit + 50; V.produit(root, q, pid); };
    const palB = $('#pal', root); if (palB) palB.onclick = () => M.requireAdmin(() => {
      const s = M.sheet(`<p class="muted small" style="margin-bottom:14px">Ces valeurs servent à calculer le coût du transport par kilo ou par pièce. Laisse vide si tu ne sais pas : l’application prend ${M.n0(M.P().kgPal)} kg par palette.</p>
        <div class="two"><div class="field"><label for="pa-w">Poids d’un colis (kg)</label><input class="input" id="pa-w" inputmode="decimal" value="${esc(p.poids_colis || '')}"></div>
        <div class="field"><label for="pa-p">Pièces par colis</label><input class="input" id="pa-p" inputmode="decimal" value="${esc(p.pieces_colis || '')}"></div></div>
        <div class="two"><div class="field"><label for="pa-c">Colis par palette</label><input class="input" id="pa-c" inputmode="decimal" value="${esc(p.colis_palette || '')}"></div>
        <div class="field"><label for="pa-k">Kg par palette</label><input class="input" id="pa-k" inputmode="decimal" value="${esc(p.kg_palette || '')}"></div></div>
        <button class="btn primary block big" id="pa-ok" type="button">Enregistrer</button>`, { title: 'Palettisation : ' + p.nom });
      $('#pa-ok', s.el).onclick = async () => {
        const g = id => { const v = M.num($('#' + id, s.el).value); return v > 0 ? v : ''; };
        try { await M.saveProduct({ id: p.id, nom: p.nom, poids_colis: g('pa-w'), pieces_colis: g('pa-p'), colis_palette: g('pa-c'), kg_palette: g('pa-k') }); }
        catch (e) { M.toast('Non enregistré : ' + e.message, 'bad'); if (e.session) s.close(); return; }
        s.close(); M.toast('Palettisation enregistrée'); V.produit(root, q, pid);
      };
    });
  };

  /* ============================================================ OPTIMISER */
  V.optimiser = (root, q) => {
    const U = M.ui.opt; if (!U.dest) U.dest = M.myDep();
    if (q && q.sim) { U.tab = 'sim'; saveUi(); history.replaceState(null, '', location.pathname + location.search + '#/optimiser'); }
    root.innerHTML = `${banners()}
      <div class="page-head"><div><h1>Optimiser les achats</h1><p class="sub">Où acheter, combien de palettes, quelle navette, avec les coûts de l’outil navettes. Un achat par un autre dépôt arrive après le délai de transfert (J+1 par ligne de navette, réglable).</p></div></div>
      ${segH('otab', [['ou', 'Où acheter'], ['nav', 'Navette' + (M.lsGet('cart', []).length ? ' (' + M.lsGet('cart', []).length + ')' : '')], ['sim', 'Simulateur']], U.tab)}
      <div id="otab" style="margin-top:18px"></div>`;
    bindSeg(root, 'otab', v => { U.tab = v; saveUi(); draw(); });
    const box = $('#otab', root);
    const draw = () => { ({ ou: tabOu, nav: tabNav, sim: tabSim })[U.tab](box); };
    draw();

    function tabOu(el) {
      const days = winDays(U.days);
      const opps = M.opportunities(U.dest, { days, mode: U.mode });
      const cart = M.lsGet('cart', []);
      const inCart = o => cart.some(x => x.pid === o.pid && x.dest === o.dest);
      const sumG = opps.reduce((a, o) => a + (isFinite(o.gainWeek) ? o.gainWeek : 0), 0);
      const sumPal = opps.reduce((a, o) => a + (isFinite(o.pal) ? o.pal : 0), 0);
      el.innerHTML = `<div class="row wrap" style="gap:10px;margin-bottom:14px">
          <div><div class="small muted" style="margin-bottom:4px">Pour le dépôt</div>${segH('odest', M.DEPS.map(d => [d, d]), U.dest)}</div>
          <div><div class="small muted" style="margin-bottom:4px">Prix des</div>${segH('odays', daysOpts, days)}</div>
          <div><div class="small muted" style="margin-bottom:4px">Coût navette</div>${segH('omode', [['full', 'Coût complet'], ['marg', 'Place libre']], U.mode)}</div></div>
        <div class="statgrid" style="margin-bottom:16px">
          <div class="stat"><div class="v">${opps.length}</div><div class="l">produits moins chers rendus chez ${esc(U.dest)}</div></div>
          <div class="stat"><div class="v">${M.eur(sumG)}</div><div class="l">d’économie par semaine (volumes habituels)</div></div>
          <div class="stat"><div class="v">${M.n1(sumPal)}</div><div class="l">palettes par semaine à transférer</div></div>
          <div class="stat"><div class="v">${M.n0(M.P().minGain)} %</div><div class="l">d’économie mini retenue</div></div></div>
        ${opps.length ? `<div class="panel flush">${opps.map((o, i) => `<label class="opp"><input type="checkbox" data-i="${i}" ${inCart(o) ? 'checked' : ''} aria-label="Ajouter à la navette">
            <div><div class="t">${esc(o.prod.nom)}</div>
              <div class="calc">${M.isOffer(o.srcRow) ? 'Proposé' : 'Acheté'} à ${M.dep(o.src)} chez ${esc(o.srcRow.fournisseur || 'fournisseur non précisé')} : ${M.px(o.srcV)} + transport ${M.px(o.tr)} = <b>${M.px(o.landed)} ${esc(M.UNITS[o.basis])} rendu</b>, contre ${M.px(o.locV)} chez ${esc(o.dest)}</div>
              <div class="gainl"><span class="badge good">${M.pct(-o.g)}</span><span class="badge">${esc(M.jplus(o.delai))}${M.via(o.src, o.dest).length ? ' via ' + esc(M.via(o.src, o.dest).join(', ')) : ''}, arrivée ${esc(M.dShort(o.arrive))}</span>${isFinite(o.gainWeek) ? `<span class="badge leaf">≈ ${M.eur(o.gainWeek)} / sem.</span><span class="small muted">${M.n1(o.pal)} pal. / sem.</span>` : '<span class="small muted">volume habituel inconnu</span>'}
              ${M.daysAgo(o.srcDate) > 7 || M.daysAgo(o.locDate) > 7 ? `<span class="badge warn">prix de plus de 7 j</span>` : ''}<a class="linkbtn small" href="#/produit/${encodeURIComponent(o.pid)}">Fiche</a></div></div></label>`).join('')}</div>
          <div class="formbar" style="margin-top:12px">${(() => { const n = cart.filter(x => x.dest === U.dest).length; return n ? `<button class="btn primary big block" id="gocart" type="button">${I.truck}Préparer la navette (${n})</button>` : `<button class="btn big block" type="button" disabled>${I.truck}Coche les produits à faire venir</button>`; })()}</div>`
          : `<div class="panel"><div class="empty"><h2 class="h3">Aucun produit moins cher rendu chez ${esc(U.dest)}</h2><p>Avec les prix des ${days} derniers jours et ${M.n0(M.P().minGain)} % d’économie mini, ${esc(U.dest)} achète déjà au meilleur prix. Élargis la période ou passe en « Place libre ».</p></div></div>`}`;
      bindSeg(el, 'odest', v => { U.dest = v; saveUi(); tabOu(el); });
      bindSeg(el, 'odays', v => { U.days = +v; saveUi(); tabOu(el); });
      bindSeg(el, 'omode', v => { U.mode = v; saveUi(); tabOu(el); });
      $$('input[data-i]', el).forEach(cb => cb.onchange = () => {
        const o = opps[+cb.dataset.i]; let c = M.lsGet('cart', []);
        if (cb.checked) c.push({ pid: o.pid, src: o.src, dest: o.dest, basis: o.basis, pal: isFinite(o.pal) ? Math.round(o.pal * 10) / 10 : 1 });
        else c = c.filter(x => !(x.pid === o.pid && x.dest === o.dest));
        M.lsSet('cart', c); V.optimiser(root);
      });
      const g = $('#gocart', el); if (g) g.onclick = () => { U.tab = 'nav'; saveUi(); V.optimiser(root); };
    }

    function tabNav(el) {
      const P = M.P(); const cart = M.lsGet('cart', []);
      if (!cart.length) { el.innerHTML = `<div class="panel"><div class="empty"><h2 class="h3">La navette est vide</h2><p>Dans « Où acheter », coche les produits à faire venir d’un autre dépôt : ils s’ajoutent ici avec leurs palettes.</p><button class="btn primary" id="goou" type="button">Voir où acheter</button></div></div>`; $('#goou', el).onclick = () => { U.tab = 'ou'; saveUi(); V.optimiser(root); }; return; }
      const days = Math.max(30, winDays(U.days));
      const items = cart.map(x => {
        const c = M.compare(x.pid, days); const prod = S.ix.prod.get(x.pid);
        if (!c || !c.per[x.src] || !c.per[x.dest] || !prod) return Object.assign({}, x, { bad: true, prod });
        const upp = M.unitsPerPal(prod, c.basis);
        return Object.assign({}, x, { prod, basis: c.basis, srcV: c.per[x.src].v, locV: c.per[x.dest].v, upp, q: x.pal * upp, achatGain: (c.per[x.dest].v - c.per[x.src].v) * x.pal * upp });
      });
      // palettes par ligne et par sens
      const flows = {}; M.lines().forEach(L => { flows[L.id + '>'] = { L, a: L.a, b: L.b, pal: 0 }; flows[L.id + '<'] = { L, a: L.b, b: L.a, pal: 0 }; });
      items.filter(i => !i.bad).forEach(i => {
        const si = M.DEPS.indexOf(i.src), di = M.DEPS.indexOf(i.dest);
        M.pathLines(i.src, i.dest).forEach(L => { flows[L.id + (si < di ? '>' : '<')].pal += i.pal; });
      });
      const free = Math.max(0, P.cap - P.palSens);
      let trFull = 0, trMarg = 0; const lineRows = [];
      M.lines().forEach(L => {
        const lc = M.lineCost(L);
        const f1 = flows[L.id + '>'], f2 = flows[L.id + '<'];
        [f1, f2].forEach(f => {
          if (!f.pal) return;
          const freeWeek = free * L.rot; const extraPal = Math.max(0, f.pal - freeWeek); const extraRot = Math.ceil(extraPal / P.cap - 1e-9);
          const full = f.pal * lc.perPal; const marg = Math.min(f.pal, freeWeek) * P.marg + extraRot * lc.sens;
          trFull += full; trMarg += marg;
          lineRows.push({ f, L, lc, freeWeek, extraRot, full, marg });
        });
      });
      const gain = items.reduce((a, i) => a + (i.achatGain || 0), 0);
      const tr = U.mode === 'marg' ? trMarg : trFull;
      const net = gain - tr;
      const hours = lineRows.reduce((a, r) => a + r.extraRot * r.lc.paid, 0);
      el.innerHTML = `<div class="grid2 wide-left">
        <div><div class="panel flush">${items.map((i, k) => `<div class="li"><div class="main"><div class="t">${esc(i.prod ? i.prod.nom : i.pid)}</div>
            <div class="s">${M.dep(i.src)} vers ${M.dep(i.dest)}, ${esc(M.jplus(M.transferDays(i.src, i.dest)))}${i.bad ? ', prix manquant, à revoir' : `, ${M.px(i.srcV)} au lieu de ${M.px(i.locV)} ${esc(M.UNITS[i.basis])}`}</div></div>
            <label class="small muted" style="display:grid;gap:2px;text-align:right">pal./sem.<input class="input" style="width:84px;min-height:40px;text-align:right" inputmode="decimal" data-k="${k}" value="${esc(String(i.pal).replace('.', ','))}"></label>
            <button class="iconbtn" type="button" data-rm="${k}" aria-label="Retirer">${I.x}</button></div>`).join('')}</div>
          <div class="section"><h2 style="margin-bottom:10px">Palettes par navette</h2>
          ${lineRows.map(r => { const tot = P.palSens * r.L.rot + r.freeWeek; const used = P.palSens * r.L.rot; return `<div class="panel" style="margin-bottom:10px">
            <div class="row" style="justify-content:space-between"><b>${M.dep(r.f.a)} vers ${M.dep(r.f.b)}</b><span class="small muted">${r.L.rot} rotation(s) / sem., délai ${esc(M.jplus(r.L.delai))}</span></div>
            <div class="fill" style="margin:10px 0 6px"><i style="width:${Math.min(100, used / tot * 100)}%;background:var(--ink-3)"></i><i class="extra" style="left:${Math.min(100, used / tot * 100)}%;width:${Math.min(100 - used / tot * 100, r.f.pal / tot * 100)}%"></i></div>
            <p class="small muted">${M.n1(r.f.pal)} palettes ajoutées par semaine sur ${M.n0(r.freeWeek)} places libres (${M.n0(P.palSens)} déjà chargées par rotation sur ${M.n0(P.cap)}).${r.extraRot ? ` <b style="color:var(--bad)">Il faut ${r.extraRot} rotation(s) en plus.</b>` : ''}</p></div>`; }).join('')}</div></div>
        <div><div class="panel"><div class="kv">
            <span class="k">Économie sur les prix d’achat</span><span class="v">${M.eur(gain)}</span>
            <span class="k">Transport, coût complet</span><span class="v">− ${M.eur(trFull)}</span>
            <span class="k">Transport, place libre</span><span class="v">− ${M.eur(trMarg)}</span>
            <span class="sep"></span>
            <span class="k"><b>Gain net par semaine</b><br><span class="small">${U.mode === 'marg' ? 'place libre' : 'coût complet'}</span></span><span class="v big" style="color:${net >= 0 ? 'var(--good)' : 'var(--bad)'}">${M.eur(net)}</span>
            <span class="k">Gain net par an (52 sem.)</span><span class="v">${M.eur(net * 52)}</span>
            <span class="sep"></span>
            <span class="k">Rotations en plus</span><span class="v">${lineRows.reduce((a, r) => a + r.extraRot, 0)}</span>
            <span class="k">Heures chauffeur en plus / sem.</span><span class="v">${M.n1(hours)} h</span>
          </div>
          ${segH('nmode', [['full', 'Coût complet'], ['marg', 'Place libre']], U.mode)}
          <div class="row" style="margin-top:14px"><button class="btn block" id="copy" type="button">${I.copy}Copier le récap</button></div>
          <button class="linkbtn small" id="clear" type="button" style="margin-top:12px">Vider la navette</button></div>
          <p class="small muted" style="margin-top:10px">Place libre : chaque palette ajoutée coûte ${M.n0(P.marg)} € par ligne tant qu’il reste de la place (${M.n0(free)} palettes par rotation). Au-delà, une rotation complète est comptée.</p></div></div>`;
      $$('input[data-k]', el).forEach(inp => inp.onchange = () => { const c = M.lsGet('cart', []); const v = M.num(inp.value); if (c[+inp.dataset.k] && v >= 0) { c[+inp.dataset.k].pal = v; M.lsSet('cart', c); } tabNav(el); });
      $$('[data-rm]', el).forEach(b => b.onclick = () => { const c = M.lsGet('cart', []); c.splice(+b.dataset.rm, 1); M.lsSet('cart', c); V.optimiser(root); });
      bindSeg(el, 'nmode', v => { U.mode = v; saveUi(); tabNav(el); });
      $('#clear', el).onclick = () => { M.lsSet('cart', []); V.optimiser(root); };
      $('#copy', el).onclick = async () => {
        const txt = ['Navette — produits à transférer (' + new Date().toLocaleDateString('fr-FR') + ')', '']
          .concat(items.filter(i => !i.bad).map(i => `- ${i.prod.nom} : ${M.n1(i.pal)} pal./sem. de ${M.DEPN[i.src]} vers ${M.DEPN[i.dest]}, ${M.jplus(M.transferDays(i.src, i.dest))} (${M.px(i.srcV)} au lieu de ${M.px(i.locV)} ${M.UNITS[i.basis]})`))
          .concat(['', `Économie sur les achats : ${M.eur(gain)} / sem.`, `Transport (${U.mode === 'marg' ? 'place libre' : 'coût complet'}) : ${M.eur(tr)} / sem.`, `Gain net : ${M.eur(net)} / sem., soit ${M.eur(net * 52)} / an`]).join('\n');
        try { await navigator.clipboard.writeText(txt); M.toast('Récap copié'); } catch (e) { M.sheet(`<textarea class="input" style="min-height:260px">${esc(txt)}</textarea>`, { title: 'Récap à copier' }); }
      };
    }

    function tabSim(el) {
      const P = M.P(); const st = M.ui.sim || (M.ui.sim = { line: 'L2', rot: null, a: 20, b: 10, kg: P.kgPal, km: 300, hw: 0.8 });
      const Ls = M.lines();
      const base = st.line === 'X' ? { id: 'X', a: '', b: '', km: +st.km, hw: +st.hw, tollShare: Math.min(1, +st.hw * 0.9), rot: 1 } : Ls.find(l => l.id === st.line);
      const rot = st.rot != null ? +st.rot : base.rot;
      const lc = M.lineCost(base, { rot });
      const nA = +st.a || 0, nB = +st.b || 0, n = nA + nB;
      const week = lc.total * rot;
      const mA = M.market(nA, base.km), mB = M.market(nB, base.km);
      const mWeek = (mA.v + mB.v) * rot;
      let be = null; for (let k = 1; k <= 2 * P.cap; k++) { const a = Math.ceil(k / 2), b = Math.floor(k / 2); if (M.market(a, base.km).v + M.market(b, base.km).v >= lc.total) { be = k; break; } }
      const hoursWeek = lc.paid * rot; const drivers = Math.max(1, Math.ceil(hoursWeek / 48 - 1e-9));
      const over = nA > P.cap || nB > P.cap;
      el.innerHTML = `<div class="grid2">
        <div class="panel">
          <div class="field"><span class="lbl">Trajet</span>${segH('sline', Ls.map(l => [l.id, l.a + ' ⇄ ' + l.b]).concat([['X', 'Autre']]), st.line)}</div>
          ${st.line === 'X' ? `<div class="two"><div class="field"><label for="skm">Distance aller (km)</label><input class="input" id="skm" inputmode="decimal" value="${esc(st.km)}"></div><div class="field"><label for="shw">Part autoroute</label><select class="input" id="shw">${[[0.3, '30 %'], [0.6, '60 %'], [0.8, '80 %'], [0.95, '95 %']].map(([v, l]) => `<option value="${v}"${+st.hw === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>` : `<p class="small muted" style="margin:-4px 0 12px">${M.n0(base.km)} km, ${M.n0(base.hw * 100)} % d’autoroute, ${M.n0(base.tollShare * 100)} % à péage (outil navettes).</p>`}
          <div class="three"><div class="field"><label for="srot">Rotations / sem.</label><input class="input" id="srot" inputmode="numeric" value="${esc(rot)}"></div>
            <div class="field"><label for="sa">Palettes aller</label><input class="input" id="sa" inputmode="numeric" value="${esc(nA)}"></div>
            <div class="field"><label for="sb">Palettes retour</label><input class="input" id="sb" inputmode="numeric" value="${esc(nB)}"></div></div>
          <div class="field"><label for="skg">Poids moyen d’une palette (kg)</label><input class="input" id="skg" inputmode="numeric" value="${esc(st.kg)}" style="max-width:200px"></div>
          ${over ? `<div class="callout bad">Plus de ${M.n0(P.cap)} palettes dans un sens : il faut un deuxième camion.</div>` : ''}
        </div>
        <div class="panel"><div class="kv">
          <span class="k">Gasoil</span><span class="v">${M.eur(lc.fuel)}</span>
          <span class="k">Péages</span><span class="v">${M.eur(lc.toll)}</span>
          <span class="k">Chauffeur (${M.n1(lc.paid)} h payées)</span><span class="v">${M.eur(lc.driverC)}</span>
          <span class="k">Nuitées (${lc.nights})</span><span class="v">${M.eur(lc.nightC)}</span>
          <span class="k">Camion (part de la semaine)</span><span class="v">${M.eur(lc.truckC)}</span>
          <span class="sep"></span>
          <span class="k"><b>Coût d’une rotation</b></span><span class="v big">${M.eur(lc.total)}</span>
          <span class="k">Coût par semaine</span><span class="v">${M.eur(week)}</span>
          <span class="k">Par palette transportée</span><span class="v">${n ? M.eur2(lc.total / n) : '—'}</span>
          <span class="k">Par kilo</span><span class="v">${n && st.kg > 0 ? M.px(lc.total / n / st.kg) + ' €' : '—'}</span>
          <span class="sep"></span>
          <span class="k">Même transport au prix du marché</span><span class="v">${M.eur(mWeek)}</span>
          <span class="k small">${esc(mA.how)} à l’aller${nB ? ', ' + esc(mB.how) + ' au retour' : ''}</span><span></span>
          <span class="k"><b>Économie de la navette / sem.</b></span><span class="v big" style="color:${mWeek - week >= 0 ? 'var(--good)' : 'var(--bad)'}">${M.eur(mWeek - week)}</span>
          <span class="sep"></span>
          <span class="k">Conduite aller</span><span class="v">${M.n1(lc.oneWay)} h</span>
          <span class="k">Heures chauffeur / sem.</span><span class="v">${M.n1(hoursWeek)} h</span>
          <span class="k">Chauffeurs nécessaires (48 h max)</span><span class="v">${drivers}</span>
        </div>
        <div class="callout" style="margin-top:14px">${be ? `La navette devient moins chère que le marché à partir de <b>${be} palettes par rotation</b> (aller + retour).` : 'Sur ce trajet, le marché reste moins cher même avec un camion plein dans les deux sens.'}</div></div></div>`;
      bindSeg(el, 'sline', v => { st.line = v; st.rot = null; saveUi(); tabSim(el); });
      const num = (id, k) => { const e = $('#' + id, el); if (e) e.onchange = () => { const v = M.num(e.value); if (v >= 0) { st[k] = v; saveUi(); tabSim(el); } }; };
      num('srot', 'rot'); num('sa', 'a'); num('sb', 'b'); num('skg', 'kg'); num('skm', 'km');
      const hw = $('#shw', el); if (hw) hw.onchange = () => { st.hw = +hw.value; saveUi(); tabSim(el); };
    }
  };

  /* ============================================================ SAISIES (historique) */
  V.saisies = (root) => {
    const U = M.ui.his; const dep = M.myDep();
    root.innerHTML = `${banners()}
      <div class="page-head"><div><h1>Historique des prix</h1><p class="sub" id="hcount"></p></div>
        <button class="btn" id="csv" type="button">${I.download}Exporter (Excel)</button></div>
      <div class="row wrap" style="gap:10px;margin-bottom:12px">
        <input class="input grow" type="search" id="hq" enterkeyhint="search" placeholder="Produit, fournisseur, origine" value="${esc(U.q)}" style="min-width:220px" aria-label="Rechercher dans l’historique" aria-controls="hres">
        ${segH('hdays', [[7, '7 j'], [30, '30 j'], [90, '90 j'], [0, 'Tout']], U.days)}</div>
      <div class="row wrap" style="justify-content:space-between;margin-bottom:14px">
        <div class="chips">${[['', 'Tous les dépôts']].concat(M.DEPS.map(d => [d, d])).map(([v, l]) => `<button type="button" class="chip" data-hd="${v}" aria-pressed="${U.dep === v}">${v ? `<span class="dep c-${v}"><i></i></span>` : ''}${esc(l)}</button>`).join('')}</div>
        <label class="check small"><input type="checkbox" id="hmine" ${U.mine ? 'checked' : ''}>Seulement mes saisies</label></div>
      <div id="hres"></div>`;
    let rows = [];
    const results = () => {
      const since = U.days ? M.addDays(M.today(), -U.days) : '0000';
      const pend = new Set(S.queue.filter(x => x.t === 'prix').map(x => x.row ? x.row.id : x.id));
      rows = S.data.prix.filter(r => !Number(r.supprime) && r.date >= since && (!U.dep || r.depot === U.dep));
      if (U.mine) rows = rows.filter(r => r.depot === dep && (!S.cfg.buyer || r.acheteur === S.cfg.buyer));
      if (U.q) { const qq = M.norm(U.q); rows = rows.filter(r => M.norm(r.produit + ' ' + r.fournisseur + ' ' + r.origine).includes(qq)); }
      rows.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : (String(b.cree) > String(a.cree) ? 1 : -1)));
      const limit = M.ui.hisLimit || 150;
      const groups = []; let last = null;
      rows.slice(0, limit).forEach(r => { if (r.date !== last) { groups.push({ d: r.date, rows: [] }); last = r.date; } groups[groups.length - 1].rows.push(r); });
      $('#hcount', root).textContent = rows.length + ' prix sur la période.';
      const box = $('#hres', root);
      box.innerHTML = `${groups.length ? groups.map(g => `<div class="section" style="margin-top:16px"><h2 class="h3 muted" style="margin:0 2px 8px">${esc(M.dShort(g.d))}</h2><div class="panel flush">${g.rows.map(r => { const rf = M.rowRef(r); const can = M.canEditDep(r.depot) && M.canWrite();
          return `<a class="li" href="${can ? '#/saisir?id=' + encodeURIComponent(r.id) : '#/produit/' + encodeURIComponent(r.produit_id)}">${M.dep(r.depot)}<div class="main"><div class="t">${esc(r.produit)}</div>
            <div class="s">${M.isOffer(r) ? `<span class="badge">${M.isExpired(r) ? 'proposition expirée' : 'proposition'}</span> ` : ''}${esc(r.fournisseur || 'Fournisseur non précisé')}${r.origine ? ', ' + esc(r.origine) : ''}${r.livraison ? ', livraison ' + esc(M.dNum(r.livraison)) : ''}${r.acheteur ? ', ' + esc(r.acheteur) : ''}</div></div>
            <div class="r">${rf ? M.priceV(rf.v, rf.u) : ''}${pend.has(r.id) ? '<div><span class="badge warn">à envoyer</span></div>' : ''}</div></a>`; }).join('')}</div></div>`).join('')
        : `<div class="panel"><div class="empty"><h2 class="h3">Aucun prix</h2><p>Rien ne correspond à ces filtres.</p></div></div>`}
      ${rows.length > limit ? `<div style="text-align:center;margin-top:14px"><button class="btn" id="hmore" type="button">Afficher plus</button></div>` : ''}`;
      const hm = $('#hmore', box); if (hm) hm.onclick = () => { M.ui.hisLimit = limit + 150; results(); };
    };
    const re = () => { saveUi(); V.saisies(root); };
    let tq; $('#hq', root).addEventListener('input', e => { clearTimeout(tq); tq = setTimeout(() => { U.q = e.target.value; saveUi(); results(); }, 220); });
    bindSeg(root, 'hdays', v => { U.days = +v; re(); });
    $$('[data-hd]', root).forEach(b => b.onclick = () => { U.dep = b.dataset.hd; re(); });
    $('#hmine', root).onchange = e => { U.mine = e.target.checked; re(); };
    $('#csv', root).onclick = () => {
      const out = rows.map(r => { const rf = M.rowRef(r) || {}; return Object.assign({}, r, { depot_nom: M.DEPN[r.depot], prix_comparable: rf.v != null ? Math.round(rf.v * 1000) / 1000 : '', unite_comparable: M.UNITS[rf.u] || '' }); });
      out.forEach(o => { o.type_nom = o.type === 'offre' ? 'Proposition' : 'Achat'; });
      const cols = ['date', 'type_nom', 'depot', 'depot_nom', 'produit', 'fournisseur', 'origine', 'categorie_qualite', 'calibre', 'prix', 'unite', 'poids_colis', 'prix_comparable', 'unite_comparable', 'prix_vente', 'livraison', 'stock', 'stock_unite', 'quantite', 'quantite_unite', 'validite', 'acheteur', 'commentaire'];
      const heads = ['Date', 'Type', 'Dépôt', 'Nom du dépôt', 'Produit', 'Fournisseur', 'Origine', 'Catégorie', 'Calibre', 'Prix saisi', 'Unité', 'Poids colis (kg)', 'Prix comparable', 'Unité comparable', 'Prix de vente', 'Livraison', 'Stock', 'Unité stock', 'Quantité', 'Unité quantité', 'Valable jusqu’au', 'Acheteur', 'Commentaire'];
      M.download('mercuriale_prix_' + M.today() + '.csv', M.csv(out, cols, heads)); M.toast(rows.length + ' prix exportés');
    };
    results();
  };

  /* ============================================================ RÉGLAGES */
  const ROLE_L = { acheteur: 'Acheteur', lecture: 'Lecture seule', admin: 'Administrateur' };
  const agoT = iso => { if (!iso) return 'jamais connecté'; const m = Math.round((Date.now() - Date.parse(iso)) / 60000); if (!isFinite(m)) return '—'; if (m < 2) return 'vu à l’instant'; if (m < 60) return 'vu il y a ' + m + ' min'; if (m < 48 * 60) return 'vu il y a ' + Math.round(m / 60) + ' h'; return 'vu il y a ' + Math.round(m / 1440) + ' j'; };
  const ACT_L = { prix_cree: 'Prix ajouté', prix_modifie: 'Prix modifié', prix_supprime: 'Prix supprimé', prix_restaure: 'Prix rétabli', produit_cree: 'Produit créé', produit_modifie: 'Produit modifié',
    fournisseur_cree: 'Fournisseur créé', fournisseur_modifie: 'Fournisseur modifié', parametre: 'Paramètre modifié', catalogue: 'Catalogue modifié', connexion: 'Connexion d’un appareil',
    admin_ouverture: 'Mode administrateur ouvert', admin_echec: 'Mot de passe refusé', admin_refuse: 'Tentative refusée', invitation_creee: 'Invitation créée', invitation_utilisee: 'Inscription',
    acces_desactive: 'Accès désactivé', acces_reactive: 'Accès réactivé', mot_de_passe: 'Mot de passe changé', envoi: 'Saisies reçues' };
  const inviteLink = jeton => {
    const base = location.href.split('#')[0].split('?')[0];
    const api = S.cfg.mode === 'live' ? S.cfg.apiUrl : 'https://script.google.com/macros/s/DEMO/exec';
    return base + '#/rejoindre?api=' + encodeURIComponent(api) + '&jeton=' + encodeURIComponent(jeton);
  };
  const shareInvite = (nom, j) => {
    const url = inviteLink(j.jeton); const until = new Date(j.expire).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    const txt = `Bonjour ${nom}, voici ton accès à Mercuriale (prix d’achat F&L des dépôts). Ouvre ce lien sur ton téléphone, il ne marche qu’une seule fois et jusqu’au ${until} :\n${url}`;
    const s = M.sheet(`<p class="muted small" style="margin-bottom:10px">Lien personnel pour <b>${esc(nom)}</b>. Il ne fonctionne <b>qu’une seule fois</b>, jusqu’au ${esc(until)}. Envoie-le uniquement à cette personne (SMS, Teams, mail).</p>
      <textarea class="input" id="inv-t" style="min-height:130px" readonly>${esc(txt)}</textarea>
      ${S.cfg.mode === 'demo' ? '<p class="small faint" style="margin-top:8px">Démo : ce lien est fictif.</p>' : ''}
      <div class="two" style="margin-top:12px"><button class="btn" type="button" id="inv-c">${I.copy}Copier</button><button class="btn primary" type="button" id="inv-s">${I.share}Envoyer</button></div>`, { title: 'Invitation prête' });
    $('#inv-c', s.el).onclick = async () => { try { await navigator.clipboard.writeText(txt); M.toast('Invitation copiée'); } catch (e) { $('#inv-t', s.el).select(); M.toast('Sélectionne le texte et copie-le'); } };
    $('#inv-s', s.el).onclick = async () => { try { if (navigator.share) { await navigator.share({ title: 'Mercuriale', text: txt }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } location.href = 'mailto:?subject=' + encodeURIComponent('Ton accès à Mercuriale') + '&body=' + encodeURIComponent(txt); };
  };
  /* fenêtre « mot de passe administrateur » */
  M.unlockSheet = (after) => {
    const s = M.sheet(`<p class="muted small" style="margin-bottom:12px">Paramètres de calcul, palettisation, accès des acheteurs et prix des autres dépôts sont protégés. Le mot de passe n’est jamais gardé sur cet appareil ; le mode administrateur se reverrouille seul après ${M.ADMIN_MIN} minutes sans action.</p>
      <form id="unf" autocomplete="on"><input type="text" name="username" autocomplete="username" value="${esc((S.cfg && S.cfg.me && S.cfg.me.nom) || 'Mercuriale admin')}" hidden>
      <div class="field"><label for="unp">Mot de passe administrateur</label><input class="input" type="password" id="unp" autocomplete="current-password" required>${S.cfg.mode === 'demo' ? '<span class="hint">Démo : le mot de passe est <b>demo</b>.</span>' : ''}</div>
      <p class="small" id="une" style="color:var(--bad);margin:0 0 10px" role="alert" hidden></p>
      <button class="btn primary big block" type="submit" id="ung">${I.check}Déverrouiller</button></form>`, { title: 'Mode administrateur' });
    $('#unf', s.el).addEventListener('submit', async e => {
      e.preventDefault(); const b = $('#ung', s.el), er = $('#une', s.el); b.disabled = true; er.hidden = true;
      try { await M.adminLogin($('#unp', s.el).value); s.close(); M.toast('Mode administrateur ouvert pour ' + M.ADMIN_MIN + ' min'); if (after) after(); }
      catch (x) { er.textContent = x.message || String(x); er.hidden = false; b.disabled = false; const i = $('#unp', s.el); i.value = ''; i.focus(); }
    });
  };
  M.requireAdmin = fn => { if (M.adminOn()) { M.adminTouch(); fn(); } else M.unlockSheet(fn); };

  V.reglages = (root) => {
    const c = S.cfg; const live = c.mode === 'live'; const P = M.P(); const editP = M.adminOn();
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const left = S.adm ? Math.max(1, Math.round((S.adm.until - Date.now()) / 60000)) : 0;
    root.innerHTML = `${banners()}
      <div class="page-head"><div><h1>Réglages</h1></div></div>
      <div class="set-group"><h2>Profil</h2><div class="panel">
        <div class="field"><label for="rname">Ton prénom (affiché sur tes saisies)</label><input class="input" id="rname" value="${esc(c.buyer || '')}" placeholder="ex. Enzo"></div>
        <div class="field"><span class="lbl">Dépôt</span>${live && M.ownDep() ? `<p>${M.depFull(M.ownDep())} ${M.role() === 'lecture' ? '<span class="badge">lecture seule</span>' : ''}${M.isAdmin() ? ' <span class="badge leaf">administrateur</span>' : ''}</p><span class="hint">Le dépôt dépend de ton accès personnel.</span>`
          : `${segH('rdep', M.DEPS.map(d => [d, M.DEPN[d]]), M.myDep())}<span class="hint">${live ? (M.isAdmin() ? 'Accès administrateur sans dépôt : choisis le dépôt affiché par défaut.' : 'Accès en lecture seule : choisis le dépôt affiché par défaut.') : 'Démo : choisis ton dépôt.'}</span>`}</div>
        <div class="field" style="margin-bottom:0"><span class="lbl">Apparence</span>${segH('rtheme', [['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']], c.theme || 'auto')}</div>
      </div></div>
      <div class="set-group"><h2>Base de l’équipe</h2><div class="panel">
        ${live ? `<div class="kv" style="margin-bottom:14px"><span class="k">État</span><span class="v" style="font-size:16px">${S.sync.error ? `<span class="badge bad">${esc(S.sync.error)}</span>` : S.sync.online ? '<span class="badge good">connectée</span>' : '<span class="badge warn">hors ligne</span>'}</span>
            <span class="k">Dernière synchronisation</span><span class="v" style="font-size:16px">${c.lastSync ? esc(new Date(c.lastSync).toLocaleString('fr-FR')) : '—'}</span>
            <span class="k">Saisies en attente d’envoi</span><span class="v" style="font-size:16px">${S.queue.length}</span>
            <span class="k">Accès</span><span class="v" style="font-size:16px">${esc((c.me && c.me.nom) || '')} <span class="code">••${esc(String(c.code).slice(-2))}</span></span></div>
          <div class="row wrap"><button class="btn primary" id="rsync" type="button">${I.sync}Synchroniser</button><button class="btn" id="rdisc" type="button">Se déconnecter</button></div>
          ${S.rejected.length ? `<div class="callout bad" style="margin-top:14px"><b>${S.rejected.length} saisie(s) refusée(s)</b><ul class="small" style="margin:6px 0 8px;padding-left:18px">${S.rejected.slice(-8).map(r => `<li>${esc((r.op.row && r.op.row.produit) || r.op.t)} : ${esc(r.error)}</li>`).join('')}</ul><button class="btn sm" id="rclr" type="button">Effacer la liste</button></div>` : ''}`
          : window.__mercDemoFile ? `<p class="muted" style="margin-bottom:14px">Version de test : données fictives gardées sur cet ordinateur. Dans la vraie version, les prix sont partagés entre les 4 dépôts par un Google Sheet commun.</p><button class="btn primary" type="button" data-avis>${I.edit}Donner mon avis</button>`
          : `<p class="muted" style="margin-bottom:14px">Tu utilises les données de démonstration. Pour partager les prix entre les 4 dépôts, rejoins la base de l’équipe avec l’invitation reçue (ou, pour l’administrateur, l’adresse du serveur et le code administrateur).</p><button class="btn primary" id="rconn" type="button">Rejoindre la base de l’équipe</button>`}
      </div></div>
      ${M.isAdmin() ? `<div class="set-group"><h2>Administration</h2>
        ${editP ? `<div class="panel"><div class="row wrap" style="justify-content:space-between;margin-bottom:12px"><div><span class="badge leaf">mode administrateur ouvert</span> <span class="small muted">se reverrouille après ${M.ADMIN_MIN} min sans action (encore ${left} min)</span></div><button class="btn sm" id="alock" type="button">Verrouiller</button></div>
            <a class="btn primary" href="#/admin">${I.list}Personnes et activité</a><p class="small muted" style="margin-top:10px">Qui est inscrit, qui a fait quoi : chaque prix ajouté, modifié ou supprimé, chaque changement du catalogue, des paramètres et des accès.</p></div>`
        : `<div class="panel"><p class="muted" style="margin-bottom:12px">Les réglages sensibles sont protégés par le mot de passe administrateur : paramètres de calcul, palettisation, accès des acheteurs (invitations, désactivation), historique de toutes les actions et prix des autres dépôts.</p><button class="btn primary" id="aunl" type="button">${I.edit}Déverrouiller</button></div>`}</div>` : ''}
      <div class="set-group" ${window.__mercDemoFile ? 'hidden' : ''}><h2>Installer sur le téléphone</h2><div class="panel">
        ${window.__mercInstall ? `<button class="btn primary" id="rinst" type="button">${I.download}Installer Mercuriale</button>` : ''}
        <p class="muted" ${window.__mercInstall ? 'style="margin-top:12px"' : ''}>${ios ? 'Sur iPhone : ouvre ce lien dans Safari, touche le bouton Partager puis « Sur l’écran d’accueil ».' : 'Sur Android : menu ⋮ de Chrome puis « Installer l’application » ou « Ajouter à l’écran d’accueil ». Sur ordinateur : icône d’installation dans la barre d’adresse de Chrome ou Edge.'}</p>
      </div></div>
      <div class="set-group"><h2>Paramètres de calcul</h2>${editP ? '' : `<p class="small muted" style="margin:-4px 0 10px">${M.isAdmin() ? 'Déverrouille le mode administrateur pour les modifier.' : 'Modifiables uniquement par l’administrateur, avec son mot de passe.'}</p>`}
        ${(() => { let h = '', open = false; M.PARAM_DEFS.forEach(d => { if (d.g) { if (open) h += '</div>'; h += `<h3 class="muted" style="margin:14px 2px 8px">${esc(d.g)}</h3><div class="panel flush">`; open = true; return; }
          h += `<div class="param"><label for="p-${d.k}">${esc(d.l)} <span class="faint small">${esc(d.u)}</span></label>${editP ? `<input class="input" id="p-${d.k}" data-p="${d.k}" inputmode="decimal" value="${esc(String(P[d.k]).replace('.', ','))}">` : `<span class="num" id="p-${d.k}" style="text-align:right;font-size:18px">${esc(String(P[d.k]).replace('.', ','))}</span>`}</div>`; }); return h + (open ? '</div>' : ''); })()}
        ${editP ? `<div class="row" style="margin-top:10px"><button class="btn sm" id="rpreset" type="button">Revenir aux valeurs de l’outil navettes</button></div>` : ''}</div>
      <div class="set-group"><h2>Catalogue</h2><div class="panel"><p class="muted">${S.ix.prod.size} produits, ${S.data.fournisseurs.length} fournisseurs, ${S.data.prix.filter(r => !Number(r.supprime)).length} prix chargés.</p>
        <div class="row wrap" style="margin-top:12px"><button class="btn" id="rcat" type="button">${I.download}Exporter le catalogue</button></div></div></div>
      <div class="set-group"><h2>Cet appareil</h2><div class="panel"><p class="muted small">Mercuriale ${esc(M.VERSION)}. Les données sont gardées sur l’appareil pour marcher sans réseau. Si ton accès est désactivé par l’administrateur, elles sont effacées automatiquement.</p>
        <button class="btn danger" id="rreset" type="button" style="margin-top:12px">${I.trash}Effacer les données de cet appareil</button></div></div>`;
    $('#rname', root).onchange = e => { c.buyer = e.target.value.trim(); M.saveCfg(); M.toast('Prénom enregistré'); };
    bindSeg(root, 'rdep', v => { c.depot = v; if (c.mode === 'demo' && c.me) c.me.depot = v; M.saveCfg(); M.ui.opt.dest = v; saveUi(); M.emit('route'); });
    bindSeg(root, 'rtheme', v => { c.theme = v; M.saveCfg(); M.applyTheme(); });
    const rs = $('#rsync', root); if (rs) rs.onclick = async () => { await M.sync({}); if (!S.sync.error && S.cfg) M.toast('Base à jour'); if (S.cfg) V.reglages(root); };
    const rd = $('#rdisc', root); if (rd) rd.onclick = async () => { if (await M.confirm('Se déconnecter ?', S.queue.length ? `${S.queue.length} saisie(s) n’ont pas encore été envoyées et seront perdues.` : 'Pour revenir, il faudra une nouvelle invitation de l’administrateur.', 'Se déconnecter', true)) { M.adminLock(); await M.reset(); location.hash = '#/bienvenue'; } };
    const rc = $('#rclr', root); if (rc) rc.onclick = async () => { S.rejected = []; await M.saveQueue(); V.reglages(root); };
    const rconn = $('#rconn', root); if (rconn) rconn.onclick = () => M.connectSheet();
    const au = $('#aunl', root); if (au) au.onclick = () => M.unlockSheet(() => V.reglages(root));
    const al = $('#alock', root); if (al) al.onclick = () => { M.adminLock(); M.toast('Mode administrateur verrouillé'); V.reglages(root); };
    const ri = $('#rinst', root); if (ri) ri.onclick = async () => { const e = window.__mercInstall; if (!e) return; e.prompt(); await e.userChoice; window.__mercInstall = null; V.reglages(root); };
    $$('[data-p]', root).forEach(inp => inp.onchange = async () => {
      const k = inp.dataset.p; const v = k === 'navMode' ? inp.value : M.num(inp.value);
      if (k !== 'navMode' && !(v >= 0)) { M.toast('Valeur invalide', 'bad'); return; }
      inp.disabled = true;
      try { await M.setParam(k, v); M.toast('Paramètre enregistré pour tous les dépôts'); }
      catch (e) { M.toast('Non enregistré : ' + e.message, 'bad'); inp.value = String(M.P()[k]).replace('.', ','); if (e.session) { V.reglages(root); return; } }
      inp.disabled = false;
    });
    const rp = $('#rpreset', root); if (rp) rp.onclick = async () => { if (!(await M.confirm('Revenir aux valeurs par défaut ?', 'Tous les paramètres de calcul reprennent les valeurs de l’outil navettes, pour tous les dépôts.', 'Rétablir'))) return;
      const d = M.defaultParams(); try { for (const k of Object.keys(d)) { if (S.data.params[k] !== d[k]) await M.setParam(k, d[k]); } M.toast('Valeurs rétablies'); } catch (e) { M.toast('Interrompu : ' + e.message, 'bad'); } V.reglages(root); };
    $('#rcat', root).onclick = () => { const cols = ['id', 'nom', 'famille', 'categorie', 'unite', 'poids_colis', 'pieces_colis', 'colis_palette', 'kg_palette']; M.download('mercuriale_catalogue.csv', M.csv(Array.from(S.ix.prod.values()), cols)); };
    $('#rreset', root).onclick = async () => { if (await M.confirm('Effacer les données de cet appareil ?', live && S.queue.length ? `${S.queue.length} saisie(s) non envoyée(s) seront perdues. Les données déjà envoyées restent dans la base. Pour revenir, il faudra une nouvelle invitation.` : 'Les données déjà envoyées restent dans la base de l’équipe.', 'Effacer', true)) { M.adminLock(); await M.reset(); location.hash = '#/bienvenue'; } };
  };

  /* ============================================================ ADMINISTRATION : PERSONNES ET ACTIVITÉ */
  const ACT_K = a => /^prix_/.test(a) ? 'prix' : /^(produit_|fournisseur_|parametre|catalogue)/.test(a) ? 'catalogue' : 'acces';
  const ACT_B = { prix: 'Prix', catalogue: 'Catalogue', acces: 'Accès' };
  M.ui.adm = M.ui.adm || { tab: 'people', person: '', kind: '' };
  const fmtT = iso => { const d = new Date(iso); return isFinite(d) ? d.toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; };
  const fmtD = iso => { const d = new Date(iso); return iso && isFinite(d) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; };
  V.admin = (root, q) => {
    if (!M.isAdmin()) { location.replace('#/reglages'); return; }
    if (!M.adminOn()) {
      root.innerHTML = `<div class="page-head"><div><h1>Personnes et activité</h1></div></div><div class="panel"><div class="empty"><h2 class="h3">Mode administrateur verrouillé</h2><p>Cette page demande le mot de passe administrateur.</p><button class="btn primary" type="button" id="aunl2">${I.edit}Déverrouiller</button></div></div>`;
      $('#aunl2', root).onclick = () => M.unlockSheet(() => V.admin(root, q)); return;
    }
    M.adminTouch();
    const U = M.ui.adm; if (q && q.person !== undefined) { U.person = q.person; U.tab = 'act'; }
    root.innerHTML = `<div class="page-head"><div><h1>Personnes et activité</h1><p class="sub">Réservé à l’administrateur. Tout est enregistré par le serveur : une appli modifiée ne peut pas effacer ses traces.</p></div>
        <a class="btn" href="#/reglages">Réglages</a></div>
      ${segH('atab', [['people', 'Personnes inscrites'], ['act', 'Activité']], U.tab)}
      <div id="abox" style="margin-top:14px"><div class="panel"><p class="muted">Chargement…</p></div></div>`;
    bindSeg(root, 'atab', v => { U.tab = v; saveUi(); V.admin(root); });
    const box = $('#abox', root);
    (U.tab === 'act' ? activityTab : peopleTab)(box, root);
  };
  async function peopleTab(box, root) {
    let j; try { j = await M.adminOp('list'); } catch (e) { return adminFail(e, box, root); }
    if (!box.isConnected) return;
    const rank = p => (p.moi ? 0 : 1) * 1000 + (p.actif ? 0 : 500) + ({ admin: 0, acheteur: 100, lecture: 200 }[p.role] || 300) + (M.DEPS.indexOf(p.depot) + 1);
    const people = j.people.slice().sort((a, b) => rank(a) - rank(b) || a.nom.localeCompare(b.nom, 'fr'));
    M.ui.admPeople = people;
    const actifs = people.filter(p => p.actif).length;
    box.innerHTML = `<div class="row wrap" style="justify-content:space-between;margin-bottom:10px"><p class="small muted" style="margin:0">${people.length} accès, dont ${actifs} actif(s). Touche une personne pour voir tout ce qu’elle a fait.</p>
        <div class="row" style="gap:8px"><button class="btn sm" type="button" id="pcsv">${I.download}Exporter</button><button class="btn primary sm" type="button" id="ainv">${I.plus}Inviter quelqu’un</button></div></div>
      <div class="panel flush">${people.map(p => `<div class="li"><a class="main" href="#/admin?person=${encodeURIComponent(p.id)}" style="color:inherit;text-decoration:none">
          <div class="t">${esc(p.nom)}${p.moi ? ' <span class="faint small">(toi)</span>' : ''} ${p.actif ? '' : '<span class="badge bad">désactivé</span>'}</div>
          <div class="s" style="white-space:normal">${esc(ROLE_L[p.role] || p.role)}${p.depot ? ', ' + esc(p.depot) : ''}, ${esc(agoT(p.dernier_acces))}</div>
          <div class="s" style="white-space:normal">${p.inscrit_le ? 'Inscrit le ' + esc(fmtD(p.inscrit_le)) : p.invitation ? 'Invitation en attente jusqu’au ' + esc(fmtD(p.invitation)) : p.dernier_acces ? 'Connecté avec son code, sans invitation' : 'Pas encore inscrit'}${p.cree_par ? ', invité par ' + esc(p.cree_par) : ''}, ${p.appareils || 0} appareil(s), ${p.actions30 || 0} action(s) sur 30 jours</div></a>
          <div class="row" style="gap:6px">${p.actif ? `<button class="btn sm" type="button" data-reinv="${esc(p.id)}" aria-label="Nouveau lien pour ${esc(p.nom)}">${I.share}<span class="hs">Nouveau lien</span></button>` : ''}
          ${p.moi ? '' : `<button class="btn sm ${p.actif ? 'danger' : ''}" type="button" data-tog="${esc(p.id)}">${p.actif ? 'Désactiver' : 'Réactiver'}</button>`}</div></div>`).join('')}</div>
      <p class="small muted" style="margin-top:8px">Une invitation ne marche qu’une fois, pendant 72 h, sur le téléphone qui l’ouvre. « Nouveau lien » sert pour un nouveau téléphone. « Désactiver » coupe l’accès et efface les données de son appli au prochain contact.</p>`;
    $('#pcsv', box).onclick = () => {
      const cols = ['nom', 'role_l', 'depot', 'etat', 'inscrit', 'cree_par', 'dernier', 'appareils', 'actions30'];
      const out = people.map(p => ({ nom: p.nom, role_l: ROLE_L[p.role] || p.role, depot: p.depot, etat: p.actif ? 'actif' : 'désactivé', inscrit: p.inscrit_le ? fmtD(p.inscrit_le) : '', cree_par: p.cree_par, dernier: p.dernier_acces ? new Date(p.dernier_acces).toLocaleString('fr-FR') : '', appareils: p.appareils || 0, actions30: p.actions30 || 0 }));
      M.download('mercuriale_personnes_' + M.today() + '.csv', M.csv(out, cols, ['Nom', 'Rôle', 'Dépôt', 'État', 'Inscrit le', 'Invité par', 'Dernier accès', 'Appareils', 'Actions sur 30 jours']));
    };
    $$('[data-reinv]', box).forEach(b => b.onclick = async () => { const p = people.find(x => x.id === b.dataset.reinv);
      if (!(await M.confirm('Nouveau lien pour ' + p.nom + ' ?', 'Pour un nouveau téléphone. L’ancien téléphone garde son accès : désactive-le si l’appareil est perdu.', 'Créer le lien'))) return;
      try { const r = await M.adminOp('reinvite', { id: p.id }); shareInvite(p.nom, r); peopleTab(box, root); } catch (e) { adminFail(e, box, root, true); } });
    $$('[data-tog]', box).forEach(b => b.onclick = async () => { const p = people.find(x => x.id === b.dataset.tog);
      if (p.actif && !(await M.confirm('Désactiver ' + p.nom + ' ?', 'Son application ne pourra plus rien lire ni envoyer, et ses données seront effacées de son téléphone au prochain contact avec le serveur.', 'Désactiver', true))) return;
      try { await M.adminOp(p.actif ? 'revoke' : 'restore', { id: p.id }); M.toast(p.actif ? p.nom + ' désactivé' : p.nom + ' réactivé'); peopleTab(box, root); } catch (e) { adminFail(e, box, root, true); } });
    $('#ainv', box).onclick = () => {
      let role = 'acheteur', dep = '';
      const s = M.sheet(`<div class="field"><label for="iv-n">Prénom (ou nom)</label><input class="input" id="iv-n" placeholder="ex. Léa" maxlength="60"></div>
        <div class="field"><span class="lbl">Rôle</span>${segH('ivr', [['acheteur', 'Acheteur'], ['lecture', 'Lecture seule'], ['admin', 'Administrateur']], role)}<span class="hint" id="iv-h">Saisit et consulte les prix de son dépôt.</span></div>
        <div class="field" id="iv-df"><span class="lbl">Dépôt <span class="faint small" id="iv-dh">(obligatoire)</span></span>${segH('ivd', M.DEPS.map(d => [d, d]), dep)}</div>
        <p class="small" id="iv-e" style="color:var(--bad);margin:0 0 10px" role="alert" hidden></p>
        <button class="btn primary big block" type="button" id="iv-go">Créer l’invitation</button>`, { title: 'Inviter quelqu’un' });
      const hint = { acheteur: 'Saisit et consulte les prix de son dépôt.', lecture: 'Consulte tout, ne saisit rien (direction, comptabilité).', admin: 'Réglages sensibles avec le mot de passe administrateur. Avec un dépôt, il peut aussi saisir des prix sans déverrouiller.' };
      bindSeg(s.el, 'ivr', v => { role = v; $('#iv-h', s.el).textContent = hint[v]; $('#iv-dh', s.el).textContent = v === 'acheteur' ? '(obligatoire)' : '(facultatif)'; });
      bindSeg(s.el, 'ivd', v => { dep = v; });
      $('#iv-go', s.el).onclick = async () => {
        const nom = $('#iv-n', s.el).value.trim(); const er = $('#iv-e', s.el); er.hidden = true;
        try { const r = await M.adminOp('invite', { nom, role, depot: dep }); s.close(); shareInvite(nom, r); peopleTab(box, root); }
        catch (e) { er.textContent = e.message; er.hidden = false; if (e.session) { s.close(); V.admin(root); } }
      };
    };
  }
  async function activityTab(box, root) {
    const U = M.ui.adm; let people = M.ui.admPeople;
    if (!people) { try { people = (await M.adminOp('list')).people; M.ui.admPeople = people; } catch (e) { return adminFail(e, box, root); } }
    let rows = [], total = 0;
    const load = async (more) => {
      let j; try { j = await M.adminOp('activity', { person: U.person, kind: U.kind, offset: more ? rows.length : 0, limit: 150 }); } catch (e) { return adminFail(e, box, root); }
      rows = more ? rows.concat(j.rows) : j.rows; total = j.total; draw();
    };
    const draw = () => {
      if (!box.isConnected) return;
      let last = '';
      box.innerHTML = `<div class="row wrap" style="gap:10px;margin-bottom:10px">
          <select class="input" id="aper" style="width:auto;min-height:44px" aria-label="Personne"><option value="">Tout le monde</option>${people.map(p => `<option value="${esc(p.id)}"${U.person === p.id ? ' selected' : ''}>${esc(p.nom)}${p.depot ? ' (' + esc(p.depot) + ')' : ''}${p.actif ? '' : ', désactivé'}</option>`).join('')}</select>
          ${segH('akind', [['', 'Tout'], ['prix', 'Prix'], ['catalogue', 'Catalogue'], ['acces', 'Accès et sécurité']], U.kind)}
          <button class="btn sm" type="button" id="acsv">${I.download}Exporter</button></div>
        <p class="small muted" style="margin:0 2px 10px">${total} action(s)${U.person ? ' pour cette personne' : ''}, les plus récentes d’abord. L’historique complet est aussi dans l’onglet Journal du Google Sheet.</p>
        ${rows.length ? `<div class="panel flush">${rows.map(x => { const day = String(x.t).slice(0, 10); const head = day !== last ? `<div class="li" style="background:var(--surface-2)"><div class="main"><div class="s"><b>${esc(new Date(x.t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))}</b></div></div></div>` : ''; last = day; const k = ACT_K(x.action);
            return head + `<div class="li"><div class="main"><div class="t">${esc(ACT_L[x.action] || x.action)}${x.objet ? ' : ' + esc(x.objet) : ''}</div>
              <div class="s" style="white-space:normal">${esc(new Date(x.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))}, ${esc(x.nom || x.role || '—')}${x.depot ? ' (' + esc(x.depot) + ')' : ''}</div>
              ${x.detail ? `<div class="s" style="white-space:normal;color:var(--ink)">${esc(x.detail)}</div>` : ''}</div><span class="badge ${k === 'acces' && /echec|refuse|desactive/.test(x.action) ? 'bad' : ''}">${ACT_B[k]}</span></div>`; }).join('')}</div>
          ${rows.length < total ? `<div style="text-align:center;margin-top:14px"><button class="btn" id="amore" type="button">Afficher plus</button></div>` : ''}`
        : `<div class="panel"><div class="empty"><h2 class="h3">Aucune action</h2><p>Rien ne correspond à ces filtres pour l’instant.</p></div></div>`}`;
      $('#aper', box).onchange = e => { U.person = e.target.value; saveUi(); load(false); };
      bindSeg(box, 'akind', v => { U.kind = v; saveUi(); load(false); });
      const m = $('#amore', box); if (m) m.onclick = () => load(true);
      $('#acsv', box).onclick = async () => {
        let all; try { all = (await M.adminOp('activity', { person: U.person, kind: U.kind, offset: 0, limit: 5000 })).rows; } catch (e) { return adminFail(e, box, root); }
        const out = all.map(x => ({ quand: new Date(x.t).toLocaleString('fr-FR'), qui: x.nom || x.role, depot: x.depot, quoi: ACT_L[x.action] || x.action, objet: x.objet, detail: x.detail }));
        M.download('mercuriale_activite_' + M.today() + '.csv', M.csv(out, ['quand', 'qui', 'depot', 'quoi', 'objet', 'detail'], ['Date et heure', 'Qui', 'Dépôt', 'Action', 'Sur quoi', 'Détail (avant → après)'])); M.toast(all.length + ' action(s) exportée(s)');
      };
    };
    load(false);
  }
  function adminFail(e, box, root, toastOnly) {
    if (e && e.session) { M.toast('Mode administrateur verrouillé', 'bad'); V.admin(root); return; }
    if (toastOnly) { M.toast(e.message || String(e), 'bad'); return; }
    box.innerHTML = `<div class="panel"><p class="muted">Impossible de charger : ${esc(e.message || String(e))}</p></div>`;
  }

  /* ============================================================ BIENVENUE / CONNEXION */
  V.bienvenue = (root) => {
    const wiped = M.lsGet('wiped', null);
    root.innerHTML = `<div class="welcome">${M.mark('mark')}
      <div><h1>Mercuriale</h1><p class="lead" style="margin-top:10px">Les prix d’achat fruits et légumes des quatre dépôts, au même endroit : saisis-les en quelques secondes, compare, et vois où acheter moins cher, transport compris.</p></div>
      ${M.isIOS() && M.isStandalone() && !M.pendingInvite() ? `<div class="callout">Sur iPhone, l’appli installée ne voit pas une connexion faite dans Safari. Touche « Rejoindre la base de mon équipe » et colle ton lien d’invitation (appui long sur le lien dans ton message, puis Copier).</div>` : ''}
      ${wiped === 'revoked' ? `<div class="callout bad">Cet appareil a été déconnecté par l’administrateur et ses données ont été effacées. Pour revenir, demande une nouvelle invitation.</div>` : ''}
      <div class="choice">
        ${window.__mercDemoFile ? '' : `<button type="button" id="wjoin"><b>Rejoindre la base de mon équipe</b><span>Ouvre le lien d’invitation reçu de l’administrateur. Administrateur : adresse du serveur et code administrateur.</span></button>`}
        <button type="button" id="wdemo"><b>${window.__mercDemoFile ? 'Commencer le test' : 'Découvrir avec des données de démonstration'}</b><span>45 produits, 4 dépôts, 10 semaines de prix fictifs. Rien n’est envoyé, rien à installer.</span></button>
      </div><p class="small faint">${window.__mercDemoFile ? 'Version de test en un seul fichier. La vraie version partage les prix entre les 4 dépôts et s’installe sur les téléphones.' : 'Accès personnel sur invitation. Fonctionne sur téléphone et sur ordinateur, même sans réseau.'}</p></div>`;
    const wj = $('#wjoin', root); if (wj) wj.onclick = () => M.connectSheet();
    $('#wdemo', root).onclick = () => {
      let dep = 'RV';
      const s = M.sheet(`<div class="field"><span class="lbl">Ton dépôt</span><div class="deppick">${M.DEPS.map(d => `<button type="button" class="c-${d}" data-d="${d}" aria-pressed="${d === dep}"><span class="dep lg c-${d}"><i></i>${esc(M.DEPN[d])}</span><span class="city">${esc(M.DEPCITY[d])}</span></button>`).join('')}</div></div>
        <div class="field"><label for="wname">Ton prénom</label><input class="input" id="wname" placeholder="ex. Enzo"></div>
        <button class="btn primary big block" id="wgo" type="button">Commencer</button>`, { title: 'Données de démonstration', noFocus: true });
      $$('[data-d]', s.el).forEach(b => b.onclick = () => { dep = b.dataset.d; $$('[data-d]', s.el).forEach(x => x.setAttribute('aria-pressed', String(x === b))); });
      $('#wgo', s.el).onclick = async () => { M.lsSet('wiped', null); await M.startDemo(dep, $('#wname', s.el).value.trim()); s.close(); location.hash = '#/accueil'; M.emit('route'); M.toast('Démo prête : essaie de saisir un prix'); };
    };
  };
  /* lien d'invitation ouvert : sur iPhone dans Safari, on installe d'abord l'appli (elle retrouvera l'invitation) */
  M.openInvite = (pre) => {
    M.keepInvite(pre.api, pre.jeton);
    if (M.isIOS() && !M.isStandalone() && !window.__mercDemoFile) {
      const s = M.sheet(`<p class="muted" style="margin-bottom:12px">Sur iPhone, installe d’abord Mercuriale sur ton écran d’accueil : ton invitation t’y attend.</p>
        <ol class="steps"><li>Touche le bouton <b>Partager</b> de Safari ${I.share.replace('class="i"', 'class="i s"')} (sur iOS 26 : menu <b>…</b> à côté de l’adresse).</li><li>Choisis <b>Sur l’écran d’accueil</b>, puis <b>Ajouter</b>.</li><li>Ouvre <b>Mercuriale</b> depuis la nouvelle icône : l’invitation s’ouvre toute seule.</li></ol>
        <p class="small muted" style="margin:10px 0 14px">Si l’appli ne retrouve pas l’invitation : dans Mercuriale, touche « Rejoindre la base de mon équipe » et colle ce même lien (appui long sur le lien dans ton message, puis Copier).</p>
        <button class="btn block" type="button" id="jsaf">Utiliser plutôt dans Safari, sans installer</button>`, { title: 'Bienvenue sur Mercuriale' });
      $('#jsaf', s.el).onclick = () => { s.close(); M.joinSheet(pre); };
      return;
    }
    M.joinSheet(pre);
  };
  /* invitation reçue : un seul bouton, le code personnel n'est jamais affiché */
  M.joinSheet = (pre) => {
    const s = M.sheet(`<p class="muted" style="margin-bottom:14px">${pre.found ? 'Ton invitation a été retrouvée. ' : 'Tu as reçu une invitation personnelle. '}Elle ne fonctionne <b>qu’une seule fois</b> : ${pre.found ? 'elle va être utilisée sur cet appareil.' : 'ouvre-la sur le téléphone ou l’ordinateur que tu vas utiliser.'}</p>
      <div class="field"><label for="jname">Ton prénom (affiché sur tes saisies)</label><input class="input" id="jname" placeholder="ex. Léa" autocomplete="given-name"></div>
      <p class="small" id="jerr" style="color:var(--bad);margin-bottom:10px" role="alert" hidden></p>
      <button class="btn primary big block" id="jgo" type="button">Rejoindre la base de l’équipe</button>`, { title: 'Bienvenue sur Mercuriale' });
    $('#jgo', s.el).onclick = async () => {
      const b = $('#jgo', s.el); const err = $('#jerr', s.el); err.hidden = true; b.disabled = true; b.textContent = 'Chargement de la base…';
      err.style.color = 'var(--ink-2)'; err.textContent = 'Premier chargement de tout l’historique des prix : jusqu’à une minute. Laisse cette fenêtre ouverte.'; err.hidden = false;
      try {
        const me = await M.join(pre.api, pre.jeton, $('#jname', s.el).value.trim());
        M.lsSet('wiped', null); s.close(); location.hash = '#/accueil'; M.emit('route'); M.persist();
        M.toast('Connecté : ' + (me.role === 'admin' ? 'administrateur' : me.role === 'lecture' ? 'lecture seule' : (M.DEPN[me.depot] || me.depot)));
      } catch (e) { if (e && e.superseded) return; err.style.color = 'var(--bad)'; err.textContent = (e.name === 'AbortError' ? 'Le serveur n’a pas répondu à temps, réessaie dans un instant.' : (e.message || String(e))); err.hidden = false; b.disabled = false; b.textContent = 'Rejoindre la base de l’équipe'; }
    };
  };
  /* connexion manuelle : réservée en pratique à l'administrateur (adresse du serveur + code administrateur, visibles seulement dans le Google Sheet) */
  M.connectSheet = (pre) => {
    pre = pre || {};
    if (!pre.admin) {
      const s0 = M.sheet(`<div class="field"><label for="clink">Lien d’invitation</label><textarea class="input" id="clink" rows="3" placeholder="Colle ici le lien reçu de l’administrateur" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><span class="hint">Appui long sur le lien dans ton message, Copier, puis colle-le ici.</span></div>
        <p class="small" id="clerr" style="color:var(--bad);margin-bottom:10px" role="alert" hidden></p>
        <button class="btn primary big block" id="clgo" type="button">Continuer</button>
        <button class="linkbtn" id="cladm" type="button" style="margin-top:16px">Je suis l’administrateur : adresse du serveur et code</button>`, { title: 'Rejoindre la base de l’équipe' });
      $('#clgo', s0.el).onclick = () => { const inv = M.parseInvite($('#clink', s0.el).value); if (!inv) { const e = $('#clerr', s0.el); e.textContent = 'Ce n’est pas un lien d’invitation Mercuriale complet.'; e.hidden = false; return; } s0.close(); M.joinSheet(inv); };
      $('#cladm', s0.el).onclick = () => { s0.close(); M.connectSheet(Object.assign({}, pre, { admin: true })); };
      return;
    }
    const s = M.sheet(`<p class="muted small" style="margin-bottom:12px">Première connexion de l’administrateur. Les acheteurs, eux, utilisent leur lien d’invitation.</p>
      <div class="field"><label for="capi">Adresse du serveur</label><input class="input" id="capi" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(pre.api || '')}" autocomplete="off"><span class="hint">URL de l’application Web Apps Script, qui finit par /exec.</span></div>
      <div class="field"><label for="ccode">Code d’accès</label><input class="input" id="ccode" type="password" placeholder="ex. ADMIN-XXXXX-XXXXX" value="${esc(pre.code || '')}" autocapitalize="characters" autocomplete="off"><span class="hint">Menu Mercuriale → Afficher le code administrateur, dans le Google Sheet.</span></div>
      <div class="field"><label for="cname">Ton prénom</label><input class="input" id="cname" placeholder="ex. Enzo" value="${esc((S.cfg && S.cfg.buyer) || '')}"></div>
      <p class="small muted" id="cerr" style="color:var(--bad);margin-bottom:10px" role="alert" hidden></p>
      <button class="btn primary big block" id="cgo" type="button">Se connecter</button>`, { title: 'Rejoindre la base de l’équipe', noFocus: !!pre.code });
    if (pre.code) setTimeout(() => $('#cname', s.el).focus(), 60);
    $('#cgo', s.el).onclick = async () => {
      const b = $('#cgo', s.el); const err = $('#cerr', s.el); err.hidden = true; b.disabled = true; b.textContent = 'Chargement de la base…';
      err.style.color = 'var(--ink-2)'; err.textContent = 'Premier chargement de tout l’historique des prix : jusqu’à une minute. Laisse cette fenêtre ouverte.'; err.hidden = false;
      try {
        const me = await M.connect($('#capi', s.el).value, $('#ccode', s.el).value, $('#cname', s.el).value.trim());
        M.lsSet('wiped', null); s.close(); location.hash = '#/accueil'; M.emit('route'); M.persist();
        M.toast(me.role === 'admin' ? 'Connecté en administrateur (mode administrateur verrouillé)' : 'Connecté : ' + (M.DEPN[me.depot] || me.depot));
      } catch (e) { if (e && e.superseded) return; err.style.color = 'var(--bad)'; err.textContent = 'Connexion impossible : ' + (e.name === 'AbortError' ? 'le serveur n’a pas répondu à temps, réessaie dans un instant.' : (e.message || e)); err.hidden = false; b.disabled = false; b.textContent = 'Se connecter'; }
    };
  };
})();
