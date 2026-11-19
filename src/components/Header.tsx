
/**
 * Header principal do Meu Planner
 * Redesign delicado rosa - estilo Meu Planner
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  Cloud,
  CloudOff,
  Calendar,
  CheckSquare,
  BookOpen,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export const Header: React.FC = () => {
  const {
    userProfile,
    firebaseStatus,
    reminders,
    setCurrentTab,
    openQuickAdd,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    setIsAuthModalOpen,
  } = usePlanner();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }

      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lembretes pendentes
  const pendingReminders = reminders.filter(
    (r) => r.status === 'pending' || r.status === 'sent'
  );

  // Saudação
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Data atual
  const getFormattedDate = () => {
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    const formatted = now.toLocaleDateString('pt-BR', options);

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFF9F7]/95 backdrop-blur-xl border-b border-[#F3DDE6] px-4 sm:px-6 py-4 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">

        {/* Saudação e data */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold text-[#786570] truncate">
              {getGreeting()},{' '}

              {userProfile.displayName?.trim() && (
                <span className="text-[#C17E9B] font-bold">
                  {userProfile.displayName.trim().split(' ')[0]}
                </span>
              )}

              <span className="text-[#D9A2B5]"> ♡</span>
            </h1>

            <span className="hidden sm:inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-[#FCECF3] text-[#B47B92] border border-[#F1D4E1]">
              <Sparkles size={12} />
              Meu Dia
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#A18F99] mt-0.5">
            {getFormattedDate()}
          </p>
        </div>

        {/* Barra de pesquisa */}
        <div className="hidden md:flex flex-1 max-w-md mx-3">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-white border border-[#F1DDE5] hover:border-[#D9A2B5] hover:shadow-[0_3px_15px_rgba(217,162,181,0.12)] text-[#A18F99] cursor-pointer transition-all"
          >
            <Search className="w-4 h-4 text-[#D9A2B5]" />

            <input
              type="text"
              readOnly
              placeholder="Pesquisar no meu planner..."
              value={searchQuery}
              className="w-full bg-transparent text-sm text-[#786570] placeholder-[#BDAEB5] outline-none cursor-pointer"
            />

            <kbd className="hidden lg:inline-flex items-center whitespace-nowrap shrink-0 leading-none px-1.5 py-1 text-[9px] text-[#BDA3AE] bg-[#FFF8FA] border border-[#F5E6EC] rounded-md">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Status Firebase */}
          <button
            onClick={() => setCurrentTab('settings')}
            title={
              firebaseStatus.isConnected
                ? 'Nuvem conectada'
                : 'Clique para configurar a nuvem'
            }
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition-all ${
              firebaseStatus.isConnected
                ? 'bg-[#F0FAF4] text-[#6C9C7B] border-[#D6EBDD] hover:bg-[#E7F5EC]'
                : 'bg-[#FCF0F5] text-[#B47B92] border-[#F1D4E1] hover:bg-[#F8E4ED]'
            }`}
          >
            {firebaseStatus.isConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Nuvem ativa</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Modo local</span>
              </>
            )}
          </button>

          {/* Pesquisa mobile */}
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Abrir pesquisa"
            className="md:hidden p-2 rounded-full text-[#8F7182] hover:bg-[#FCECF3] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notificações */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 rounded-full text-[#98788A] hover:bg-[#FCECF3] hover:text-[#B47B92] transition-all"
              aria-label="Notificações e lembretes"
            >
              <Bell className="w-[18px] h-[18px]" />

              {pendingReminders.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#D9A2B5] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-[350px] bg-white rounded-2xl shadow-planner border border-[#F3DDE6] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                {/* Cabeçalho */}
                <div className="px-4 py-3 border-b border-[#F9EAF0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D9A2B5]" />
                    <span className="text-sm font-semibold text-[#786570]">
                      Central de Lembretes
                    </span>
                  </div>

                  <span className="text-[11px] text-[#AD91A0] px-2 py-1 rounded-full bg-[#FCF2F6]">
                    {pendingReminders.length} pendente(s)
                  </span>
                </div>

                {/* Lista */}
                <div className="max-h-72 overflow-y-auto p-2 divide-y divide-[#F9EAF0]">
                  {pendingReminders.length === 0 ? (
                    <div className="py-7 text-center text-sm text-[#AD91A0]">
                      <Clock className="w-7 h-7 mx-auto mb-2 text-[#D9A2B5]/60" />
                      Nenhum lembrete pendente.
                      <p className="mt-1 text-xs">Tudo em paz por aqui! 🌸</p>
                    </div>
                  ) : (
                    pendingReminders.slice(0, 5).map((rem) => (
                      <div
                        key={rem.id}
                        className="p-3 hover:bg-[#FFF9F7] rounded-xl transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-[#786570]">
                            {rem.title}
                          </p>

                          <span className="text-[11px] text-[#B47B92] bg-[#FCF2F6] px-2 py-1 rounded-lg shrink-0">
                            {rem.time}
                          </span>
                        </div>

                        {rem.description && (
                          <p className="text-xs text-[#A18F99] mt-1 line-clamp-1">
                            {rem.description}
                          </p>
                        )}

                        <p className="text-[10px] text-[#BDAEB5] mt-1.5">
                          Data: {rem.date}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Rodapé */}
                <div className="px-3 pt-2 border-t border-[#F9EAF0]">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      setCurrentTab('reminders');
                    }}
                    className="w-full py-2 text-center text-sm font-semibold text-[#B47B92] hover:bg-[#FCF2F6] rounded-xl transition-colors"
                  >
                    Ver todos os lembretes →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Adicionar novo */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#D9A2B5] hover:bg-[#C98A9F] active:scale-95 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-planner border border-[#F3DDE6] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                {/* Compromisso */}
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    openQuickAdd('event');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#786570] hover:bg-[#FCF2F6] hover:text-[#B47B92] rounded-xl transition-colors text-left"
                >
                  <div className="p-2 rounded-xl bg-[#FCF2F6] text-[#D9A2B5]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Novo compromisso</p>
                    <p className="text-xs text-[#AD91A0]">Horários e calendário</p>
                  </div>
                </button>

                {/* Tarefa */}
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    openQuickAdd('task');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#786570] hover:bg-[#FCF2F6] hover:text-[#B47B92] rounded-xl transition-colors text-left"
                >
                  <div className="p-2 rounded-xl bg-[#F0EBF8] text-[#A18BC5]">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Nova tarefa</p>
                    <p className="text-xs text-[#AD91A0]">Prioridade e checklist</p>
                  </div>
                </button>

                {/* Anotação */}
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    openQuickAdd('note');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#786570] hover:bg-[#FCF2F6] hover:text-[#B47B92] rounded-xl transition-colors text-left"
                >
                  <div className="p-2 rounded-xl bg-[#FFF0ED] text-[#E4A28F]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Nova anotação</p>
                    <p className="text-xs text-[#AD91A0]">Caderno ou nota rápida</p>
                  </div>
                </button>

                {/* Lembrete */}
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false);
                    openQuickAdd('reminder');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#786570] hover:bg-[#FCF2F6] hover:text-[#B47B92] rounded-xl transition-colors text-left"
                >
                  <div className="p-2 rounded-xl bg-[#FBF7EE] text-[#C5A059]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Novo lembrete</p>
                    <p className="text-xs text-[#AD91A0]">Avisos e notificações</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#D9A2B5]/50 transition-all"
            title="Minha conta"
          >
            <img
              src={userProfile.avatarUrl?.trim() || '/imagens/hellokitty.jpg'}
              alt={userProfile.displayName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/imagens/hellokitty.jpg';
              }}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#F1D4E1] shadow-sm"
            />
          </button>

        </div>
      </div>
    </header>
  );
};
