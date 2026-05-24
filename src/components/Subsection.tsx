import { Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface SubsectionProps {
  title: string;
  content: string;
  videoUrl?: string;
  icon?: React.ReactNode;
}

export function Subsection({ title, content, videoUrl, icon }: SubsectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setShowVideo(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-6 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          {icon && <div className="flex-shrink-0 text-2xl">{icon}</div>}
          <h3 className="text-xl font-semibold text-left">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top duration-300">
          <p className="text-gray-300 leading-relaxed mb-6">{content}</p>

          {videoUrl && (
            <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video border border-white/10">
              {showVideo ? (
                <iframe
                  src={videoUrl}
                  title={title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-magenta opacity-20"></div>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>
                  </button>
                  <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded">
                    Cliquez pour lire la vidéo
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
