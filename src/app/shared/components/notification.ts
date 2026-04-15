import { Component, inject, effect, ElementRef, viewChildren, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../services/notification';
import { animate } from 'motion';

@Component({
  selector: 'app-notification',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (n of notifications(); track n.id) {
        <div 
          #notificationEl
          class="notification-item pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border min-w-[300px] max-w-[450px] transition-all duration-300"
          [ngClass]="{
            'bg-white border-blue-100 text-blue-800': n.type === 'info',
            'bg-white border-emerald-100 text-emerald-800': n.type === 'success',
            'bg-white border-rose-100 text-rose-800': n.type === 'error',
            'bg-white border-amber-100 text-amber-800': n.type === 'warning'
          }"
        >
          <div class="flex-shrink-0">
            @switch (n.type) {
              @case ('success') {
                <mat-icon class="text-emerald-500">check_circle</mat-icon>
              }
              @case ('error') {
                <mat-icon class="text-rose-500">error</mat-icon>
              }
              @case ('warning') {
                <mat-icon class="text-amber-500">warning</mat-icon>
              }
              @default {
                <mat-icon class="text-blue-500">info</mat-icon>
              }
            }
          </div>
          
          <div class="flex-1 text-sm font-medium">
            {{ n.message }}
          </div>

          <button 
            (click)="remove(n.id)"
            class="flex-shrink-0 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <mat-icon class="text-slate-400 text-lg">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;
  notificationEls = viewChildren<ElementRef>('notificationEl');

  constructor() {
    effect(() => {
      const elements = this.notificationEls();
      if (elements.length > 0) {
        const lastEl = elements[elements.length - 1].nativeElement;
        if (!lastEl.classList.contains('animated')) {
          lastEl.classList.add('animated');
          animate(
            lastEl,
            { opacity: [0, 1], x: [50, 0], scale: [0.9, 1] },
            { duration: 0.4, ease: 'easeOut' }
          );
        }
      }
    });
  }

  remove(id: number) {
    this.notificationService.remove(id);
  }
}