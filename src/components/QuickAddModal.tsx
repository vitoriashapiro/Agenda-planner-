/**
 * Modal de Ação Rápida: Adicionar Compromisso, Tarefa, Anotação ou Lembrete
 */
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  Clock, 
  MapPin, 
  Bell, 
  Repeat, 
  Tag,
  Palette,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { Priority, RepeatOption, ReminderTiming } from '../types/planner';
import { getTodayString } from '../services/storageService';

export const QuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, 
    setIsQuickAddOpen, 
    quickAddDefaultType, 
    categories, 
    selectedDate,
    addEvent, 
    addTask, 
    addNote, 
    addReminder 
  } = usePlanner();

  const [activeTab, setActiveTab] = useState<'event' | 'task' | 'note' | 'reminder'>('event');

  // Estado Compromisso
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtDate, setEvtDate] = useState(selectedDate || getTodayString());
  const [evtStartTime, setEvtStartTime] = useState('10:00');
  const [evtEndTime, setEvtEndTime] = useState('11:00');
  const [evtCategory, setEvtCategory] = useState(categories[0]?.id || 'cat-pessoal');
  const [evtColor, setEvtColor] = useState('#D9A2B5');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtReminder, setEvtReminder] = useState<ReminderTiming>('10m_before');
  const [evtRepeat, setEvtRepeat] = useState<RepeatOption>('none');

  // Estado Tarefa
  const [tskName, setTskName] = useState('');
  const [tskDesc, setTskDesc] = useState('');
  const [tskDueDate, setTskDueDate] = useState(selectedDate || getTodayString());
  const [tskDueTime, setTskDueTime] = useState('');
  const [tskCategory, setTskCategory] = useState(categories[0]?.id || 'cat-pessoal');
  const [tskPriority, setTskPriority] = useState<Priority>('medium');

  // Estado Anotação
  const [notTitle, setNotTitle] = useState('');
  const [notContent, setNotContent] = useState('');
  const [notColor, setNotColor] = useState('#F9EAF0');
  const [notCategory, setNotCategory] = useState(categories[0]?.id || 'cat-pessoal');
  const [notIsQuick, setNotIsQuick] = useState(false);

  // Estado Lembrete
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remDate, setRemDate] = useState(selectedDate || getTodayString());
  const [remTime, setRemTime] = useState('15:00');

  // Sincronizar aba padrão ao abrir
  useEffect(() => {
    if (isQuickAddOpen) {
      setActiveTab(quickAddDefaultType);
      if (selectedDate) {
        setEvtDate(selectedDate);
        setTskDueDate(selectedDate);
        setRemDate(selectedDate);
      }
    }
  }, [isQuickAddOpen, quickAddDefaultType, selectedDate]);

  if (!isQuickAddOpen) return null;

  const handleClose = () => {
    setIsQuickAddOpen(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;

    addEvent({
      title: evtTitle.trim(),
      description: evtDesc.trim(),
      date: evtDate,
      startTime: evtStartTime,
      endTime: evtEndTime || undefined,
      categoryId: evtCategory,
      color: evtColor,
      location: evtLocation.trim() || undefined,
      reminderTiming: evtReminder,
      repeat: evtRepeat,
      completed: false,
      isFavorite: false,
    });

    setEvtTitle('');
    setEvtDesc('');
    setEvtLocation('');
    handleClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tskName.trim()) return;

    addTask({
      name: tskName.trim(),
      description: tskDesc.trim() || undefined,
      dueDate: tskDueDate || undefined,
      dueTime: tskDueTime || undefined,
      categoryId: tskCategory,
      priority: tskPriority,
      completed: false,
      isFavorite: false,
    });

    setTskName('');
    setTskDesc('');
    handleClose();
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notTitle.trim() && !notContent.trim()) return;

    addNote({
      title: notTitle.trim() || 'Anotação sem título',
      content: notContent.trim(),
      color: notColor,
      categoryId: notCategory,
      date: getTodayString(),
      isFavorite: false,
      isQuickNote: notIsQuick,
    });

    setNotTitle('');
    setNotContent('');
    handleClose();
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    addReminder({
      title: remTitle.trim(),
      description: remDesc.trim() || undefined,
      date: remDate,
      time: remTime,
      status: 'pending',
      isFavorite: false,
    });

    setRemTitle('');
    setRemDesc('');
    handleClose();
  };

  const notePastelColors = [
    { label: 'Rosa Claro', hex: '#F9EAF0' },
    { label: 'Lilás Suave', hex: '#EAE3F5' },
    { label: 'Creme Delicado', hex: '#FFF9F4' },
    { label: 'Menta Suave', hex: '#EAF5F0' },
    { label: 'Pêssego', hex: '#FAF0E6' },
    { label: 'Branco Puro', hex: '#FFFFFF' },
  ];

  const eventPastelColors = [
    '#D9A2B5', '#B399D4', '#E8A598', '#97C1A9', '#80B3B3', '#C5A059', '#F4A261'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#F4DCE5] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-[#F9EAF0] flex items-center justify-between bg-[#FFF9F4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F9EAF0] flex items-center justify-center text-[#B26E86]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-sans-planner text-lg font-bold text-[#75656D]">
                Adicionar Novo Registro
              </h2>
              <p className="text-[11px] text-[#A697A0]">Organize seu dia com delicadeza</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#9B8C94] hover:bg-[#F9EAF0] hover:text-[#75656D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Seleção de Tipo */}
        <div className="flex p-2 bg-[#FBF7F9] border-b border-[#F4DCE5] gap-1.5">
          <button
            onClick={() => setActiveTab('event')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-2xl text-xs font-medium transition-all ${
              activeTab === 'event'
                ? 'bg-white text-[#B26E86] shadow-xs border border-[#E8C2D1] font-semibold'
                : 'text-[#75656D] hover:bg-white/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Compromisso</span>
          </button>

          <button
            onClick={() => setActiveTab('task')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-2xl text-xs font-medium transition-all ${
              activeTab === 'task'
                ? 'bg-white text-[#B26E86] shadow-xs border border-[#E8C2D1] font-semibold'
                : 'text-[#75656D] hover:bg-white/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tarefa</span>
          </button>

          <button
            onClick={() => setActiveTab('note')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-2xl text-xs font-medium transition-all ${
              activeTab === 'note'
                ? 'bg-white text-[#B26E86] shadow-xs border border-[#E8C2D1] font-semibold'
                : 'text-[#75656D] hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Anotação</span>
          </button>

          <button
            onClick={() => setActiveTab('reminder')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-2xl text-xs font-medium transition-all ${
              activeTab === 'reminder'
                ? 'bg-white text-[#B26E86] shadow-xs border border-[#E8C2D1] font-semibold'
                : 'text-[#75656D] hover:bg-white/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lembrete</span>
          </button>
        </div>

        {/* Conteúdo Formulário */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* 1. FORMULÁRIO DE COMPROMISSO */}
          {activeTab === 'event' && (
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Título do Compromisso *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Consulta com dermatologista, Reunião de equipe..."
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#F4DCE5] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Descrição (opcional)</label>
                <textarea 
                  rows={2}
                  placeholder="Observações importantes, pauta ou detalhes..."
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#F4DCE5] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Data</label>
                  <input 
                    type="date"
                    required
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Horário Início</label>
                  <input 
                    type="time"
                    required
                    value={evtStartTime}
                    onChange={(e) => setEvtStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Horário Término</label>
                  <input 
                    type="time"
                    value={evtEndTime}
                    onChange={(e) => setEvtEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#B26E86]" /> Categoria
                  </label>
                  <select 
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B26E86]" /> Local (opcional)
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Sala de reunião, Av. Paulista..."
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-[#B26E86]" /> Lembrete
                  </label>
                  <select 
                    value={evtReminder}
                    onChange={(e) => setEvtReminder(e.target.value as ReminderTiming)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-white"
                  >
                    <option value="at_time">No horário do evento</option>
                    <option value="10m_before">10 minutos antes</option>
                    <option value="30m_before">30 minutos antes</option>
                    <option value="1h_before">1 hora antes</option>
                    <option value="1d_before">1 dia antes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1 flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5 text-[#B26E86]" /> Repetição
                  </label>
                  <select 
                    value={evtRepeat}
                    onChange={(e) => setEvtRepeat(e.target.value as RepeatOption)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-white"
                  >
                    <option value="none">Não se repete</option>
                    <option value="daily">Todos os dias</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensalmente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-[#B26E86]" /> Cor no Calendário
                </label>
                <div className="flex items-center gap-2">
                  {eventPastelColors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setEvtColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        evtColor === color ? 'ring-2 ring-[#75656D] scale-110' : 'opacity-85 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F9EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-[#75656D] hover:bg-[#F9EAF0] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#D9A2B5] hover:bg-[#C98A9F] rounded-xl shadow-xs transition-colors"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          )}

          {/* 2. FORMULÁRIO DE TAREFA */}
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Nome da Tarefa *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Enviar relatório mensal, Comprar presente da mamãe..."
                  value={tskName}
                  onChange={(e) => setTskName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#F4DCE5] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Detalhes adicionais (opcional)</label>
                <textarea 
                  rows={2}
                  placeholder="Passos da tarefa, links ou notas..."
                  value={tskDesc}
                  onChange={(e) => setTskDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#F4DCE5] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Data Limite (opcional)</label>
                  <input 
                    type="date"
                    value={tskDueDate}
                    onChange={(e) => setTskDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Horário (opcional)</label>
                  <input 
                    type="time"
                    value={tskDueTime}
                    onChange={(e) => setTskDueTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Categoria</label>
                  <select 
                    value={tskCategory}
                    onChange={(e) => setTskCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Prioridade</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setTskPriority(p)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          tskPriority === p 
                            ? p === 'high' 
                              ? 'bg-rose-100 text-rose-800 border-rose-300 font-semibold'
                              : p === 'medium'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                            : 'bg-white text-[#75656D] border-[#F4DCE5]'
                        }`}
                      >
                        {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F9EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-[#75656D] hover:bg-[#F9EAF0] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#D9A2B5] hover:bg-[#C98A9F] rounded-xl shadow-xs transition-colors"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          )}

          {/* 3. FORMULÁRIO DE ANOTAÇÃO */}
          {activeTab === 'note' && (
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Título da Anotação</label>
                <input 
                  type="text"
                  placeholder="Ex: Ideias para o final de semana, Lista de livros..."
                  value={notTitle}
                  onChange={(e) => setNotTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#F4DCE5] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Conteúdo da Anotação *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Escreva seus pensamentos, listas ou reflexões..."
                  value={notContent}
                  onChange={(e) => setNotContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#FFFFF] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D] resize-none paper-lined"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Categoria</label>
                  <select 
                    value={notCategory}
                    onChange={(e) => setNotCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Cor do Papel</label>
                  <div className="flex items-center gap-2 pt-1">
                    {notePastelColors.map((color) => (
                      <button
                        type="button"
                        key={color.hex}
                        title={color.label}
                        onClick={() => setNotColor(color.hex)}
                        style={{ backgroundColor: color.hex }}
                        className={`w-6 h-6 rounded-lg border border-[#D9A2B5]/40 transition-transform ${
                          notColor === color.hex ? 'ring-2 ring-[#75656D] scale-110' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input 
                  type="checkbox"
                  checked={notIsQuick}
                  onChange={(e) => setNotIsQuick(e.target.checked)}
                  className="rounded text-[#D9A2B5] focus:ring-[#F9EAF0]"
                />
                <span className="text-xs text-[#75656D]">Marcar como Nota Rápida (post-it fixado no topo)</span>
              </label>

              <div className="pt-3 border-t border-[#F9EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-[#75656D] hover:bg-[#F9EAF0] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#D9A2B5] hover:bg-[#C98A9F] rounded-xl shadow-xs transition-colors"
                >
                  Guardar Anotação
                </button>
              </div>
            </form>
          )}

          {/* 4. FORMULÁRIO DE LEMBRETE */}
          {activeTab === 'reminder' && (
            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">O que você gostaria de lembrar? *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Tomar vitaminas, Ligar para vovó, Desligar o forno..."
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#F4DCE5] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Detalhes (opcional)</label>
                <textarea 
                  rows={2}
                  placeholder="Descrição ou informações complementares..."
                  value={remDesc}
                  onChange={(e) => setRemDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#F4DCE5] focus:border-[#D9A2B5] focus:ring-2 focus:ring-[#F9EAF0] outline-none text-[#75656D] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Data do Lembrete</label>
                  <input 
                    type="date"
                    required
                    value={remDate}
                    onChange={(e) => setRemDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Horário Exato</label>
                  <input 
                    type="time"
                    required
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5] text-[11px] text-[#8C7A83]">
                💡 Os lembretes tocam um som suave e exibem notificações no navegador assim que atingirem o horário agendado.
              </div>

              <div className="pt-3 border-t border-[#F9EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-[#75656D] hover:bg-[#F9EAF0] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#D9A2B5] hover:bg-[#C98A9F] rounded-xl shadow-xs transition-colors"
                >
                  Agendar Lembrete
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
