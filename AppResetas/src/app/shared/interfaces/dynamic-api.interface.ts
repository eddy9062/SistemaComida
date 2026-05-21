export type ApiParamType = 'N' | 'V' | 'F' | 'B';

export interface DynamicApiRequest {
  idapp: number;
  codigoSQL: number;
  parametro?: string;
}

export interface MasterDetailRequest<THeader = unknown> {
  idapp: number;
  codigoSQL: number;
  encabezado: THeader;
}
