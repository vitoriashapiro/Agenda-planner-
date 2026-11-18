/**
 * Histórico de Registros Anteriores do Meu Planner
 */
import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Filter, 
  Search,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { getTodayString } from '../services/storageService';

export const HistoryView: React.FC = () => {
  const { events, tasks, notes, categories } = usePlanner();

  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'tasks' | 'notes'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const todayStr = getTodayString();

  // Compromissos passados
  const pastEvents = events.filter((e) => e.date < todayStr || e.completed);
  // Tarefas concluídas
  const completedTasks = tasks.filter((t) => t.completed);
  // Anotações
  const allNotes = notes;

  const monthNames = [
    { num: '01', name: 'Janeiro' },
    { num: '02', name: 'Fevereiro' },
    { num: '03', name: 'Março' },
    { num: '04', name: 'Abril' },
    { num: '05', name: 'Maio' },
    { num: '06', name: 'Junho' },
    { num: '07', name: 'Julho' },
    { num: '08', name: 'Agosto' },
    { num: '09', name: 'Setembro' },
    { num: '10', name: 'Outubro' },
    { num: '11', name: 'Novembro' },
    { num: '12', name: 'Dezembro' },
  ];

  // Filtros aplicados
  const filterDateMatch = (dateStr?: string) => {
    if (!dateStr) return true;
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      if (selectedYear !== 'all' && year !== selectedYear) return false;
      if (selectedMonth !== 'all' && month !== selectedMonth) return false;
    }
    return true;
  };

  const filteredPastEvents = pastEvents.filter((e) => {
    const matchesCat = selectedCategory === 'all' || e.categoryId === selectedCategory;
    return matchesCat && filterDateMatch(e.date);
  });

  const filteredCompletedTasks = completedTasks.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.categoryId === selectedCategory;
    return matchesCat && filterDateMatch(t.completedAt?.slice(0, 10) || t.dueDate);
  });

  const filteredNotes = allNotes.filter((n) => {
    const matchesCat = selectedCategory === 'all' || n.categoryId === selectedCategory;
    return matchesCat && filterDateMatch(n.date || n.createdAt.slice(0, 10));
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Topo do Histórico */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#FFF9F4] text-[#B26E86] border border-[#F4DCE5]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans-planner text-2xl font-bold text-[#75656D]">
              Histórico & Memórias
            </h2>
            <p className="text-[11px] text-[#A697A0]">
              Consulte compromissos anteriores, tarefas realizadas e anotações passadas
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF9F4] border border-[#F4DCE5] rounded-2xl text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeTab === 'all' ? 'bg-[#D9A2B5] text-white font-semibold' : 'text-[#75656D]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeTab === 'events' ? 'bg-[#D9A2B5] text-white font-semibold' : 'text-[#75656D]'
            }`}
          >
            Compromissos ({filteredPastEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeTab === 'tasks' ? 'bg-[#D9A2B5] text-white font-semibold' : 'text-[#75656D]'
            }`}
          >
            Tarefas ({filteredCompletedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeTab === 'notes' ? 'bg-[#D9A2B5] text-white font-semibold' : 'text-[#75656D]'
            }`}
          >
            Anotações ({filteredNotes.length})
          </button>
        </div>
      </div>

      {/* Barra de Filtros: Mês, Ano e Categoria */}
      <div className="p-4 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#75656D] font-semibold">
          <Filter className="w-4 h-4 text-[#B26E86]" />
          <span>Filtrar histórico por:</span>
        </div>

        {/* Ano */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-[#FFF9F4]"
        >
          <option value="all">Todos os Anos</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>

        {/* Mês */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-[#FFF9F4]"
        >
          <option value="all">Todos os Meses</option>
          {monthNames.map((m) => (
            <option key={m.num} value={m.num}>{m.name}</option>
          ))}
        </select>

        {/* Categoria */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] bg-[#FFF9F4]"
        >
          <option value="all">Todas as Categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de Histórico */}
      <div className="space-y-6">
        
        {/* Compromissos Passados */}
        {(activeTab === 'all' || activeTab === 'events') && (
          <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 sm:p-6 shadow-planner space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F9EAF0]">
              <Calendar className="w-4 h-4 text-[#B26E86]" />
              <h3 className="font-sans-plannertext-base font-bold text-[#75656D]">
                Compromissos Anteriores ({filteredPastEvents.length})
              </h3>
            </div>

            {filteredPastEvents.length === 0 ? (
              <p className="text-xs text-[#A697A0] py-4 text-center">Nenhum compromisso passado encontrado.</p>
            ) : (
              <div className="space-y-2.5">
                {filteredPastEvents.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5] flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-[#63535B]">{evt.title}</h4>
                      <p className="text-[10px] text-[#A697A0]">{evt.date} às {evt.startTime} {evt.location ? `• ${evt.location}` : ''}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium shrink-0">
                      Realizado
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tarefas Concluídas */}
        {(activeTab === 'all' || activeTab === 'tasks') && (
          <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 sm:p-6 shadow-planner space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F9EAF0]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-sans-planner text-base font-bold text-[#75656D]">
                Tarefas Concluídas ({filteredCompletedTasks.length})
              </h3>
            </div>

            {filteredCompletedTasks.length === 0 ? (
              <p className="text-xs text-[#A697A0] py-4 text-center">Nenhuma tarefa concluída arquivada com estes filtros.</p>
            ) : (
              <div className="space-y-2.5">
                {filteredCompletedTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />
                      <div>
                        <h4 className="text-xs font-semibold text-[#63535B] line-through opacity-75">{task.name}</h4>
                        {task.dueDate && <p className="text-[10px] text-[#A697A0]">Prazo original: {task.dueDate}</p>}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#75656D] border border-[#F4DCE5]">
                      Feito com sucesso ✨
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
