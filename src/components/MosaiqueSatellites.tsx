import { useEffect, useRef, useState, useCallback } from 'react';

const wiki = (file: string, w = 800) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;

type Tile = {
  area: string;
  year: string;
  title: string;
  sub?: string;
  detail: string;
  img: string;
  alt: string;
  feature?: boolean;
  short?: boolean;
};

const TILES: Tile[] = [
  // ░ Les pionniers (1957–1965) ░
  { area: 'sp', year: '1957', title: 'Spoutnik 1, le tout premier satellite', sub: "58 cm, 83 kg — l'URSS ouvre l'ère spatiale", detail: 'Gros comme un ballon de plage, il bouclait un tour de Terre toutes les 96 minutes. Ses « bip » ont été captés partout dans le monde.', img: wiki('Sputnik asm.jpg', 900), alt: 'Réplique du satellite Spoutnik 1', feature: true },
  { area: 'ga', year: '1961', title: 'Youri Gagarine', sub: '1ᵉʳ humain en orbite', detail: "108 minutes, un seul tour de Terre — et, à 27 ans, l'homme le plus célèbre de la planète.", img: wiki('Yuri Gagarin (1961) - Restoration.jpg', 700), alt: 'Youri Gagarine en 1961' },
  { area: 'di', year: '1965', title: "La France dans l'espace", sub: 'Diamant lance Astérix — 3ᵉ puissance spatiale', detail: 'Avec la fusée Diamant et le satellite Astérix, la France devient le 3ᵉ pays à lancer seul un satellite.', img: wiki('Diamant A.jpg', 700), alt: 'Fusée française Diamant A' },
  { area: 'va', year: '1958', title: 'Vanguard 1 — toujours en orbite', detail: 'Le plus vieil objet humain encore en orbite — pour deux siècles.', img: wiki('Vanguard 1.jpg', 700), alt: 'Satellite Vanguard 1', short: true },
  { area: 'te', year: '1962', title: 'Telstar — la télé en direct transatlantique', detail: "La première image de télévision relayée en direct entre l'Amérique et l'Europe.", img: wiki('Telstar.jpg', 700), alt: 'Satellite Telstar', short: true },

  // ░ Voir la Terre & explorer (1968–1990) ░
  { area: 'ea', year: '1968', title: '« Lever de Terre » — Apollo 8', detail: "Prise par l'équipage d'Apollo 8, elle a nourri la conscience écologique mondiale.", img: wiki('NASA-Apollo8-Dec24-Earthrise.jpg', 900), alt: 'Lever de Terre, Apollo 8' },
  { area: 'bm', year: '1972', title: '« The Blue Marble »', detail: "L'une des photos les plus reproduites de l'histoire : la Terre entière d'un seul regard.", img: wiki('The Earth seen from Apollo 17.jpg', 900), alt: 'La Bille Bleue, Apollo 17' },
  { area: 'la', year: '1972', title: 'Landsat 1', sub: "observer la Terre depuis l'orbite", detail: "Le premier d'une lignée qui photographie la Terre sans interruption depuis plus de 50 ans.", img: wiki('Landsat 1.jpg', 700), alt: 'Satellite Landsat 1' },
  { area: 'vo', year: '1977', title: 'Voyager', sub: 'le plus lointain messager humain', detail: "À plus de 24 milliards de km, elles emportent un disque d'or destiné à d'éventuels extraterrestres.", img: wiki('Voyager.jpg', 700), alt: 'Sonde Voyager' },
  { area: 'al', year: '1969', title: 'Premiers pas sur la Lune', sub: "Apollo 11 — « un bond de géant pour l'humanité »", detail: '600 millions de personnes ont suivi en direct le premier pas humain sur un autre monde.', img: wiki('Aldrin Apollo 11 original.jpg', 900), alt: 'Buzz Aldrin sur la Lune, Apollo 11', feature: true },

  // ░ Observer & habiter (1990–2019) ░
  { area: 'hu', year: '1990', title: 'Hubble', sub: "un œil au-dessus de l'atmosphère", detail: "Au-dessus de l'atmosphère, il a livré les images les plus profondes jamais prises du cosmos.", img: wiki('Space Telescope Hubble 2009.jpg', 700), alt: 'Télescope spatial Hubble' },
  { area: 'is', year: '1998', title: 'La Station spatiale internationale', sub: 'le plus grand objet jamais assemblé en orbite', detail: "Grande comme un terrain de football, habitée sans interruption depuis l'an 2000.", img: wiki('International Space Station after undocking of STS-132.jpg', 900), alt: 'La Station spatiale internationale', feature: true },
  { area: 'cu', year: '2012', title: 'Curiosity sur Mars', detail: "Un rover de la taille d'une voiture, déposé sur Mars par une grue volante.", img: wiki("Curiosity Self-Portrait at 'Big Sky' Drilling Site.jpg", 700), alt: 'Autoportrait du rover Curiosity sur Mars' },
  { area: 'se', year: '2015', title: 'Sentinel — surveiller le climat', detail: 'Le programme européen Copernicus surveille climat et pollution, en accès libre.', img: wiki('Sentinel-2.jpg', 700), alt: 'Satellite européen Sentinel-2', short: true },
  { area: 'st', year: '2019', title: 'Les méga-constellations', detail: 'Des milliers de satellites pour couvrir la Terre en Internet — un défi pour les astronomes.', img: wiki('Starlink Mission (47926144123).jpg', 700), alt: "Lancement d'une grappe de satellites Starlink", short: true },

  // ░ Finale ░
  { area: 'jw', year: '2022', title: 'James Webb', sub: 'voir naître les premières étoiles', detail: 'Successeur de Hubble, il observe en infrarouge la lumière des toutes premières galaxies.', img: wiki('Pillars of Creation (NIRCam Image).jpg', 900), alt: 'Les Piliers de la Création vus par James Webb', feature: true },
  { area: 'pe', year: '2021', title: 'Thomas Pesquet', sub: "un Français commande l'ISS", detail: "Premier Français à commander l'ISS, après plus de 200 expériences scientifiques.", img: wiki('Thomas Pesquet.jpg', 700), alt: "L'astronaute Thomas Pesquet" },
];

const STORE = 'mosaique-satellites-knowledge';
type Verdict = 'known' | 'unknown';

const MOSAIC_CSS = `
.mq-grid{ display:grid; grid-template-columns:repeat(6,1fr); grid-auto-rows:140px; gap:10px; margin-top:40px; }
.mq-tile{ position:relative; margin:0; overflow:hidden; border-radius:14px; cursor:pointer;
  border:1px solid rgba(255,255,255,.08); background:#05071a; isolation:isolate; }
.mq-tile:focus-visible{ outline:2px solid #c8257a; outline-offset:2px; }
.mq-tile img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;
  transition:transform 600ms cubic-bezier(.2,0,0,1); }
.mq-tile .mq-scrim{ position:absolute; inset:0; z-index:1;
  background:linear-gradient(to top, rgba(5,7,20,.92) 0%, rgba(5,7,20,.45) 32%, transparent 60%);
  transition:opacity 300ms; }
.mq-tile .mq-hoverfill{ position:absolute; inset:0; z-index:2; pointer-events:none; opacity:0; transition:opacity .3s;
  background:linear-gradient(to top, rgba(5,7,20,.94) 0%, rgba(5,7,20,.82) 55%, rgba(5,7,20,.55) 100%); }
.mq-tile:hover .mq-hoverfill, .mq-tile:focus-within .mq-hoverfill{ opacity:1; }
.mq-cap{ position:absolute; left:14px; right:14px; bottom:12px; z-index:3; }
.mq-year{ display:block; font-weight:700; color:#c8257a; font-size:14px; line-height:1; margin-bottom:5px; text-shadow:0 1px 8px rgba(0,0,0,.5); }
.mq-title{ display:block; font-weight:600; color:#fff; font-size:13.5px; line-height:1.25; text-shadow:0 1px 10px rgba(0,0,0,.6); }
.mq-sub{ display:block; font-weight:400; color:rgba(255,255,255,.66); font-size:11.5px; margin-top:3px; line-height:1.3; text-shadow:0 1px 8px rgba(0,0,0,.6); }
.mq-detail{ display:block; max-height:0; opacity:0; margin-top:0; overflow:hidden;
  color:rgba(255,255,255,.86); font-size:11.5px; line-height:1.42; font-weight:400; text-shadow:0 1px 8px rgba(0,0,0,.7);
  transition:max-height .42s cubic-bezier(.2,0,0,1), opacity .3s, margin-top .42s; }
.mq-tile:hover .mq-detail, .mq-tile:focus-within .mq-detail, .mq-tile.mq-answered .mq-detail{ max-height:170px; opacity:1; margin-top:7px; }
.mq-ask{ display:flex; flex-wrap:wrap; gap:6px; max-height:0; opacity:0; margin-top:0; overflow:hidden;
  transition:max-height .42s cubic-bezier(.2,0,0,1), opacity .3s .04s, margin-top .42s; }
.mq-tile:hover .mq-ask, .mq-tile:focus-within .mq-ask, .mq-tile.mq-answered .mq-ask{ max-height:90px; opacity:1; margin-top:10px; }
.mq-tile.mq-short:hover .mq-year, .mq-tile.mq-short:focus-within .mq-year, .mq-tile.mq-short.mq-answered .mq-year{ display:none; }
.mq-askbtn{ font-family:inherit; font-size:11px; font-weight:600; line-height:1; cursor:pointer; border-radius:7px;
  padding:7px 9px; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.10); color:#fff;
  display:inline-flex; align-items:center; gap:6px; transition:background .15s, border-color .15s, color .15s; }
.mq-askbtn:hover{ border-color:#fff; background:rgba(255,255,255,.2); }
.mq-askbtn .mq-dot{ width:7px; height:7px; border-radius:50%; border:1.5px solid currentColor; flex:none; }
.mq-askbtn.mq-knew.mq-sel{ background:#c8257a; border-color:#c8257a; color:#fff; }
.mq-askbtn.mq-knew.mq-sel .mq-dot{ background:#fff; border-color:#fff; }
.mq-askbtn.mq-newb.mq-sel{ background:rgba(255,255,255,.92); border-color:#fff; color:#0b0f2a; }
.mq-badge{ position:absolute; top:11px; right:11px; width:15px; height:15px; border-radius:50%; z-index:4;
  opacity:0; transform:scale(.5); transition:opacity .25s, transform .25s; }
.mq-tile.mq-answered .mq-badge{ opacity:1; transform:none; }
.mq-tile.mq-is-known .mq-badge{ background:#c8257a; box-shadow:0 0 0 3px rgba(200,37,122,.28); }
.mq-tile.mq-is-unknown .mq-badge{ background:rgba(11,15,42,.55); border:2px solid rgba(255,255,255,.75); }
.mq-tile.mq-feature{ border-radius:16px; }
.mq-tile.mq-feature .mq-year{ font-size:17px; }
.mq-tile.mq-feature .mq-title{ font-size:16px; }
.mq-tile.mq-feature .mq-badge{ top:13px; right:13px; }
.mq-tile .mq-tick{ position:absolute; top:13px; left:13px; width:20px; height:20px; z-index:4;
  border-left:2px solid #c8257a; border-top:2px solid #c8257a; border-top-left-radius:5px; }

.mq-prompt{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin:20px 0 0; font-size:13.5px; color:rgba(255,255,255,.6); }
.mq-kc{ display:inline-flex; align-items:center; gap:6px; color:#fff; background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12); border-radius:8px; padding:5px 11px; font-weight:600; }
.mq-kc b{ color:#c8257a; font-size:15px; }
.mq-reset{ background:none; border:none; color:rgba(255,255,255,.45); font-family:inherit; font-size:12px; cursor:pointer; text-decoration:underline; padding:0; }
.mq-reset:hover{ color:#fff; }

.mq-out{ position:relative; margin:0; border-radius:16px; overflow:hidden; border:1.5px solid #c8257a;
  background:radial-gradient(120% 120% at 0% 0%, rgba(200,37,122,.18) 0%, transparent 55%), #161a3d;
  display:flex; flex-direction:column; justify-content:center; gap:14px; padding:26px 30px; }
.mq-out .mq-big{ font-weight:700; font-size:clamp(20px,2vw,26px); line-height:1.18; margin:0; }
.mq-out .mq-big b{ color:#c8257a; }
.mq-out p{ margin:0; font-size:13.5px; line-height:1.5; color:rgba(255,255,255,.7); max-width:46ch; }

/* placement bento 6×8 */
.mq-a-sp{grid-column:1/3;grid-row:1/3}.mq-a-ga{grid-column:3/4;grid-row:1/3}.mq-a-di{grid-column:4/5;grid-row:1/3}
.mq-a-va{grid-column:5/7;grid-row:1/2}.mq-a-te{grid-column:5/7;grid-row:2/3}
.mq-a-ea{grid-column:1/3;grid-row:3/4}.mq-a-bm{grid-column:1/3;grid-row:4/5}.mq-a-la{grid-column:3/4;grid-row:3/5}
.mq-a-vo{grid-column:4/5;grid-row:3/5}.mq-a-al{grid-column:5/7;grid-row:3/5}
.mq-a-hu{grid-column:1/2;grid-row:5/7}.mq-a-is{grid-column:2/4;grid-row:5/7}.mq-a-cu{grid-column:4/5;grid-row:5/7}
.mq-a-se{grid-column:5/7;grid-row:5/6}.mq-a-st{grid-column:5/7;grid-row:6/7}
.mq-a-jw{grid-column:1/3;grid-row:7/9}.mq-a-pe{grid-column:3/4;grid-row:7/9}.mq-a-out{grid-column:4/7;grid-row:7/9}

.mq-tile,.mq-out{ opacity:0; transform:translateY(22px) scale(.985);
  transition:opacity .6s cubic-bezier(.2,0,0,1), transform .6s cubic-bezier(.2,0,0,1); }
.mq-tile.mq-in,.mq-out.mq-in{ opacity:1; transform:none; }
@media (prefers-reduced-motion:reduce){ .mq-tile,.mq-out{ opacity:1; transform:none; transition:none; } }

@media (max-width:860px){
  .mq-grid{ grid-template-columns:repeat(2,1fr); grid-auto-rows:150px; }
  .mq-grid > *{ grid-column:auto !important; grid-row:auto !important; }
  .mq-feature,.mq-a-is,.mq-out{ grid-column:span 2 !important; }
  .mq-feature{ grid-row:span 2 !important; } .mq-out{ grid-row:span 2 !important; }
}
@media (max-width:520px){
  .mq-grid{ grid-template-columns:1fr; }
  .mq-tile,.mq-feature,.mq-a-is,.mq-out{ grid-column:span 1 !important; grid-row:span 1 !important; min-height:210px; }
}
`;

interface MosaiqueSatellitesProps {
  onAnsweredCount?: (count: number) => void;
}

export function MosaiqueSatellites({ onAnsweredCount }: MosaiqueSatellitesProps = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { setVerdicts(JSON.parse(localStorage.getItem(STORE) || '{}')); } catch { /* ignore */ }
  }, []);

  const setVerdict = useCallback((area: string, v: Verdict) => {
    setVerdicts((prev) => {
      const next = { ...prev };
      if (next[area] === v) delete next[area]; else next[area] = v;
      try { localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setVerdicts({});
    try { localStorage.removeItem(STORE); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const key = (e.target as HTMLElement).dataset.mqKey ?? '';
          setRevealed((prev) => { const s = new Set(prev); s.add(key); return s; });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    ref.current?.querySelectorAll('[data-mq-key]').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${Math.min(i, 12) * 45}ms`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const knownCount = Object.values(verdicts).filter((v) => v === 'known').length;
  const answeredCount = Object.keys(verdicts).length;

  useEffect(() => { onAnsweredCount?.(answeredCount); }, [answeredCount, onAnsweredCount]);

  return (
    <section ref={ref}>
      <style>{MOSAIC_CSS}</style>

      <p className="inline-flex items-center gap-3 m-0 mb-3.5 text-[12px] font-semibold tracking-[0.18em] uppercase text-[#c8257a]">
        <span className="bg-[#c8257a] text-white font-bold text-[11px] rounded-md px-2.5 py-0.5 tracking-[0.06em]">70 ANS</span>
        L'épopée des satellites
      </p>
      <h2 className="m-0 font-bold leading-[1.06] tracking-[-0.01em] text-[clamp(30px,4.2vw,52px)]" style={{ textWrap: 'balance' } as React.CSSProperties}>
        De Spoutnik aux méga-constellations,<br />
        <span className="text-[#c8257a]">soixante-dix ans qui ont changé notre ciel.</span>
      </h2>
      <p className="max-w-[680px] mt-[18px] text-[16.5px] leading-[1.6] text-white/70" style={{ textWrap: 'pretty' } as React.CSSProperties}>
        Le 4 octobre 1957, une sphère de 58&nbsp;cm lance ses premiers «&nbsp;bip&nbsp;» depuis l'orbite. En sept décennies,
        les satellites sont passés de l'exploit isolé à l'infrastructure invisible de notre quotidien.
        Parcours les images qui ont marqué cette histoire.
      </p>

      <p className="mq-prompt">
        Survole chaque moment&nbsp;— le connaissais-tu déjà&nbsp;?
        <span className="mq-kc">Déjà connus&nbsp;: <b>{knownCount}</b>&nbsp;/&nbsp;{TILES.length}</span>
        {Object.keys(verdicts).length > 0 && (
          <button className="mq-reset" type="button" onClick={reset}>réinitialiser</button>
        )}
      </p>

      <div className="mq-grid">
        {TILES.map((t) => {
          const v = verdicts[t.area];
          const cls = [
            'mq-tile', `mq-a-${t.area}`,
            t.feature ? 'mq-feature' : '',
            t.short ? 'mq-short' : '',
            v ? 'mq-answered' : '',
            v === 'known' ? 'mq-is-known' : '',
            v === 'unknown' ? 'mq-is-unknown' : '',
            revealed.has(t.area) ? 'mq-in' : '',
          ].filter(Boolean).join(' ');
          return (
            <figure key={t.area} data-mq-key={t.area} className={cls} tabIndex={0}>
              <img loading="lazy" src={t.img} alt={t.alt} />
              {t.feature && <span className="mq-tick" />}
              <div className="mq-scrim" />
              <div className="mq-hoverfill" />
              <figcaption className="mq-cap">
                <span className="mq-year">{t.year}</span>
                <span className="mq-title">{t.title}</span>
                {t.sub && <span className="mq-sub">{t.sub}</span>}
                <span className="mq-detail">{t.detail}</span>
                <div className="mq-ask">
                  <button
                    type="button"
                    className={`mq-askbtn mq-knew${v === 'known' ? ' mq-sel' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setVerdict(t.area, 'known'); }}
                  >
                    <span className="mq-dot" />Je connaissais
                  </button>
                  <button
                    type="button"
                    className={`mq-askbtn mq-newb${v === 'unknown' ? ' mq-sel' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setVerdict(t.area, 'unknown'); }}
                  >
                    Je ne connaissais pas
                  </button>
                </div>
              </figcaption>
              <div className="mq-badge" />
            </figure>
          );
        })}

        <div data-mq-key="out" className={`mq-out mq-a-out${revealed.has('out') ? ' mq-in' : ''}`}>
          <p className="mq-big">En 70 ans, on est passé d'<b>un</b> satellite à <b>plus de 10&nbsp;000</b> en orbite.</p>
          <p>Météo, GPS, télévision, Internet, sécurité civile&nbsp;: ils sont devenus l'infrastructure invisible qui
            conditionne chaque aspect de nos vies. Tu viens d'en parcourir l'histoire image par image.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontWeight: 700, color: '#c8257a', fontSize: 28, lineHeight: 1 }}>{TILES.length}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>moments clés</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontWeight: 700, color: '#c8257a', fontSize: 28, lineHeight: 1 }}>{knownCount}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>que tu connaissais</span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-[22px] mx-0.5 text-[12px] text-white/40">
        Images&nbsp;: <b className="text-white/60 font-medium">NASA · ESA · CNES · Roscosmos</b> — domaine public / Creative Commons. Servies via Wikimedia Commons.
      </p>
    </section>
  );
}
