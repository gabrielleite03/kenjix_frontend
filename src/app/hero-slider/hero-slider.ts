import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-[1440px] mx-auto px-8 mb-8">
      <swiper-container 
        class="rounded-3xl overflow-hidden shadow-xl h-[160px] lg:h-[200px]"
        pagination="true" 
        navigation="true" 
        autoplay-delay="5000" 
        loop="true"
        style="--swiper-navigation-color: #fff; --swiper-pagination-color: #fff; --swiper-navigation-size: 20px;"
      >
        <swiper-slide>
          <div class="relative w-full h-full">
            <img 
              src="https://picsum.photos/seed/pet-hero-1/1920/1080" 
              alt="Promoção Ração Premium" 
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
            >
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 lg:px-12 text-white">
              <span class="bg-accent text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-1">Oferta Especial</span>
              <h2 class="text-xl lg:text-2xl font-black mb-1 leading-tight max-w-md">Nutrição de Elite para seu Melhor Amigo</h2>
              <p class="hidden lg:block text-sm opacity-90 mb-3 max-w-sm">Até 30% OFF em toda a linha de rações premium Kenji.</p>
              <button class="bg-white text-deep-teal px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary transition-all w-fit shadow-md">Ver Ofertas</button>
            </div>
          </div>
        </swiper-slide>

        <swiper-slide>
          <div class="relative w-full h-full">
            <img 
              src="https://picsum.photos/seed/pet-hero-2/1920/1080" 
              alt="Acessórios Exclusivos" 
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
            >
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 lg:px-12 text-white">
              <span class="bg-primary text-deep-teal px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-1">Lançamento</span>
              <h2 class="text-xl lg:text-2xl font-black mb-1 leading-tight max-w-md">Estilo e Conforto em Cada Passeio</h2>
              <p class="hidden lg:block text-sm opacity-90 mb-3 max-w-sm">Nova coleção de guias e coleiras ergonômicas exclusivas.</p>
              <button class="bg-accent text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-accent/90 transition-all w-fit shadow-md">Explorar Coleção</button>
            </div>
          </div>
        </swiper-slide>

        <swiper-slide>
          <div class="relative w-full h-full">
            <img 
              src="https://picsum.photos/seed/pet-hero-3/1920/1080" 
              alt="Higiene e Bem-estar" 
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
            >
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 lg:px-12 text-white">
              <span class="bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-1">Cuidado Completo</span>
              <h2 class="text-xl lg:text-2xl font-black mb-1 leading-tight max-w-md">Higiene que Transforma o Dia a Dia</h2>
              <p class="hidden lg:block text-sm opacity-90 mb-3 max-w-sm">Produtos hipoalergênicos e acessórios para banho pet.</p>
              <button class="bg-white text-deep-teal px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary transition-all w-fit shadow-md">Ver Produtos</button>
            </div>
          </div>
        </swiper-slide>
      </swiper-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    swiper-container {
      width: 100%;
      height: 100%;
    }
    swiper-slide {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSlider {}
