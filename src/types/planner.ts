/**
 * Tipos e Modelos para o Meu Planner
 */

export type NavigationTab = 
  | 'home' 
  | 'calendar' 
  | 'tasks' 
  | 'notes' 
  | 'reminders' 
  | 'favorites' 
  | 'history' 
  | 'settings';

export type Priority = 'low' | 'medium' | 'high';

export type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly';

export type ReminderTiming = 'at_time' | '10m_before' | '30m_before' | '1h_before' | '1d_before' | 'custom';

export interface Category {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  iconName: string;
  isCustom?: boolean;
}

export interface PlannerEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  categoryId: string;
  color: string;
  location?: string;
  reminderTiming?: ReminderTiming;
  reminderCustomMinutes?: number;
  repeat: RepeatOption;
  completed: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerTask {
  id: string;
  name: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  categoryId: string;
  priority: Priority;
  completed: boolean;
  isFavorite: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerNote {
  id: string;
  title: string;
  content: string;
  color: string; // Hex color for the paper note
  categoryId: string;
  date?: string; // YYYY-MM-DD
  isFavorite: boolean;
  isQuickNote?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerReminder {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'pending' | 'sent' | 'completed' | 'dismissed';
  isFavorite: boolean;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl: string;
  firstDayOfWeek: 'sunday' | 'monday';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  defaultReminderMinutes: number;
  themePalette: 'blush' | 'lavender' | 'peach' | 'mint';
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export interface FirebaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  lastSyncAt: Date | null;
  error?: string | null;
  projectId?: string;
  isOfflineMode: boolean;
}

export interface GlobalSearchResult {
  id: string;
  type: 'event' | 'task' | 'note' | 'reminder';
  title: string;
  subtitle: string;
  date?: string;
  category?: Category;
  item: PlannerEvent | PlannerTask | PlannerNote | PlannerReminder;
}
