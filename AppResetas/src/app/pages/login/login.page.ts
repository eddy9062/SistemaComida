import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  loading = false;
  readonly form = this.fb.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly ui: UiService
  ) {}

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
        next: () => this.router.navigateByUrl('/home', { replaceUrl: true }),
        error: (error: Error) => this.ui.toast(error.message, 'danger')
      });
  }
}