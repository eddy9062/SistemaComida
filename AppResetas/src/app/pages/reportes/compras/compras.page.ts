import { CommonModule, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { finalize } from 'rxjs';
import { SQL_CODES } from '../../../core/constants/sql-codes';
import { ApiService } from '../../../core/services/api.service';
import { UiService } from '../../../core/services/ui.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ReporteCompra } from '../../../shared/interfaces/recetas.interface';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './compras.page.html',
  styleUrls: ['./compras.page.scss']
})
export class ComprasPage {
  rows: ReporteCompra[] = [];
  generated = false;
  loading = false;

  readonly form = this.fb.group({
    fecha_inicio: [this.todayIso(), Validators.required],
    fecha_fin: [this.todayIso(), Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly ui: UiService
  ) {}

  generar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.loading = true;
    this.api.queryFromRecord<ReporteCompra[]>(
      SQL_CODES.REPORTE_COMPRAS,
      { fecha_inicio: value.fecha_inicio, fecha_fin: value.fecha_fin },
      { fecha_inicio: 'F', fecha_fin: 'F' }
    )
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (rows) => {
          this.rows = rows ?? [];
          this.generated = true;
        },
        error: (error: Error) => this.ui.toast(error.message, 'danger')
      });
  }

  imprimir(): void {
    window.print();
  }

  exportar(): void {
    const header = 'ingrediente,unidad_compra,cantidad_total';
    const body = this.rows
      .map((row) => [row.ingrediente, row.unidad_compra, row.cantidad_total].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-compras-${this.form.value.fecha_inicio}-${this.form.value.fecha_fin}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private todayIso(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }
}