/**
 * Minhas Anotações - Caderno Digital Feminino com Notas Rápidas e Auto-Save
 */
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Heart, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Tag, 
  Check, 
  StickyNote,
  Palette,
  Calendar
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { PlannerNote } from '../types/planner';
import { getTodayString } from '../services/storageService';

export const NotesView: React.FC = () => {
  const { 
    notes, 
    categories, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleNoteFavorite,
    openQuickAdd 
  } = usePlanner();

  const [searchWord, setSearchWord] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNote, setActiveNote] = useState<PlannerNote | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [isAutoSaved, setIsAutoSaved] = useState(false);

  // Inicializar com a primeira anotação se disponível
  useEffect(() => {
    if (!activeNote && notes.length > 0) {
      setActiveNote(notes[0]);
    }
  }, [notes, activeNote]);

  // Auto-save debounce no activeNote
  useEffect(() => {
    if (!activeNote) return;

    setIsAutoSaved(false);
    const timer = setTimeout(() => {
      updateNote(activeNote);
      setIsAutoSaved(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [activeNote, updateNote]);

  // Notas Rápidas separadas
  const quickNotes = notes.filter((n) => n.isQuickNote);

  // Filtragem
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchWord.toLowerCase()) || 
      note.content.toLowerCase().includes(searchWord.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || note.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateNewBlankNote = () => {
    const today = getTodayString();
    const newNoteData: Omit<PlannerNote, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Nova Anotação',
      content: '',
      color: '#F9EAF0',
      categoryId: categories[0]?.id || 'cat-pessoal',
      date: today,
      isFavorite: false,
      isQuickNote: false,
    };
    addNote(newNoteData);
  };

  const handleCreateQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;

    addNote({
      title: 'Nota Rápida',
      content: quickNoteText.trim(),
      color: '#FFF9F4',
      categoryId: 'cat-pessoal',
      date: getTodayString(),
      isFavorite: false,
      isQuickNote: true,
    });

    setQuickNoteText('');
  };

  const pastelColors = [
    { name: 'Rosa Blush', hex: '#F9EAF0' },
    { name: 'Lilás Suave', hex: '#EAE3F5' },
    { name: 'Creme Delicado', hex: '#FFF9F4' },
    { name: 'Menta Suave', hex: '#EAF5F0' },
    { name: 'Pêssego Aconchegante', hex: '#FAF0E6' },
    { name: 'Branco Puro', hex: '#FFFFFF' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Topo do Caderno Digital */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#FFF2F0] text-[#E8A598]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans-planner text-2xl font-bold text-[#75656D]">
              Caderno Digital
            </h2>
            <p className="text-[11px] text-[#A697A0]">
              Suas ideias, reflexões e anotações com visual delicado de papelaria
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNewBlankNote}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Página</span>
        </button>
      </div>

      {/* Seção de Notas Rápidas (Post-its) */}
      <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 shadow-planner space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-[#C5A059]" />
            <span className="font-sans-planner text-base font-bold text-[#75656D]">
              Notas Rápidas (Lembretes de Post-it)
            </span>
          </div>
          <span className="text-[11px] text-[#A697A0]">{quickNotes.length} nota(s) fixada(s)</span>
        </div>

        {/* Input rápido */}
        <form onSubmit={handleCreateQuickNote} className="flex gap-2">
          <input 
            type="text"
            placeholder="Escreva uma ideia rápida e pressione Enter (ex: comprar vela aromática)..."
            value={quickNoteText}
            onChange={(e) => setQuickNoteText(e.target.value)}
            className="flex-1 px-4 py-2 text-xs rounded-2xl border border-[#F4DCE5] focus:border-[#D9A2B5] outline-none text-[#75656D] bg-[#FFF9F4]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#F9EAF0] hover:bg-[#F4DCE5] text-[#B26E86] text-xs font-semibold rounded-2xl transition-colors shrink-0"
          >
            + Fixar
          </button>
        </form>

        {/* Grade de Post-its */}
        {quickNotes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {quickNotes.map((qn) => (
              <div 
                key={qn.id}
                style={{ backgroundColor: qn.color || '#FFF9F4' }}
                className="p-3.5 rounded-2xl border border-[#D9A2B5]/30 shadow-2xs relative group flex flex-col justify-between"
              >
                <p className="text-xs text-[#63535B] leading-relaxed break-words">{qn.content}</p>
                <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#A697A0]">
                  <span>{qn.date || 'Hoje'}</span>
                  <button
                    onClick={() => deleteNote(qn.id)}
                    className="text-rose-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Excluir nota rápida"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caderno Digital Dividido: Lista Lateral de Páginas + Área de Escrita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Painel Esquerdo: Lista de Páginas do Caderno (4 colunas) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#F4DCE5] p-4 shadow-planner flex flex-col">
          
          {/* Busca e Filtro */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF9F4] border border-[#F4DCE5]">
              <Search className="w-3.5 h-3.5 text-[#D9A2B5]" />
              <input 
                type="text"
                placeholder="Buscar palavras no caderno..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full bg-transparent text-xs text-[#75656D] outline-none placeholder-[#B5A8AF]"
              />
            </div>

            {/* Chips de Categorias */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-0.5 rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#D9A2B5] text-white font-semibold'
                    : 'bg-[#FFF9F4] text-[#75656D] border border-[#F4DCE5]'
                }`}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-0.5 rounded-full transition-all whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-[#D9A2B5] text-white font-semibold'
                      : 'bg-[#FFF9F4] text-[#75656D] border border-[#F4DCE5]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Páginas */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#A697A0]">
                Nenhuma anotação encontrada.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                const cat = categories.find((c) => c.id === note.categoryId);

                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNote(note)}
                    style={{ backgroundColor: isSelected ? '#FDF2F6' : note.color || '#FFF9F4' }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#B26E86] ring-1 ring-[#D9A2B5] shadow-xs'
                        : 'border-[#F4DCE5] hover:border-[#D9A2B5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#63535B] truncate">
                        {note.title || 'Sem título'}
                      </h4>
                      {note.isFavorite && (
                        <Heart className="w-3.5 h-3.5 fill-[#D9A2B5] text-[#D9A2B5] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-[#75656D] mt-1 line-clamp-2 leading-relaxed">
                      {note.content || 'Página em branco...'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px] text-[#A697A0]">
                      <span>{note.date || 'Hoje'}</span>
                      {cat && (
                        <span 
                          style={{ color: cat.color }}
                          className="font-semibold"
                        >
                          {cat.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Folha do Caderno para Edição (8 colunas) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#F4DCE5] shadow-planner overflow-hidden flex flex-col">
          {activeNote ? (
            <div 
              style={{ backgroundColor: activeNote.color || '#FFFFFF' }}
              className="flex-1 flex flex-col p-6 transition-colors"
            >
              {/* Barra de Ferramentas da Página */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D9A2B5]/30">
                <div className="flex items-center gap-2">
                  {/* Seletor de Categoria */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-[#D9A2B5]/40 text-xs text-[#75656D]">
                    <Tag className="w-3.5 h-3.5 text-[#B26E86]" />
                    <select
                      value={activeNote.categoryId}
                      onChange={(e) => setActiveNote({ ...activeNote, categoryId: e.target.value })}
                      className="bg-transparent outline-none text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Seletor de Cor do Papel */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/90 border border-[#D9A2B5]/40">
                    <Palette className="w-3.5 h-3.5 text-[#B26E86]" />
                    <div className="flex items-center gap-1">
                      {pastelColors.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setActiveNote({ ...activeNote, color: color.hex })}
                          style={{ backgroundColor: color.hex }}
                          className={`w-4 h-4 rounded-full border border-black/10 transition-transform ${
                            activeNote.color === color.hex ? 'ring-2 ring-[#75656D] scale-110' : 'hover:scale-105'
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Indicador de Salvamento Automático */}
                  <span className="flex items-center gap-1 text-[11px] text-[#8C7A83]">
                    {isAutoSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Salvo</span>
                      </>
                    ) : (
                      <span className="animate-pulse">Salvando...</span>
                    )}
                  </span>

                  {/* Favorito */}
                  <button
                    onClick={() => toggleNoteFavorite(activeNote.id)}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-[#D9A2B5] transition-colors"
                    title="Favoritar"
                  >
                    <Heart className={`w-4 h-4 ${activeNote.isFavorite ? 'fill-[#D9A2B5]' : ''}`} />
                  </button>

                  {/* Excluir Página */}
                  <button
                    onClick={() => {
                      deleteNote(activeNote.id);
                      setActiveNote(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-rose-50 text-rose-500 transition-colors"
                    title="Excluir esta página"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Título da Folha */}
              <input 
                type="text"
                placeholder="Título da anotação..."
                value={activeNote.title}
                onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                className="w-full font-sans-planner text-2xl font-bold text-[#63535B] bg-transparent outline-none pt-4 pb-2 border-b border-[#D9A2B5]/20 placeholder-[#B5A8AF]"
              />

              {/* Data da Anotação */}
              <div className="py-2 text-[11px] text-[#A697A0] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#B26E86]" />
                <span>Página criada em: {activeNote.date || getTodayString()}</span>
              </div>

              {/* Corpo da Folha com Textura Pautada */}
              <textarea 
                placeholder="Escreva seus pensamentos, receitas, leituras, metas ou o que o seu coração desejar..."
                value={activeNote.content}
                onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                className="w-full flex-1 bg-transparent outline-none text-xs sm:text-sm text-[#75656D] leading-relaxed resize-none pt-2 paper-lined min-h-[300px]"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#A697A0]">
              <BookOpen className="w-12 h-12 mb-3 text-[#D9A2B5]/50" />
              <p className="font-sans-planner text-lg font-bold text-[#75656D]">Nenhuma página aberta</p>
              <p className="text-xs mt-1">Selecione uma folha ao lado ou crie uma nova para começar a escrever.</p>
              <button
                onClick={handleCreateNewBlankNote}
                className="mt-4 px-4 py-2 bg-[#D9A2B5] text-white text-xs font-semibold rounded-2xl shadow-xs"
              >
                + Criar nova página
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
