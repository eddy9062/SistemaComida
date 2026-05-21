import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { finalize } from 'rxjs';
import { SQL_CODES } from '../../core/constants/sql-codes';
import { ApiService } from '../../core/services/api.service';
import { UiService } from '../../core/services/ui.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ApiParamType } from '../../shared/interfaces/dynamic-api.interface';
import { Receta } from '../../shared/interfaces/recetas.interface';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './recetas.page.html',
  styleUrls: ['./recetas.page.scss']
})
export class RecetasPage implements OnInit {
  items: Receta[] = [];
  search = '';
  loading = false;
  modalOpen = false;
  editing: Receta | null = null;

  readonly form = this.fb.group({
    id_receta: [0],
    nombre: ['', Validators.required],
    descripcion: [''],
    porciones: [1, [Validators.required, Validators.min(0.0001)]],
    imagen_url: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly ui: UiService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get filtered(): Receta[] {
    const term = this.search.trim().toLowerCase();
    return term
      ? this.items.filter((item) =>
        [item.nombre, item.descripcion, item.porciones]
          .some((value) => String(value ?? '').toLowerCase().includes(term))
      )
      : this.items;
  }

  load(): void {
    this.loading = true;
    this.api.query<Receta[]>(SQL_CODES.RECETAS_LIST, '')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (items) => this.items = items ?? [],
        error: (error: Error) => this.ui.toast(error.message, 'danger')
      });
  }

  create(): void {
    this.editing = null;
    this.form.reset({ id_receta: 0, nombre: '', descripcion: '', porciones: 1, imagen_url: '' });
    this.modalOpen = true;
  }

  edit(item: Receta): void {
    this.editing = item;
    this.form.reset(item);
    this.modalOpen = true;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const isEdit = !!this.editing;
    const codigo = isEdit ? SQL_CODES.RECETAS_UPDATE : SQL_CODES.RECETAS_INSERT;
    const data = isEdit
      ? { id_receta: value.id_receta, nombre: value.nombre, descripcion: value.descripcion, porciones: value.porciones, imagen_url: value.imagen_url }
      : { nombre: value.nombre, descripcion: value.descripcion, porciones: value.porciones, imagen_url: value.imagen_url };
    const schema = (isEdit
      ? { id_receta: 'N' as const, nombre: 'V' as const, descripcion: 'V' as const, porciones: 'N' as const, imagen_url: 'V' as const }
      : { nombre: 'V' as const, descripcion: 'V' as const, porciones: 'N' as const, imagen_url: 'V' as const }) as Record<string, ApiParamType>;

    this.api.queryFromRecord(codigo, data, schema).subscribe({
      next: () => {
        this.modalOpen = false;
        this.ui.toast('Receta guardada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  async remove(item: Receta): Promise<void> {
    const ok = await this.ui.confirm('Eliminar receta', `Desea eliminar ${item.nombre}?`);
    if (!ok) {
      return;
    }

    this.api.queryFromRecord(SQL_CODES.RECETAS_DELETE, { id_receta: item.id_receta }, { id_receta: 'N' }).subscribe({
      next: () => {
        this.ui.toast('Receta eliminada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }
}
