export interface UnidadMedida {
  id_unidad: number;
  nombre: string;
  abreviatura: string;
}

export interface ConversionUnidad {
  id_conversion: number;
  unidad_origen: number;
  unidad_destino: number;
  factor: number;
  unidad_origen_nombre?: string;
  unidad_destino_nombre?: string;
}

export interface Ingrediente {
  id_ingrediente: number;
  nombre: string;
  unidad_compra: number;
  unidad_consumo: number;
  unidad_compra_nombre?: string;
  unidad_consumo_nombre?: string;
}

export interface Receta {
  id_receta: number;
  nombre: string;
  descripcion?: string;
  porciones: number;
  imagen_url?: string;
}

export interface RecetaIngrediente {
  id_receta: number;
  id_ingrediente: number;
  id_unidad: number;
  cantidad: number;
  ingrediente?: string;
  unidad?: string;
}

export interface MenuSemanal {
  id_menu: number;
  fecha: string;
  id_receta: number;
  cantidad_personas: number;
  receta?: string;
}

export interface ReporteCompra {
  ingrediente: string;
  unidad_compra: string;
  cantidad_total: number;
}