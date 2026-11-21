
/**
 * Barra de Navegação Inferior para Celulares e Tablets
 */
import React, { useState } from 'react';
import {
  Home,
  Calendar,
  Plus,
  CheckSquare,
  BookOpen,
  MoreHorizontal,
  Clock,
  Heart,
  History,
  Settings,
  X,
  Music2
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { NavigationTab } from '../types/planner';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, openQuickAdd } = usePlanner();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { tab: 'home' as NavigationTab, label: 'Início', icon: Home },
    { tab: 'calendar' as NavigationTab, label: 'Agenda', icon: Calendar },
    { tab: 'tasks' as NavigationTab, label: 'Tarefas', icon: CheckSquare },
    { tab: 'notes' as NavigationTab, label: 'Notas', icon: BookOpen },
  ];

  const moreTabs = [
    { tab: 'reminders' as NavigationTab, label: 'Lembretes', icon: Clock },
    { tab: 'favorites' as NavigationTab, label: 'Favoritos', icon: Heart },
    { tab: 'history' as NavigationTab, label: 'Histórico', icon: History },
    { tab: 'settings' as NavigationTab, label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Menu Mais no Mobile */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 border-t border-[#F4DCE5] shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F9EAF0]">
              <span className="font-semibold text-sm text-[#75656D]">
                Mais Opções
              </span>

              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full text-[#9B8C94] hover:bg-[#F9EAF0]"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.tab;

                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setCurrentTab(item.tab);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#F9EAF0] text-[#B26E86] border-[#D9A2B5] font-semibold'
                        : 'bg-[#FFF9F4] text-[#75656D] border-[#F4DCE5]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#B26E86]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Música */}
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  window.dispatchEvent(new Event('planner:openSpotify'));
                }}
                className="flex items-center gap-3 p-3 rounded-2xl border border-[#F4DCE5] bg-[#FFF9F4] text-[#75656D] text-xs font-medium transition-all hover:bg-[#F9EAF0]"
              >
                <Music2 className="w-4 h-4 text-[#B26E86]" />
                <span>Música</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F4DCE5] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
        {mainTabs.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#B26E86] font-semibold' : 'text-[#9B8C94]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Botão Central de Adicionar - tamanho ajustado */}
        <button
          onClick={() => openQuickAdd('event')}
          
          aria-label="Adicionar novo item"className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D9A2B5] to-[#E8BAC9] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <Plus className="w-[21px] h-[21px] stroke-[2.5]" />
        </button>

        {mainTabs.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#B26E86] font-semibold' : 'text-[#9B8C94]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Botão Mais */}
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            moreTabs.some((m) => m.tab === currentTab)
              ? 'text-[#B26E86] font-semibold'
              : 'text-[#9B8C94]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
};
