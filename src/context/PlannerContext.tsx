
/**
 * Contexto principal do Meu Planner
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  NavigationTab,
  PlannerEvent,
  PlannerTask,
  PlannerNote,
  PlannerReminder,
  Category,
  UserProfile,
  FirebaseConnectionStatus,
  GlobalSearchResult
} from '../types/planner';
import {
  LocalStorageManager,
  syncDocToFirestore,
  deleteDocFromFirestore
} from '../services/storageService';
import {
  getFirebaseInstances,
  testFirestoreConnection,
  onAuthStateChanged,
  FirebaseUser,
  saveFirebaseConfig,
  clearFirebaseConfig,
  getStoredFirebaseConfig,
  FirebaseConfigParams
} from '../services/firebaseConfig';
import { sound } from '../services/sound';
import { notificationService } from '../services/notificationService';

export interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface PlannerContextType {
  // Navegação
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Dados
  events: PlannerEvent[];
  tasks: PlannerTask[];
  notes: PlannerNote[];
  reminders: PlannerReminder[];
  categories: Category[];
  userProfile: UserProfile;

  // Modais globais
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddDefaultType: 'event' | 'task' | 'note' | 'reminder';
  openQuickAdd: (type?: 'event' | 'task' | 'note' | 'reminder') => void;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: GlobalSearchResult[];

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;

  // Status Firebase & Auth
  currentUser: FirebaseUser | null;
  firebaseStatus: FirebaseConnectionStatus;
  saveFirebaseCredentials: (params: FirebaseConfigParams) => Promise<boolean>;
  disconnectFirebase: () => void;
  testCloudConnection: () => Promise<{ success: boolean; message: string }>;

  // Métodos CRUD
  addEvent: (event: Omit<PlannerEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (event: PlannerEvent) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  toggleEventCompleted: (id: string) => void;
  toggleEventFavorite: (id: string) => void;

  addTask: (task: Omit<PlannerTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: PlannerTask) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  toggleTaskFavorite: (id: string) => void;

  addNote: (note: Omit<PlannerNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (note: PlannerNote) => void;
  deleteNote: (id: string) => void;
  toggleNoteFavorite: (id: string) => void;

  addReminder: (reminder: Omit<PlannerReminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReminder: (reminder: PlannerReminder) => void;
  deleteReminder: (id: string) => void;
  updateReminderStatus: (id: string, status: PlannerReminder['status']) => void;
  toggleReminderFavorite: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [events, setEvents] = useState<PlannerEvent[]>(() => LocalStorageManager.getEvents());
  const [tasks, setTasks] = useState<PlannerTask[]>(() => LocalStorageManager.getTasks());
  const [notes, setNotes] = useState<PlannerNote[]>(() => LocalStorageManager.getNotes());
  const [reminders, setReminders] = useState<PlannerReminder[]>(() => LocalStorageManager.getReminders());
  const [categories, setCategories] = useState<Category[]>(() => LocalStorageManager.getCategories());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => LocalStorageManager.getProfile());

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<'event' | 'task' | 'note' | 'reminder'>('event');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>(() => {
    const config = getStoredFirebaseConfig();

    return {
      isConfigured: !!(config && config.apiKey && config.projectId),
      isConnected: false,
      lastSyncAt: null,
      error: null,
      projectId: config?.projectId,
      isOfflineMode: !(config && config.apiKey && config.projectId),
    };
  });

  const showToast = useCallback((
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

 
  // Monitorar estado de autenticação Firebase
  useEffect(() => {
    const { auth } = getFirebaseInstances();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        const displayName = user.displayName?.trim() || '';
        console.log('NOME RECEBIDO DO FIREBASE:', user.displayName);
console.log('EMAIL DO FIREBASE:', user.email);

        setUserProfile((prev) => {
          const next: UserProfile = {
            ...prev,
            displayName,
            email: user.email || '',
            ...(user.photoURL ? { avatarUrl: user.photoURL } : {}),
          };

          LocalStorageManager.saveProfile(next);
          return next;
        });

        setFirebaseStatus((prev) => ({
          ...prev,
          isConnected: true,
          lastSyncAt: new Date(),
          error: null,
        }));
      } else {
        setUserProfile((prev) => {
          const next: UserProfile = {
            ...prev,
            displayName: '',
          };

          LocalStorageManager.saveProfile(next);
          return next;
        });
      }
    });

    return () => unsubscribe();
  }, [firebaseStatus.isConfigured]);


  // Verificar conexão inicial
  const checkConnection = useCallback(async () => {
    const res = await testFirestoreConnection();

    setFirebaseStatus((prev) => ({
      ...prev,
      isConnected: res.success,
      lastSyncAt: res.success ? new Date() : prev.lastSyncAt,
      error: res.success ? null : res.message,
    }));

    return res;
  }, []);

  useEffect(() => {
    if (firebaseStatus.isConfigured) {
      checkConnection();
    }
  }, [firebaseStatus.isConfigured, checkConnection]);

  // Persistência local imediata e sincronização automática
  const saveEventsState = useCallback((newEvents: PlannerEvent[]) => {
    setEvents(newEvents);
    LocalStorageManager.saveEvents(newEvents);
  }, []);

  const saveTasksState = useCallback((newTasks: PlannerTask[]) => {
    setTasks(newTasks);
    LocalStorageManager.saveTasks(newTasks);
  }, []);

  const saveNotesState = useCallback((newNotes: PlannerNote[]) => {
    setNotes(newNotes);
    LocalStorageManager.saveNotes(newNotes);
  }, []);

  const saveRemindersState = useCallback((newReminders: PlannerReminder[]) => {
    setReminders(newReminders);
    LocalStorageManager.saveReminders(newReminders);
  }, []);

  const saveCategoriesState = useCallback((newCats: Category[]) => {
    setCategories(newCats);
    LocalStorageManager.saveCategories(newCats);
  }, []);

  // Monitor de Lembretes Ativos em segundo plano (cada 25 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setReminders((prevReminders) => {
        let changed = false;

        const updated = prevReminders.map((rem) => {
          if (rem.status === 'pending' && rem.date === today && rem.time <= currentTime) {
            changed = true;

            notificationService.sendNotification(`Lembrete: ${rem.title}`, {
              body: rem.description || 'Horário do seu lembrete no Meu Planner!',
            });

            showToast(`Lembrete: ${rem.title}`, 'info');

            return {
              ...rem,
              status: 'sent' as const,
              updatedAt: new Date().toISOString()
            };
          }

          return rem;
        });

        if (changed) {
          LocalStorageManager.saveReminders(updated);
          return updated;
        }

        return prevReminders;
      });
    }, 25000);

    return () => clearInterval(interval);
  }, [showToast]);

  // --- CRUD Compromissos ---
  const addEvent = useCallback((eventData: Omit<PlannerEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();

    const newEvent: PlannerEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    saveEventsState([newEvent, ...events]);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'events', newEvent);
    }

    showToast('Compromisso adicionado com carinho! ✨', 'success');

    if (userProfile.soundEnabled) sound.playSoftClick();
  }, [events, currentUser, saveEventsState, showToast, userProfile.soundEnabled]);

  const updateEvent = useCallback((event: PlannerEvent) => {
    const updated = { ...event, updatedAt: new Date().toISOString() };
    const nextList = events.map((e) => (e.id === event.id ? updated : e));

    saveEventsState(nextList);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'events', updated);
    }

    showToast('Compromisso atualizado!', 'success');
  }, [events, currentUser, saveEventsState, showToast]);

  const deleteEvent = useCallback((id: string) => {
    const nextList = events.filter((e) => e.id !== id);

    saveEventsState(nextList);

    if (currentUser) {
      deleteDocFromFirestore(currentUser.uid, 'events', id);
    }

    showToast('Compromisso removido.', 'info');
  }, [events, currentUser, saveEventsState, showToast]);

  const duplicateEvent = useCallback((id: string) => {
    const original = events.find((e) => e.id === id);
    if (!original) return;

    const now = new Date().toISOString();

    const duplicated: PlannerEvent = {
      ...original,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${original.title} (Cópia)`,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    saveEventsState([duplicated, ...events]);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'events', duplicated);
    }

    showToast('Compromisso duplicado com sucesso!', 'success');
  }, [events, currentUser, saveEventsState, showToast]);

  const toggleEventCompleted = useCallback((id: string) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;

    const updated = {
      ...target,
      completed: nextCompleted,
      updatedAt: new Date().toISOString()
    };

    saveEventsState(events.map((e) => (e.id === id ? updated : e)));

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'events', updated);
    }

    if (nextCompleted) {
      if (userProfile.soundEnabled) sound.playCompletion();
      showToast('Compromisso concluído com sucesso! 🌸', 'success');
    }
  }, [events, currentUser, saveEventsState, showToast, userProfile.soundEnabled]);

  const toggleEventFavorite = useCallback((id: string) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    const nextFav = !target.isFavorite;

    const updated = {
      ...target,
      isFavorite: nextFav,
      updatedAt: new Date().toISOString()
    };

    saveEventsState(events.map((e) => (e.id === id ? updated : e)));

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'events', updated);
    }

    showToast(nextFav ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', 'info');
  }, [events, currentUser, saveEventsState, showToast]);

  // --- CRUD Tarefas ---
  const addTask = useCallback((taskData: Omit<PlannerTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();

    const newTask: PlannerTask = {
      ...taskData,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    saveTasksState([newTask, ...tasks]);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'tasks', newTask);
    }

    showToast('Tarefa criada com sucesso! 📝', 'success');

    if (userProfile.soundEnabled) sound.playSoftClick();
  }, [tasks, currentUser, saveTasksState, showToast, userProfile.soundEnabled]);

  const updateTask = useCallback((task: PlannerTask) => {
    const updated = { ...task, updatedAt: new Date().toISOString() };
    const nextList = tasks.map((t) => (t.id === task.id ? updated : t));

    saveTasksState(nextList);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'tasks', updated);
    }

    showToast('Tarefa atualizada!', 'success');
  }, [tasks, currentUser, saveTasksState, showToast]);

  const deleteTask = useCallback((id: string) => {
    const nextList = tasks.filter((t) => t.id !== id);

    saveTasksState(nextList);

    if (currentUser) {
      deleteDocFromFirestore(currentUser.uid, 'tasks', id);
    }

    showToast('Tarefa excluída.', 'info');
  }, [tasks, currentUser, saveTasksState, showToast]);

  const triggerDelicateConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D9A2B5', '#F4DCE5', '#C5A059', '#EAE3F5', '#FFF9F4'],
        scalar: 0.9,
      });
    } catch {
      // Ignorar se confetti falhar
    }
  };

  const toggleTaskCompleted = useCallback((id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    const now = new Date().toISOString();

    const updated: PlannerTask = {
      ...target,
      completed: nextCompleted,
      completedAt: nextCompleted ? now : undefined,
      updatedAt: now,
    };

    saveTasksState(tasks.map((t) => (t.id === id ? updated : t)));

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'tasks', updated);
    }

    if (nextCompleted) {
      if (userProfile.soundEnabled) sound.playCompletion();
      triggerDelicateConfetti();
      showToast('Parabéns! Mais uma tarefa concluída com delicadeza! ✨', 'success');
    }
  }, [tasks, currentUser, saveTasksState, showToast, userProfile.soundEnabled]);

  const toggleTaskFavorite = useCallback((id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const nextFav = !target.isFavorite;

    const updated = {
      ...target,
      isFavorite: nextFav,
      updatedAt: new Date().toISOString()
    };

    saveTasksState(tasks.map((t) => (t.id === id ? updated : t)));

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'tasks', updated);
    }

    showToast(nextFav ? 'Tarefa marcada como favorita!' : 'Tarefa desmarcada dos favoritos.', 'info');
  }, [tasks, currentUser, saveTasksState, showToast]);

  // --- CRUD Anotações ---
  const addNote = useCallback((noteData: Omit<PlannerNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();

    const newNote: PlannerNote = {
      ...noteData,
      id: `not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    saveNotesState([newNote, ...notes]);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'notes', newNote);
    }

    showToast('Anotação guardada no seu caderno! 📖', 'success');

    if (userProfile.soundEnabled) sound.playSoftClick();
  }, [notes, currentUser, saveNotesState, showToast, userProfile.soundEnabled]);

  const updateNote = useCallback((note: PlannerNote) => {
    const updated = { ...note, updatedAt: new Date().toISOString() };
    const nextList = notes.map((n) => (n.id === note.id ? updated : n));

    saveNotesState(nextList);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'notes', updated);
    }
  }, [notes, currentUser, saveNotesState]);

  const deleteNote = useCallback((id: string) => {
    const nextList = notes.filter((n) => n.id !== id);

    saveNotesState(nextList);

    if (currentUser) {
      deleteDocFromFirestore(currentUser.uid, 'notes', id);
    }

    showToast('Anotação removida.', 'info');
  }, [notes, currentUser, saveNotesState, showToast]);

  const toggleNoteFavorite = useCallback((id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    const nextFav = !target.isFavorite;

    const updated = {
      ...target,
      isFavorite: nextFav,
      updatedAt: new Date().toISOString()
    };

    saveNotesState(notes.map((n) => (n.id === id ? updated : n)));

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'notes', updated);
    }

    showToast(nextFav ? 'Anotação favoritada com carinho!' : 'Removida dos favoritos.', 'info');
  }, [notes, currentUser, saveNotesState, showToast]);

  // --- CRUD Lembretes ---
  const addReminder = useCallback((remData: Omit<PlannerReminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();

    const newRem: PlannerReminder = {
      ...remData,
      id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    saveRemindersState([newRem, ...reminders]);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'reminders', newRem);
    }

    showToast('Lembrete agendado com sucesso! ⏰', 'success');

    if (userProfile.soundEnabled) sound.playSoftClick();
  }, [reminders, currentUser, saveRemindersState, showToast, userProfile.soundEnabled]);

  const updateReminder = useCallback((reminder: PlannerReminder) => {
    const updated = { ...reminder, updatedAt: new Date().toISOString() };
    const nextList = reminders.map((r) => (r.id === reminder.id ? updated : r));

    saveRemindersState(nextList);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'reminders', updated);
    }

    showToast('Lembrete atualizado!', 'success');
  }, [reminders, currentUser, saveRemindersState, showToast]);

  const deleteReminder = useCallback((id: string) => {
    const nextList = reminders.filter((r) => r.id !== id);

    saveRemindersState(nextList);

    if (currentUser) {
      deleteDocFromFirestore(currentUser.uid, 'reminders', id);
    }

    showToast('Lembrete excluído.', 'info');
  }, [reminders, currentUser, saveRemindersState, showToast]);

  const updateReminderStatus = useCallback((id: string, status: PlannerReminder['status']) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;

    const updated: PlannerReminder = {
      ...target,
      status,
      updatedAt: new Date().toISOString()
    };

    saveRemindersState(reminders.map((r) => (r.id === id ? updated : r)));

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'reminders', updated);
    }

    if (status === 'completed') {
      showToast('Lembrete marcado como concluído!', 'success');
    }
  }, [reminders, currentUser, saveRemindersState, showToast]);

  const toggleReminderFavorite = useCallback((id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;

    const nextFav = !target.isFavorite;

    const updated = {
      ...target,
      isFavorite: nextFav,
      updatedAt: new Date().toISOString()
    };

    saveRemindersState(reminders.map((r) => (r.id === id ? updated : r)));

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'reminders', updated);
    }

    showToast(nextFav ? 'Lembrete favoritado!' : 'Removido dos favoritos.', 'info');
  }, [reminders, currentUser, saveRemindersState, showToast]);

  // --- CRUD Categorias ---
  const addCategory = useCallback((catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      isCustom: true,
    };

    saveCategoriesState([...categories, newCat]);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'categories', newCat);
    }

    showToast(`Categoria "${newCat.name}" criada com sucesso!`, 'success');
  }, [categories, currentUser, saveCategoriesState, showToast]);

  const updateCategory = useCallback((cat: Category) => {
    const nextList = categories.map((c) => (c.id === cat.id ? cat : c));

    saveCategoriesState(nextList);

    if (currentUser) {
      syncDocToFirestore(currentUser.uid, 'categories', cat);
    }

    showToast('Categoria atualizada!', 'success');
  }, [categories, currentUser, saveCategoriesState, showToast]);

  const deleteCategory = useCallback((id: string) => {
    const nextList = categories.filter((c) => c.id !== id);

    saveCategoriesState(nextList);

    if (currentUser) {
      deleteDocFromFirestore(currentUser.uid, 'categories', id);
    }

    showToast('Categoria removida.', 'info');
  }, [categories, currentUser, saveCategoriesState, showToast]);

  // --- Perfil & Configurações ---
  const updateUserProfile = useCallback((profileUpdate: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...profileUpdate };
      LocalStorageManager.saveProfile(next);
      return next;
    });

    showToast('Perfil atualizado com sucesso!', 'success');
  }, [showToast]);

  const saveFirebaseCredentials = useCallback(async (params: FirebaseConfigParams): Promise<boolean> => {
    saveFirebaseConfig(params);

    setFirebaseStatus({
      isConfigured: true,
      isConnected: false,
      lastSyncAt: null,
      projectId: params.projectId,
      isOfflineMode: false,
    });

    const res = await checkConnection();

    if (res.success) {
      showToast('Firebase conectado com sucesso à nuvem! ☁️', 'success');
      return true;
    } else {
      showToast(`Atenção: ${res.message}`, 'warning');
      return false;
    }
  }, [checkConnection, showToast]);

  const disconnectFirebase = useCallback(() => {
    clearFirebaseConfig();

    setFirebaseStatus({
      isConfigured: false,
      isConnected: false,
      lastSyncAt: null,
      error: null,
      isOfflineMode: true,
    });

    showToast('Desconectado da nuvem. Operando em modo offline com salvamento seguro.', 'info');
  }, [showToast]);

  const openQuickAdd = useCallback((
    type: 'event' | 'task' | 'note' | 'reminder' = 'event'
  ) => {
    setQuickAddDefaultType(type);
    setIsQuickAddOpen(true);
  }, []);

  // --- Pesquisa Global Unificada ---
  const searchResults = useMemo<GlobalSearchResult[]>(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();
    const results: GlobalSearchResult[] = [];

    // Compromissos
    events.forEach((evt) => {
      if (
        evt.title.toLowerCase().includes(q) ||
        (evt.description && evt.description.toLowerCase().includes(q)) ||
        (evt.location && evt.location.toLowerCase().includes(q))
      ) {
        const cat = categories.find((c) => c.id === evt.categoryId);

        results.push({
          id: evt.id,
          type: 'event',
          title: evt.title,
          subtitle: `${evt.date} às ${evt.startTime}${evt.location ? ` • ${evt.location}` : ''}`,
          date: evt.date,
          category: cat,
          item: evt,
        });
      }
    });

    // Tarefas
    tasks.forEach((tsk) => {
      if (
        tsk.name.toLowerCase().includes(q) ||
        (tsk.description && tsk.description.toLowerCase().includes(q))
      ) {
        const cat = categories.find((c) => c.id === tsk.categoryId);

        results.push({
          id: tsk.id,
          type: 'task',
          title: tsk.name,
          subtitle: `Prioridade: ${tsk.priority === 'high' ? 'Alta' : tsk.priority === 'medium' ? 'Média' : 'Baixa'}${tsk.dueDate ? ` • Prazo: ${tsk.dueDate}` : ''}`,
          date: tsk.dueDate,
          category: cat,
          item: tsk,
        });
      }
    });

    // Anotações
    notes.forEach((not) => {
      if (
        not.title.toLowerCase().includes(q) ||
        not.content.toLowerCase().includes(q)
      ) {
        const cat = categories.find((c) => c.id === not.categoryId);

        results.push({
          id: not.id,
          type: 'note',
          title: not.title,
          subtitle: not.content.slice(0, 70) + (not.content.length > 70 ? '...' : ''),
          date: not.date,
          category: cat,
          item: not,
        });
      }
    });

    // Lembretes
    reminders.forEach((rem) => {
      if (
        rem.title.toLowerCase().includes(q) ||
        (rem.description && rem.description.toLowerCase().includes(q))
      ) {
        results.push({
          id: rem.id,
          type: 'reminder',
          title: rem.title,
          subtitle: `${rem.date} às ${rem.time} • Status: ${rem.status === 'completed' ? 'Concluído' : rem.status === 'sent' ? 'Enviado' : 'Pendente'}`,
          date: rem.date,
          item: rem,
        });
      }
    });

    return results;
  }, [searchQuery, events, tasks, notes, reminders, categories]);

  const value = {
    currentTab,
    setCurrentTab,
    selectedDate,
    setSelectedDate,
    events,
    tasks,
    notes,
    reminders,
    categories,
    userProfile,
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddDefaultType,
    openQuickAdd,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    isAuthModalOpen,
    setIsAuthModalOpen,
    toasts,
    showToast,
    dismissToast,
    currentUser,
    firebaseStatus,
    saveFirebaseCredentials,
    disconnectFirebase,
    testCloudConnection: checkConnection,
    addEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    toggleEventCompleted,
    toggleEventFavorite,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    toggleTaskFavorite,
    addNote,
    updateNote,
    deleteNote,
    toggleNoteFavorite,
    addReminder,
    updateReminder,
    deleteReminder,
    updateReminderStatus,
    toggleReminderFavorite,
    addCategory,
    updateCategory,
    deleteCategory,
    updateUserProfile,
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);

  if (!context) {
    throw new Error('usePlanner deve ser usado dentro de um PlannerProvider');
  }

  return context;
};
