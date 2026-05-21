import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiParamType, DynamicApiRequest, MasterDetailRequest } from '../../shared/interfaces/dynamic-api.interface';
import { ParamBuilder } from '../../shared/utils/param-builder';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly url = environment.apiUrl;
  private readonly idapp = environment.idapp;

  constructor(private readonly http: HttpClient) {}

  query<T>(codigoSQL: number, parametro = ''): Observable<T> {
    return this.http.post<T>(`${this.url}getapi`, { idapp: this.idapp, codigoSQL, parametro } as DynamicApiRequest)
      .pipe(catchError((error) => throwError(() => this.toMessage(error))));
  }

  queryFromRecord<T>(
    codigoSQL: number,
    data: Record<string, unknown>,
    schema: Record<string, ApiParamType>
  ): Observable<T> {
    return this.query<T>(codigoSQL, ParamBuilder.fromRecord(data, schema));
  }

  saveMasterDetail<T, H>(codigoSQL: number, encabezado: H): Observable<T> {
    return this.http.post<T>(`${this.url}getapiMulti`, { idapp: this.idapp, codigoSQL, encabezado } as MasterDetailRequest<H>)
      .pipe(catchError((error) => throwError(() => this.toMessage(error))));
  }

  private toMessage(error: unknown): Error {
    const err = error as { error?: { message?: string }, message?: string };
    return new Error(err.error?.message ?? err.message ?? 'No fue posible completar la operacion');
  }
}
