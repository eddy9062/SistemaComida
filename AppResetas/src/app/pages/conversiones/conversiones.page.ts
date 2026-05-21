import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { finalize } from 'rxjs';
import { SQL_CODES } from '../../core/constants/sql-codes';
import { ApiService } from '../../core/services/api.service';
import { UiService } from '../../core/services/ui.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ApiParamType } from '../../shared/interfaces/dynamic-api.interface';
import { ConversionUnidad, UnidadMedida } from '../../shared/interfaces/recetas.interface';

@Component({
  selector: 'app-conversiones',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './conversiones.page.html',
  styleUrls: ['./conversiones.page.scss']
})
export class ConversionesPage implements OnInit {
  items: ConversionUnidad[] = [];
  unidades: UnidadMedida[] = [];
  search = '';
  loading = false;
  modalOpen = false;
  editing: ConversionUnidad | null = null;

  readonly form = this.fb.group({
    id_conversion: [0],
    unidad_origen: [null as number | null, Validators.required],
    unidad_destino: [null as number | null, Validators.required],
    factor: [1, [Validators.required, Validators.min(0.000001)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly ui: UiService
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.load();
  }

  loadCatalogs(): void {
    this.api.query<UnidadMedida[]>(SQL_CODES.UNIDADES_LIST, '').subscribe({
      next: (items) => this.unidades = items ?? [],
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  load(): void {
    this.loading = true;
    this.api.query<ConversionUnidad[]>(SQL_CODES.CONVERSIONES_LIST, '')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (items) => this.items = items ?? [],
        error: (error: Error) => this.ui.toast(error.message, 'danger')
      });
  }

  unitName(id: number): string {
    const unit = this.unidades.find((item) => Number(item.id_unidad) === Number(id));
    return unit ? `${unit.nombre} (${unit.abreviatura})` : String(id);
  }

  get filteredItems(): ConversionUnidad[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.items;
    }

    return this.items.filter((item) =>
      [
        item.unidad_origen_nombre || this.unitName(item.unidad_origen),
        item.unidad_destino_nombre || this.unitName(item.unidad_destino),
        item.factor
      ].some((value) => String(value ?? '').toLowerCase().includes(term))
    );
  }

  onSearch(event: CustomEvent): void {
    this.search = String(event.detail?.value ?? '');
  }

  create(): void {
    this.editing = null;
    this.form.reset({ id_conversion: 0, unidad_origen: null, unidad_destino: null, factor: 1 });
    this.modalOpen = true;
  }

  edit(item: ConversionUnidad): void {
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
    const codigo = isEdit ? SQL_CODES.CONVERSIONES_UPDATE : SQL_CODES.CONVERSIONES_INSERT;
    const data = isEdit
      ? { id_conversion: value.id_conversion, unidad_origen: value.unidad_origen, unidad_destino: value.unidad_destino, factor: value.factor }
      : { unidad_origen: value.unidad_origen, unidad_destino: value.unidad_destino, factor: value.factor };
    const schema = (isEdit
      ? { id_conversion: 'N' as const, unidad_origen: 'N' as const, unidad_destino: 'N' as const, factor: 'N' as const }
      : { unidad_origen: 'N' as const, unidad_destino: 'N' as const, factor: 'N' as const }) as Record<string, ApiParamType>;

    this.api.queryFromRecord(codigo, data, schema).subscribe({
      next: () => {
        this.modalOpen = false;
        this.ui.toast('Conversion guardada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  async remove(item: ConversionUnidad): Promise<void> {
    const ok = await this.ui.confirm('Eliminar conversion', `Desea eliminar la conversion ${this.unitName(item.unidad_origen)} a ${this.unitName(item.unidad_destino)}?`);
    if (!ok) {
      return;
    }

    this.api.queryFromRecord(SQL_CODES.CONVERSIONES_DELETE, { id_conversion: item.id_conversion }, { id_conversion: 'N' }).subscribe({
      next: () => {
        this.ui.toast('Conversion eliminada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }
}
