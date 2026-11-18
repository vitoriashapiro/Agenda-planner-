/**
 * Meu Calendário - Visualização Mensal, Semanal e Diária
 */
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  Circle, 
  Copy, 
  Trash2, 
  Edit3, 
  Heart,
  Repeat,
  Bell,
  X
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { PlannerEvent, RepeatOption, ReminderTiming } from '../types/planner';
import { getTodayString } from '../services/storageService';

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const { 
    events, 
    categories, 
    selectedDate, 
    setSelectedDate, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    duplicateEvent, 
    toggleEventCompleted, 
    toggleEventFavorite,
    openQuickAdd,
    userProfile 
  } = usePlanner();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  
  // Data de referência do calendário
  const [currentYear, setCurrentYear] = useState(() => {
    return selectedDate ? parseInt(selectedDate.split('-')[0]) : new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? parseInt(selectedDate.split('-')[1]) - 1 : new Date().getMonth();
  });

  // Modal de edição / detalhes do compromisso
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const todayStr = getTodayString();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayNames = userProfile.firstDayOfWeek === 'monday' 
    ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Navegação
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Cálculo da grade mensal
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayIndex = userProfile.firstDayOfWeek === 'monday' 
    ? (firstDayRaw === 0 ? 6 : firstDayRaw - 1)
    : firstDayRaw;

  // Compromissos do dia selecionado
  const selectedDayEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Abrir modal de edição
  const handleEditClick = (evt: PlannerEvent) => {
    setEditingEvent({ ...evt });
    setIsDetailModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateEvent(editingEvent);
    setIsDetailModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Topo do Calendário: Controles & Navegação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#F9EAF0] text-[#B26E86]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans-planner text-2xl font-bold text-[#75656D]">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-[11px] text-[#A697A0]">
              Dia selecionado: <span className="font-semibold text-[#B26E86]">{selectedDate}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Modo: Mês / Semana / Dia */}
          <div className="flex p-1 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'month' ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs' : 'text-[#75656D]'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'week' ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs' : 'text-[#75656D]'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'day' ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs' : 'text-[#75656D]'
              }`}
            >
              Dia
            </button>
          </div>

          {/* Navegação de Mês */}
          <div className="flex items-center gap-1 border border-[#F4DCE5] rounded-2xl p-1 bg-[#FFF9F4]">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-[#75656D] hover:bg-[#F9EAF0] transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-medium text-[#B26E86] hover:bg-[#F9EAF0] rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-[#75656D] hover:bg-[#F9EAF0] transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botão Adicionar Compromisso */}
          <button
            onClick={() => openQuickAdd('event')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Calendário + Painel Lateral do Dia Selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Grade do Calendário */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#F4DCE5] p-5 sm:p-6 shadow-planner">
          
          {/* MODO MENSAL */}
          {viewMode === 'month' && (
            <div>
              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-2 pb-3 mb-2 border-b border-[#F9EAF0] text-center text-xs font-semibold text-[#8C7A83]">
                {weekDayNames.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>

              {/* Grade dos dias do mês */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {Array.from({ length: firstDayIndex }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-16 sm:h-24 rounded-2xl bg-[#FFF9F4]/40 border border-transparent" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const isToday = todayStr === dateStr;
                  const dayEvents = events.filter((e) => e.date === dateStr);

                  return (
                    <div
                      key={dayNum}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-16 sm:h-24 p-1.5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#B26E86] bg-[#FDF2F6] ring-2 ring-[#F4DCE5]'
                          : isToday
                          ? 'border-[#D9A2B5] bg-[#FFF9F4]'
                          : 'border-[#F9EAF0] bg-white hover:border-[#D9A2B5] hover:bg-[#FFF9F4]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center ${
                          isToday 
                            ? 'bg-[#D9A2B5] text-white font-bold' 
                            : isSelected 
                            ? 'text-[#B26E86]' 
                            : 'text-[#75656D]'
                        }`}>
                          {dayNum}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] text-[#A697A0] hidden sm:inline">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Indicadores de Eventos */}
                      <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((evt) => (
                          <div 
                            key={evt.id}
                            style={{ backgroundColor: `${evt.color}25`, borderColor: evt.color, color: '#63535B' }}
                            className="text-[10px] truncate px-1.5 py-0.5 rounded-md border font-medium hidden sm:block"
                          >
                            {evt.startTime} {evt.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-[#B26E86] font-semibold hidden sm:block">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}

                        {/* Indicadores compactos para mobile */}
                        <div className="flex gap-1 justify-center sm:hidden">
                          {dayEvents.slice(0, 3).map((evt) => (
                            <span 
                              key={evt.id}
                              style={{ backgroundColor: evt.color }}
                              className="w-1.5 h-1.5 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO SEMANAL */}
          {viewMode === 'week' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FFF9F4] rounded-2xl border border-[#F4DCE5] text-xs text-[#75656D]">
                📅 Visualização semanal dos seus compromissos. Clique em qualquer compromisso para visualizar ou editar detalhes.
              </div>

              <div className="divide-y divide-[#F9EAF0]">
                {Array.from({ length: 7 }).map((_, i) => {
                  const baseDate = new Date(selectedDate || todayStr);
                  const dayOffset = i - baseDate.getDay();
                  const target = new Date(baseDate);
                  target.setDate(baseDate.getDate() + dayOffset);
                  const dateStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
                  const dayEvents = events.filter((e) => e.date === dateStr);

                  return (
                    <div key={dateStr} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="w-36 shrink-0">
                        <p className="text-xs font-bold text-[#75656D]">
                          {target.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[10px] text-[#A697A0]">{dateStr === todayStr ? 'Hoje' : dateStr}</p>
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        {dayEvents.length === 0 ? (
                          <span className="text-xs text-[#B5A8AF] italic">Nenhum compromisso marcado</span>
                        ) : (
                          dayEvents.map((evt) => (
                            <div 
                              key={evt.id}
                              onClick={() => handleEditClick(evt)}
                              style={{ borderLeftColor: evt.color }}
                              className="p-2.5 rounded-xl bg-[#FFF9F4] hover:bg-[#F9EAF0] border border-l-4 border-[#F4DCE5] cursor-pointer flex items-center justify-between gap-2 transition-colors"
                            >
                              <div>
                                <p className="text-xs font-semibold text-[#75656D]">{evt.title}</p>
                                <p className="text-[10px] text-[#A697A0]">{evt.startTime} {evt.location ? `• ${evt.location}` : ''}</p>
                              </div>
                              <span className="text-[10px] text-[#B26E86] bg-white px-2 py-0.5 rounded-full border border-[#F4DCE5]">
                                Ver detalhes
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO DIÁRIO */}
          {viewMode === 'day' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-[#FFF9F4] to-[#F9EAF0] rounded-2xl border border-[#F4DCE5] flex items-center justify-between">
                <div>
                  <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
                    Dia {selectedDate}
                  </h3>
                  <p className="text-xs text-[#8C7A83]">
                    {selectedDayEvents.length} compromisso(s) agendado(s)
                  </p>
                </div>
                <button
                  onClick={() => openQuickAdd('event')}
                  className="px-3 py-1.5 rounded-xl bg-[#D9A2B5] text-white text-xs font-semibold"
                >
                  + Novo neste dia
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {selectedDayEvents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#A697A0]">
                    Nenhum compromisso para este dia. Aproveite seu tempo livre! 🌸
                  </div>
                ) : (
                  selectedDayEvents.map((evt) => (
                    <div 
                      key={evt.id}
                      style={{ borderLeftColor: evt.color }}
                      className="p-4 rounded-2xl bg-[#FFF9F4] border border-l-4 border-[#F4DCE5] flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#63535B]">{evt.title}</h4>
                          {evt.isFavorite && <Heart className="w-3.5 h-3.5 fill-[#D9A2B5] text-[#D9A2B5]" />}
                        </div>
                        {evt.description && <p className="text-xs text-[#8C7A83]">{evt.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#A697A0] pt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#B26E86]" /> {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>
                          {evt.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#B26E86]" /> {evt.location}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(evt)}
                          className="p-1.5 rounded-lg text-[#75656D] hover:bg-[#F9EAF0]"
                          title="Editar compromisso"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateEvent(evt.id)}
                          className="p-1.5 rounded-lg text-[#75656D] hover:bg-[#F9EAF0]"
                          title="Duplicar compromisso"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEvent(evt.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Excluir compromisso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Coluna 3: Detalhes do Dia Selecionado */}
        <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 sm:p-6 shadow-planner space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F9EAF0]">
            <div>
              <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
                Compromissos do Dia
              </h3>
              <p className="text-[11px] text-[#A697A0]">
                {selectedDate === todayStr ? 'Hoje' : selectedDate}
              </p>
            </div>
            <button
              onClick={() => openQuickAdd('event')}
              className="p-1.5 rounded-full bg-[#F9EAF0] text-[#B26E86] hover:bg-[#F4DCE5] transition-colors"
              title="Adicionar compromisso neste dia"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#A697A0] bg-[#FFF9F4] rounded-2xl border border-dashed border-[#F4DCE5] p-4">
                <p>Nenhum compromisso para este dia.</p>
                <button
                  onClick={() => openQuickAdd('event')}
                  className="mt-3 px-3 py-1 rounded-xl bg-white border border-[#E8C2D1] text-[11px] text-[#B26E86] font-medium"
                >
                  + Agendar agora
                </button>
              </div>
            ) : (
              selectedDayEvents.map((evt) => (
                <div 
                  key={evt.id}
                  style={{ borderLeftColor: evt.color }}
                  className="p-3 rounded-2xl bg-[#FFF9F4] border border-l-4 border-[#F4DCE5] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleEventCompleted(evt.id)}
                        className="text-[#D9A2B5] hover:text-[#B26E86] transition-colors"
                      >
                        {evt.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span className={`text-xs font-semibold text-[#63535B] ${evt.completed ? 'line-through opacity-60' : ''}`}>
                        {evt.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => toggleEventFavorite(evt.id)} 
                        className="p-1 text-[#D9A2B5] hover:text-[#B26E86]"
                        title="Favoritar"
                      >
                        <Heart className={`w-3.5 h-3.5 ${evt.isFavorite ? 'fill-[#D9A2B5]' : ''}`} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(evt)} 
                        className="p-1 text-[#75656D] hover:text-[#B26E86]"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => duplicateEvent(evt.id)} 
                        className="p-1 text-[#75656D] hover:text-[#B26E86]"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteEvent(evt.id)} 
                        className="p-1 text-rose-500 hover:text-rose-700"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {evt.description && (
                    <p className="text-[11px] text-[#8C7A83] pl-6 leading-relaxed">
                      {evt.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#A697A0] pl-6">
                    <span>⏰ {evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
                    {evt.location && <span>📍 {evt.location}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal de Edição de Compromisso */}
      {isDetailModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F4DCE5] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F9EAF0]">
              <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
                Editar Compromisso
              </h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-[#9B8C94] hover:text-[#75656D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Título</label>
                <input 
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Descrição</label>
                <textarea 
                  rows={2}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Data</label>
                  <input 
                    type="date"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Início</label>
                  <input 
                    type="time"
                    required
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Término</label>
                  <input 
                    type="time"
                    value={editingEvent.endTime || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Local</label>
                <input 
                  type="text"
                  value={editingEvent.location || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                />
              </div>

              <div className="pt-3 border-t border-[#F9EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#75656D] hover:bg-[#F9EAF0] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#D9A2B5] hover:bg-[#C98A9F] rounded-xl"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};