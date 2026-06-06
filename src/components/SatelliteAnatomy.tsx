import { SatelliteLabelGame } from './SatelliteLabelGame';

const IMG = {
  hero: 'https://commons.wikimedia.org/wiki/Special:FilePath/Space%20Telescope%20Hubble%202009.jpg?width=1200',
  bus: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Hubble%20Space%20Telescope%20at%20the%20Lockheed%20assembly%20plant%208913987.jpg?width=800',
  payload: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Hubble%20Space%20Telescope%20in%20space.jpg?width=800',
};

const ANNOTATIONS = [
  { n: 1, label: 'Antennes', role: 'lien Terre' },
  { n: 2, label: 'Panneaux solaires', role: 'énergie' },
  { n: 3, label: 'Charge utile', role: 'instruments' },
  { n: 4, label: 'Plateforme (bus)', role: 'le corps' },
  { n: 5, label: 'Propulsion', role: 'tuyères' },
];

const BUS_ITEMS = [
  "Navigation & contrôle d'attitude",
  'Propulsion (réservoirs + moteurs-fusées)',
  'Communications avec la Terre',
  'Gestion thermique (−150 °C à +150 °C)',
  'Alimentation électrique (batteries)',
];

const PAYLOAD_ITEMS = [
  'Appareil de prise de vue (optique, radar)',
  'Altimètre (niveau des océans)',
  "Télescope (observation de l'Univers)",
  'Transpondeur de télécommunications',
  'Horloge atomique (navigation GNSS)',
];

const ANATOMY_CSS = `
.sa-ticks::before,.sa-ticks::after,.sa-ticks>span::before,.sa-ticks>span::after{
  content:'';position:absolute;width:18px;height:18px;border:2px solid rgba(200,37,122,.85);pointer-events:none;}
.sa-ticks::before{top:10px;left:10px;border-right:0;border-bottom:0}
.sa-ticks::after{top:10px;right:10px;border-left:0;border-bottom:0}
.sa-ticks>span::before{bottom:10px;left:10px;border-right:0;border-top:0}
.sa-ticks>span::after{bottom:10px;right:10px;border-left:0;border-top:0}
.sa-court{position:relative;aspect-ratio:23.77/10.97;border:2px solid rgba(255,255,255,.85);
  background:repeating-linear-gradient(180deg,#15604a,#15604a 6px,#14583f 6px,#14583f 12px);}
.sa-court .sa-net{position:absolute;top:-6px;bottom:-6px;left:50%;width:2px;background:rgba(255,255,255,.9)}
.sa-court .sa-singles{position:absolute;left:0;right:0;top:11%;bottom:11%;
  border-top:2px solid rgba(255,255,255,.85);border-bottom:2px solid rgba(255,255,255,.85)}
.sa-court .sa-svc{position:absolute;top:11%;bottom:11%;width:2px;background:rgba(255,255,255,.85)}
.sa-court .sa-svc-c{position:absolute;height:2px;background:rgba(255,255,255,.85);top:50%}
`;

export function SatelliteAnatomy() {
  return (
    <div className="space-y-16">
      <style>{ANATOMY_CSS}</style>

      {/* ════ 1 · Vue d'ensemble — photo annotée ════ */}
      <div>
        <SectionLabel>Vue d'ensemble</SectionLabel>
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-5">
          <figure className="sa-ticks relative m-0 rounded-2xl overflow-hidden border border-white/12 bg-black">
            <span />
            <img src={IMG.hero} alt="Le télescope spatial Hubble en orbite" className="w-full h-[300px] sm:h-[380px] object-cover" />
            <div className="absolute inset-y-0 right-0 w-[58%] bg-gradient-to-l from-black/85 via-black/55 to-transparent" />
            <div className="absolute top-5 right-5 flex flex-col gap-2.5 w-[52%] max-w-[260px]">
              {ANNOTATIONS.map(a => (
                <div key={a.n} className="flex items-center gap-2 justify-end">
                  <span className="text-[12px] font-semibold text-white text-right leading-tight">
                    {a.label} <span className="text-white/55 font-normal">· {a.role}</span>
                  </span>
                  <span className="w-6 h-6 rounded-full bg-magenta text-white grid place-items-center text-[11px] font-bold shrink-0 ring-2 ring-magenta/40">{a.n}</span>
                </div>
              ))}
            </div>
            <figcaption className="absolute left-5 bottom-4 right-5">
              <p className="m-0 text-[11px] font-mono tracking-wide text-white/55">PHOTO · NASA — Hubble Space Telescope</p>
              <p className="m-0 text-[15px] font-semibold text-white">Un satellite d'observation de 11 tonnes</p>
            </figcaption>
          </figure>

          <div className="grid grid-cols-2 gap-3 content-start">
            <div className="col-span-2 bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="m-0 text-[12px] font-semibold tracking-[0.12em] uppercase text-white/45 mb-3">Les contraintes du milieu</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { v: '300 °C', t: "d'écart thermique" },
                  { v: '15 ans', t: 'sans réparation' },
                  { v: '0', t: 'technicien à bord' },
                ].map(s => (
                  <div key={s.t}>
                    <div className="text-[24px] font-bold text-magenta leading-none">{s.v}</div>
                    <div className="text-[11px] text-white/50 mt-1 leading-tight">{s.t}</div>
                  </div>
                ))}
              </div>
            </div>
            <MiniFact shape="square" title="Vide spatial" body="Aucune convection : la chaleur ne s'évacue que par rayonnement." />
            <MiniFact shape="circle" title="Radiations" body="Électronique blindée et redondée pour survivre aux particules." />
          </div>
        </div>
      </div>

      {/* ════ 2 · Bus vs Charge utile ════ */}
      <div>
        <SectionLabel>Deux mondes dans une machine</SectionLabel>
        <div className="grid md:grid-cols-2 gap-4">
          <SystemCard
            image={IMG.bus} alt="Satellite en intégration, salle blanche"
            eyebrow="Le véhicule" title={<>La Plateforme <span className="text-white/55 font-medium">(Bus)</span></>}
            tag="≈ 60 % de la masse" intro="Elle fournit toutes les ressources qui maintiennent le satellite en vie :"
            items={BUS_ITEMS}
          />
          <SystemCard
            image={IMG.payload} alt="Instrument d'observation d'un satellite"
            eyebrow="Le passager" title="La Charge Utile"
            tag="la mission" intro="Les instruments embarqués qui réalisent la vraie mission :"
            items={PAYLOAD_ITEMS}
          />
        </div>
      </div>

      {/* ════ 3 · Comparer pour comprendre ════ */}
      <div>
        <SectionLabel>Comparer pour comprendre</SectionLabel>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h4 className="m-0 text-[16px] font-bold text-white">Des panneaux plus longs qu'un court de tennis</h4>
            <span className="text-[12px] text-white/45">Sonde <strong className="text-white/75">Juice</strong> (ESA) · envergure des panneaux</span>
          </div>
          <div className="mx-auto max-w-[560px]">
            <div className="relative mb-2">
              <div className="h-7 rounded-md bg-gradient-to-r from-magenta-700 via-magenta to-magenta-400 flex items-center justify-center shadow-[0_0_24px_rgba(200,37,122,.35)]">
                <span className="text-[12px] font-bold text-white tracking-wide">PANNEAUX SOLAIRES · 27 m</span>
              </div>
              <span className="absolute left-0 -top-2 w-px h-[calc(100%+16px)] bg-magenta/60" />
              <span className="absolute right-0 -top-2 w-px h-[calc(100%+16px)] bg-magenta/60" />
            </div>
            <div className="mx-auto" style={{ width: '88.04%' }}>
              <div className="sa-court rounded-[3px]">
                <div className="sa-singles" />
                <div className="sa-net" />
                <div className="sa-svc" style={{ left: '21%' }} />
                <div className="sa-svc" style={{ right: '21%' }} />
                <div className="sa-svc-c" style={{ left: '21%', right: '50%' }} />
              </div>
              <p className="text-center text-[11px] text-white/45 mt-2 font-mono">COURT DE TENNIS · 23,77 m</p>
            </div>
          </div>
          <p className="text-[12.5px] text-white/55 leading-relaxed mt-5 max-w-[640px] mx-auto text-center">
            À 800 millions de km du Soleil, la lumière est <strong className="text-white/80">25× plus faible</strong> qu'en orbite terrestre :
            il faut <strong className="text-white/80">85 m²</strong> de cellules pour alimenter la sonde.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <h4 className="m-0 text-[16px] font-bold text-white mb-1">Brûlant et glacial — en même temps</h4>
            <p className="m-0 text-[12px] text-white/45 mb-5">La même structure, deux faces, 300 °C d'écart.</p>
            <div className="relative rounded-xl overflow-hidden border border-white/10 h-[150px] flex">
              <div className="flex-1 relative" style={{ background: 'linear-gradient(135deg,#f7b733,#c8252a)' }}>
                <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/85" />
                <span className="absolute bottom-3 left-3 text-[20px] font-extrabold text-white drop-shadow">+150 °C</span>
                <span className="absolute top-3.5 right-3 text-[10px] font-semibold uppercase tracking-wide text-white/85">face Soleil</span>
              </div>
              <div className="flex-1 relative" style={{ background: 'linear-gradient(135deg,#2b3f8f,#0a1230)' }}>
                <span className="absolute bottom-3 right-3 text-[20px] font-extrabold text-white drop-shadow">−150 °C</span>
                <span className="absolute top-3.5 left-3 text-[10px] font-semibold uppercase tracking-wide text-white/70">face ombre</span>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/55 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-[12px] font-bold text-white whitespace-nowrap">Δ 300 °C</div>
            </div>
            <p className="text-[12px] text-white/55 leading-relaxed mt-4">
              Les <strong className="text-white/80">couvertures dorées (MLI)</strong> et des caloducs répartissent la chaleur pour garder l'électronique entre −40 et +50 °C.
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <h4 className="m-0 text-[16px] font-bold text-white mb-1">Du nano au géant</h4>
            <p className="m-0 text-[12px] text-white/45 mb-5">À l'échelle, sur la même ligne de sol.</p>
            <div className="relative h-[150px] flex items-end justify-around gap-2 border-b border-white/15 px-1">
              <ScaleItem barClass="w-16 bg-gradient-to-b from-magenta to-magenta-700 border border-magenta-400/40" h={128} name="GEO télécom" dim="~7 m" />
              <ScaleItem barClass="w-11 bg-white/25 border border-white/30" h={74} name="Scientifique" dim="~4 m" />
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex flex-col items-center justify-end" style={{ height: 32 }}>
                  <span className="w-2 h-2 rounded-full bg-white/70" />
                  <span className="w-3 rounded-sm bg-white/70" style={{ height: 18 }} />
                </div>
                <ScaleCaption name="Humain" dim="1,75 m" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative flex items-end" style={{ height: 32 }}>
                  <span className="w-1.5 h-1.5 bg-amber-300" />
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border border-amber-300/50 grid place-items-center">
                    <span className="w-2.5 h-2.5 bg-amber-300/90" />
                  </span>
                </div>
                <ScaleCaption name="CubeSat" dim="10 cm" />
              </div>
            </div>
            <p className="text-[12px] text-white/55 leading-relaxed mt-4">
              Du <strong className="text-white/80">CubeSat</strong> (une brique de lait, 1 kg) au <strong className="text-white/80">géostationnaire</strong> haut comme un bus (7 tonnes).
            </p>
          </div>
        </div>
      </div>

      {/* ════ 4 · Mini-jeu ════ */}
      <div className="rounded-2xl border border-magenta/25 bg-gradient-to-br from-magenta/[0.10] to-transparent p-6 sm:p-7">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-magenta/15 border border-magenta/30 rounded-full text-magenta text-[12px] font-semibold mb-3">
          <span className="w-3.5 h-3.5 rounded-sm bg-magenta inline-block" /> Mini-jeu interactif
        </div>
        <h4 className="m-0 text-[20px] font-bold text-white mb-1">Identifie les composants sur le schéma</h4>
        <p className="m-0 text-[13px] text-white/60 leading-relaxed mb-6">
          Glisse les étiquettes sous le bon satellite, puis compare leur masse, leur taille et leur durée de vie.
        </p>
        <SatelliteLabelGame />
      </div>

      <div className="text-right">
        <a href="https://cnes.fr/dossiers/satellites" target="_blank" rel="noopener noreferrer" className="text-[12px] text-magenta hover:underline">
          Source : CNES — Dossier Les Satellites ↗
        </a>
      </div>
    </div>
  );
}

/* ─── sous-composants ─────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="text-[12px] font-bold tracking-[0.18em] uppercase text-white/45">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function MiniFact({ shape, title, body }: { shape: 'square' | 'circle'; title: string; body: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
      <div className="w-9 h-9 rounded-lg bg-magenta/15 border border-magenta/30 grid place-items-center mb-3">
        <span className={`block w-4 h-4 border-2 border-magenta ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`} />
      </div>
      <p className="m-0 text-[14px] font-bold text-white">{title}</p>
      <p className="m-0 text-[12px] text-white/55 leading-snug mt-1">{body}</p>
    </div>
  );
}

function SystemCard({ image, alt, eyebrow, title, tag, intro, items }: {
  image: string; alt: string; eyebrow: string; title: React.ReactNode; tag: string; intro: string; items: string[];
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-magenta/20 bg-magenta/[0.06]">
      <div className="relative h-[180px]">
        <img src={image} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0c16] via-[#1a0c16]/30 to-transparent" />
        <div className="absolute left-4 bottom-3 right-4 flex items-center justify-between">
          <div>
            <p className="m-0 text-[11px] font-mono uppercase tracking-wide text-magenta-300">{eyebrow}</p>
            <h4 className="m-0 text-[18px] font-bold text-white">{title}</h4>
          </div>
          <span className="text-[11px] font-semibold text-white/80 bg-black/40 border border-white/15 rounded-full px-2.5 py-1">{tag}</span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[13px] text-white/65 leading-relaxed mb-3">{intro}</p>
        <ul className="space-y-1.5">
          {items.map(item => (
            <li key={item} className="flex items-start gap-2 text-[13px] text-white/80">
              <span className="text-magenta mt-px">·</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ScaleCaption({ name, dim }: { name: string; dim: string }) {
  return (
    <span className="text-[10.5px] font-semibold text-white text-center leading-tight">
      {name}<br /><span className="text-white/50 font-mono">{dim}</span>
    </span>
  );
}

function ScaleItem({ barClass, h, name, dim }: { barClass: string; h: number; name: string; dim: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`rounded-t-sm ${barClass}`} style={{ height: h }} />
      <ScaleCaption name={name} dim={dim} />
    </div>
  );
}
