import { Trophy, Home, Star } from 'lucide-react';
import { AvatarGuide } from './AvatarGuide';
import { SectionCanvas } from './ChapterShell';

interface CompletionPageProps {
  onRestart: () => void;
}

export function CompletionPage({ onRestart }: CompletionPageProps) {
  return (
    <SectionCanvas>
      <div className="relative z-[1] flex items-center justify-center min-h-screen px-6 py-16">
        <div className="text-center max-w-4xl">
          <div className="mb-8 inline-block">
            <div className="w-24 h-24 mx-auto bg-magenta rounded-full grid place-items-center shadow-[0_0_0_6px_rgba(200,37,122,0.18),0_20px_40px_rgba(200,37,122,0.35)]">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="font-display font-bold text-[clamp(36px,4.4vw,56px)] leading-[1.05] tracking-[0.04em] uppercase mb-6">
            Voyage <span className="text-magenta">Complété.</span>
          </h1>

          <p className="text-[17px] text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
            Tu as parcouru l'intégralité du parcours spatial européen. Impact terrestre, lanceurs, satellites, exploration et accompagnement : tout y est passé.
          </p>

          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 mb-8">
            <h3 className="text-[20px] font-semibold text-white mb-5">Ce que tu as exploré</h3>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              {[
                { title: 'Géopolitique', desc: 'Enjeux stratégiques et souveraineté spatiale' },
                { title: 'Lanceurs', desc: 'Technologies de propulsion et missions' },
                { title: 'Satellites', desc: 'Applications et systèmes orbitaux' },
                { title: 'Exploration', desc: 'Missions scientifiques et découvertes' },
                { title: 'Réseaux', desc: 'Communauté et ressources spatiales' },
                { title: 'Accompagnement', desc: 'Associations et opportunités' },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-magenta/[0.06] rounded-xl p-4 border border-magenta/20">
                  <h4 className="font-semibold text-magenta mb-1">{title}</h4>
                  <p className="text-sm text-white/60">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 max-w-xl mx-auto bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <AvatarGuide
              lines={[
                { speaker: 'girl', text: "Bravo ! Tu as parcouru tout le voyage spatial avec nous." },
                { speaker: 'boy',  text: "J'espère que tu repars avec de nouvelles idées et peut-être une vocation !" },
                { speaker: 'girl', text: "N'hésite pas à rejoindre une association ou à contacter des pros du secteur." },
                { speaker: 'boy',  text: "À bientôt, et qui sait — peut-être qu'on se retrouvera dans l'espace un jour !" },
              ]}
              interval={4200}
            />
          </div>

          <div className="flex gap-4 justify-center mb-10">
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-8 py-4 bg-magenta hover:bg-magenta-700 text-white text-[15px] font-semibold rounded-lg transition"
            >
              <Home className="w-5 h-5" />
              Retour au début
            </button>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 max-w-xl mx-auto">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-magenta flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-white/80 font-semibold mb-1.5">Passionné par l'espace ?</p>
                <p className="text-white/55 text-sm">
                  Visite{' '}
                  <a href="https://www.esa.int/About_Us/Careers_at_ESA" target="_blank" rel="noopener noreferrer" className="text-magenta hover:underline">
                    Carrières à l'ESA
                  </a>
                  {' '}pour explorer les opportunités professionnelles dans le secteur spatial européen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCanvas>
  );
}
