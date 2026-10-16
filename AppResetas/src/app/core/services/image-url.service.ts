import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageUrlService {
  resolve(imageUrl?: string | null, apiUrl = environment.apiUrl): string {
    if (!imageUrl) return 'assets/recipe-placeholder.svg';
    if (/^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;

    const path = imageUrl.replace(/^\/+/, '');
    return new URL(`../${path}`, apiUrl).toString();
  }
}
