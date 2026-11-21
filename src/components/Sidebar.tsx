
/**
 * Menu Lateral do Meu Planner (Sidebar)
 */
import React, { useState } from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  CheckSquare,
  BookOpen,
  Clock,
  Heart,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { NavigationTab } from '../types/planner';

interface NavItem {
  tab: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, tasks, reminders, isAdmin } = usePlanner();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const pendingRemindersCount = reminders.filter(
    (r) => r.status === 'pending'
  ).length;

  const navItems: NavItem[] = [
    { tab: 'home', label: 'Início', icon: Home },
    { tab: 'calendar', label: 'Meu calendário', icon: CalendarIcon },
    { tab: 'tasks', label: 'Minhas tarefas', icon: CheckSquare, badge: pendingTasksCount },
    { tab: 'notes', label: 'Minhas anotações', icon: BookOpen },
    { tab: 'reminders', label: 'Lembretes', icon: Clock, badge: pendingRemindersCount },
    { tab: 'favorites', label: 'Favoritos', icon: Heart },
    { tab: 'history', label: 'Histórico', icon: History },
    ...(isAdmin
      ? [{ tab: 'settings' as NavigationTab, label: 'Configurações', icon: Settings }]
      : []),
  ];

  return (
    <aside
      className={[
        'hidden md:flex flex-col border-r border-[#F1DDE5]',
        'bg-white/90 backdrop-blur-sm transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
        'min-h-screen sticky top-0 z-40',
      ].join(' ')}
    >
      <div
        className={[
          'px-4 py-5 border-b border-[#F8EEF2] flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between',
        ].join(' ')}
      >
        <div
          onClick={() => setCurrentTab('home')}
          className={[
            'flex items-center gap-3 cursor-pointer overflow-hidden',
            isCollapsed ? 'justify-center w-full' : '',
          ].join(' ')}
        >
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <img
              src="/imagens/hellokittyicone.png"
              alt="Meu Planner"
              className="w-full h-full object-contain"
            />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-sans-planner text-xl font-bold tracking-tight text-[#75656D]">
                Meu Planner
              </span>
              <span className="text-[10px] tracking-[0.16em] uppercase font-medium text-[#B26E86] mt-0.5">
                agenda digital
              </span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-xl text-[#B49AA5] hover:bg-[#F9EAF0] hover:text-[#9E5D73] transition-all"
            title="Recolher menu lateral"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="px-2 pt-3 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-xl text-[#B49AA5] hover:bg-[#F9EAF0] hover:text-[#9E5D73] transition-all"
            title="Expandir menu lateral"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-3 mb-3 text-[9px] uppercase tracking-[0.2em] text-[#C5AAB6] font-semibold">
            Menu principal
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              title={isCollapsed ? item.label : undefined}
              className={[
                'relative w-full flex items-center gap-3 px-3 py-3',
                'rounded-2xl text-xs font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-[#F9EAF0] text-[#9E5D73] border border-[#EBCBD8] shadow-sm'
                  : 'border border-transparent text-[#75656D] hover:bg-[#FFF9F4] hover:text-[#9E5D73]',
                isCollapsed ? 'justify-center px-0' : '',
              ].join(' ')}
            >
              {isActive && !isCollapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[#D9A2B5]" />
              )}

              <Icon
                className={[
                  'w-[17px] h-[17px] shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive
                    ? 'text-[#B26E86]'
                    : 'text-[#B09AA4] group-hover:text-[#B26E86]',
                ].join(' ')}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">
                  {item.label}
                </span>
              )}

              {!isCollapsed &&
                typeof item.badge === 'number' &&
                item.badge > 0 && (
                  <span
                    className={[
                      'min-w-[22px] text-center text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                      isActive
                        ? 'bg-white text-[#B26E86]'
                        : 'bg-[#F9EAF0] text-[#9B7887]',
                    ].join(' ')}
                  >
                    {item.badge}
                  </span>
                )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-3 mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF9F4] to-[#F9EAF0] border border-[#F1DDE5] text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#B26E86] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rotina com afeto</span>
            </div>

            <p className="text-[11px] text-[#8C7A83] italic leading-relaxed">
              "Organize seu dia com leveza e celebre cada pequeno passo."
            </p>

            <div className="flex justify-center mt-2.5 text-[#D9A2B5] text-xs">
              ♡
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
