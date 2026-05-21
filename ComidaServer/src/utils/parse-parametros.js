export const parseParametros = (paramString = '') => {
  if (!paramString) return [];

  return paramString
    .split('|')
    .filter((pair) => pair.length > 0)
    .map((pair) => {
      const type = pair.charAt(0);
      let value = pair.substring(1).trim();

      if (type === 'N') {
        if (value.toLowerCase() === 'null' || value === '') return 0;
        if (!/^\d+(\.\d+)?$/.test(value)) {
          throw new Error(`Parametro numerico invalido: ${pair}`);
        }
        return Number(value);
      }

      if (type === 'V') {
        if (value.toLowerCase() === 'null' || value === '') return null;
        return value;
      }

      if (type === 'F') {
        if (value.toLowerCase() === 'null' || value === '') return null;
        if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
          throw new Error(`Parametro fecha invalido: ${pair}`);
        }
        return value;
      }

      if (type === 'B') {
        if (value.toLowerCase() === 'null' || value === '') return false;
        return ['true', '1', 's', 'si', 'y'].includes(value.toLowerCase());
      }

      throw new Error(`Tipo de parametro desconocido: ${type}`);
    });
};
