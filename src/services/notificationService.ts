/**
 * Serviço de Notificações Reais do Navegador e Service Worker
 */
import { sound } from './sound';

class NotificationService {
  private hasServiceWorker = false;

  constructor() {
    this.initServiceWorker();
  }

  private async initServiceWorker(): Promise<void> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        this.hasServiceWorker = !!registration;
      } catch {
        this.hasServiceWorker = false;
      }
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch {
      return 'denied';
    }
  }

  sendNotification(title: string, options?: NotificationOptions & { playAudio?: boolean }): boolean {
    const playAudio = options?.playAudio !== false;
    if (playAudio) {
      sound.playChime();
    }

    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const defaultIcon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D9A2B5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
      
      const notif = new Notification(title, {
        icon: defaultIcon,
        badge: defaultIcon,
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return true;
    } catch {
      return false;
    }
  }
}

export const notificationService = new NotificationService();
