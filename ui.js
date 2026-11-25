/* Mercuriale — composants d'interface */
'use strict';
(function () {
  const M = window.M, esc = M.esc;
  const P = (d) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  M.I = {
    home: P('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
    plus: P('<path d="M12 5v14M5 12h14"/>'),
    compare: P('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    route: P('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>'),
    menu: P('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    list: P('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
    gear: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    search: P('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    sync: P('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>'),
    star: P('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    trash: P('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    edit: P('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>'),
    download: P('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
    chev: P('<path d="m9 6 6 6-6 6"/>'),
    back: P('<path d="m15 6-6 6 6 6"/>'),
    x: P('<path d="M6 6l12 12M18 6 6 18"/>'),
    check: P('<path d="m5 12 5 5 9-10"/>'),
    truck: P('<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    wifiOff: P('<path d="M2 8.8a16 16 0 0 1 5-2.9M10.7 5.1A16 16 0 0 1 22 8.8M5 12.5a11 11 0 0 1 3.5-2M15.5 10.5A11 11 0 0 1 19 12.5M8.5 16a6 6 0 0 1 7 0"/><path d="M12 20h.01M3 3l18 18"/>'),
    info: P('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    share: P('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>'),
    copy: P('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
    calc: P('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>')
  };
  M.mark = (cls) => `<svg class="${cls || 'brand-mark'}" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M10 8h30l16 24-16 24H10a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#ffd23f"/>
    <circle cx="18" cy="32" r="4.5" fill="var(--paper)"/>
    <path d="M27 42c0-9 6-16 16-18-1 10-7 17-16 18z" fill="#1d5a3c"/><path d="M27 42c3-6 7-10 12-13" stroke="#ffd23f" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;

  M.dep = (d, lg) => `<span class="dep c-${esc(d)}${lg ? ' lg' : ''}"><i></i>${esc(d)}</span>`;
  M.depFull = d => `<span class="dep c-${esc(d)}"><i></i>${esc(M.DEPN[d] || d)}</span>`;
  M.priceTag = (v, basis, cls) => `<span class="tagp ${cls || ''}">${M.px(v)}<span class="u">${esc(M.UNITS[basis] || '€')}</span></span>`;
  M.priceV = (v, basis) => `<span class="pricev">${M.px(v)}<span class="u">${esc(M.UNITS[basis] || '€')}</span></span>`;
  M.deltaH = (g) => { if (g == null || !isFinite(g)) return ''; const c = Math.abs(g) < 0.005 ? 'eq' : g > 0 ? 'up' : 'down'; return `<span class="delta ${c}">${M.pct(g, true)}</span>`; };

  /* ------------------------------------------------------------ toasts */
  M.toast = (msg, kind, act) => {
    const box = document.getElementById('toasts'); if (!box) return;
    const t = document.createElement('div'); t.className = 'toast' + (kind === 'bad' ? ' bad' : ''); t.setAttribute('role', 'status');
    t.innerHTML = `<span>${esc(msg)}</span>` + (act ? `<button class="act" type="button">${esc(act.label)}</button>` : '');
    if (act) t.querySelector('.act').onclick = () => { act.fn(); t.remove(); };
    box.appendChild(t); setTimeout(() => t.remove(), act ? 7000 : 3800);
  };
  M.on('toast', o => M.toast(o.msg, o.kind));

  /* ------------------------------------------------------------ fenêtre (bottom sheet) */
  let sheetN = 0;
  M.sheet = (html, opts) => {
    opts = opts || {};
    const opener = document.activeElement; const hid = 'sheet-t' + (++sheetN);
    const bg = document.createElement('div'); bg.className = 'sheet-bg';
    bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="${hid}"><div class="grab"></div>
      <div class="sh-h"><h2 id="${hid}">${esc(opts.title || '')}</h2><button class="iconbtn" type="button" data-close aria-label="Fermer">${M.I.x}</button></div>${html}</div>`;
    let closed = false;
    const close = () => {
      if (closed) return; closed = true; bg.remove(); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose();
      // le focus revient là où il était (clavier, lecteur d'écran)
      if (opener && opener.isConnected && typeof opener.focus === 'function') { try { opener.focus({ preventScroll: true }); } catch (e) {} }
    };
    const onKey = e => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const fs = Array.from(bg.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(x => !x.disabled && x.offsetParent !== null);
      if (!fs.length) return;
      const first = fs[0], last = fs[fs.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(bg);
    const f = bg.querySelector('input,select,textarea,button:not([data-close])'); if (f && !opts.noFocus) setTimeout(() => f.focus(), 50);
    return { el: bg.querySelector('.sheet'), close };
  };
  M.confirm = (title, text, okLabel, danger) => new Promise(res => {
    const s = M.sheet(`<p class="muted" style="margin-bottom:18px">${esc(text)}</p><div class="two"><button class="btn" data-close type="button">Annuler</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok type="button">${esc(okLabel)}</button></div>`,
      { title, onClose: () => res(false) });
    // résoudre AVANT de fermer : la fermeture déclenche onClose qui répondrait « non »
    s.el.querySelector('[data-ok]').onclick = () => { res(true); s.close(); };
  });

  /* ------------------------------------------------------------ graphique : prix dans le temps par dépôt */
  M.lineChart = (el, series, basis) => {
    const W = Math.max(320, el.clientWidth || 640), H = 250, pl = 46, pr = 14, pt = 14, pb = 30;
    const pts = series.flatMap(s => s.points);
    if (!pts.length) { el.innerHTML = '<p class="muted small">Pas encore assez de prix pour tracer une courbe.</p>'; return; }
    const xs = pts.map(p => M.parseD(p.x).getTime());
    let x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs); if (x1 === x0) { x0 -= 3 * 864e5; x1 += 3 * 864e5; }
    let y0 = Math.min.apply(null, pts.map(p => p.y)), y1 = Math.max.apply(null, pts.map(p => p.y));
    const span = (y1 - y0) || y1 * 0.2 || 1; y0 = Math.max(0, y0 - span * 0.15); y1 = y1 + span * 0.15;
    const step = niceStep((y1 - y0) / 4); y0 = Math.floor(y0 / step) * step; y1 = Math.ceil(y1 / step) * step;
    const X = t => pl + (t - x0) / (x1 - x0) * (W - pl - pr), Y = v => pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb);
    let g = '';
    for (let v = y0; v <= y1 + 1e-9; v += step) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line-2)"/><text x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="12" fill="var(--ink-3)">${M.n2(v)}</text>`;
    const nT = Math.min(6, Math.max(2, Math.round((W - pl - pr) / 110)));
    for (let i = 0; i <= nT; i++) { const t = x0 + (x1 - x0) * i / nT; g += `<text x="${X(t)}" y="${H - 8}" text-anchor="middle" font-size="12" fill="var(--ink-3)">${M.dNum(M.iso(new Date(t)))}</text>`; }
    let lines = '';
    series.forEach(s => {
      const sp = s.points.slice().sort((a, b) => a.x < b.x ? -1 : 1);
      if (!sp.length) return;
      const d = sp.map((p, i) => (i ? 'L' : 'M') + X(M.parseD(p.x).getTime()).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join(' ');
      lines += `<path d="${d}" fill="none" stroke="var(--${s.dep.toLowerCase()})" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      sp.forEach(p => { lines += `<circle cx="${X(M.parseD(p.x).getTime())}" cy="${Y(p.y)}" r="4" fill="var(--${s.dep.toLowerCase()})" stroke="var(--surface)" stroke-width="2"/>`; });
      const last = sp[sp.length - 1];
      lines += `<text x="${Math.min(W - pr, X(M.parseD(last.x).getTime()) + 7)}" y="${Y(last.y) - 8}" font-size="12" font-weight="700" fill="var(--ink-2)" text-anchor="${X(M.parseD(last.x).getTime()) > W - 60 ? 'end' : 'start'}">${esc(s.dep)}</text>`;
    });
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution des prix par dépôt">${g}${lines}<line class="xh" y1="${pt}" y2="${H - pb}" stroke="var(--ink-3)" stroke-dasharray="3 3" visibility="hidden"/><rect x="${pl}" y="${pt}" width="${W - pl - pr}" height="${H - pt - pb}" fill="transparent" class="hit"/></svg><div class="tip" hidden></div>`;
    const svg = el.querySelector('svg'), tip = el.querySelector('.tip'), xh = el.querySelector('.xh');
    const days = Array.from(new Set(pts.map(p => p.x))).sort();
    const move = ev => {
      const r = svg.getBoundingClientRect(); const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left; const sx = cx * W / r.width;
      const t = x0 + (sx - pl) / (W - pl - pr) * (x1 - x0);
      let best = days[0], bd = Infinity; days.forEach(d => { const k = Math.abs(M.parseD(d).getTime() - t); if (k < bd) { bd = k; best = d; } });
      const xx = X(M.parseD(best).getTime()); xh.setAttribute('x1', xx); xh.setAttribute('x2', xx); xh.setAttribute('visibility', 'visible');
      const rows = series.map(s => { const p = s.points.find(q => q.x === best); return p ? `<div class="rowt">${M.dep(s.dep)}<b class="num">${M.px(p.y)} ${esc(M.UNITS[basis] || '')}</b></div>` : ''; }).join('');
      tip.innerHTML = `<div class="d">Semaine du ${esc(M.dShort(best))}</div>${rows}`; tip.hidden = false;
      tip.style.left = Math.max(80, Math.min(r.width - 80, xx * r.width / W)) + 'px'; tip.style.top = (pt * r.height / H + 4) + 'px';
    };
    const leave = () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); };
    const hit = el.querySelector('.hit');
    hit.addEventListener('mousemove', move); hit.addEventListener('touchstart', move, { passive: true }); hit.addEventListener('touchmove', move, { passive: true });
    hit.addEventListener('mouseleave', leave); hit.addEventListener('touchend', () => setTimeout(leave, 1600));
  };
  function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const n = raw / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }

  /* ------------------------------------------------------------ liste de suggestions (produits / fournisseurs) */
  M.combo = (wrap, o) => {
    // o: {placeholder, items():[{id,label,sub,score?}], onPick(item), onNew(text), newLabel(text)}
    wrap.classList.add('combo');
    const lid = (o.id || 'cb' + Math.random().toString(36).slice(2, 7)) + '-list';
    wrap.innerHTML = `<input class="input" type="search" autocomplete="off" enterkeyhint="search" placeholder="${esc(o.placeholder || '')}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${lid}"${o.label ? ` aria-label="${esc(o.label)}"` : ''}${o.id ? ` id="${o.id}"` : ''}><div class="sug" id="${lid}" hidden role="listbox"></div>`;
    const inp = wrap.querySelector('input'), sug = wrap.querySelector('.sug');
    new MutationObserver(() => inp.setAttribute('aria-expanded', String(!sug.hidden))).observe(sug, { attributes: true, attributeFilter: ['hidden'] });
    let cur = [], on = -1;
    const render = () => {
      const q = M.norm(inp.value.trim());
      const all = o.items();
      let list = q ? all.filter(it => M.norm(it.label).includes(q) || (it.sub && M.norm(it.sub).includes(q))) : all.slice(0, o.emptyCount || 8);
      if (q) list.sort((a, b) => (M.norm(a.label).startsWith(q) ? 0 : 1) - (M.norm(b.label).startsWith(q) ? 0 : 1) || (b.score || 0) - (a.score || 0));
      cur = list.slice(0, 30); on = -1;
      let h = cur.map((it, i) => `<button type="button" role="option" data-i="${i}"><span>${esc(it.label)}</span><span class="f">${esc(it.sub || '')}</span></button>`).join('');
      if (q && o.onNew && !all.some(it => M.norm(it.label) === q)) h += `<button type="button" data-new><span class="new">${esc(o.newLabel ? o.newLabel(inp.value.trim()) : 'Ajouter « ' + inp.value.trim() + ' »')}</span></button>`;
      sug.innerHTML = h; sug.hidden = !h;
    };
    inp.addEventListener('input', render); inp.addEventListener('focus', render);
    inp.addEventListener('keydown', e => {
      const bs = sug.querySelectorAll('button'); if (!bs.length) return;
      if (e.key === 'ArrowDown') { on = Math.min(bs.length - 1, on + 1); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { on = Math.max(0, on - 1); e.preventDefault(); }
      else if (e.key === 'Enter') { e.preventDefault(); (bs[on >= 0 ? on : 0]).click(); return; }
      else if (e.key === 'Escape') { sug.hidden = true; return; }
      bs.forEach((b, i) => { b.classList.toggle('on', i === on); b.setAttribute('aria-selected', String(i === on)); if (!b.id) b.id = lid + '-o' + i; }); if (bs[on]) { bs[on].scrollIntoView({ block: 'nearest' }); inp.setAttribute('aria-activedescendant', bs[on].id); }
    });
    sug.addEventListener('mousedown', e => e.preventDefault());
    sug.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-new')) { sug.hidden = true; o.onNew(inp.value.trim()); return; }
      const it = cur[+b.dataset.i]; sug.hidden = true; if (it) o.onPick(it);
    });
    inp.addEventListener('blur', () => setTimeout(() => { sug.hidden = true; if (o.onBlur) o.onBlur(inp.value.trim()); }, 120));
    return { input: inp, refresh: render };
  };
})();
