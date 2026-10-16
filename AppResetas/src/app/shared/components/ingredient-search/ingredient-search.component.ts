import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonInput, IonicModule } from '@ionic/angular';
import { Ingrediente } from '../../interfaces/recetas.interface';

@Component({
  selector: 'app-ingredient-search',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './ingredient-search.component.html',
  styleUrls: ['./ingredient-search.component.scss']
})
export class IngredientSearchComponent implements OnChanges {
  @Input() ingredientes: Ingrediente[] = [];
  @Input() selectedId: number | null = null;
  @Output() selectedIdChange = new EventEmitter<number | null>();
  @ViewChild('searchInput') searchInput?: IonInput;

  query = '';
  dropdownOpen = false;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedId'] || changes['ingredientes']) {
      const selected = this.ingredientes.find((item) => Number(item.id_ingrediente) === Number(this.selectedId));
      this.query = selected?.nombre ?? '';
      this.dropdownOpen = false;
    }
  }

  get matches(): Ingrediente[] {
    const term = this.normalize(this.query);
    if (!term) {
      return [];
    }
    return this.ingredientes.filter((item) => this.normalize(item.nombre).includes(term)).slice(0, 20);
  }

  select(ingrediente: Ingrediente): void {
    this.query = ingrediente.nombre;
    this.dropdownOpen = false;
    this.selectedIdChange.emit(ingrediente.id_ingrediente);
  }

  clear(): void {
    this.query = '';
    this.dropdownOpen = false;
    this.selectedIdChange.emit(null);
    setTimeout(() => this.searchInput?.setFocus());
  }

  onQueryChange(): void {
    this.dropdownOpen = !!this.query.trim();
  }

  @HostListener('document:pointerdown', ['$event'])
  closeOnOutsideClick(event: PointerEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.dropdownOpen = false;
    }
  }

  private normalize(value: string): string {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
