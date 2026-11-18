/**
 * Página de Favoritos - Reúne anotações, compromissos e tarefas destacadas
 */
import React, { useState } from 'react';
import { 
  Heart, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Trash2
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';

export const FavoritesView: React.FC = () => {
  const { 
    events, 
    tasks, 
    notes, 
    reminders, 
    toggleEventFavorite, 
    toggleTaskFavorite, 
    toggleNoteFavorite, 
    toggleReminderFavorite,
    setCurrentTab,
    setSelectedDate 
  } = usePlanner();

  const [filterType, setFilterType] = useState<'all' | 'events' | 'tasks' | 'notes'>('all');

  const favoriteEvents = events.filter((e) => e.isFavorite);
  const favoriteTasks = tasks.filter((t) => t.isFavorite);
  const favoriteNotes = notes.filter((n) => n.isFavorite);
  const favoriteReminders = reminders.filter((r) => r.isFavorite);

  const totalFavorites = favoriteEvents.length + favoriteTasks.length + favoriteNotes.length + favoriteReminders.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Topo de Favoritos */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#F9EAF0] text-[#B26E86]">
            <Heart className="w-5 h-5 fill-[#D9A2B5] text-[#D9A2B5]" />
          </div>
          <div>
            <h2 className="font-sans-planner text-2xl font-bold text-[#75656D]">
              Meus Favoritos
            </h2>
            <p className="text-[11px] text-[#A697A0]">
              Tudo o que você marcou com carinho reunido em um só lugar ({totalFavorites} itens)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF9F4] border border-[#F4DCE5] rounded-2xl text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl transition-all ${
              filterType === 'all' ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs' : 'text-[#75656D]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('events')}
            className={`px-3 py-1 rounded-xl transition-all ${
              filterType === 'events' ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs' : 'text-[#75656D]'
            }`}
          >
            Compromissos ({favoriteEvents.length})
          </button>
          <button
            onClick={() => setFilterType('tasks')}
            className={`px-3 py-1 rounded-xl transition-all ${
              filterType === 'tasks' ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs' : 'text-[#75656D]'
            }`}
          >
            Tarefas ({favoriteTasks.length})
          </button>
          <button
            onClick={() => setFilterType('notes')}
            className={`px-3 py-1 rounded-xl transition-all ${
              filterType === 'notes' ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs' : 'text-[#75656D]'
            }`}
          >
            Anotações ({favoriteNotes.length})
          </button>
        </div>
      </div>

      {totalFavorites === 0 ? (
        <div className="bg-white rounded-3xl border border-[#F4DCE5] p-16 text-center shadow-planner">
          <Heart className="w-12 h-12 mx-auto mb-3 text-[#D9A2B5]/40" />
          <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
            Você ainda não favoritou nenhum item
          </h3>
          <p className="text-xs text-[#A697A0] max-w-md mx-auto mt-1 leading-relaxed">
            Clique no ícone de coração em qualquer compromisso, anotação ou tarefa para guardá-la em destaque aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Seção 1: Compromissos Importantes */}
          {(filterType === 'all' || filterType === 'events') && favoriteEvents.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 shadow-planner space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F9EAF0]">
                <Calendar className="w-4 h-4 text-[#B26E86]" />
                <h3 className="font-sans-planner text-base font-bold text-[#75656D]">
                  Compromissos Importantes ({favoriteEvents.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {favoriteEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5] flex items-start justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-[#63535B]">{evt.title}</h4>
                      <p className="text-[10px] text-[#A697A0] mt-0.5">{evt.date} às {evt.startTime}</p>
                      {evt.location && <p className="text-[10px] text-[#8C7A83]">📍 {evt.location}</p>}
                    </div>
                    <button
                      onClick={() => toggleEventFavorite(evt.id)}
                      className="p-1 text-[#D9A2B5] hover:text-[#B26E86]"
                      title="Remover dos favoritos"
                    >
                      <Heart className="w-4 h-4 fill-[#D9A2B5]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção 2: Tarefas Destacadas */}
          {(filterType === 'all' || filterType === 'tasks') && favoriteTasks.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 shadow-planner space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F9EAF0]">
                <CheckSquare className="w-4 h-4 text-[#9E82C2]" />
                <h3 className="font-sans-planner text-base font-bold text-[#75656D]">
                  Tarefas Destacadas ({favoriteTasks.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {favoriteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5] flex items-start justify-between gap-2"
                  >
                    <div>
                      <h4 className={`text-xs font-semibold text-[#63535B] ${task.completed ? 'line-through text-[#A697A0]' : ''}`}>
                        {task.name}
                      </h4>
                      {task.dueDate && <p className="text-[10px] text-[#A697A0] mt-0.5">Prazo: {task.dueDate}</p>}
                    </div>
                    <button
                      onClick={() => toggleTaskFavorite(task.id)}
                      className="p-1 text-[#D9A2B5] hover:text-[#B26E86]"
                      title="Remover dos favoritos"
                    >
                      <Heart className="w-4 h-4 fill-[#D9A2B5]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção 3: Anotações Favoritas */}
          {(filterType === 'all' || filterType === 'notes') && favoriteNotes.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 shadow-planner space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F9EAF0]">
                <BookOpen className="w-4 h-4 text-[#E8A598]" />
                <h3 className="font-sans-planner text-base font-bold text-[#75656D]">
                  Anotações Favoritas ({favoriteNotes.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {favoriteNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{ backgroundColor: note.color || '#FFF9F4' }}
                    className="p-3.5 rounded-2xl border border-[#D9A2B5]/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#63535B] truncate">{note.title}</h4>
                      <button
                        onClick={() => toggleNoteFavorite(note.id)}
                        className="p-1 text-[#D9A2B5] hover:text-[#B26E86]"
                        title="Remover dos favoritos"
                      >
                        <Heart className="w-4 h-4 fill-[#D9A2B5]" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#75656D] line-clamp-3 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
