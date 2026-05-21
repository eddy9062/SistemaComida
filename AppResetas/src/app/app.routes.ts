import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage)
      },
      {
        path: 'unidades',
        loadComponent: () => import('./pages/unidades/unidades.page').then((m) => m.UnidadesPage)
      },
      {
        path: 'conversiones',
        loadComponent: () => import('./pages/conversiones/conversiones.page').then((m) => m.ConversionesPage)
      },
      {
        path: 'ingredientes',
        loadComponent: () => import('./pages/ingredientes/ingredientes.page').then((m) => m.IngredientesPage)
      },
      {
        path: 'recetas',
        loadComponent: () => import('./pages/recetas/recetas.page').then((m) => m.RecetasPage)
      },
      {
        path: 'recetas/:id/detalle',
        loadComponent: () => import('./pages/receta-detalle/receta-detalle.page').then((m) => m.RecetaDetallePage)
      },
      {
        path: 'menu-semanal',
        loadComponent: () => import('./pages/menu-semanal/menu-semanal.page').then((m) => m.MenuSemanalPage)
      },
      {
        path: 'reportes/compras',
        loadComponent: () => import('./pages/reportes/compras/compras.page').then((m) => m.ComprasPage)
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];