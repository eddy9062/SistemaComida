import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from './core/services/auth.service';

interface AppMenuItem {
  title: string;
  icon: string;
  url: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly menu: AppMenuItem[] = [
    { title: 'Inicio', icon: 'home-outline', url: '/home' },
    { title: 'Unidades de medida', icon: 'scale-outline', url: '/unidades' },
    { title: 'Conversiones', icon: 'swap-horizontal-outline', url: '/conversiones' },
    { title: 'Ingredientes', icon: 'nutrition-outline', url: '/ingredientes' },
    { title: 'Recetas', icon: 'restaurant-outline', url: '/recetas' },
    { title: 'Menu semanal', icon: 'calendar-outline', url: '/menu-semanal' },
    { title: 'Reporte de compras', icon: 'cart-outline', url: '/reportes/compras' }
  ];

  constructor(public readonly auth: AuthService) {}
}
