import {ChangeDetectionStrategy, Component, model, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  isOpen = model(false);
  private authService = inject(AuthService);

  user = this.authService.user;

  close() {
    this.isOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.close();
  }
}
