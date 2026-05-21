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
import { UnidadMedida } from '../../shared/interfaces/recetas.interface';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './unidades.page.html',
  styleUrls: ['./unidades.page.scss']
})
export class UnidadesPage implements OnInit {
  items: UnidadMedida[] = [];
  search = '';
  loading = false;
  modalOpen = false;
  editing: UnidadMedida | null = null;

  readonly form = this.fb.group({
    id_unidad: [0],
    nombre: ['', Validators.required],
    abreviatura: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly ui: UiService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get filteredItems(): UnidadMedida[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.items;
    }

    return this.items.filter((item) =>
      [item.id_unidad, item.nombre, item.abreviatura]
        .some((value) => String(value ?? '').toLowerCase().includes(term))
    );
  }

  onSearch(event: CustomEvent): void {
    this.search = String(event.detail?.value ?? '');
  }

  load(): void {
    this.loading = true;
    this.api.query<UnidadMedida[]>(SQL_CODES.UNIDADES_LIST, '')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (items) => this.items = items ?? [],
        error: (error: Error) => this.ui.toast(error.message, 'danger')
      });
  }

  create(): void {
    this.editing = null;
    this.form.reset({ id_unidad: 0, nombre: '', abreviatura: '' });
    this.modalOpen = true;
  }

  edit(item: UnidadMedida): void {
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
    const codigo = isEdit ? SQL_CODES.UNIDADES_UPDATE : SQL_CODES.UNIDADES_INSERT;
    const data = isEdit
      ? { id_unidad: value.id_unidad, nombre: value.nombre, abreviatura: value.abreviatura }
      : { nombre: value.nombre, abreviatura: value.abreviatura };
    const schema = (isEdit
      ? { id_unidad: 'N' as const, nombre: 'V' as const, abreviatura: 'V' as const }
      : { nombre: 'V' as const, abreviatura: 'V' as const }) as Record<string, ApiParamType>;

    this.api.queryFromRecord(codigo, data, schema).subscribe({
      next: () => {
        this.modalOpen = false;
        this.ui.toast('Unidad guardada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  async remove(item: UnidadMedida): Promise<void> {
    const ok = await this.ui.confirm('Eliminar unidad', `Desea eliminar ${item.nombre}?`);
    if (!ok) {
      return;
    }

    this.api.queryFromRecord(SQL_CODES.UNIDADES_DELETE, { id_unidad: item.id_unidad }, { id_unidad: 'N' }).subscribe({
      next: () => {
        this.ui.toast('Unidad eliminada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }
}
