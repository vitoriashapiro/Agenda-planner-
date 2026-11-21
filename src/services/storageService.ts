/**
 * Gerenciador unificado de dados do Meu Planner
 * Suporta Firestore em tempo real + espelho local resiliente
 */
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { 
  Category, 
  PlannerEvent, 
  PlannerTask, 
  PlannerNote, 
  PlannerReminder, 
  UserProfile 
} from '../types/planner';
import { getFirebaseInstances } from './firebaseConfig';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-pessoal', name: 'Pessoal', color: '#D9A2B5', bgColor: '#FDF0F4', iconName: 'Heart' },
  { id: 'cat-trabalho', name: 'Trabalho', color: '#B399D4', bgColor: '#F5F0FB', iconName: 'Briefcase' },
  { id: 'cat-familia', name: 'Família', color: '#E8A598', bgColor: '#FFF2F0', iconName: 'Home' },
  { id: 'cat-saude', name: 'Saúde', color: '#97C1A9', bgColor: '#F0F7F3', iconName: 'Activity' },
  { id: 'cat-estudos', name: 'Estudos', color: '#80B3B3', bgColor: '#EEF7F7', iconName: 'BookOpen' },
  { id: 'cat-compras', name: 'Compras', color: '#DEB088', bgColor: '#FAF3ED', iconName: 'ShoppingBag' },
  { id: 'cat-compromissos', name: 'Compromissos', color: '#C5A059', bgColor: '#FBF7EE', iconName: 'Calendar' },
  { id: 'cat-outros', name: 'Outros', color: '#A0939A', bgColor: '#F5F3F4', iconName: 'Sparkles' },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  displayName: 'Vitória Miranda',
  email: 'vitoria.miranda@lojaodobras.com.br',
  avatarUrl: '/imagens/hellokitty.jpg',
  firstDayOfWeek: 'sunday',
  dateFormat: 'DD/MM/YYYY',
  defaultReminderMinutes: 15,
  themePalette: 'blush',
  soundEnabled: true,
  browserNotificationsEnabled: true,
};

const STORAGE_KEYS = {
  EVENTS: 'meu_planner_events',
  TASKS: 'meu_planner_tasks',
  NOTES: 'meu_planner_notes',
  REMINDERS: 'meu_planner_reminders',
  CATEGORIES: 'meu_planner_categories',
  PROFILE: 'meu_planner_profile',
};

// Formato YYYY-MM-DD para hoje
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Dados iniciais elegantes para inaugurar o planner
function createInitialSeedData(): {
  events: PlannerEvent[];
  tasks: PlannerTask[];
  notes: PlannerNote[];
  reminders: PlannerReminder[];
} {
  const today = getTodayString();
  const tomorrow = getTomorrowString();
  const now = new Date().toISOString();

  const events: PlannerEvent[] = [
    {
      id: 'evt-1',
      title: 'Organização do Meu Planner e Metas do Mês',
      description: 'Momento para organizar prioridades da semana, alinhar anotações e desfrutar de um bom café.',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      categoryId: 'cat-pessoal',
      color: '#D9A2B5',
      location: 'Espaço de estudos / Cantinho favorito',
      reminderTiming: '10m_before',
      repeat: 'none',
      completed: false,
      isFavorite: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'evt-2',
      title: 'Consulta de Rotina & Cuidados de Saúde',
      description: 'Checkup anual de saúde e bem-estar.',
      date: tomorrow,
      startTime: '14:30',
      endTime: '15:30',
      categoryId: 'cat-saude',
      color: '#97C1A9',
      location: 'Consultório Dra. Marina',
      reminderTiming: '1h_before',
      repeat: 'none',
      completed: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const tasks: PlannerTask[] = [
    {
      id: 'tsk-1',
      name: 'Separar 20 minutos para leitura inspiradora',
      description: 'Ler um capítulo do livro atual com um chá aconchegante.',
      dueDate: today,
      dueTime: '17:00',
      categoryId: 'cat-pessoal',
      priority: 'medium',
      completed: false,
      isFavorite: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk-2',
      name: 'Revisar pendências de trabalho e e-mails',
      description: 'Limpar caixa de entrada e responder mensagens urgentes.',
      dueDate: today,
      dueTime: '11:00',
      categoryId: 'cat-trabalho',
      priority: 'high',
      completed: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'tsk-3',
      name: 'Comprar flores frescas para aromatizar o ambiente',
      description: 'Lírios ou rosas brancas.',
      dueDate: tomorrow,
      categoryId: 'cat-compras',
      priority: 'low',
      completed: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const notes: PlannerNote[] = [
    {
      id: 'not-1',
      title: 'Bem-vinda ao seu Meu Planner! 🌸',
      content: 'Este é o seu cantinho seguro e tranquilo para planejar cada momento com leveza e serenidade.\n\n✨ Aqui você pode:\n- Anotar seus pensamentos e listas de desejos\n- Guardar lembretes com carinho\n- Acompanhar seus compromissos no calendário diário, semanal e mensal\n- Celebrar cada conquista pequena ou grande!\n\nLembre-se sempre: um passo de cada vez.',
      color: '#F9EAF0', // Rosa claro suave
      categoryId: 'cat-pessoal',
      date: today,
      isFavorite: true,
      isQuickNote: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'not-2',
      title: 'Ideias de autocuidado e bem-estar',
      content: '1. Beber 2L de água com rodelas de limão e hortelã.\n2. Caminhada matinal sentindo o ar fresco.\n3. Skincare noturno com massagem facial suave.\n4. Dormir sem telas 30 minutos antes.',
      color: '#EAE3F5', // Lilás suave
      categoryId: 'cat-saude',
      date: today,
      isFavorite: true,
      isQuickNote: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'not-3',
      title: 'Nota Rápida: Perfume favorito',
      content: 'Comprar refil de vela aromática de lavanda e baunilha.',
      color: '#FFF9F4',
      categoryId: 'cat-compras',
      isFavorite: false,
      isQuickNote: true,
      createdAt: now,
      updatedAt: now,
    }
  ];

  const reminders: PlannerReminder[] = [
    {
      id: 'rem-1',
      title: 'Lembrete de hidratação 💧',
      description: 'Pausa para beber um copo d’água e alongar a coluna.',
      date: today,
      time: '15:00',
      status: 'pending',
      isFavorite: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rem-2',
      title: 'Confirmar horário da consulta médica',
      description: 'Ligar para a clínica ou enviar mensagem no WhatsApp.',
      date: today,
      time: '18:00',
      status: 'pending',
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    }
  ];

  return { events, tasks, notes, reminders };
}

export class LocalStorageManager {
  static getEvents(): PlannerEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      const seed = createInitialSeedData();
      this.saveEvents(seed.events);
      return seed.events;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveEvents(events: PlannerEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  static getTasks(): PlannerTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const seed = createInitialSeedData();
      this.saveTasks(seed.tasks);
      return seed.tasks;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveTasks(tasks: PlannerTask[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  static getNotes(): PlannerNote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      const seed = createInitialSeedData();
      this.saveNotes(seed.notes);
      return seed.notes;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveNotes(notes: PlannerNote[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  static getReminders(): PlannerReminder[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!raw) {
      const seed = createInitialSeedData();
      this.saveReminders(seed.reminders);
      return seed.reminders;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveReminders(reminders: PlannerReminder[]): void {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }

  static getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static getProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      this.saveProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    try {
      return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  }

  static saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }
}

/**
 * Operações na Nuvem Firestore com tratamento resiliente de erros
 */
export async function syncDocToFirestore<T extends { id: string }>(
  userId: string,
  subcollection: 'events' | 'tasks' | 'notes' | 'reminders' | 'categories',
  item: T
): Promise<void> {
  const { db } = getFirebaseInstances();
  if (!db || !userId) return;

  try {
    const docRef = doc(db, 'users', userId, subcollection, item.id);
    const cleanItem = Object.fromEntries(
  Object.entries(item).filter(([, value]) => value !== undefined)
);

await setDoc(docRef, cleanItem, { merge: true });
  } catch (err) {
    console.warn(`Firestore sync warning on ${subcollection}/${item.id}:`, err);
  }
}

export async function deleteDocFromFirestore(
  userId: string,
  subcollection: 'events' | 'tasks' | 'notes' | 'reminders' | 'categories',
  itemId: string
): Promise<void> {
  const { db } = getFirebaseInstances();
  if (!db || !userId) return;

  try {
    const docRef = doc(db, 'users', userId, subcollection, itemId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete warning on ${subcollection}/${itemId}:`, err);
  }
}
