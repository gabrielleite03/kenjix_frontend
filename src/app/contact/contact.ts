import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, Header, Footer, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <app-header></app-header>

      <main class="flex-1 max-w-[1440px] mx-auto w-full px-8 py-16">
        <div class="max-w-5xl mx-auto">
          <div class="flex items-center gap-4 mb-12">
            <div class="size-12 bg-primary rounded-xl flex items-center justify-center text-deep-teal shadow-md">
              <mat-icon class="text-[28px]">mail</mat-icon>
            </div>
            <h1 class="text-4xl font-bold text-slate-900 tracking-tight">Contato</h1>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Contact Info -->
            <div class="lg:col-span-1 space-y-8">
              <div>
                <h3 class="text-lg font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Fale Conosco</h3>
                <div class="space-y-4">
                  <div class="flex items-start gap-4">
                    <div class="size-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-accent shrink-0">
                      <mat-icon>phone</mat-icon>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">Telefone</p>
                      <p class="text-sm text-slate-500">(11) 99999-9999</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="size-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-accent shrink-0">
                      <mat-icon>whatsapp</mat-icon>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">WhatsApp</p>
                      <p class="text-sm text-slate-500">(11) 98888-8888</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4">
                    <div class="size-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-accent shrink-0">
                      <mat-icon>email</mat-icon>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">E-mail</p>
                      <p class="text-sm text-slate-500">contato&#64;kenjipet.com.br</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Horário</h3>
                <div class="flex items-start gap-4">
                  <div class="size-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-accent shrink-0">
                    <mat-icon>schedule</mat-icon>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Atendimento</p>
                    <p class="text-sm text-slate-500">
                      Segunda a Sábado: 08:00 - 20:00<br>
                      Domingos e Feriados: 09:00 - 14:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="lg:col-span-2">
              <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 class="text-2xl font-bold text-slate-800 mb-6">Envie uma mensagem</h2>
                
                @if (submitted()) {
                  <div class="bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-2xl flex items-center gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <mat-icon class="text-emerald-500">check_circle</mat-icon>
                    <div>
                      <p class="font-bold">Mensagem enviada com sucesso!</p>
                      <p class="text-sm opacity-90">Entraremos em contato em breve.</p>
                    </div>
                  </div>
                }

                <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label for="contact-name" class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
                      <input 
                        id="contact-name"
                        type="text" 
                        formControlName="name"
                        placeholder="Seu nome"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        [class.border-red-300]="contactForm.get('name')?.invalid && contactForm.get('name')?.touched"
                      >
                    </div>
                    <div class="space-y-2">
                      <label for="contact-email" class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail</label>
                      <input 
                        id="contact-email"
                        type="email" 
                        formControlName="email"
                        placeholder="seu@email.com"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        [class.border-red-300]="contactForm.get('email')?.invalid && contactForm.get('email')?.touched"
                      >
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label for="contact-subject" class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Assunto</label>
                    <select 
                      id="contact-subject"
                      formControlName="subject"
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all bg-white"
                    >
                      <option value="duvida">Dúvida sobre produto</option>
                      <option value="pedido">Status de pedido</option>
                      <option value="servico">Agendamento de serviço</option>
                      <option value="elogio">Elogio ou Sugestão</option>
                      <option value="outro">Outro assunto</option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label for="contact-message" class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mensagem</label>
                    <textarea 
                      id="contact-message"
                      formControlName="message"
                      rows="5"
                      placeholder="Como podemos ajudar?"
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                      [class.border-red-300]="contactForm.get('message')?.invalid && contactForm.get('message')?.touched"
                    ></textarea>
                  </div>

                  <!-- CAPTCHA Section -->
                  <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div class="flex items-center justify-between">
                      <label for="contact-captcha" class="text-sm font-bold text-slate-700">Verificação de Segurança</label>
                      <button type="button" (click)="generateCaptcha()" class="text-accent hover:text-accent/80 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                        <mat-icon class="text-sm">refresh</mat-icon>
                        Novo Desafio
                      </button>
                    </div>
                    <div class="flex flex-col sm:flex-row items-center gap-4">
                      <div class="bg-white px-6 py-3 rounded-xl border border-slate-200 font-mono text-xl font-bold text-deep-teal shadow-inner select-none tracking-widest">
                        {{ captchaQuestion() }}
                      </div>
                      <div class="flex-1 w-full">
                        <input 
                          id="contact-captcha"
                          type="number" 
                          formControlName="captcha"
                          placeholder="Resultado"
                          class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                          [class.border-red-300]="contactForm.get('captcha')?.invalid && contactForm.get('captcha')?.touched"
                        >
                      </div>
                    </div>
                    @if (contactForm.get('captcha')?.invalid && contactForm.get('captcha')?.touched) {
                      <p class="text-xs text-red-500 font-medium">Por favor, resolva o desafio corretamente para continuar.</p>
                    }
                  </div>

                  <button 
                    type="submit"
                    [disabled]="contactForm.invalid || isSubmitting()"
                    class="w-full md:w-auto px-12 py-4 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    @if (isSubmitting()) {
                      <mat-icon class="animate-spin">sync</mat-icon>
                      Enviando...
                    } @else {
                      <mat-icon>send</mat-icon>
                      Enviar Mensagem
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage implements OnInit {
  captchaQuestion = signal('');
  private captchaAnswer = 0;

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl('duvida', [Validators.required]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)]),
    captcha: new FormControl('', [Validators.required, (control) => this.validateCaptcha(control)]),
  });

  isSubmitting = signal(false);
  submitted = signal(false);

  ngOnInit() {
    this.generateCaptcha();
  }

  generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    this.captchaAnswer = num1 + num2;
    this.captchaQuestion.set(`${num1} + ${num2} = ?`);
    this.contactForm.get('captcha')?.reset();
  }

  private validateCaptcha(control: AbstractControl): ValidationErrors | null {
    if (control.value === null || control.value === '') return null;
    return Number(control.value) === this.captchaAnswer ? null : { invalidCaptcha: true };
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form data:', this.contactForm.value);
      
      this.isSubmitting.set(false);
      this.submitted.set(true);
      this.contactForm.reset({ subject: 'duvida' });
      this.generateCaptcha();

      // Reset success message after 5 seconds
      setTimeout(() => this.submitted.set(false), 5000);
    }
  }
}
