/**
 * Cartão especial: "Um carinho para hoje"
 * Frases positivas, acolhedoras e inspiradoras com troca diária ou manual.
 */
import React, { useState } from 'react';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';

const FRASES_INSPIRADORAS = [
  {
    frase: "Respire fundo, dê um passo de cada vez e confie no seu próprio ritmo. Você está indo maravilhosamente bem.",
    autor: "Meu Planner"
  },
  {
    frase: "Que o seu dia seja repleto de delicadeza, boas notícias e xícaras quentinhas de paz.",
    autor: "Carinho Diário"
  },
  {
    frase: "Cuidar de você não é egoísmo, é a prioridade mais bonita que você pode cultivar hoje.",
    autor: "Autocuidado & Afeto"
  },
  {
    frase: "Pequenos hábitos diários florescem nas maiores conquistas da vida. Celebre cada detalhe.",
    autor: "Sabedoria Serena"
  },
  {
    frase: "Hoje é um novo dia em branco. Escreva momentos doces e lembre-se do quanto você é capaz.",
    autor: "Inspiração"
  },
  {
    frase: "A organização traz tranquilidade para a mente e espaço para o coração sonhar.",
    autor: "Meu Planner"
  },
  {
    frase: "Permita-se desacelerar quando necessário. O descanso também faz parte do caminho.",
    autor: "Paz Interior"
  },
  {
    frase: "A sua dedicação silenciosa está construindo algo lindo. Acredite no poder dos seus dias.",
    autor: "Afeto"
  }
];

export const CarinhoDoDia: React.FC = () => {
  // Índice baseado no dia do ano para mudar diariamente
  const getDailyIndex = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % FRASES_INSPIRADORAS.length;
  };

  const [currentIndex, setCurrentIndex] = useState(getDailyIndex());
  const [isRotating, setIsRotating] = useState(false);

  const handleNext = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % FRASES_INSPIRADORAS.length);
      setIsRotating(false);
    }, 200);
  };

  const item = FRASES_INSPIRADORAS[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF9F4] via-[#F9EAF0] to-[#F4DCE5] border border-[#F4DCE5] p-5 sm:p-6 shadow-planner">
      {/* Detalhe de fundo floral sutil */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/40 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-white/90 text-[#B26E86] shadow-2xs">
            <Heart className="w-4 h-4 fill-[#D9A2B5] text-[#D9A2B5]" />
          </div>
          <span className="font-sans-planner text-lg sm:text-xl font-semibold text-[#75656D]">
            Um carinho para hoje
          </span>
        </div>

        <button
          onClick={handleNext}
          title="Ver outra frase de carinho"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-[11px] font-medium text-[#8C7A83] hover:text-[#B26E86] border border-[#F4DCE5] shadow-2xs transition-all active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 text-[#B26E86] ${isRotating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Nova frase</span>
        </button>
      </div>

      <div className="relative z-10 pl-2 border-l-2 border-[#D9A2B5]">
        <p className="font-sans-planner text-base sm:text-lg italic text-[#63535B] leading-relaxed">
          "{item.frase}"
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-[#A66E80] uppercase">
            — {item.autor}
          </span>
          <span className="text-xs text-[#B26E86]/70 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Tenha um dia iluminado
          </span>
        </div>
      </div>
    </div>
  );
};
