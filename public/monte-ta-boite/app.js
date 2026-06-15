/* ==================================================================
 * Monte ta boîte spatiale - logique de l'atelier
 * ================================================================== */
(function () {
  'use strict';
  const { LEAD_CATS, TAIL_CATS, SECTORS } = window.MTB_DATA;

  /* ---------- État ---------- */
  const STATE_KEY = 'mtb_state_v1';
  const TWEAK_KEY = 'mtb_tweaks_v1';

  const defaultState = { step: 0, sector: null, name: '', companyType: '', desc: '', location: '', jobs: '', hintShown: false, manual: {} };

  const COMPANY_TYPES = [
    { id: 'startup', label: 'Startup' },
    { id: 'pme', label: 'PME' },
    { id: 'grand-groupe', label: 'Grand groupe' },
  ];
  let state = load(STATE_KEY, defaultState);
  let tweaks = load(TWEAK_KEY, { bilanStyle: 'cartes', exigence: 'normal' });

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ? Object.assign({}, fallback, v) : Object.assign({}, fallback); }
    catch (e) { return Object.assign({}, fallback); }
  }
  function saveState() { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {} }
  function saveTweaks() { try { localStorage.setItem(TWEAK_KEY, JSON.stringify(tweaks)); } catch (e) {} }

  /* ---------- Logo (en mémoire, non persisté pour ne pas saturer le storage) ---------- */
  let logoImg = null;      // HTMLImageElement (si image)
  let logoMeta = null;     // { name, type, size, path? }
  let logoStatus = '';     // message affiché sous le dépôt
  let logoTone = '';       // ok | warn | err | pending
  let navDir = 'fwd';      // sens de transition entre écrans (widget)

  /* Logo de marque Space Elevator (pour le certificat) */
  const brandMark = new Image();
  let brandReady = false;
  brandMark.onload = () => { brandReady = true; if (state.step === 5) drawCertificate(); };
  brandMark.src = 'assets/logo-wordmark-black.png';

  /* ---------- Utilitaires ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function joinFr(arr) {
    arr = arr.filter(Boolean);
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1];
  }
  function jobLines() {
    return String(state.jobs || '').split(/\n/).map(l => l.trim()).filter(Boolean);
  }
  function sectorObj() { return SECTORS.find(s => s.id === state.sector) || null; }

  /* ---------- Catégories actives pour le secteur courant ---------- */
  function buildCategories() {
    const sec = sectorObj();
    if (!sec) return [];
    const ing = sec.jobs.filter(j => j.lvl !== 'tech');
    const tech = sec.jobs.filter(j => j.lvl === 'tech');
    const coreIng = { id: 'core-ing', label: sec.coreLabels.ing, note: sec.coreNotes.ing, weight: 1.4, jobs: ing };
    const coreTech = { id: 'core-tech', label: sec.coreLabels.tech, note: sec.coreNotes.tech, weight: 1.4, jobs: tech };
    return [].concat(LEAD_CATS, [coreIng, coreTech], TAIL_CATS);
  }

  const REVEAL = {
    direction: 'la direction (qui dirige et signe ?)',
    'core-ing': "les ingénieurs (bureau d'études, conception)",
    'core-tech': 'les techniciens & opérateurs (fabrication, terrain)',
    support: 'les fonctions support (RH, juridique, commercial…)',
    securite: 'la sécurité et la qualité',
    si: "l'informatique et la cybersécurité",
    jeunes: 'les jeunes (stagiaires, alternants)',
  };
  const SHORT = {
    direction: 'la direction',
    'core-ing': 'les ingénieurs',
    'core-tech': 'les techniciens & opérateurs',
    support: 'les fonctions support',
    securite: 'la sécurité & la qualité',
    si: "l'informatique",
    jeunes: 'les jeunes talents',
  };

  /* ---------- Moteur d'analyse (reconnaissance floue) ---------- */
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      let cur = [i];
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      prev = cur;
    }
    return prev[n];
  }
  function sim(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    return 1 - lev(a, b) / Math.max(a.length, b.length);
  }

  let _idxCache = null, _idxKey = null;
  function activeJobIndex() {
    if (_idxKey === state.sector && _idxCache) return _idxCache;
    const idx = [];
    buildCategories().forEach(cat => cat.jobs.forEach(job => {
      const phrases = job.kw.concat([norm(job.name)]).map(p => ({
        raw: p, words: p.split(' ').filter(w => w.length >= 3),
      }));
      idx.push({ job, catId: cat.id, catLabel: cat.label, phrases });
    }));
    _idxCache = idx; _idxKey = state.sector;
    return idx;
  }

  function fuzzyScore(words, phrases) {
    let best = 0;
    for (const ph of phrases) {
      if (!ph.words.length) continue;
      let minS = 1;
      for (const kw of ph.words) {
        let s = 0;
        for (const w of words) { const v = sim(kw, w); if (v > s) s = v; }
        if (s < minS) minS = s;
      }
      if (minS > best) best = minS;
    }
    return best;
  }

  /* Renvoie le meilleur métier reconnu pour une ligne, ou null */
  function matchOneLine(line, idx) {
    const ln = norm(line);
    if (!ln) return null;
    const padded = ' ' + ln + ' ';
    const words = ln.split(' ').filter(Boolean);
    let best = null;
    for (const e of idx) {
      const exact = e.job.kw.some(k => padded.indexOf(' ' + k + ' ') !== -1);
      const conf = exact ? 1 : fuzzyScore(words, e.phrases);
      if (!best || conf > best.conf) best = { e, conf, exact };
    }
    if (best && best.conf >= 0.8) return best;
    return null;
  }

  /* Libellés de catégorie (sensibles au secteur, car le cœur est scindé) */
  function catPairs() {
    return buildCategories().map(c => [c.id, c.label]).concat([['autre', 'Autre']]);
  }
  function catLabelOf(id) {
    if (id === 'autre') return 'Autre';
    const c = buildCategories().find(x => x.id === id);
    return c ? c.label : id;
  }

  /* Valide chaque ligne saisie (un métier à la fois) */
  function validateLines() {
    const idx = activeJobIndex();
    const ov = state.manual || {};
    return jobLines().map(line => {
      const key = norm(line);
      const m = matchOneLine(line, idx);
      if (m) {
        const reclassed = !!(ov[key] && ov[key] !== m.e.catId);
        const catId = reclassed ? ov[key] : m.e.catId;
        return { line, key, name: m.e.job.name, cat: catLabelOf(catId), catId, exact: m.exact, reclassed };
      }
      if (ov[key]) return { line, key, name: null, manual: true, catId: ov[key], cat: catLabelOf(ov[key]) };
      return { line, key, name: null };
    });
  }

  function thresholdFor(total) {
    if (tweaks.exigence === 'indulgent') return 1;
    if (tweaks.exigence === 'strict') return total;
    return Math.max(1, Math.round(total * 0.5));
  }

  function analyze() {
    const cats = buildCategories();
    const res = validateLines();
    const covered = new Set();
    const placedByCat = {};
    res.forEach(r => {
      if (r.name && !r.reclassed) covered.add(r.name);
      else if (r.name && r.reclassed) (placedByCat[r.catId] = placedByCat[r.catId] || []).push(r.name);
      else if (r.manual) (placedByCat[r.catId] = placedByCat[r.catId] || []).push(r.line);
    });

    const result = cats.map(cat => {
      const jobs = cat.jobs.map(job => ({ name: job.name, covered: covered.has(job.name) }));
      const own = jobs.filter(j => j.covered).length;
      const placed = (placedByCat[cat.id] || []).length;
      const matched = own + placed;
      const total = jobs.length;
      const th = thresholdFor(total);
      let status = matched === 0 ? 'oublie' : matched < th ? 'partiel' : 'solide';
      const score = status === 'oublie' ? 0 : status === 'partiel' ? 0.5 : 1;
      return { id: cat.id, label: cat.label, note: cat.note, weight: cat.weight, jobs, manual: placedByCat[cat.id] || [], matched, total, status, score };
    });

    const extras = res.filter(r => !r.name && !r.manual).map(r => r.line);
    const wSum = result.reduce((a, c) => a + c.weight, 0);
    const wScore = result.reduce((a, c) => a + c.weight * c.score, 0);
    const pct = Math.round((wScore / wSum) * 100);

    return { cats: result, extras, pct };
  }

  function verdictFor(pct) {
    if (pct >= 85) return { tag: 'Boîte au complet', tone: 'fort' };
    if (pct >= 65) return { tag: 'Bonne base, à compléter', tone: 'moyen' };
    if (pct >= 40) return { tag: 'Des équipes clés manquent', tone: 'faible' };
    return { tag: "Une boîte, ce n'est pas que des ingénieurs", tone: 'faible' };
  }

  function buildSummary(a) {
    const solides = a.cats.filter(c => c.status === 'solide').map(c => SHORT[c.id]);
    const oublies = a.cats.filter(c => c.status === 'oublie').map(c => REVEAL[c.id]);
    const partiels = a.cats.filter(c => c.status === 'partiel').map(c => SHORT[c.id]);
    const parts = [];
    if (solides.length) parts.push((solides.length === 1 ? 'Ton point fort : ' : 'Tes points forts : ') + joinFr(solides) + '.');
    if (oublies.length) {
      parts.push(oublies.length === 1
        ? "Mais personne ne s'occupe de " + oublies[0] + " : et ça, aucune entreprise ne peut s'en passer."
        : 'Mais tu as oublié ' + joinFr(oublies) + '. Une boîte ne tient pas sans elles.');
    }
    if (partiels.length) parts.push('Pense aussi à étoffer ' + joinFr(partiels) + '.');
    if (!oublies.length && !partiels.length) parts.push("Tu as pensé à toutes les équipes, du cœur technique jusqu'aux fonctions support. Belle vision d'ensemble.");
    return parts.join(' ');
  }

  /* ================================================================
   * RENDU
   * ================================================================ */
  const app = document.getElementById('app');

  function render() {
    document.body.classList.toggle('is-dark', state.step === 0);
    renderStepper();
    if (state.step === 0) app.innerHTML = screenIntro();
    else if (state.step === 1) app.innerHTML = screenSector();
    else if (state.step === 2) app.innerHTML = screenIdentity();
    else if (state.step === 3) app.innerHTML = screenTeam();
    else if (state.step === 5) app.innerHTML = screenFinal();
    else app.innerHTML = screenBilan();
    app.classList.remove('nav-fwd', 'nav-back');
    app.classList.add('nav-' + navDir);
    wire();
  }

  const STEPS = ['Secteur', 'Identité', 'Équipe', 'Bilan'];
  function renderStepper() {
    const el = document.getElementById('stepper');
    if (state.step === 0) { el.innerHTML = ''; return; }
    const cur = Math.min(state.step, 4);
    el.innerHTML = STEPS.map((s, i) => {
      const n = i + 1;
      const cls = n === cur ? 'active' : n < cur ? 'done' : '';
      return `<button class="step-pill ${cls}" data-goto="${n}"><span>${n}</span>${s}</button>`;
    }).join('<i class="step-sep"></i>');
  }

  /* ---------- Écran 0 : intro ---------- */
  function screenIntro() {
    return `
    <section class="screen intro">
      <div class="intro-mark">${CRESCENT}</div>
      <p class="eyebrow light">Atelier Do &amp; Inspire</p>
      <h1 class="banner">Monte ta boîte<br>spatiale</h1>
      <p class="lede">Une fusée ne part jamais toute seule. Derrière chaque mission, il y a une entreprise : et une entreprise, c'est surtout des dizaines de métiers différents.</p>
      <p class="lede">À toi de créer la tienne : choisis un secteur, donne-lui un nom, installe-la quelque part, puis recrute ton équipe. À la fin, on regarde ensemble si tu n'as oublié personne.</p>
      <button class="btn btn-accent lg" data-act="start">Commencer${ICON('arrow-right')}</button>
    </section>`;
  }

  /* ---------- Écran 1 : secteur ---------- */
  function screenSector() {
    const cards = SECTORS.map(s => `
      <button class="sector-card ${state.sector === s.id ? 'selected' : ''}" data-sector="${s.id}">
        <span class="sector-ico">${ICON(s.icon)}</span>
        <span class="sector-body">
          <span class="sector-name">${s.label}</span>
          <span class="sector-tag">${s.tagline}</span>
          <span class="sector-ex">${s.example}</span>
        </span>
        <span class="sector-check"><i data-lucide="check"></i></span>
      </button>`).join('');
    return `
    <section class="screen">
      <header class="screen-head">
        <p class="eyebrow">Étape 1 sur 4</p>
        <h1>Dans quel secteur se lance ta boîte ?</h1>
        <p class="sub">Toute la filière spatiale tient en cinq grands métiers. Choisis-en un.</p>
      </header>
      <div class="sector-grid">${cards}</div>
      <footer class="nav-row">
        <button class="btn btn-ghost" data-act="back">${ICON('arrow-left')}Retour</button>
        <button class="btn btn-accent" data-act="next" ${state.sector ? '' : 'disabled'}>Continuer${ICON('arrow-right')}</button>
      </footer>
    </section>`;
  }

  /* ---------- Écran 2 : identité ---------- */
  function screenIdentity() {
    const sec = sectorObj();
    return `
    <section class="screen narrow">
      <header class="screen-head">
        <p class="eyebrow">Étape 2 sur 4 · Secteur ${sec ? sec.label : ''}</p>
        <h1>Donne une identité à ta boîte</h1>
        <p class="sub">Pas de mauvaise réponse : invente. Le nom et le lieu, c'est déjà une décision de patron·ne.</p>
      </header>
      <div class="form">
        <div class="field">
          <label for="f-name">${ICON('building-2')}Comment s'appelle ton entreprise ?</label>
          <input id="f-name" type="text" maxlength="48" placeholder="StellarLift, OrbiTech, Lune & Cie…" value="${esc(state.name)}">
        </div>
        <div class="field">
          <label>${ICON('building-2')}Quelle taille d'entreprise ?</label>
          <div class="toggle-group">${COMPANY_TYPES.map(t => `<button type="button" class="toggle-pill ${state.companyType === t.id ? 'selected' : ''}" data-company-type="${t.id}">${t.label}</button>`).join('')}</div>
        </div>
        <div class="field">
          <label for="f-desc">${ICON('pen-line')}Que fait ton entreprise ?</label>
          <textarea id="f-desc" rows="3" maxlength="180" placeholder="En une phrase : ce que ta boîte construit, lance ou propose…">${esc(state.desc || '')}</textarea>
          <p class="hint-line">Facultatif : une phrase suffit. Elle figurera sur ton certificat.</p>
        </div>
        <div class="field">
          <label for="f-loc">${ICON('map-pin')}Où l'installes-tu ?</label>
          <input id="f-loc" type="text" maxlength="60" placeholder="Toulouse, Kourou, ta ville…" value="${esc(state.location)}">
          <p class="hint-line">Une ville, un pays, près d'un site de lancement… à toi de voir.</p>
        </div>
      </div>
      <footer class="nav-row">
        <button class="btn btn-ghost" data-act="back">${ICON('arrow-left')}Retour</button>
        <button class="btn btn-accent" data-act="next" ${state.name.trim() ? '' : 'disabled'}>Continuer${ICON('arrow-right')}</button>
      </footer>
    </section>`;
  }

  /* ---------- Écran 3 : équipe ---------- */
  function validInner(res) {
    if (!res.length) return '<p class="vl-empty">Tes métiers s\'affichent ici, validés un par un au fur et à mesure que tu écris.</p>';
    return res.map(r => {
      if (r.name) {
        const corr = !r.exact ? `<i class="vl-corr">compris : « ${esc(r.line)} »</i>` : '';
        const moved = r.reclassed ? ' moved' : '';
        const sub = r.reclassed ? 'rangé par toi · ' + r.cat : r.cat;
        return `<div class="vl-item ok${moved}"><span class="vl-ic check">${ICON('check')}</span>
          <span class="vl-txt"><b>${esc(r.name)}</b><em>${sub}</em>${corr}</span>
          ${catSelect(r.key, r.catId, false)}</div>`;
      }
      if (r.manual) {
        return `<div class="vl-item mine"><span class="vl-ic check">${ICON('check')}</span>
          <span class="vl-txt"><b>${esc(r.line)}</b><em>rangé par toi · ${esc(r.cat)}</em></span>
          ${catSelect(r.key, r.catId, true)}</div>`;
      }
      return `<div class="vl-item todo"><span class="vl-ic">${ICON('help-circle')}</span>
        <span class="vl-txt"><b>${esc(r.line)}</b><em>à toi de le ranger</em></span>
        ${catSelect(r.key, '', true)}</div>`;
    }).join('');
  }
  /* hasEmpty : affiche l'option vide « Ranger dans… » (métiers non reconnus) */
  function catSelect(key, sel, hasEmpty) {
    const head = hasEmpty ? ['<option value="">Ranger dans…</option>'] : [];
    const opts = head.concat(catPairs().map(([v, l]) =>
      `<option value="${v}" ${sel === v ? 'selected' : ''}>${esc(l)}</option>`));
    const title = hasEmpty ? '' : 'title="Mal classé ? change la catégorie"';
    return `<select class="vl-select" data-classify="${esc(key)}" ${title}>${opts.join('')}</select>`;
  }

  function updateValidation() {
    const c = document.getElementById('valid-list');
    if (!c) return;
    const res = validateLines();
    c.innerHTML = validInner(res);
    const n = res.length, rec = res.filter(r => r.name || r.manual).length;
    const cnt = document.getElementById('job-count');
    if (cnt) cnt.textContent = n + ' saisi' + (n > 1 ? 's' : '') + ' · ' + rec + ' validé' + (rec > 1 ? 's' : '');
    const btn = app.querySelector('[data-act="next"]');
    if (btn) btn.disabled = n < 2;
  }

  function screenTeam() {
    const sec = sectorObj();
    const res = validateLines();
    const n = jobLines().length, rec = res.filter(r => r.name || r.manual).length;
    const hint = state.hintShown ? hintBlock() : '';
    return `
    <section class="screen wide">
      <div class="sector-banner">${ICON(sec ? sec.icon : 'rocket')}<span><b>Ton secteur</b>${sec ? sec.label : ''}</span></div>
      <header class="screen-head">
        <p class="eyebrow">Étape 3 sur 4 · ${esc(state.name) || 'Ta boîte'}</p>
        <h1>Qui recrutes-tu ?</h1>
        <p class="sub">Liste les métiers dont ta boîte a besoin : un par ligne. On valide chaque métier au fur et à mesure ; si l'orthographe est approximative, on retrouve le bon nom.</p>
      </header>
      <div class="team-grid">
        <div class="team-col">
          <textarea id="f-jobs" rows="11" placeholder="Ingénieur propulsion&#10;Soudeur&#10;Comptable&#10;…">${esc(state.jobs)}</textarea>
          <div class="team-foot">
            <span class="count" id="job-count">${n} saisi${n > 1 ? 's' : ''} · ${rec} validé${rec > 1 ? 's' : ''}</span>
            <button class="btn btn-link" data-act="hint">${ICON('help-circle')}Je suis bloqué·e</button>
          </div>
        </div>
        <aside class="team-col">
          <p class="vl-title">Métiers validés</p>
          <div id="valid-list" class="valid-list">${validInner(res)}</div>
        </aside>
      </div>
      ${hint}
      <footer class="nav-row">
        <button class="btn btn-ghost" data-act="back">${ICON('arrow-left')}Retour</button>
        <button class="btn btn-accent" data-act="next" ${n >= 2 ? '' : 'disabled'}>Voir mon bilan${ICON('arrow-right')}</button>
      </footer>
    </section>`;
  }

  function hintBlock() {
    const sec = sectorObj();
    const qs = [
      'Qui dirige la boîte et prend les grandes décisions ?',
      'Qui recrute, paie les salaires, gère les équipes ?',
      'Qui signe les contrats et s\'occupe du juridique ?',
      'Qui vend vos produits ou vos services ?',
      'Qui protège vos données et vos ordinateurs ?',
      'Qui veille à la sécurité des personnes et des sites ?',
      'Et pour débuter : stagiaires, alternants… tu y as pensé ?',
      sec ? ('Dans « ' + sec.label + ' », pense aux niveaux : qui conçoit ? qui fabrique ? qui teste ?') : '',
    ].filter(Boolean);
    return `<div class="callout">
      <p class="callout-title">${ICON('help-circle')}Des pistes : sans donner les réponses</p>
      <ul>${qs.map(q => `<li>${q}</li>`).join('')}</ul>
    </div>`;
  }

  /* ---------- Écran 4 : bilan ---------- */
  function screenBilan() {
    const a = analyze();
    const v = verdictFor(a.pct);
    const sec = sectorObj();
    const summary = buildSummary(a);
    let body = '';
    if (tweaks.bilanStyle === 'organigramme') body = bilanOrg(a);
    else if (tweaks.bilanStyle === 'checklist') body = bilanChecklist(a);
    else body = bilanCartes(a);

    const extras = a.extras.length
      ? `<p class="extras">Tu as aussi cité : ${a.extras.map(e => `<span>${esc(e)}</span>`).join('')}</p>` : '';

    return `
    <section class="screen wide">
      <header class="bilan-id">
        <div>
          <p class="eyebrow">${sec ? sec.label : ''}${state.location ? ' · ' + esc(state.location) : ''}</p>
          <h1>${esc(state.name) || 'Ta boîte'}</h1>
        </div>
        <div class="score">
          <span class="score-num">${a.pct}<span>%</span></span>
          <span class="score-lbl">d'équipe en place</span>
        </div>
      </header>
      <div class="score-bar"><i style="width:${a.pct}%"></i></div>
      <div class="verdict ${v.tone}">${v.tag}</div>
      <p class="summary">${summary}</p>
      ${body}
      ${extras}
      ${finalizeBlock(a)}
      <footer class="nav-row spread">
        <button class="btn btn-ghost" data-act="edit">${ICON('pen-line')}Modifier mon équipe</button>
        <div class="nav-right">
          <button class="btn btn-ghost" data-act="restart">${ICON('rotate-ccw')}Recommencer</button>
        </div>
      </footer>
    </section>`;
  }

  const FINISH_PCT = 70;
  function finalizeBlock(a) {
    const ok = a.pct >= FINISH_PCT;
    if (ok) {
      return `<div class="finalize ready">
        <div class="finalize-txt">
          <p class="finalize-h">${ICON('check')}Ta boîte tient debout : tu peux l'officialiser.</p>
          <p class="finalize-sub">Au-delà de 70 %, l'essentiel est là. Ajoute un logo (facultatif) et reçois ton certificat Space Elevator.</p>
        </div>
        <button class="btn btn-accent" data-act="finalize">Officialiser ma boîte${ICON('arrow-right')}</button>
      </div>`;
    }
    const need = a.cats.filter(c => c.status === 'oublie').map(c => SHORT[c.id]);
    const tip = need.length ? ' Commence par ' + joinFr(need.slice(0, 2)) + '.' : '';
    return `<div class="finalize">
      <div class="finalize-txt">
        <p class="finalize-h">Encore un effort : ${FINISH_PCT}/% pour officialiser ta boîte.</p>
        <p class="finalize-sub">Tu es à ${a.pct}/%.${tip} Les tout derniers pourcents sont les plus durs : vise le seuil, pas la perfection.</p>
      </div>
      <button class="btn btn-ghost" data-act="edit">${ICON('pen-line')}Compléter</button>
    </div>`;
  }

  const STATUS_LBL = { oublie: 'Oublié', partiel: 'À compléter', solide: 'Solide' };

  function bilanCartes(a) {
    const cards = a.cats.map(c => {
      const on = c.jobs.filter(j => j.covered).map(j => `<span class="chip on">${j.name}</span>`).join('');
      const mine = (c.manual || []).map(t => `<span class="chip mine">${esc(t)}</span>`).join('');
      const off = c.jobs.filter(j => !j.covered).map(j => `<span class="chip off">${j.name}</span>`).join('');
      return `<div class="cat-card ${c.status}">
        <div class="cat-head">
          <h4>${c.label.replace(/^Cœur de métier : /, 'Cœur de métier · ')}</h4>
          <span class="badge ${c.status}">${STATUS_LBL[c.status]}</span>
        </div>
        <p class="cat-note">${c.note}</p>
        <div class="chips">${on}${mine}${off}</div>
      </div>`;
    }).join('');
    return `<div class="cat-grid">${cards}</div>`;
  }

  function bilanChecklist(a) {
    const secs = a.cats.map(c => {
      const rows = c.jobs.map(j => `<li class="${j.covered ? 'on' : 'off'}">
        <span class="mark">${j.covered ? ICON('check') : ''}</span>${j.name}</li>`).join('');
      const mine = (c.manual || []).map(t => `<li class="mine">
        <span class="mark">${ICON('check')}</span>${esc(t)} <i class="ck-tag">ajouté par toi</i></li>`).join('');
      return `<div class="ck-cat">
        <div class="ck-head"><h4>${c.label.replace(/^Cœur de métier : /, 'Cœur de métier · ')}</h4>
          <span class="ck-frac ${c.status}">${c.matched}/${c.total}</span></div>
        <ul class="ck-list">${rows}${mine}</ul>
      </div>`;
    }).join('');
    return `<div class="ck-grid">${secs}</div>`;
  }

  function bilanOrg(a) {
    const lead = a.cats.find(c => c.id === 'direction');
    const rest = a.cats.filter(c => c.id !== 'direction');
    const node = j => `<span class="org-node ${j.covered ? 'on' : 'off'}">${j.name}${j.covered ? '' : '<i>à recruter</i>'}</span>`;
    const mineNodes = c => (c.manual || []).map(t => `<span class="org-node mine">${esc(t)}<i>ajouté par toi</i></span>`).join('');
    const leadHtml = lead ? `<div class="org-top">
        <p class="org-col-h">${lead.label}</p>
        <div class="org-nodes">${lead.jobs.map(node).join('')}${mineNodes(lead)}</div>
      </div>` : '';
    const cols = rest.map(c => `<div class="org-col ${c.status}">
        <p class="org-col-h">${c.label.replace(/^Cœur de métier : /, 'Cœur · ')}</p>
        <div class="org-nodes">${c.jobs.map(node).join('')}${mineNodes(c)}</div>
      </div>`).join('');
    return `<div class="org">
      ${leadHtml}
      <div class="org-rail"></div>
      <div class="org-cols">${cols}</div>
    </div>`;
  }

  /* ================================================================
   * ÉCRAN 5 : OFFICIALISATION + CERTIFICAT
   * ================================================================ */
  function screenFinal() {
    const sec = sectorObj();
    const a = analyze();
    const hasImg = !!logoImg;
    const drop = hasImg
      ? `<img class="logo-prev" src="${logoImg.src}" alt="logo">
         <button class="logo-clear" data-act="logo-clear" title="Retirer">${ICON('x')}</button>`
      : (logoMeta
        ? `<div class="logo-file">${ICON('building-2')}<span>${esc(logoMeta.name)}</span><i>PDF importé : non affiché sur le certificat</i></div>
           <button class="logo-clear" data-act="logo-clear" title="Retirer">${ICON('x')}</button>`
        : `<div class="logo-empty">
             <span class="logo-plus">+</span>
             <p>Dépose ton logo ici<br><i>ou clique pour choisir</i></p>
           </div>`);

    return `
    <section class="screen wide final">
      <header class="screen-head center">
        <p class="eyebrow">Étape finale · ${esc(state.name) || 'Ta boîte'}</p>
        <h1>Officialise ${esc(state.name) || 'ta boîte'}</h1>
        <p class="sub">Ajoute un logo si tu en as un : c'est facultatif. Puis génère ton certificat de création d'entreprise Space Elevator.</p>
      </header>
      <div class="final-grid">
        <div class="final-pane">
          <p class="vl-title">Logo de l'entreprise <span class="opt">facultatif</span></p>
          <div id="logo-drop" class="logo-drop ${hasImg ? 'has' : ''}" tabindex="0" role="button">${drop}</div>
          <input id="logo-input" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf" hidden>
          <p class="logo-hint">Image (PNG, JPG, SVG, WebP) ou PDF : 3 Mo maximum.</p>
          ${logoStatus ? `<p class="logo-status ${logoTone}">${esc(logoStatus)}</p>` : ''}
        </div>
        <div class="final-pane">
          <p class="vl-title">Aperçu du certificat</p>
          <div class="cert-frame">
            <canvas id="cert-canvas" width="1600" height="1120" aria-label="Certificat de création d'entreprise"></canvas>
          </div>
          <div class="cert-actions">
            <button class="btn btn-accent" data-act="download-cert">${ICON('arrow-right')}Télécharger le certificat (PNG)</button>
            <button class="btn btn-ghost" data-act="print-cert">${ICON('pen-line')}Imprimer</button>
          </div>
          <p class="cert-note">Le certificat laisse une ligne libre pour le nom du fondateur ou de la fondatrice, à compléter après impression.</p>
        </div>
      </div>
      <footer class="nav-row spread">
        <button class="btn btn-ghost" data-act="to-bilan">${ICON('arrow-left')}Retour au bilan</button>
        <button class="btn btn-ghost" data-act="restart">${ICON('rotate-ccw')}Nouvelle boîte</button>
      </footer>
    </section>`;
  }

  function setLogoStatus(msg, tone) {
    logoStatus = msg || ''; logoTone = tone || '';
    const el = document.getElementById('logo-status') || (function () {
      const pane = document.querySelector('.final-pane'); return pane ? pane.querySelector('.logo-status') : null;
    })();
    if (el) { el.textContent = logoStatus; el.className = 'logo-status ' + logoTone; }
    else if (state.step === 5) render();
  }

  function handleLogoFile(file) {
    if (!file) return;
    const MAX = 3 * 1024 * 1024;
    const isImg = /^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type);
    const isPdf = file.type === 'application/pdf';
    if (!isImg && !isPdf) { logoMeta = null; logoImg = null; setLogoStatus('Format refusé : choisis une image ou un PDF.', 'err'); return; }
    if (file.size > MAX) { logoMeta = null; logoImg = null; setLogoStatus('Fichier trop lourd (3 Mo maximum).', 'err'); return; }
    logoMeta = { name: file.name, type: file.type, size: file.size };
    if (isImg) {
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => { logoImg = img; if (state.step === 5) render(); };
        img.onerror = () => { logoImg = null; setLogoStatus('Image illisible.', 'err'); };
        img.src = rd.result;
      };
      rd.onerror = () => setLogoStatus('Lecture du fichier impossible.', 'err');
      rd.readAsDataURL(file);
    } else {
      logoImg = null; if (state.step === 5) render();
    }
    uploadLogo(file);
  }

  async function uploadLogo(file) {
    const cfg = window.MTB_SUPABASE;
    if (!cfg || !cfg.url || !cfg.anonKey) { setLogoStatus('Logo prêt. (Enregistrement en ligne non configuré sur cette page.)', 'ok'); return; }
    if (!window.supabase || !window.supabase.createClient) { setLogoStatus('Logo prêt. (Client Supabase indisponible ici.)', 'warn'); return; }
    try {
      setLogoStatus('Envoi du logo…', 'pending');
      const client = window.supabase.createClient(cfg.url, cfg.anonKey);
      const safe = (norm(state.name) || 'boite').replace(/ /g, '-');
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = safe + '/' + Date.now() + '.' + ext;
      const { error } = await client.storage.from(cfg.bucket || 'logos')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      if (logoMeta) logoMeta.path = path;
      setLogoStatus('Logo enregistré en ligne.', 'ok');
    } catch (err) {
      setLogoStatus('Logo prêt localement. (Envoi en ligne échoué.)', 'warn');
    }
  }

  /* ---------- Dessin du certificat (canvas) ---------- */
  const C = {
    magenta: '#c8257a', magenta700: '#94154f', ink: '#0b0f2a',
    gray: '#808080', grayLine: '#d4d4d4', soft: '#fdf2f8', paper: '#ffffff',
  };
  function drawCrescent(ctx, cx, cy, r, color, bg) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - r * 0.32, cy, r * 0.86, 0, Math.PI * 2); ctx.fillStyle = bg || C.paper; ctx.fill();
    ctx.restore();
  }
  function drawCertificate() {
    const cv = document.getElementById('cert-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const a = analyze();
    const sec = sectorObj();
    const cx = W / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);

    // Cadre
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.strokeStyle = C.magenta; ctx.lineWidth = 6; ctx.strokeRect(58, 58, W - 116, H - 116);

    // En-tête : logo Space Elevator complet (wordmark)
    if (brandReady) {
      const bh = 60, bw = bh * (brandMark.naturalWidth / brandMark.naturalHeight);
      ctx.drawImage(brandMark, cx - bw / 2, 118, bw, bh);
    } else {
      // repli : croissant + texte si l'image n'est pas encore chargée
      drawCrescent(ctx, cx - 168, 150, 26, C.magenta, C.paper);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = C.ink; ctx.font = '600 38px Poppins, sans-serif';
      ctx.fillText('SPACE ELEVATOR', cx - 128, 144);
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.gray;
    ctx.font = '500 17px Poppins, sans-serif';
    ctx.fillText('A T E L I E R   D O   &   I N S P I R E', cx, 198);

    // Filet
    ctx.strokeStyle = C.grayLine; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(160, 224); ctx.lineTo(W - 160, 224); ctx.stroke();

    // Eyebrow
    ctx.textAlign = 'center'; ctx.fillStyle = C.magenta;
    ctx.font = '600 22px Poppins, sans-serif';
    ctx.fillText("C E R T I F I C A T   D E   C R É A T I O N   D ' E N T R E P R I S E", cx, 280);

    // Logo (cercle) si présent
    let nameY = 430;
    if (logoImg) {
      const lr = 84, lcy = 366;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, lcy, lr, 0, Math.PI * 2); ctx.closePath();
      ctx.fillStyle = C.soft; ctx.fill();
      ctx.clip();
      const iw = logoImg.naturalWidth || logoImg.width, ih = logoImg.naturalHeight || logoImg.height;
      const scale = Math.max((lr * 2) / iw, (lr * 2) / ih);
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(logoImg, cx - dw / 2, lcy - dh / 2, dw, dh);
      ctx.restore();
      ctx.strokeStyle = C.magenta; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, lcy, lr, 0, Math.PI * 2); ctx.stroke();
      nameY = 600;
    }

    // « Il est officiellement créé l'entreprise »
    ctx.fillStyle = C.gray; ctx.font = '400 22px Poppins, sans-serif';
    ctx.fillText("Il est officiellement fondé l'entreprise", cx, nameY - 64);

    // Nom de l'entreprise (auto-fit)
    const name = (state.name || 'Mon entreprise').toUpperCase();
    let fs = 78; ctx.font = '700 ' + fs + 'px Poppins, sans-serif';
    while (ctx.measureText(name).width > W - 320 && fs > 34) { fs -= 2; ctx.font = '700 ' + fs + 'px Poppins, sans-serif'; }
    ctx.fillStyle = C.ink; ctx.fillText(name, cx, nameY);

    // Secteur · lieu
    ctx.fillStyle = C.magenta700; ctx.font = '500 26px Poppins, sans-serif';
    const subline = [sec ? sec.label : '', state.location ? '« ' + state.location + ' »' : '']
      .filter(Boolean).join('   ·   ');
    ctx.fillText(subline, cx, nameY + 60);

    // Descriptif (facultatif), en italique
    let flowY = nameY + 116;
    const desc = (state.desc || '').trim();
    if (desc) {
      ctx.fillStyle = C.ink; ctx.font = 'italic 400 25px Poppins, sans-serif';
      flowY = wrapText(ctx, '« ' + desc + ' »', cx, nameY + 116, W - 360, 36) + 48;
    }

    // Bandeau : qualité de l'équipe (sans pourcentage)
    ctx.fillStyle = C.ink; ctx.font = '400 24px Poppins, sans-serif';
    ctx.fillText('Une équipe complète, équilibrée et solide.', cx, flowY);

    // Lignes à signer
    const baseY = H - 250;
    ctx.textAlign = 'left'; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    // ligne gauche : nom du/de la fondateur·rice
    const lx = 150, lw = 460;
    ctx.beginPath(); ctx.moveTo(lx, baseY); ctx.lineTo(lx + lw, baseY); ctx.stroke();
    ctx.fillStyle = C.gray; ctx.font = '400 19px Poppins, sans-serif';
    ctx.fillText('Fondateur·rice', lx, baseY + 30);
    // ligne droite : signature
    const rx = W - 150 - lw;
    ctx.beginPath(); ctx.moveTo(rx, baseY); ctx.lineTo(rx + lw, baseY); ctx.stroke();
    ctx.fillText('Signature', rx, baseY + 30);

    // Pied : date + sceau
    ctx.textAlign = 'center'; ctx.fillStyle = C.gray; ctx.font = '400 20px Poppins, sans-serif';
    ctx.fillText('Délivré le ' + frDate() + ' · Atelier « Monte ta boîte spatiale »', cx, H - 130);

    // Sceau croissant
    drawCrescent(ctx, cx, H - 196, 30, C.magenta, C.paper);
  }

  function wrapText(ctx, text, cx, y, maxW, lh) {
    const words = String(text).split(' ');
    let line = '', yy = y;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, cx, yy); yy += lh; line = w; }
      else line = test;
    }
    if (line) ctx.fillText(line, cx, yy);
    return yy;
  }

  function frDate() {
    try {
      return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return new Date().toLocaleDateString(); }
  }

  function certFilename(ext) {
    const safe = (norm(state.name) || 'mon-entreprise').replace(/ /g, '-');
    return 'certificat-' + safe + '.' + ext;
  }
  function downloadCert() {
    const cv = document.getElementById('cert-canvas'); if (!cv) return;
    cv.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = certFilename('png');
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }
  function printCert() {
    const cv = document.getElementById('cert-canvas'); if (!cv) return;
    const data = cv.toDataURL('image/png');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write('<!doctype html><title>Certificat</title><style>@page{size:landscape;margin:0}html,body{margin:0}img{width:100%;display:block}</style><img src="' + data + '" onload="window.focus();window.print()">');
    w.document.close();
  }

  function wireFinal() {
    const drop = document.getElementById('logo-drop');
    const input = document.getElementById('logo-input');
    if (drop && input) {
      drop.addEventListener('click', e => { if (!e.target.closest('[data-act="logo-clear"]')) input.click(); });
      drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
      input.addEventListener('change', e => { if (e.target.files && e.target.files[0]) handleLogoFile(e.target.files[0]); });
      ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('drag'); }));
      drop.addEventListener('drop', e => { const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) handleLogoFile(f); });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawCertificate);
    else drawCertificate();
  }


  const ICONS = {
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'pen-line': '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'satellite': '<path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/>',
    'radio': '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    'telescope': '<path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/><path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/><path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/><path d="m6.158 8.633 1.114 4.456"/><path d="m8 21 3.105-6.21"/><circle cx="12" cy="13" r="2"/>',
    'radio-tower': '<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"/><circle cx="12" cy="9" r="2"/><path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"/><path d="M19.1 1.9c3.9 3.9 3.9 10.3 0 14.2"/><path d="M9.5 18h5"/><path d="m8 22 4-11 4 11"/>',
  };
  function ICON(n) {
    return `<i class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg></i>`;
  }
  const CRESCENT = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="cmask"><rect width="100" height="100" fill="#fff"></rect><circle cx="42" cy="50" r="40" fill="#000"></circle></mask></defs><circle cx="50" cy="50" r="46" fill="currentColor" mask="url(#cmask)"></circle></svg>`;

  /* ================================================================
   * INTERACTIONS
   * ================================================================ */
  function go(step) { navDir = step >= state.step ? 'fwd' : 'back'; state.step = step; saveState(); render(); window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); }

  function wire() {
    app.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', onAct));
    app.querySelectorAll('[data-sector]').forEach(b => b.addEventListener('click', () => {
      state.sector = b.getAttribute('data-sector'); saveState(); render();
    }));
    app.querySelectorAll('[data-company-type]').forEach(b => b.addEventListener('click', () => {
      const val = b.getAttribute('data-company-type');
      state.companyType = state.companyType === val ? '' : val;
      saveState(); render();
    }));
    const name = document.getElementById('f-name');
    if (name) name.addEventListener('input', e => { state.name = e.target.value; saveState();
      const btn = app.querySelector('[data-act="next"]'); if (btn) btn.disabled = !state.name.trim(); });
    const loc = document.getElementById('f-loc');
    if (loc) loc.addEventListener('input', e => { state.location = e.target.value; saveState(); });
    const desc = document.getElementById('f-desc');
    if (desc) desc.addEventListener('input', e => { state.desc = e.target.value; saveState(); });
    const jobs = document.getElementById('f-jobs');
    if (jobs) {
      let t = null;
      jobs.addEventListener('input', e => {
        state.jobs = e.target.value; saveState();
        clearTimeout(t); t = setTimeout(updateValidation, 250);
      });
    }
    if (state.step === 5) wireFinal();
  }

  /* Reclassement (un seul écouteur, #app est persistant) */
  app.addEventListener('change', e => {
    const sel = e.target.closest('[data-classify]');
    if (!sel) return;
    const key = sel.getAttribute('data-classify'), val = sel.value;
    if (!state.manual) state.manual = {};
    if (val) state.manual[key] = val; else delete state.manual[key];
    saveState(); updateValidation();
  });

  function onAct(e) {
    const act = e.currentTarget.getAttribute('data-act');
    if (act === 'start') go(1);
    else if (act === 'next') go(state.step + 1);
    else if (act === 'back') go(Math.max(0, state.step - 1));
    else if (act === 'hint') { state.hintShown = true; saveState(); render(); }
    else if (act === 'edit') go(3);
    else if (act === 'finalize') go(5);
    else if (act === 'to-bilan') go(4);
    else if (act === 'download-cert') downloadCert();
    else if (act === 'print-cert') printCert();
    else if (act === 'logo-clear') { logoImg = null; logoMeta = null; logoStatus = ''; logoTone = ''; render(); }
    else if (act === 'restart') {
      if (confirm('Repartir de zéro ? Ta boîte actuelle sera effacée.')) {
        state = Object.assign({}, defaultState, { manual: {} });
        logoImg = null; logoMeta = null; logoStatus = ''; logoTone = '';
        saveState(); go(0);
      }
    }
  }

  /* Stepper navigation (only to visited steps) */
  document.getElementById('stepper').addEventListener('click', e => {
    const b = e.target.closest('[data-goto]'); if (!b) return;
    const n = +b.getAttribute('data-goto');
    if (n <= state.step || canReach(n)) go(n);
  });
  function canReach(n) {
    if (n >= 2 && !state.sector) return false;
    if (n >= 3 && !state.name.trim()) return false;
    if (n >= 4 && jobLines().length < 2) return false;
    if (n >= 5 && analyze().pct < FINISH_PCT) return false;
    return true;
  }

  /* ================================================================
   * TWEAKS (panneau + protocole hôte)
   * ================================================================ */
  const tw = document.getElementById('tweaks');
  function renderTweaks() {
    tw.innerHTML = `
      <div class="tw-head"><span>Tweaks</span><button class="tw-x" id="tw-close">${ICON('x')}</button></div>
      <div class="tw-sec">Système de retour</div>
      ${segRow('bilanStyle', [['cartes', 'Cartes'], ['organigramme', 'Organigramme'], ['checklist', 'Checklist']])}
      <div class="tw-sec">Niveau d'exigence</div>
      ${segRow('exigence', [['indulgent', 'Indulgent'], ['normal', 'Normal'], ['strict', 'Strict']])}
      <p class="tw-note">Modifie l'écran de bilan en direct.</p>`;
    tw.querySelectorAll('[data-tw]').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-tw'), val = btn.getAttribute('data-val');
      tweaks[key] = val; saveTweaks(); renderTweaks();
      try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*'); } catch (e) {}
      if (state.step === 4) render();
    }));
    const x = document.getElementById('tw-close');
    if (x) x.addEventListener('click', dismissTweaks);
  }
  function segRow(key, opts) {
    return `<div class="tw-seg">${opts.map(([v, l]) =>
      `<button data-tw="${key}" data-val="${v}" class="${tweaks[key] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  }
  function openTweaks() { tw.classList.add('open'); renderTweaks(); }
  function dismissTweaks() { tw.classList.remove('open'); try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {} }

  window.addEventListener('message', e => {
    const t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') openTweaks();
    else if (t === '__deactivate_edit_mode') tw.classList.remove('open');
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

  /* ---------- Go ---------- */
  render();
})();
