import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [IonicModule],
  template: `
    <div class="state">
      <ion-spinner name="crescent"></ion-spinner>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .state {
      min-height: 180px;
      display: grid;
      place-items: center;
      gap: 10px;
      color: var(--app-muted);
    }
  `]
})
export class LoadingComponent {
  @Input() message = 'Cargando...';
}