import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { finalize } from 'rxjs';
import { SQL_CODES } from '../../core/constants/sql-codes';
import { ApiService } from '../../core/services/api.service';
import { UiService } from '../../core/services/ui.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ApiParamType } from '../../shared/interfaces/dynamic-api.interface';
import { Ingrediente, Receta, RecetaIngrediente, UnidadMedida } from '../../shared/interfaces/recetas.interface';

@Component({
  selector: 'app-receta-detalle',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './receta-detalle.page.html',
  styleUrls: ['./receta-detalle.page.scss']
})
export class RecetaDetallePage implements OnInit {
  idReceta = 0;
  receta?: Receta;
  detalle: RecetaIngrediente[] = [];
  ingredientes: Ingrediente[] = [];
  unidades: UnidadMedida[] = [];
  loading = false;
  editing: RecetaIngrediente | null = null;

  readonly form = this.fb.group({
    id_ingrediente: [null as number | null, Validators.required],
    id_unidad: [null as number | null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(0.0001)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly ui: UiService
  ) {}

  ngOnInit(): void {
    this.idReceta = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    this.form.controls.id_ingrediente.valueChanges.subscribe(() => this.syncSelectedUnit());
    this.loadCatalogs();
    this.loadRecipe();
    this.loadDetalle();
  }

  loadCatalogs(): void {
    this.api.query<Ingrediente[]>(SQL_CODES.INGREDIENTES_LIST, '').subscribe({
      next: (items) => this.ingredientes = items ?? [],
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
    this.api.query<UnidadMedida[]>(SQL_CODES.UNIDADES_LIST, '').subscribe({
      next: (items) => this.unidades = items ?? [],
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  loadRecipe(): void {
    this.api.query<Receta[]>(SQL_CODES.RECETAS_LIST, '').subscribe({
      next: (items) => this.receta = (items ?? []).find((item) => Number(item.id_receta) === this.idReceta),
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  loadDetalle(): void {
    this.loading = true;
    this.api.queryFromRecord<RecetaIngrediente[]>(
      SQL_CODES.RECETA_DETALLE_LIST,
      { id_receta: this.idReceta },
      { id_receta: 'N' }
    )
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (items) => this.detalle = items ?? [],
        error: (error: Error) => this.ui.toast(error.message, 'danger')
      });
  }

  ingredientName(id: number): string {
    return this.ingredientes.find((item) => Number(item.id_ingrediente) === Number(id))?.nombre ?? String(id);
  }

  unitName(id: number): string {
    const unit = this.unidades.find((item) => Number(item.id_unidad) === Number(id));
    return unit ? `${unit.nombre} (${unit.abreviatura})` : String(id);
  }

  get unidadesFiltradas(): UnidadMedida[] {
    const idIngrediente = this.form.controls.id_ingrediente.value;
    const ingrediente = this.ingredientes.find((item) => Number(item.id_ingrediente) === Number(idIngrediente));

    if (!ingrediente) {
      return [];
    }

    const ids = new Set([Number(ingrediente.unidad_compra), Number(ingrediente.unidad_consumo)]);
    return this.unidades.filter((unidad) => ids.has(Number(unidad.id_unidad)));
  }

  edit(item: RecetaIngrediente): void {
    this.editing = item;
    this.form.reset({
      id_ingrediente: item.id_ingrediente,
      id_unidad: item.id_unidad,
      cantidad: item.cantidad
    }, { emitEvent: false });
  }

  cancelEdit(): void {
    this.editing = null;
    this.form.reset({ id_ingrediente: null, id_unidad: null, cantidad: 1 });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const data = {
      id_receta: this.idReceta,
      id_ingrediente: Number(value.id_ingrediente),
      id_unidad: Number(value.id_unidad),
      cantidad: Number(value.cantidad)
    };
    const schema = {
      id_receta: 'N' as const,
      id_ingrediente: 'N' as const,
      id_unidad: 'N' as const,
      cantidad: 'N' as const
    } as Record<string, ApiParamType>;

    this.api.queryFromRecord(SQL_CODES.RECETA_DETALLE_SAVE, data, schema).subscribe({
      next: () => {
        this.ui.toast('Detalle guardado.', 'success');
        this.cancelEdit();
        this.loadDetalle();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  async remove(item: RecetaIngrediente): Promise<void> {
    const ok = await this.ui.confirm('Eliminar ingrediente', `Desea eliminar ${item.ingrediente || this.ingredientName(item.id_ingrediente)} de la receta?`);
    if (!ok) {
      return;
    }

    this.api.queryFromRecord(
      SQL_CODES.RECETA_DETALLE_DELETE,
      { id_receta: this.idReceta, id_ingrediente: item.id_ingrediente },
      { id_receta: 'N', id_ingrediente: 'N' }
    ).subscribe({
      next: () => {
        this.ui.toast('Ingrediente eliminado.', 'success');
        this.loadDetalle();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  private syncSelectedUnit(): void {
    const selectedUnit = this.form.controls.id_unidad.value;
    const allowed = this.unidadesFiltradas.some((unidad) => Number(unidad.id_unidad) === Number(selectedUnit));

    if (!allowed) {
      this.form.controls.id_unidad.setValue(null);
    }
  }
}
