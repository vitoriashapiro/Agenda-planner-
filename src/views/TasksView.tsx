/**
 * Gerenciador de Tarefas do Meu Planner
 */
import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Circle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  Heart,
  AlertCircle,
  Filter,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { PlannerTask, Priority } from '../types/planner';
import { getTodayString } from '../services/storageService';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export const TasksView: React.FC = () => {
  const { 
    tasks, 
    categories, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompleted, 
    toggleTaskFavorite,
    openQuickAdd 
  } = usePlanner();

  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);

  const todayStr = getTodayString();

  // Filtragem
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'completed') return task.completed;
    if (task.completed && activeFilter !== 'all') return false;

    if (activeFilter === 'today') {
      return task.dueDate === todayStr;
    }
    if (activeFilter === 'upcoming') {
      return task.dueDate && task.dueDate > todayStr;
    }
    if (activeFilter === 'overdue') {
      return task.dueDate && task.dueDate < todayStr && !task.completed;
    }
    return true; // 'all'
  });

  const counts = {
    all: tasks.length,
    today: tasks.filter((t) => !t.completed && t.dueDate === todayStr).length,
    upcoming: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr).length,
    overdue: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Topo: Título & Botão Adicionar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#EAE3F5] text-[#9E82C2]">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans-planner text-2xl font-bold text-[#75656D]">
              Minhas Tarefas
            </h2>
            <p className="text-[11px] text-[#A697A0]">
              Gerencie seus afazeres com clareza e celebre cada realização ✨
            </p>
          </div>
        </div>

        <button
          onClick={() => openQuickAdd('task')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'all' as TaskFilter, label: 'Todas', count: counts.all },
          { id: 'today' as TaskFilter, label: 'Hoje', count: counts.today },
          { id: 'upcoming' as TaskFilter, label: 'Próximas', count: counts.upcoming },
          { id: 'overdue' as TaskFilter, label: 'Atrasadas', count: counts.overdue },
          { id: 'completed' as TaskFilter, label: 'Concluídas', count: counts.completed },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeFilter === f.id
                ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#75656D] hover:bg-[#F9EAF0] border border-[#F4DCE5]'
            }`}
          >
            <span>{f.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === f.id ? 'bg-white/30 text-white' : 'bg-[#F9EAF0] text-[#75656D]'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 sm:p-6 shadow-planner">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#A697A0]">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#D9A2B5]/60" />
            <p className="font-semibold text-sm text-[#75656D]">Nenhuma tarefa encontrada neste filtro</p>
            <p className="mt-1">Aproveite a tranquilidade ou adicione uma nova tarefa.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const cat = categories.find((c) => c.id === task.categoryId);
              const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                    task.completed
                      ? 'bg-[#FFF9F4]/60 border-[#F9EAF0] opacity-75'
                      : isOverdue
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-[#FFF9F4] hover:bg-[#FDF3F7] border-[#F4DCE5]'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className="text-[#D9A2B5] hover:text-[#B26E86] transition-transform hover:scale-110 mt-0.5 sm:mt-0 shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold text-[#63535B] ${task.completed ? 'line-through text-[#A697A0]' : ''}`}>
                          {task.name}
                        </span>
                        {task.isFavorite && (
                          <Heart className="w-3.5 h-3.5 fill-[#D9A2B5] text-[#D9A2B5] shrink-0" />
                        )}
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-[#8C7A83] mt-0.5 line-clamp-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#A697A0] mt-1.5">
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            {task.dueDate === todayStr ? 'Hoje' : task.dueDate}
                            {task.dueTime ? ` às ${task.dueTime}` : ''}
                            {isOverdue && ' (Atrasada)'}
                          </span>
                        )}

                        {cat && (
                          <span 
                            style={{ backgroundColor: cat.bgColor, color: cat.color }}
                            className="px-2 py-0.5 rounded-full font-medium"
                          >
                            {cat.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Badge de Prioridade */}
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                      task.priority === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {task.priority === 'high' ? 'Alta Prioridade' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>

                    {/* Ações */}
                    <button
                      onClick={() => toggleTaskFavorite(task.id)}
                      className="p-1.5 text-[#D9A2B5] hover:text-[#B26E86]"
                      title="Favoritar"
                    >
                      <Heart className={`w-4 h-4 ${task.isFavorite ? 'fill-[#D9A2B5]' : ''}`} />
                    </button>
                    <button
                      onClick={() => setEditingTask({ ...task })}
                      className="p-1.5 text-[#75656D] hover:text-[#B26E86]"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Edição de Tarefa */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F4DCE5] animate-in zoom-in-95 duration-150">
            <h3 className="font-sans-planner text-lg font-bold text-[#75656D] pb-3 border-b border-[#F9EAF0]">
              Editar Tarefa
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Nome da Tarefa</label>
                <input 
                  type="text"
                  required
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Descrição</label>
                <textarea 
                  rows={2}
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Prazo</label>
                  <input 
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#75656D] mb-1">Horário</label>
                  <input 
                    type="time"
                    value={editingTask.dueTime || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueTime: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F9EAF0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
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
