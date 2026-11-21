
/**
 * Contexto principal do Meu Planner
 * Sincronização individual por usuário com Firebase Firestore.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

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
  GlobalSearchResult,
} from '../types/planner';

import {
  LocalStorageManager,
  syncDocToFirestore,
  deleteDocFromFirestore,
  subscribeToFirestore,
  setStorageUser,
  migrateLegacyStorageToUser,
} from '../services/storageService';

import {
  getFirebaseInstances,
  testFirestoreConnection,
  onAuthStateChanged,
  FirebaseUser,
  saveFirebaseConfig,
  clearFirebaseConfig,
  getStoredFirebaseConfig,
  FirebaseConfigParams,
} from '../services/firebaseConfig';

import { sound } from '../services/sound';
import { notificationService } from '../services/notificationService';

export interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface PlannerContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  events: PlannerEvent[];
  tasks: PlannerTask[];
  notes: PlannerNote[];
  reminders: PlannerReminder[];
  categories: Category[];
  userProfile: UserProfile;

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

  toasts: ToastInfo[];
  showToast: (
    message: string,
    type?: 'success' | 'info' | 'warning' | 'error'
  ) => void;
  dismissToast: (id: string) => void;

  currentUser: FirebaseUser | null;
  firebaseStatus: FirebaseConnectionStatus;
  saveFirebaseCredentials: (params: FirebaseConfigParams) => Promise<boolean>;
  disconnectFirebase: () => void;
  testCloudConnection: () => Promise<{ success: boolean; message: string }>;

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

// UID da conta principal de e-mail e senha.
// Somente essa conta recebe a migração dos dados antigos do navegador.
const PRIMARY_EMAIL_UID = 'ygv4wvsazLOG7MzaO7V27xSsa1A2';

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });

  const [events, setEvents] = useState<PlannerEvent[]>(() =>
    LocalStorageManager.getEvents()
  );

  const [tasks, setTasks] = useState<PlannerTask[]>(() =>
    LocalStorageManager.getTasks()
  );

  const [notes, setNotes] = useState<PlannerNote[]>(() =>
    LocalStorageManager.getNotes()
  );

  const [reminders, setReminders] = useState<PlannerReminder[]>(() =>
    LocalStorageManager.getReminders()
  );

  const [categories, setCategories] = useState<Category[]>(() =>
    LocalStorageManager.getCategories()
  );

  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    LocalStorageManager.getProfile()
  );

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultType, setQuickAddDefaultType] = useState<
    'event' | 'task' | 'note' | 'reminder'
  >('event');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const [firebaseStatus, setFirebaseStatus] =
    useState<FirebaseConnectionStatus>(() => {
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

  // --------------------------------------------------
  // TOASTS
  // --------------------------------------------------

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'info' | 'warning' | 'error' = 'info'
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // --------------------------------------------------
  // PERSISTÊNCIA LOCAL
  // --------------------------------------------------

  const saveEventsState = useCallback((items: PlannerEvent[]) => {
    setEvents(items);
    LocalStorageManager.saveEvents(items);
  }, []);

  const saveTasksState = useCallback((items: PlannerTask[]) => {
    setTasks(items);
    LocalStorageManager.saveTasks(items);
  }, []);

  const saveNotesState = useCallback((items: PlannerNote[]) => {
    setNotes(items);
    LocalStorageManager.saveNotes(items);
  }, []);

  const saveRemindersState = useCallback((items: PlannerReminder[]) => {
    setReminders(items);
    LocalStorageManager.saveReminders(items);
  }, []);

  const saveCategoriesState = useCallback((items: Category[]) => {
    setCategories(items);
    LocalStorageManager.saveCategories(items);
  }, []);

  // --------------------------------------------------
  // AUTENTICAÇÃO E SINCRONIZAÇÃO FIRESTORE
  // --------------------------------------------------

  useEffect(() => {
    const { auth } = getFirebaseInstances();

    if (!auth) return;

    let subscriptions: (() => void)[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Encerrar as inscrições da conta anterior.
      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions = [];

      setCurrentUser(user);

      if (!user) {
        // Voltar ao espaço anônimo ao sair da conta.
        setStorageUser(null);

        setEvents(LocalStorageManager.getEvents());
        setTasks(LocalStorageManager.getTasks());
        setNotes(LocalStorageManager.getNotes());
        setReminders(LocalStorageManager.getReminders());
        setCategories(LocalStorageManager.getCategories());

        setUserProfile({
          ...LocalStorageManager.getProfile(),
          displayName: '',
          email: '',
          avatarUrl: '',
        });

        setFirebaseStatus((prev) => ({
          ...prev,
          isConnected: false,
        }));

        return;
      }

      // A conta principal recebe os dados antigos do navegador.
      // A conta Google não recebe essa migração.
      if (user.uid === PRIMARY_EMAIL_UID) {
        migrateLegacyStorageToUser(user.uid);
      }

      // Ativar o armazenamento individual antes de carregar os dados.
      setStorageUser(user.uid);

      // Carregar os dados locais pertencentes a esta conta.
      const localEvents = LocalStorageManager.getEvents();
      const localTasks = LocalStorageManager.getTasks();
      const localNotes = LocalStorageManager.getNotes();
      const localReminders = LocalStorageManager.getReminders();
      const localCategories = LocalStorageManager.getCategories();

      setEvents(localEvents);
      setTasks(localTasks);
      setNotes(localNotes);
      setReminders(localReminders);
      setCategories(localCategories);

      // Atualizar perfil com os dados da autenticação.
      const profile = {
        ...LocalStorageManager.getProfile(),
        displayName: user.displayName?.trim() || '',
        email: user.email || '',
        avatarUrl: user.photoURL || '',
      };

      setUserProfile(profile);
      LocalStorageManager.saveProfile(profile);

      setFirebaseStatus((prev) => ({
        ...prev,
        isConnected: true,
        lastSyncAt: new Date(),
        error: null,
      }));

      console.log('USUÁRIO AUTENTICADO:', user.uid);
      console.log('EMAIL:', user.email);

      // Sincronização individual de cada coleção.
      // Se a nuvem já tiver dados, eles serão carregados.
      // Se estiver vazia, os dados locais serão enviados uma vez.
      const listenToCollection = <T extends { id: string }>(
        collectionName: 'events' | 'tasks' | 'notes' | 'reminders' | 'categories',
        localItems: T[],
        applyItems: (items: T[]) => void,
        saveItems: (items: T[]) => void
      ) => {
        let firstSnapshot = true;

        const unsubscribe = subscribeToFirestore<T>(
          user.uid,
          collectionName,
          (cloudItems) => {
            if (firstSnapshot) {
              firstSnapshot = false;

              if (cloudItems.length > 0) {
                // A nuvem já possui registros: ela é a fonte principal.
                applyItems(cloudItems);
                saveItems(cloudItems);
              } else {
                // A coleção está vazia: enviar os dados locais dessa conta.
                localItems.forEach((item) => {
                  void syncDocToFirestore(user.uid, collectionName, item);
                });
              }

              setFirebaseStatus((prev) => ({
                ...prev,
                isConnected: true,
                lastSyncAt: new Date(),
                error: null,
              }));

              return;
            }

            // Atualizações seguintes, inclusive exclusões feitas na nuvem.
            applyItems(cloudItems);
            saveItems(cloudItems);

            setFirebaseStatus((prev) => ({
              ...prev,
              isConnected: true,
              lastSyncAt: new Date(),
              error: null,
            }));
          }
        );

        if (unsubscribe) {
  subscriptions.push(unsubscribe);
}
      };

      listenToCollection<PlannerEvent>(
        'events',
        localEvents,
        setEvents,
        LocalStorageManager.saveEvents
      );

      listenToCollection<PlannerTask>(
        'tasks',
        localTasks,
        setTasks,
        LocalStorageManager.saveTasks
      );

      listenToCollection<PlannerNote>(
        'notes',
        localNotes,
        setNotes,
        LocalStorageManager.saveNotes
      );

      listenToCollection<PlannerReminder>(
        'reminders',
        localReminders,
        setReminders,
        LocalStorageManager.saveReminders
      );

      listenToCollection<Category>(
        'categories',
        localCategories,
        setCategories,
        LocalStorageManager.saveCategories
      );
    });

    return () => {
      unsubscribeAuth();

      subscriptions.forEach((unsubscribe) => unsubscribe());
      subscriptions = [];
    };
  }, [firebaseStatus.isConfigured]);

  // --------------------------------------------------
  // CONEXÃO FIREBASE
  // --------------------------------------------------

  const checkConnection = useCallback(async () => {
    const result = await testFirestoreConnection();

    setFirebaseStatus((prev) => ({
      ...prev,
      isConnected: result.success,
      lastSyncAt: result.success ? new Date() : prev.lastSyncAt,
      error: result.success ? null : result.message,
    }));

    return result;
  }, []);

  useEffect(() => {
    if (firebaseStatus.isConfigured) {
      void checkConnection();
    }
  }, [firebaseStatus.isConfigured, checkConnection]);

  // --------------------------------------------------
  // COMPROMISSOS
  // --------------------------------------------------

  const addEvent = useCallback(
    (eventData: Omit<PlannerEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();

      const newEvent: PlannerEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };

      saveEventsState([newEvent, ...events]);

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'events', newEvent);
      }

      showToast('Compromisso adicionado com carinho! ✨', 'success');

      if (userProfile.soundEnabled) sound.playSoftClick();
    },
    [events, currentUser, saveEventsState, showToast, userProfile.soundEnabled]
  );

  const updateEvent = useCallback(
    (event: PlannerEvent) => {
      const updated = {
        ...event,
        updatedAt: new Date().toISOString(),
      };

      saveEventsState(
        events.map((item) => (item.id === event.id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'events', updated);
      }

      showToast('Compromisso atualizado!', 'success');
    },
    [events, currentUser, saveEventsState, showToast]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      saveEventsState(events.filter((item) => item.id !== id));

      if (currentUser) {
        void deleteDocFromFirestore(currentUser.uid, 'events', id);
      }

      showToast('Compromisso removido.', 'info');
    },
    [events, currentUser, saveEventsState, showToast]
  );

  const duplicateEvent = useCallback(
    (id: string) => {
      const original = events.find((item) => item.id === id);
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
        void syncDocToFirestore(currentUser.uid, 'events', duplicated);
      }

      showToast('Compromisso duplicado com sucesso!', 'success');
    },
    [events, currentUser, saveEventsState, showToast]
  );

  const toggleEventCompleted = useCallback(
    (id: string) => {
      const target = events.find((item) => item.id === id);
      if (!target) return;

      const updated = {
        ...target,
        completed: !target.completed,
        updatedAt: new Date().toISOString(),
      };

      saveEventsState(
        events.map((item) => (item.id === id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'events', updated);
      }

      if (updated.completed) {
        if (userProfile.soundEnabled) sound.playCompletion();
        showToast('Compromisso concluído com sucesso! 🌸', 'success');
      }
    },
    [events, currentUser, saveEventsState, showToast, userProfile.soundEnabled]
  );

  const toggleEventFavorite = useCallback(
    (id: string) => {
      const target = events.find((item) => item.id === id);
      if (!target) return;

      const updated = {
        ...target,
        isFavorite: !target.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      saveEventsState(
        events.map((item) => (item.id === id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'events', updated);
      }

      showToast(
        updated.isFavorite
          ? 'Adicionado aos favoritos!'
          : 'Removido dos favoritos.',
        'info'
      );
    },
    [events, currentUser, saveEventsState, showToast]
  );

  // --------------------------------------------------
  // TAREFAS
  // --------------------------------------------------

  const addTask = useCallback(
    (taskData: Omit<PlannerTask, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();

      const newTask: PlannerTask = {
        ...taskData,
        id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };

      saveTasksState([newTask, ...tasks]);

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'tasks', newTask);
      }

      showToast('Tarefa criada com sucesso! 📝', 'success');

      if (userProfile.soundEnabled) sound.playSoftClick();
    },
    [tasks, currentUser, saveTasksState, showToast, userProfile.soundEnabled]
  );

  const updateTask = useCallback(
    (task: PlannerTask) => {
      const updated = {
        ...task,
        updatedAt: new Date().toISOString(),
      };

      saveTasksState(
        tasks.map((item) => (item.id === task.id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'tasks', updated);
      }

      showToast('Tarefa atualizada!', 'success');
    },
    [tasks, currentUser, saveTasksState, showToast]
  );

  const deleteTask = useCallback(
    (id: string) => {
      saveTasksState(tasks.filter((item) => item.id !== id));

      if (currentUser) {
        void deleteDocFromFirestore(currentUser.uid, 'tasks', id);
      }

      showToast('Tarefa excluída.', 'info');
    },
    [tasks, currentUser, saveTasksState, showToast]
  );

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
      // Ignorar se o efeito falhar.
    }
  };

  const toggleTaskCompleted = useCallback(
    (id: string) => {
      const target = tasks.find((item) => item.id === id);
      if (!target) return;

      const nextCompleted = !target.completed;
      const now = new Date().toISOString();

      const updated: PlannerTask = {
        ...target,
        completed: nextCompleted,
        completedAt: nextCompleted ? now : undefined,
        updatedAt: now,
      };

      saveTasksState(
        tasks.map((item) => (item.id === id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'tasks', updated);
      }

      if (nextCompleted) {
        if (userProfile.soundEnabled) sound.playCompletion();

        triggerDelicateConfetti();

        showToast(
          'Parabéns! Mais uma tarefa concluída com delicadeza! ✨',
          'success'
        );
      }
    },
    [tasks, currentUser, saveTasksState, showToast, userProfile.soundEnabled]
  );

  const toggleTaskFavorite = useCallback(
    (id: string) => {
      const target = tasks.find((item) => item.id === id);
      if (!target) return;

      const updated = {
        ...target,
        isFavorite: !target.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      saveTasksState(
        tasks.map((item) => (item.id === id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'tasks', updated);
      }

      showToast(
        updated.isFavorite
          ? 'Tarefa marcada como favorita!'
          : 'Tarefa desmarcada dos favoritos.',
        'info'
      );
    },
    [tasks, currentUser, saveTasksState, showToast]
  );

  // --------------------------------------------------
  // ANOTAÇÕES
  // --------------------------------------------------

  const addNote = useCallback(
    (noteData: Omit<PlannerNote, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();

      const newNote: PlannerNote = {
        ...noteData,
        id: `not-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };

      saveNotesState([newNote, ...notes]);

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'notes', newNote);
      }

      showToast('Anotação guardada no seu caderno! 📖', 'success');

      if (userProfile.soundEnabled) sound.playSoftClick();
    },
    [notes, currentUser, saveNotesState, showToast, userProfile.soundEnabled]
  );

  const updateNote = useCallback(
    (note: PlannerNote) => {
      const updated = {
        ...note,
        updatedAt: new Date().toISOString(),
      };

      saveNotesState(
        notes.map((item) => (item.id === note.id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'notes', updated);
      }
    },
    [notes, currentUser, saveNotesState]
  );

  const deleteNote = useCallback(
    (id: string) => {
      saveNotesState(notes.filter((item) => item.id !== id));

      if (currentUser) {
        void deleteDocFromFirestore(currentUser.uid, 'notes', id);
      }

      showToast('Anotação removida.', 'info');
    },
    [notes, currentUser, saveNotesState, showToast]
  );

  const toggleNoteFavorite = useCallback(
    (id: string) => {
      const target = notes.find((item) => item.id === id);
      if (!target) return;

      const updated = {
        ...target,
        isFavorite: !target.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      saveNotesState(
        notes.map((item) => (item.id === id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'notes', updated);
      }

      showToast(
        updated.isFavorite
          ? 'Anotação favoritada com carinho!'
          : 'Removida dos favoritos.',
        'info'
      );
    },
    [notes, currentUser, saveNotesState, showToast]
  );

  // --------------------------------------------------
  // LEMBRETES
  // --------------------------------------------------

  const addReminder = useCallback(
    (remData: Omit<PlannerReminder, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();

      const newReminder: PlannerReminder = {
        ...remData,
        id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };

      saveRemindersState([newReminder, ...reminders]);

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'reminders', newReminder);
      }

      showToast('Lembrete agendado com sucesso! ⏰', 'success');

      if (userProfile.soundEnabled) sound.playSoftClick();
    },
    [reminders, currentUser, saveRemindersState, showToast, userProfile.soundEnabled]
  );

  const updateReminder = useCallback(
    (reminder: PlannerReminder) => {
      const updated = {
        ...reminder,
        updatedAt: new Date().toISOString(),
      };

      saveRemindersState(
        reminders.map((item) => (item.id === reminder.id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'reminders', updated);
      }

      showToast('Lembrete atualizado!', 'success');
    },
    [reminders, currentUser, saveRemindersState, showToast]
  );

  const deleteReminder = useCallback(
    (id: string) => {
      saveRemindersState(reminders.filter((item) => item.id !== id));

      if (currentUser) {
        void deleteDocFromFirestore(currentUser.uid, 'reminders', id);
      }

      showToast('Lembrete excluído.', 'info');
    },
    [reminders, currentUser, saveRemindersState, showToast]
  );

  const updateReminderStatus = useCallback(
    (id: string, status: PlannerReminder['status']) => {
      const target = reminders.find((item) => item.id === id);
      if (!target) return;

      const updated: PlannerReminder = {
        ...target,
        status,
        updatedAt: new Date().toISOString(),
      };

      saveRemindersState(
        reminders.map((item) => (item.id === id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'reminders', updated);
      }

      if (status === 'completed') {
        showToast('Lembrete marcado como concluído!', 'success');
      }
    },
    [reminders, currentUser, saveRemindersState, showToast]
  );

  const toggleReminderFavorite = useCallback(
    (id: string) => {
      const target = reminders.find((item) => item.id === id);
      if (!target) return;

      const updated = {
        ...target,
        isFavorite: !target.isFavorite,
        updatedAt: new Date().toISOString(),
      };

      saveRemindersState(
        reminders.map((item) => (item.id === id ? updated : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'reminders', updated);
      }

      showToast(
        updated.isFavorite
          ? 'Lembrete favoritado!'
          : 'Removido dos favoritos.',
        'info'
      );
    },
    [reminders, currentUser, saveRemindersState, showToast]
  );

  // --------------------------------------------------
  // CATEGORIAS
  // --------------------------------------------------

  const addCategory = useCallback(
    (catData: Omit<Category, 'id'>) => {
      const newCategory: Category = {
        ...catData,
        id: `cat-${Date.now()}`,
        isCustom: true,
      };

      saveCategoriesState([...categories, newCategory]);

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'categories', newCategory);
      }

      showToast(`Categoria "${newCategory.name}" criada com sucesso!`, 'success');
    },
    [categories, currentUser, saveCategoriesState, showToast]
  );

  const updateCategory = useCallback(
    (category: Category) => {
      saveCategoriesState(
        categories.map((item) => (item.id === category.id ? category : item))
      );

      if (currentUser) {
        void syncDocToFirestore(currentUser.uid, 'categories', category);
      }

      showToast('Categoria atualizada!', 'success');
    },
    [categories, currentUser, saveCategoriesState, showToast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      saveCategoriesState(categories.filter((item) => item.id !== id));

      if (currentUser) {
        void deleteDocFromFirestore(currentUser.uid, 'categories', id);
      }

      showToast('Categoria removida.', 'info');
    },
    [categories, currentUser, saveCategoriesState, showToast]
  );

  // --------------------------------------------------
  // PERFIL E CONFIGURAÇÕES
  // --------------------------------------------------

  const updateUserProfile = useCallback(
    (profileUpdate: Partial<UserProfile>) => {
      setUserProfile((prev) => {
        const next = {
          ...prev,
          ...profileUpdate,
        };

        LocalStorageManager.saveProfile(next);

        return next;
      });

      showToast('Perfil atualizado com sucesso!', 'success');
    },
    [showToast]
  );

  const saveFirebaseCredentials = useCallback(
    async (params: FirebaseConfigParams): Promise<boolean> => {
      saveFirebaseConfig(params);

      setFirebaseStatus({
        isConfigured: true,
        isConnected: false,
        lastSyncAt: null,
        projectId: params.projectId,
        isOfflineMode: false,
      });

      const result = await checkConnection();

      if (result.success) {
        showToast('Firebase conectado com sucesso à nuvem! ☁️', 'success');
        return true;
      }

      showToast(`Atenção: ${result.message}`, 'warning');
      return false;
    },
    [checkConnection, showToast]
  );

  const disconnectFirebase = useCallback(() => {
    clearFirebaseConfig();

    setFirebaseStatus({
      isConfigured: false,
      isConnected: false,
      lastSyncAt: null,
      error: null,
      isOfflineMode: true,
    });

    showToast(
      'Desconectado da nuvem. Operando em modo offline com salvamento seguro.',
      'info'
    );
  }, [showToast]);

  const openQuickAdd = useCallback(
    (type: 'event' | 'task' | 'note' | 'reminder' = 'event') => {
      setQuickAddDefaultType(type);
      setIsQuickAddOpen(true);
    },
    []
  );

  // --------------------------------------------------
  // MONITOR DE LEMBRETES
  // --------------------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')}`;

      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      setReminders((prevReminders) => {
        let changed = false;

        const updated = prevReminders.map((reminder) => {
          if (
            reminder.status === 'pending' &&
            reminder.date === today &&
            reminder.time <= currentTime
          ) {
            changed = true;

            notificationService.sendNotification(
              `Lembrete: ${reminder.title}`,
              {
                body:
                  reminder.description ||
                  'Horário do seu lembrete no Meu Planner!',
              }
            );

            showToast(`Lembrete: ${reminder.title}`, 'info');

            return {
              ...reminder,
              status: 'sent' as const,
              updatedAt: new Date().toISOString(),
            };
          }

          return reminder;
        });

        if (changed) {
          LocalStorageManager.saveReminders(updated);

          if (currentUser) {
            updated.forEach((reminder) => {
              const oldReminder = prevReminders.find(
                (item) => item.id === reminder.id
              );

              if (oldReminder && oldReminder.status !== reminder.status) {
                void syncDocToFirestore(
                  currentUser.uid,
                  'reminders',
                  reminder
                );
              }
            });
          }

          return updated;
        }

        return prevReminders;
      });
    }, 25000);

    return () => clearInterval(interval);
  }, [showToast, currentUser]);

  // --------------------------------------------------
  // PESQUISA GLOBAL
  // --------------------------------------------------

  const searchResults = useMemo<GlobalSearchResult[]>(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: GlobalSearchResult[] = [];

    events.forEach((event) => {
      if (
        event.title.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.location && event.location.toLowerCase().includes(query))
      ) {
        const category = categories.find(
          (item) => item.id === event.categoryId
        );

        results.push({
          id: event.id,
          type: 'event',
          title: event.title,
          subtitle: `${event.date} às ${event.startTime}${
            event.location ? ` • ${event.location}` : ''
          }`,
          date: event.date,
          category,
          item: event,
        });
      }
    });

    tasks.forEach((task) => {
      if (
        task.name.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      ) {
        const category = categories.find(
          (item) => item.id === task.categoryId
        );

        results.push({
          id: task.id,
          type: 'task',
          title: task.name,
          subtitle: `Prioridade: ${
            task.priority === 'high'
              ? 'Alta'
              : task.priority === 'medium'
                ? 'Média'
                : 'Baixa'
          }${task.dueDate ? ` • Prazo: ${task.dueDate}` : ''}`,
          date: task.dueDate,
          category,
          item: task,
        });
      }
    });

    notes.forEach((note) => {
      if (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      ) {
        const category = categories.find(
          (item) => item.id === note.categoryId
        );

        results.push({
          id: note.id,
          type: 'note',
          title: note.title,
          subtitle:
            note.content.slice(0, 70) +
            (note.content.length > 70 ? '...' : ''),
          date: note.date,
          category,
          item: note,
        });
      }
    });

    reminders.forEach((reminder) => {
      if (
        reminder.title.toLowerCase().includes(query) ||
        (reminder.description &&
          reminder.description.toLowerCase().includes(query))
      ) {
        results.push({
          id: reminder.id,
          type: 'reminder',
          title: reminder.title,
          subtitle: `${reminder.date} às ${reminder.time} • Status: ${
            reminder.status === 'completed'
              ? 'Concluído'
              : reminder.status === 'sent'
                ? 'Enviado'
                : 'Pendente'
          }`,
          date: reminder.date,
          item: reminder,
        });
      }
    });

    return results;
  }, [searchQuery, events, tasks, notes, reminders, categories]);

  // --------------------------------------------------
  // VALOR DO CONTEXTO
  // --------------------------------------------------

  const value: PlannerContextType = {
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
    throw new Error(
      'usePlanner deve ser usado dentro de um PlannerProvider'
    );
  }

  return context;
};
