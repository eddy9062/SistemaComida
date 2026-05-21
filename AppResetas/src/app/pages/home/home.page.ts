import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

interface HomeCard {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  readonly cards: HomeCard[] = [
    { title: 'Unidades de medida', description: 'Catalogo de unidades.', icon: 'scale-outline', route: '/unidades' },
    { title: 'Conversiones', description: 'Factores entre unidades.', icon: 'swap-horizontal-outline', route: '/conversiones' },
    { title: 'Ingredientes', description: 'Insumos y unidades.', icon: 'nutrition-outline', route: '/ingredientes' },
    { title: 'Recetas', description: 'Recetas y detalle.', icon: 'restaurant-outline', route: '/recetas' },
    { title: 'Menu semanal', description: 'Programacion por dia.', icon: 'calendar-outline', route: '/menu-semanal' },
    { title: 'Reporte de compras', description: 'Consolidado por rango.', icon: 'cart-outline', route: '/reportes/compras' }
  ];

  constructor(public readonly auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }
}