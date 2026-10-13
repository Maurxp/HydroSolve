/**
 * Formatea un número decimal con un número fijo de decimales
 */
export function formatNumber(val: number | null | undefined, decimals = 4): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea valores científicos o muy pequeños con notación exponencial si es necesario
 */
export function formatScientific(val: number | null | undefined, precision = 4): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (Math.abs(val) < 1e-4 && val !== 0) {
    return val.toExponential(precision).replace('e', ' × 10^');
  }
  return formatNumber(val, precision);
}

/**
 * Formatea un porcentaje con símbolo
 */
export function formatPercent(val: number | null | undefined, decimals = 4): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return `${formatNumber(val, decimals)} %`;
}

/**
 * Formatea un valor con su respectiva unidad de ingeniería civil
 */
export function formatWithUnit(val: number | null | undefined, unit: string, decimals = 3): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return `${formatNumber(val, decimals)} ${unit}`;
}
