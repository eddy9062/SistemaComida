export interface AuthSession {
  token: string;
  usuario: string;
  empresa?: number | string;
  cod_empresa?: number | string;
  sucursal?: number | string;
  rol?: string;
  expiresAt?: number;
  raw?: unknown;
}

export interface LoginRequest {
  usuario: string;
  password: string;
}