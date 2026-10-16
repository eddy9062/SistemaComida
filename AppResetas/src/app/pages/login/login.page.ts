import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
import { AppStorageService } from '../../core/storage/app-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  loading = false;
  showPassword = false;
  readonly form = this.fb.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
    remember: [false]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly ui: UiService,
    private readonly storage: AppStorageService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
      return;
    }
    const usuario = this.storage.rememberedUsername;
    this.form.patchValue({ usuario, remember: !!usuario });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  updateRememberPreference(): void {
    if (!this.form.controls.remember.value) {
      this.storage.setRememberedUsername('');
    }
  }

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.loading = true;
    this.auth.login({ usuario: value.usuario ?? '', password: value.password ?? '' })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.storage.setRememberedUsername(value.remember ? value.usuario ?? '' : '');
          this.router.navigateByUrl('/home', { replaceUrl: true });
        },
        error: () => this.ui.toast('No fue posible iniciar sesión. Verifique sus credenciales.', 'danger')
      });
  }
}
