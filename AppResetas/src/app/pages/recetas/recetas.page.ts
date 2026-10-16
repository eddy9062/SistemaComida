import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { finalize, of, switchMap } from 'rxjs';
import { SQL_CODES } from '../../core/constants/sql-codes';
import { ApiService } from '../../core/services/api.service';
import { ImageUrlService } from '../../core/services/image-url.service';
import { UiService } from '../../core/services/ui.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ApiParamType } from '../../shared/interfaces/dynamic-api.interface';
import { Receta, RecetaIngrediente, TipoComida } from '../../shared/interfaces/recetas.interface';

@Component({ selector: 'app-recetas', standalone: true, imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, RouterLink, EmptyStateComponent], templateUrl: './recetas.page.html', styleUrls: ['./recetas.page.scss'] })
export class RecetasPage implements OnInit {
  items: Receta[] = []; detalle: RecetaIngrediente[] = []; search = ''; selectedType: TipoComida | 'TODAS' = 'TODAS'; loading = false; formLoading = false; modalOpen = false; editing: Receta | null = null; selectedImage?: File; imagePreview = ''; uploading = false; saving = false;
  readonly types: TipoComida[] = ['DESAYUNO', 'ALMUERZO', 'CENA']; readonly placeholder = 'assets/recipe-placeholder.svg';
  readonly form = this.fb.group({ id_receta: [0], nombre: ['', Validators.required], descripcion: [''], tipo_comida: [null as TipoComida | null, Validators.required], porciones: [1, [Validators.required, Validators.min(0.0001)]], tiempo_preparacion: [null as number | null, Validators.min(0)], calorias_estimadas: [null as number | null, Validators.min(0)], instrucciones: ['', Validators.maxLength(10000)], imagen_url: [''] });
  constructor(private readonly fb: FormBuilder, private readonly api: ApiService, private readonly ui: UiService, private readonly images: ImageUrlService, private readonly router: Router) {}
  ngOnInit(): void { this.load(); }
  get filtered(): Receta[] { const term = this.search.trim().toLowerCase(); return this.items.filter(i => (this.selectedType === 'TODAS' || i.tipo_comida === this.selectedType) && (!term || [i.nombre, i.descripcion, i.tipo_comida].some(v => String(v ?? '').toLowerCase().includes(term)))); }
  load(): void { this.loading = true; this.api.query<Receta[]>(SQL_CODES.RECETAS_LIST, '').pipe(finalize(() => this.loading = false)).subscribe({ next: i => this.items = i ?? [], error: (e: Error) => this.ui.toast(e.message, 'danger') }); }
  create(): void { this.editing = null; this.detalle = []; this.selectedImage = undefined; this.imagePreview = ''; this.form.reset({ id_receta: 0, nombre: '', descripcion: '', tipo_comida: null, porciones: 1, tiempo_preparacion: null, calorias_estimadas: null, instrucciones: '', imagen_url: '' }); this.form.markAsPristine(); this.modalOpen = true; }
  edit(item: Receta): void { this.editing = item; this.selectedImage = undefined; this.imagePreview = this.images.resolve(item.imagen_url); this.form.reset(item); this.form.markAsPristine(); this.modalOpen = true; this.formLoading = true; this.api.queryFromRecord<RecetaIngrediente[]>(SQL_CODES.RECETA_DETALLE_LIST, { id_receta: item.id_receta }, { id_receta: 'N' }).pipe(finalize(() => this.formLoading = false)).subscribe({ next: i => this.detalle = i ?? [], error: (e: Error) => this.ui.toast(e.message, 'danger') }); }
  imageUrl(url?: string | null): string { return this.images.resolve(url); }
  onImageSelected(event: Event): void { const image = (event.target as HTMLInputElement).files?.[0]; if (!image) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 5 * 1024 * 1024) { this.ui.toast('Seleccione una imagen JPEG, PNG o WebP de hasta 5 MB.', 'danger'); return; } this.selectedImage = image; const reader = new FileReader(); reader.onload = () => this.imagePreview = String(reader.result); reader.readAsDataURL(image); }
  async removeImage(): Promise<void> { if (!this.editing) { this.selectedImage = undefined; this.imagePreview = ''; return; } if (!await this.ui.confirm('Eliminar imagen', '¿Desea eliminar la imagen de esta receta?')) return; this.uploading = true; this.api.deleteRecipeImage(this.editing.id_receta).pipe(finalize(() => this.uploading = false)).subscribe({ next: () => { this.imagePreview = ''; this.form.controls.imagen_url.setValue(''); this.load(); }, error: (e: Error) => this.ui.toast(e.message, 'danger') }); }
  save(): void { if (this.saving || this.form.invalid) { this.form.markAllAsTouched(); return; } const value = this.form.getRawValue(); const edit = !!this.editing; const schema = { ...(edit ? { id_receta: 'N' as const } : {}), nombre: 'V' as const, descripcion: 'V' as const, tipo_comida: 'V' as const, porciones: 'N' as const, tiempo_preparacion: 'N' as const, calorias_estimadas: 'N' as const, instrucciones: 'V' as const, imagen_url: 'V' as const } as Record<string, ApiParamType>; this.saving = true; this.uploading = !!this.selectedImage;
    this.api.queryFromRecord<unknown>(edit ? SQL_CODES.RECETAS_UPDATE : SQL_CODES.RECETAS_INSERT, value as Record<string, unknown>, schema).pipe(switchMap(result => { const id = Number((Array.isArray(result) ? result[0] : result as { id_receta?: number })?.id_receta); if (!id) throw new Error('La receta no fue encontrada al guardar los cambios.'); return this.selectedImage ? this.api.uploadRecipeImage(id, this.selectedImage) : of(null); }), finalize(() => { this.saving = false; this.uploading = false; })).subscribe({ next: () => { this.modalOpen = false; this.ui.toast(edit ? 'Cambios guardados.' : 'Receta guardada.', 'success'); this.load(); }, error: (e: Error) => this.ui.toast(e.message, 'danger') }); }
  async closeModal(): Promise<void> { if (this.saving) return; if (this.form.dirty && !await this.ui.confirm('Descartar cambios', 'Hay cambios sin guardar. ¿Desea salir?')) return; this.modalOpen = false; }
  manageIngredients(): void { if (!this.editing) return; this.modalOpen = false; this.router.navigate(['/recetas', this.editing.id_receta, 'detalle']); }
  async remove(item: Receta): Promise<void> { if (!await this.ui.confirm('Eliminar receta', `Desea eliminar ${item.nombre}?`)) return; this.api.queryFromRecord(SQL_CODES.RECETAS_DELETE, { id_receta: item.id_receta }, { id_receta: 'N' }).subscribe({ next: () => { this.ui.toast('Receta eliminada.', 'success'); this.load(); }, error: (e: Error) => this.ui.toast(e.message, 'danger') }); }
}
