import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { finalize } from 'rxjs';
import { SQL_CODES } from '../../core/constants/sql-codes';
import { ApiService } from '../../core/services/api.service';
import { UiService } from '../../core/services/ui.service';
import { ImageUrlService } from '../../core/services/image-url.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ApiParamType } from '../../shared/interfaces/dynamic-api.interface';
import { MenuSemanal, Receta } from '../../shared/interfaces/recetas.interface';

interface WeekDay {
  label: string;
  fecha: string;
}

@Component({
  selector: 'app-menu-semanal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './menu-semanal.page.html',
  styleUrls: ['./menu-semanal.page.scss']
})
export class MenuSemanalPage implements OnInit {
  recetas: Receta[] = [];
  programacion: MenuSemanal[] = [];
  days: WeekDay[] = [];
  loading = false;
  saving = false;
  modalOpen = false;
  editing: MenuSemanal | null = null;
  recipeType: 'TODAS' | 'DESAYUNO' | 'ALMUERZO' | 'CENA' = 'TODAS';
  recipeSearch = '';

  readonly filterForm = this.fb.group({
    semana: [this.todayIso(), Validators.required]
  });

  readonly form = this.fb.group({
    id_menu: [0],
    fecha: ['', Validators.required],
    id_receta: [null as number | null, Validators.required],
    cantidad_personas: [1, [Validators.required, Validators.min(0.0001)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly ui: UiService,
    private readonly images: ImageUrlService
  ) {}

  ngOnInit(): void {
    this.buildWeek();
    this.loadRecetas();
    this.load();
  }

  buildWeek(): void {
    const base = new Date(`${this.filterForm.value.semana}T00:00:00`);
    const day = base.getDay() || 7;
    const monday = new Date(base);
    monday.setDate(base.getDate() - day + 1);
    const labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    this.days = labels.map((label, index) => {
      const fecha = new Date(monday);
      fecha.setDate(monday.getDate() + index);
      return { label, fecha: formatDate(fecha, 'yyyy-MM-dd', 'en-US') };
    });
  }

  loadRecetas(): void {
    this.api.query<Receta[]>(SQL_CODES.RECETAS_LIST, '').subscribe({
      next: (items) => this.recetas = items ?? [],
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  load(): void {
    this.buildWeek();
    this.loading = true;
    const inicio = this.days[0]?.fecha ?? this.todayIso();
    const fin = this.days[6]?.fecha ?? this.todayIso();
    this.api.queryFromRecord<MenuSemanal[]>(
      SQL_CODES.MENU_SEMANAL_LIST,
      { fecha_inicio: inicio, fecha_fin: fin },
      { fecha_inicio: 'F', fecha_fin: 'F' }
    )
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (items) => this.programacion = items ?? [],
        error: (error: Error) => this.ui.toast(error.message, 'danger')
      });
  }

  itemsByDay(fecha: string): MenuSemanal[] {
    const order: Record<string, number> = { DESAYUNO: 1, ALMUERZO: 2, CENA: 3 };
    return this.programacion
      .filter((item) => item.fecha?.slice(0, 10) === fecha)
      .sort((a, b) => (order[a.tipo_comida ?? ''] ?? 99) - (order[b.tipo_comida ?? ''] ?? 99));
  }

  recetaName(id: number): string {
    return this.recetas.find((item) => Number(item.id_receta) === Number(id))?.nombre ?? String(id);
  }

  imageUrl(imageUrl?: string | null): string {
    return this.images.resolve(imageUrl);
  }

  get filteredRecipes(): Receta[] {
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const term = normalize(this.recipeSearch.trim());
    return this.recetas.filter((receta) =>
      (this.recipeType === 'TODAS' || receta.tipo_comida === this.recipeType) &&
      (!term || normalize(receta.nombre).includes(term))
    );
  }

  selectRecipe(idReceta: number): void { this.form.controls.id_receta.setValue(idReceta); }

  mealIcon(tipo?: string | null): string {
    return tipo === 'DESAYUNO' ? 'sunny-outline' : tipo === 'ALMUERZO' ? 'restaurant-outline' : 'moon-outline';
  }

  mealLabel(tipo?: string | null): string {
    return tipo ? `${tipo.charAt(0)}${tipo.slice(1).toLowerCase()}` : 'Sin categoría';
  }

  displayDate(fecha: string): string {
    const date = new Date(`${fecha.slice(0, 10)}T00:00:00`);
    return new Intl.DateTimeFormat('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  peopleLabel(cantidad: number | string): string {
    const value = Number(cantidad);
    const formatted = new Intl.NumberFormat('es-GT', { maximumFractionDigits: 4 }).format(value);
    return `${formatted} ${value === 1 ? 'persona' : 'personas'}`;
  }

  create(fecha: string): void {
    this.editing = null;
    this.form.reset({ id_menu: 0, fecha, id_receta: null, cantidad_personas: 1 });
    this.recipeType = 'TODAS'; this.recipeSearch = '';
    this.modalOpen = true;
  }

  edit(item: MenuSemanal): void {
    this.editing = item;
    this.form.reset({
      id_menu: item.id_menu,
      fecha: item.fecha?.slice(0, 10),
      id_receta: item.id_receta,
      cantidad_personas: item.cantidad_personas
    });
    this.recipeType = this.recetas.find((receta) => Number(receta.id_receta) === Number(item.id_receta))?.tipo_comida ?? 'TODAS';
    this.recipeSearch = '';
    this.modalOpen = true;
  }

  save(): void {
    if (this.saving) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const isEdit = !!this.editing;
    const codigo = isEdit ? SQL_CODES.MENU_SEMANAL_UPDATE : SQL_CODES.MENU_SEMANAL_INSERT;
    const data = isEdit
      ? { id_menu: value.id_menu, fecha: value.fecha, id_receta: value.id_receta, cantidad_personas: value.cantidad_personas }
      : { fecha: value.fecha, id_receta: value.id_receta, cantidad_personas: value.cantidad_personas };
    const schema = (isEdit
      ? { id_menu: 'N' as const, fecha: 'F' as const, id_receta: 'N' as const, cantidad_personas: 'N' as const }
      : { fecha: 'F' as const, id_receta: 'N' as const, cantidad_personas: 'N' as const }) as Record<string, ApiParamType>;

    this.saving = true;
    this.api.queryFromRecord(codigo, data, schema).pipe(finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.modalOpen = false;
        this.ui.toast('Programacion guardada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  async remove(item: MenuSemanal): Promise<void> {
    const ok = await this.ui.confirm('Eliminar programacion', `Desea eliminar ${item.receta || this.recetaName(item.id_receta)}?`);
    if (!ok) {
      return;
    }

    this.api.queryFromRecord(SQL_CODES.MENU_SEMANAL_DELETE, { id_menu: item.id_menu }, { id_menu: 'N' }).subscribe({
      next: () => {
        this.ui.toast('Programacion eliminada.', 'success');
        this.load();
      },
      error: (error: Error) => this.ui.toast(error.message, 'danger')
    });
  }

  private todayIso(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }
}
