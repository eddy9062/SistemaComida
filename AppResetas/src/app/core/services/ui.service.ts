import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class UiService {
  private loading?: HTMLIonLoadingElement;

  constructor(
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController
  ) {}

  async showLoading(message = 'Cargando...'): Promise<void> {
    this.loading = await this.loadingController.create({ message });
    await this.loading.present();
  }

  async hideLoading(): Promise<void> {
    await this.loading?.dismiss();
    this.loading = undefined;
  }

  async toast(message: string, color: 'success' | 'warning' | 'danger' | 'medium' = 'medium'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2400,
      position: 'top'
    });
    await toast.present();
  }

  async confirm(header: string, message: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          { text: 'Cancelar', role: 'cancel', handler: () => resolve(false) },
          { text: 'Confirmar', role: 'destructive', handler: () => resolve(true) }
        ]
      });
      await alert.present();
    });
  }
}