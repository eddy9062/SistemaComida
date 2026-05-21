import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [IonicModule],
  template: `
    <ion-alert
      [isOpen]="isOpen"
      [header]="header"
      [message]="message"
      [buttons]="buttons"
      (didDismiss)="closed.emit()">
    </ion-alert>
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() header = 'Confirmar';
  @Input() message = 'Desea continuar?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  get buttons(): unknown[] {
    return [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Confirmar', role: 'destructive', handler: () => this.confirmed.emit() }
    ];
  }
}