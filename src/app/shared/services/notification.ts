import { Injectable, signal } from '@angular/core';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private nextId = 0;
  notifications = signal<Notification[]>([]);

  show(message: string, type: NotificationType = 'info', duration = 5000) {
    const id = this.nextId++;
    const notification: Notification = { id, type, message, duration };
    
    this.notifications.update(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  remove(id: number) {
    this.notifications.update(prev => prev.filter(n => n.id !== id));
  }
}