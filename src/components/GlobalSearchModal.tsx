/**
 * Modal de Pesquisa Global Unificada (Ctrl+K)
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { GlobalSearchResult, NavigationTab } from '../types/planner';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    searchQuery, 
    setSearchQuery, 
    searchResults,
    setCurrentTab,
    setSelectedDate
  } = usePlanner();

  const [activeFilter, setActiveFilter] = useState<'all' | 'event' | 'task' | 'note' | 'reminder'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Atalho de teclado global Ctrl+K ou Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredResults = searchResults.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleSelectItem = (item: GlobalSearchResult) => {
    setIsSearchOpen(false);
    if (item.date) {
      setSelectedDate(item.date);
    }
    const tabMap: Record<string, NavigationTab> = {
      event: 'calendar',
      task: 'tasks',
      note: 'notes',
      reminder: 'reminders',
    };
    setCurrentTab(tabMap[item.type] || 'home');
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4 text-[#B26E86]" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-[#9E82C2]" />;
      case 'note': return <BookOpen className="w-4 h-4 text-[#E8A598]" />;
      case 'reminder': return <Clock className="w-4 h-4 text-[#C5A059]" />;
      default: return <Sparkles className="w-4 h-4 text-[#B26E86]" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Compromisso';
      case 'task': return 'Tarefa';
      case 'note': return 'Anotação';
      case 'reminder': return 'Lembrete';
      default: return 'Item';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#F4DCE5] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        
        {/* Barra de Busca */}
        <div className="p-4 border-b border-[#FFFFFF] flex items-center gap-3 bg-[#FFFFFF]">
          <Search className="w-5 h-5 text-[#FFFFFF] shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Pesquise por títulos, conteúdos, datas ou categorias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#75656D] placeholder-[#B5A8AF] outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-[#A697A0] hover:text-[#75656D]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 text-xs text-[#9B8C94] hover:bg-[#F9EAF0] rounded-lg"
          >
            Esc
          </button>
        </div>

        {/* Filtros por Categoria/Tipo */}
        <div className="flex px-4 py-2 bg-[#FBF7F9] border-b border-[#F4DCE5] gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'event', label: 'Compromissos' },
            { id: 'task', label: 'Tarefas' },
            { id: 'note', label: 'Anotações' },
            { id: 'reminder', label: 'Lembretes' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as typeof activeFilter)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === f.id
                  ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs'
                  : 'text-[#75656D] hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de Resultados */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-[#F9EAF0]">
          {!searchQuery.trim() ? (
            <div className="py-12 text-center text-xs text-[#A697A0]">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#D9A2B5]" />
              Digite algo para pesquisar em todo o seu planner.
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A697A0]">
              Nenhum resultado encontrado para "<span className="font-semibold text-[#75656D]">{searchQuery}</span>".
            </div>
          ) : (
            filteredResults.map((res) => (
              <div
                key={`${res.type}-${res.id}`}
                onClick={() => handleSelectItem(res)}
                className="p-3 hover:bg-[#FFF9F4] rounded-2xl cursor-pointer flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-[#F9EAF0] shrink-0 mt-0.5">
                    {getIconForType(res.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#75656D] group-hover:text-[#B26E86] truncate">
                        {res.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F4DCE5]/60 text-[#9E657A] font-medium shrink-0">
                        {getTypeLabel(res.type)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9B8C94] truncate mt-0.5">{res.subtitle}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[#D9A2B5] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
