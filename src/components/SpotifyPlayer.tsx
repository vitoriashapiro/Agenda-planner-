
import { useState } from 'react';
import { Music2, Minus } from 'lucide-react';

export default function SpotifyPlayer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 sm:bottom-5 sm:left-5 sm:right-auto z-40">

      {/* Painel do Spotify */}
      <div
        className={`mb-3 w-[min(300px,calc(100vw-24px))] sm:w-[340px] overflow-hidden rounded-2xl border border-[#F4DCE5] bg-white shadow-xl transition-all duration-300 ${
          isOpen
            ? 'max-h-[410px] opacity-100'
            : 'max-h-0 opacity-0 border-0 mb-0'
        }`}
      >
        <div className="flex items-center justify-between bg-[#FCEEF3] px-4 py-3">
          <div className="flex items-center gap-2 text-[#95677A]">
            <Music2 size={18} />
            <span className="text-sm font-semibold">
              Minha Playlist 🎀
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-[#95677A] hover:text-[#75656D]"
            title="Minimizar música"
            aria-label="Minimizar música"
          >
            <Minus size={20} />
          </button>
        </div>

        <iframe
          src="https://open.spotify.com/embed/playlist/6eHzsruUkFWMc1COHI5w1m?utm_source=generator"
          width="100%"
          height="352"
          style={{ borderRadius: '0 0 16px 16px' }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Minha playlist do Spotify"
        />
      </div>

      {/* Botão compacto */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-[#E8B6C8] px-3 py-2.5 sm:px-4 sm:py-3 text-white shadow-lg transition-all hover:bg-[#D99DB5] hover:scale-105"
        title={isOpen ? 'Minimizar música' : 'Abrir player de música'}
        aria-label={isOpen ? 'Minimizar música' : 'Abrir player de música'}
      >
        <Music2 size={20} />
        <span className="text-xs sm:text-sm font-semibold">
          {isOpen ? 'Minimizar' : 'Minha música'}
        </span>
      </button>

    </div>
  );
}
