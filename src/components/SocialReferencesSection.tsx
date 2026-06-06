import { useState, useEffect } from 'react';
import { Instagram, Youtube, Globe, ExternalLink, QrCode, Check } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { QRCodeSVG } from 'qrcode.react';
import { SectionCanvas, SectionTopBar, SectionProgress, ChapterShell, ChapterRecap } from './ChapterShell';

const TOTAL_CHAPTERS = 4;
const MIN_ACCOUNTS = 3;
const MIN_SITES = 3;

type RefType = 'instagram' | 'youtube' | 'website';

interface SocialReference {
  name: string;
  handle: string;
  description: string;
  category: 'astronaut' | 'agency' | 'education' | 'female_role_model';
  url: string;
  type: RefType;
}

interface WebResource {
  name: string;
  description: string;
  url: string;
}

interface SocialReferencesSectionProps {
  onComplete: () => void;
  onHome: () => void;
  onBack: () => void;
}

const references: SocialReference[] = [
  { name: 'Thomas Pesquet', handle: '@thom_astro', description: "Astronaute français de l'ESA, partage ses missions et expériences spatiales", category: 'astronaut', url: 'https://www.instagram.com/thom_astro/', type: 'instagram' },
  { name: 'Sophie Adenot', handle: '@sophie.adenot', description: "Nouvelle astronaute française de l'ESA, ingénieure et pilote d'essai", category: 'astronaut', url: 'https://www.instagram.com/sophie.adenot/', type: 'instagram' },
  { name: 'CNES', handle: '@cnes_france', description: "L'agence spatiale française — actu spatiale vulgarisée, missions et images", category: 'agency', url: 'https://www.instagram.com/cnes_france/', type: 'instagram' },
  { name: 'ESA France', handle: '@esafrance', description: "Agence Spatiale Européenne — actualités des missions et découvertes", category: 'agency', url: 'https://www.instagram.com/esafrance/', type: 'instagram' },
  { name: 'CNES YT', handle: 'youtube.com/@CnesFrance', description: "L'agence spatiale française — vidéos pédagogiques sur les missions spatiales", category: 'agency', url: 'https://www.youtube.com/@CnesFrance/', type: 'youtube' },
  { name: 'ESA YT', handle: 'youtube.com/user/ESA', description: "Vidéos immersives sur l'exploration spatiale européenne", category: 'agency', url: 'https://www.youtube.com/user/ESA', type: 'youtube' },
  { name: 'Techniques Spatiales', handle: '@TechniquesSpatiales', description: "Vulgarisation des techniques spatiales en français", category: 'education', url: 'https://www.youtube.com/@TechniquesSpatiales', type: 'youtube' },
  { name: 'Odyssée Spatiale', handle: '@odyssee.spatiale', description: "Vulgarisation spatiale accessible et passionnante", category: 'education', url: 'https://www.instagram.com/odyssee.spatiale/', type: 'instagram' },
  { name: 'Spaceexplorerw', handle: '@spaceexplorerw', description: "Une jeune étudiante qui parle de spatial — parcours et passion", category: 'education', url: 'https://www.instagram.com/spaceexplorerw/', type: 'instagram' },
  { name: "Rêves d'Espace", handle: '@revesdespace', description: "Vulgarisation spatiale passionnante et accessible à tous", category: 'education', url: 'https://www.instagram.com/revesdespace/', type: 'instagram' },
  { name: "Cité de l'Espace", handle: '@citeespace', description: "Musée et centre de culture spatiale à Toulouse", category: 'education', url: 'https://www.instagram.com/citeespace/', type: 'instagram' },
  { name: 'Stardust', handle: '@stardust_space', description: "Média de vulgarisation sur l'espace et l'astronomie", category: 'education', url: 'https://www.instagram.com/stardust_space/', type: 'instagram' },
  { name: 'Elles bougent', handle: '@ellesbougent', description: "Témoignages, modèles féminins scientifiques, événements", category: 'female_role_model', url: 'https://www.instagram.com/ellesbougent', type: 'instagram' },
  { name: "The Women's Voices", handle: 'LinkedIn', description: "Témoignages et actualités sur la place des femmes dans les sciences", category: 'female_role_model', url: 'https://www.linkedin.com/company/the-women-s-voices/posts/', type: 'website' },
  { name: 'Astro Allan', handle: '@astro_allan', description: "Jeune ingénieur issu de la diversité — parcours et passion du spatial", category: 'female_role_model', url: 'https://www.instagram.com/astro_allan/', type: 'instagram' },
];

const webResources: WebResource[] = [
  { name: "Rêves d'Espace", description: "Actualité spatiale : missions, astronautes, exploration", url: 'https://reves-d-espace.com' },
  { name: 'CNES', description: "Ressources officielles, projets éducatifs (Proximars, SpatioLab)", url: 'https://cnes.fr' },
  { name: 'ESA', description: "Missions spatiales européennes, contenus éducatifs et vidéos", url: 'https://www.esa.int' },
  { name: 'SpaceCal', description: "L'agenda des événements du spatial français — gratuit pour tous", url: 'https://www.spacecal.fr/' },
  { name: 'Robotique FIRST France', description: "Compétitions de robotique éducative STEM, soutenues par la Fondation EDF", url: 'https://firstfrance.org' },
];

const categoryLabels: Record<SocialReference['category'], string> = {
  astronaut: 'Astronautes Français',
  agency: 'Agences Spatiales',
  education: 'Vulgarisation & Éducation',
  female_role_model: 'Modèles & Diversité',
};

function TypeIcon({ type }: { type: RefType }) {
  if (type === 'youtube') return <Youtube className="w-4 h-4 text-magenta flex-shrink-0" />;
  if (type === 'website') return <Globe className="w-4 h-4 text-magenta flex-shrink-0" />;
  return <Instagram className="w-4 h-4 text-magenta flex-shrink-0" />;
}

export function SocialReferencesSection({ onComplete, onHome }: SocialReferencesSectionProps) {
  const { saveResponse, getResponses } = useSession();
  const [chapter, setChapter] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [favorite, setFavorite] = useState('');
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [visitedAccounts, setVisitedAccounts] = useState<string[]>([]);
  const [visitedSites, setVisitedSites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const r = await getResponses('social_references');
      if (r.chapter) setChapter(Math.min(parseInt(r.chapter, 10) || 0, TOTAL_CHAPTERS - 1));
      if (r.favorite) setFavorite(r.favorite);
      if (r.visitedAccounts) {
        try { setVisitedAccounts(JSON.parse(r.visitedAccounts)); } catch {}
      }
      if (r.visitedSites) {
        try { setVisitedSites(JSON.parse(r.visitedSites)); } catch {}
      }
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = async (i: number) => {
    if (i < 0 || i >= TOTAL_CHAPTERS) return;
    setChapter(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (hydrated) await saveResponse('social_references', 'chapter', String(i));
  };

  const handleFavoriteChange = async (v: string) => {
    setFavorite(v);
    if (hydrated) await saveResponse('social_references', 'favorite', v);
  };

  const markAccountVisited = async (name: string) => {
    if (visitedAccounts.includes(name)) return;
    const updated = [...visitedAccounts, name];
    setVisitedAccounts(updated);
    if (hydrated) await saveResponse('social_references', 'visitedAccounts', JSON.stringify(updated));
  };

  const markSiteVisited = async (name: string) => {
    if (visitedSites.includes(name)) return;
    const updated = [...visitedSites, name];
    setVisitedSites(updated);
    if (hydrated) await saveResponse('social_references', 'visitedSites', JSON.stringify(updated));
  };

  const accountsNeeded = Math.max(0, MIN_ACCOUNTS - visitedAccounts.length);
  const sitesNeeded = Math.max(0, MIN_SITES - visitedSites.length);

  return (
    <SectionCanvas>
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedQR(null)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <h3 className="text-[22px] font-bold text-gray-900 mb-1">Scanner pour suivre</h3>
              <p className="text-gray-500 text-sm">Scanne ce QR code avec ton téléphone</p>
            </div>
            <QRCodeSVG value={selectedQR} size={256} level="H" includeMargin={true} />
            <button
              onClick={() => setSelectedQR(null)}
              className="w-full mt-4 py-3 bg-magenta text-white rounded-lg font-semibold hover:bg-magenta-700 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <SectionTopBar label="Session 1 · Chapitre 3 sur 3 · Réseaux Sociaux" onHome={onHome} />
      <SectionProgress current={chapter} total={TOTAL_CHAPTERS} onGoTo={goTo} />

      <div className="relative z-[1] max-w-[1120px] mx-auto px-8 pt-14 pb-24">

        {/* ── Ch 1 : Comptes à suivre ── */}
        {chapter === 0 && (
          <ChapterShell
            kicker="01" title="Comptes à suivre"
            titlePrefix="Pour rester connecté à l'espace,"
            titleAccent="voici par où commencer."
            lede="Suis ces comptes pour recevoir de l'actualité spatiale et des contenus inspirants au quotidien. Clique sur la carte pour ouvrir le profil, ou affiche le QR code pour scanner avec ton téléphone."
            onPrev={null} onNext={() => goTo(1)}
            nextEnabled={visitedAccounts.length >= MIN_ACCOUNTS}
            nextLabel={
              accountsNeeded > 0
                ? `Ouvre encore ${accountsNeeded} compte${accountsNeeded > 1 ? 's' : ''} pour continuer`
                : 'Continue · Sites web →'
            }
          >
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-[13px] font-semibold tabular-nums ${visitedAccounts.length >= MIN_ACCOUNTS ? 'text-magenta' : 'text-white/55'}`}>
                {visitedAccounts.length} / {MIN_ACCOUNTS} comptes consultés
              </span>
              {visitedAccounts.length >= MIN_ACCOUNTS && (
                <span className="inline-flex items-center gap-1 bg-magenta/15 text-magenta rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                  <Check className="w-3 h-3" strokeWidth={2.5} /> Minimum atteint
                </span>
              )}
            </div>

            <div className="space-y-8">
              {(['astronaut', 'agency', 'education', 'female_role_model'] as const).map(category => {
                const refs = references.filter(r => r.category === category);
                if (!refs.length) return null;
                return (
                  <div key={category}>
                    <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/45 mb-4">{categoryLabels[category]}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {refs.map((ref, i) => {
                        const visited = visitedAccounts.includes(ref.name);
                        return (
                          <div
                            key={i}
                            className={`bg-white/[0.04] border rounded-2xl p-5 hover:-translate-y-0.5 transition-all group ${
                              visited ? 'border-magenta' : 'border-white/10 hover:border-magenta'
                            }`}
                          >
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mb-3"
                              onClick={() => markAccountVisited(ref.name)}
                            >
                              <div className="flex items-start gap-3">
                                <TypeIcon type={ref.type} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-white group-hover:text-magenta transition-colors text-[15px]">{ref.name}</h5>
                                    {visited && <Check className="w-3.5 h-3.5 text-magenta flex-shrink-0" strokeWidth={2.5} />}
                                  </div>
                                  <p className="text-[12px] text-magenta/70 mb-1">{ref.handle}</p>
                                  <p className="text-[12px] text-white/55 leading-[1.45]">{ref.description}</p>
                                </div>
                              </div>
                            </a>
                            {ref.type !== 'website' && (
                              <button
                                onClick={() => {
                                  setSelectedQR(ref.url);
                                  markAccountVisited(ref.name);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-white/[0.04] hover:bg-magenta/10 border border-white/10 hover:border-magenta rounded-lg text-[12px] text-white/55 hover:text-magenta transition"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                Afficher le QR Code
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 2 : Sites web ── */}
        {chapter === 1 && (
          <ChapterShell
            kicker="02" title="Sites web à explorer"
            titlePrefix="Pour approfondir tes connaissances,"
            titleAccent="ces ressources en ligne."
            lede="Des sites de référence pour rester informé, approfondir tes connaissances et découvrir des opportunités dans le spatial."
            onPrev={() => goTo(0)} onNext={() => goTo(2)}
            nextEnabled={visitedSites.length >= MIN_SITES}
            nextLabel={
              sitesNeeded > 0
                ? `Ouvre encore ${sitesNeeded} site${sitesNeeded > 1 ? 's' : ''} pour continuer`
                : 'Continue · Ton inspiration →'
            }
          >
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-[13px] font-semibold tabular-nums ${visitedSites.length >= MIN_SITES ? 'text-magenta' : 'text-white/55'}`}>
                {visitedSites.length} / {MIN_SITES} sites consultés
              </span>
              {visitedSites.length >= MIN_SITES && (
                <span className="inline-flex items-center gap-1 bg-magenta/15 text-magenta rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                  <Check className="w-3 h-3" strokeWidth={2.5} /> Minimum atteint
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {webResources.map(res => {
                const visited = visitedSites.includes(res.name);
                return (
                  <a
                    key={res.url}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markSiteVisited(res.name)}
                    className={`flex items-start gap-3 bg-white/[0.04] border rounded-2xl p-5 hover:-translate-y-0.5 transition-all group ${
                      visited ? 'border-magenta' : 'border-white/10 hover:border-magenta'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-magenta flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white group-hover:text-magenta transition-colors text-[15px]">{res.name}</p>
                        {visited && <Check className="w-3.5 h-3.5 text-magenta flex-shrink-0" strokeWidth={2.5} />}
                      </div>
                      <p className="text-[12px] text-white/55 mt-0.5 leading-snug">{res.description}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/25 flex-shrink-0 mt-0.5 group-hover:text-magenta transition" />
                  </a>
                );
              })}
            </div>
          </ChapterShell>
        )}

        {/* ── Ch 3 : Ton inspiration ── */}
        {chapter === 2 && (
          <ChapterShell
            kicker="03" title="Ton inspiration"
            titlePrefix="Quel compte ou contenu spatial"
            titleAccent="t'inspire le plus ?"
            lede="Partage ce qui t'a le plus intéressé. Il n'y a pas de bonne ou mauvaise réponse."
            onPrev={() => goTo(1)} onNext={() => goTo(3)} nextEnabled={favorite.trim().length > 0}
            nextLabel={favorite.trim().length > 0 ? "Terminer le chapitre →" : "Écris ta réponse d'abord"}
          >
            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-3">
                Quel compte t'inspire le plus et pourquoi ? Ou quel type de contenu spatial aimerais-tu suivre ?
              </label>
              <textarea
                value={favorite}
                onChange={e => handleFavoriteChange(e.target.value)}
                placeholder="Partage tes centres d'intérêt..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 resize-none text-[14px]"
                rows={5}
                maxLength={4000}
              />
            </div>
          </ChapterShell>
        )}

        {/* ── Récap ── */}
        {chapter === 3 && (
          <ChapterRecap
            chapterLabel="Réseaux Sociaux"
            summary="Tu as découvert les comptes à suivre pour rester connecté à l'actualité spatiale, les sites de référence, et partagé ce qui t'inspire."
            stats={[
              { v: visitedAccounts.length, t: 'comptes consultés' },
              { v: visitedSites.length, t: 'sites explorés' },
            ]}
            nextTitle="Pause entre les sessions"
            nextDesc="Session 1 terminée. Reviens à l'accueil pour démarrer la session 2."
            onContinue={onComplete}
            onPrev={() => goTo(2)}
          />
        )}
      </div>
    </SectionCanvas>
  );
}
