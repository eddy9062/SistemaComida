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
import { Ingrediente, UnidadMedida } from '../../shared/interfaces/recetas.interface';

@Component({
  selector: 'app-ingredientes',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './ingredientes.page.html',
  styleUrls: ['./ingredientes.page.scss']
})
export class IngredientesPage implements OnInit {
  items: Ingrediente[] = [];
  unidades: UnidadMedida[] = [];
  search = '';
  loading = false;
  modalOpen = false;
  editing: Ingrediente | null = null;

  readonly form = this.fb.group({
    id_ingrediente: [0],
    nombre: ['', Validators.required],
    unidad_compra: [null as number | null, Validators.required],
    unidad_consumo: [null as number | null, Validators.required]
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
    this.api.query<Ingrediente[]>(SQL_CODES.INGREDIENTES_LIST, '')
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

  get filteredItems(): Ingrediente[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.items;
    }

    return this.items.filter((item) =>
      [
        item.nombre,
        item.unidad_compra_nombre || this.unitName(item.unidad_compra),
        item.unidad_consumo_nombre || this.unitName(item.unidad_consumo)
      ].some((value) => String(value ?? '').toLowerCase().includes(term))
    );
  }

  onSearch(event: CustomEvent): void {
    this.search = String(event.detail?.value ?? '');
  }

  create(): void {
    this.editing = null;
    this.form.reset({ id_ingrediente: 0, nombre: '', unidad_compra: null, unidad_consumo: null });
    this.modalOpen = true;
  }

  edit(item: Ingrediente): void {
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
    const codigo = isEdit ? SQL_CODES.INGREDIENTES_UPDATE : SQL_CODES.INGREDIENTES_INSERT;
    const data = isEdit
      ? { id_ingrediente: value.id_ingrediente, nombre: value.nombre, unidad_compra: value.unidad_compra, unidad_consumo: value.unidad_consumo }
      : { nombre: value.nombre, unidad_compra: value.unidad_compra, unidad_consumo: value.unidad_consumo };
    const schema = (isEdit
      ? { id_ingrediente: 'N' as const, nombre: 'V' as const, unidad_compra: 'N' as const, unidad_consumo: 'N' as const }
      : { nombre: 'V' as const, unidad_compra: 'N' as const, unidad_consumo: 'N' as const }) as Record<string, ApiParamType>;

    this.api.queryFromRecord(codigo, data, schema).subscribe({
      next: () => {
        this.modalOpen = false;
        this.ui.toast('Ingrediente guardado.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  async remove(item: Ingrediente): Promise<void> {
    const ok = await this.ui.confirm('Eliminar ingrediente', `Desea eliminar ${item.nombre}?`);
    if (!ok) {
      return;
    }

    this.api.queryFromRecord(SQL_CODES.INGREDIENTES_DELETE, { id_ingrediente: item.id_ingrediente }, { id_ingrediente: 'N' }).subscribe({
      next: () => {
        this.ui.toast('Ingrediente eliminado.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }
}
