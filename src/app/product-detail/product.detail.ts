import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProductService, Product, ProductItem } from '../admin/product/product.service';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { WhatsAppButton } from '../whatsapp-button';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, MatIconModule, RouterLink, Header, Footer, WhatsAppButton],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);
    private sanitizer = inject(DomSanitizer);

    product = signal<ProductItem | undefined>(undefined);
    selectedImage = signal<string>('');
    marketplace: string = "site";
    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadProduct(id);
        }
    }

    async loadProduct(id: string) {
        const p = await firstValueFrom(
            this.productService.getProductToHomeById(id, this.marketplace)
        );

        this.product.set(p);

        if (p?.images?.length) {
            this.selectedImage.set(p.images[0]);
        }
    }

    properties = computed(() => {
        const p = this.product();
        if (!p?.properties) return [];

        const map = new Map<string, { name: string; value: string }>();

        p.properties.forEach(prop => {
            const key = prop.name?.trim().toLowerCase();
            if (!key) return;

            if (!map.has(key)) {
                map.set(key, {
                    name: prop.name.trim(),
                    value: prop.value
                });
            }
        });

        return Array.from(map.values());
    });

    isYouTube(url: string): boolean {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    getYouTubeEmbedUrl(url: string): SafeResourceUrl {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    getYouTubeThumbnail(url: string): string {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
}
