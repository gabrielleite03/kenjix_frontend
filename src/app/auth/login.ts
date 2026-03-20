import {ChangeDetectionStrategy, Component, inject, signal, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css', '../admin/admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      email: ['admin@kenjipet.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.cdr.detectChanges();

      // Simulate API call
      setTimeout(() => {
        const { email, password } = this.loginForm.value;
        if (email === 'admin@kenjipet.com' && password === 'admin123') {
          this.authService.login(email, 'Administrador');
        } else {
          this.errorMessage.set('E-mail ou senha incorretos.');
          this.isLoading.set(false);
          this.cdr.detectChanges();
        }
      }, 1000);
    }
  }
}
