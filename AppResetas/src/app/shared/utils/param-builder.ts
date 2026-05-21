import { ApiParamType } from '../interfaces/dynamic-api.interface';

export interface ParamValue {
  type: ApiParamType;
  value: unknown;
}

export class ParamBuilder {
  static build(values: ParamValue[]): string {
    return values.map(({ type, value }) => `${type}${this.format(value)}`).join('|');
  }

  static fromRecord(record: Record<string, unknown>, schema: Record<string, ApiParamType>): string {
    return Object.keys(schema).map((key) => `${schema[key]}${this.format(record[key])}`).join('|');
  }

  private static format(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'boolean') {
      return value ? 'S' : 'N';
    }

    return String(value).trim();
  }
}