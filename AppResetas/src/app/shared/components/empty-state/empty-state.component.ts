import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonicModule],
  template: `
    <div class="empty">
      <ion-icon name="file-tray-outline"></ion-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty {
      min-height: 180px;
      display: grid;
      place-items: center;
      align-content: center;
      gap: 8px;
      color: var(--app-muted);
      text-align: center;
      padding: 24px;
    }
    ion-icon {
      font-size: 34px;
      color: var(--ion-color-medium);
    }
    h3 {
      margin: 0;
      color: var(--ion-color-dark);
      font-size: 18px;
    }
    p {
      margin: 0;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Sin datos';
  @Input() message = 'No hay registros para mostrar.';
}