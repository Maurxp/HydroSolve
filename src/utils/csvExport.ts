import type { NumericalMethodResult } from '../types/numerical';
import type { ChannelParameters } from '../types/hydraulics';

/**
 * Genera el texto CSV con los datos de las iteraciones y parámetros del canal
 */
export function generateIterationsCsv(
  params: ChannelParameters,
  result: NumericalMethodResult
): string {
  const lines: string[] = [];

  // Metadatos y parámetros del problema
  lines.push('--- REPORTE DE SIMULACIÓN NUMÉRICA: HYDROSOLVE ---');
  lines.push(`Método;Falsa Posición (Regula Falsi)`);
  lines.push(`Fecha;${new Date().toLocaleString('es-ES')}`);
  lines.push(`Caudal de diseño Q (m3/s);${params.Q}`);
  lines.push(`Ancho de fondo b (m);${params.b}`);
  lines.push(`Talud lateral z (H:1V);${params.z}`);
  lines.push(`Pendiente longitudinal S (m/m);${params.S}`);
  lines.push(`Coeficiente de Manning n;${params.n}`);
  lines.push(`Intervalo inicial;[${params.a}, ${params.b0}]`);
  lines.push(`Tolerancia de error relativo (%);${params.tolerance}%`);
  lines.push(`Estado final;${result.statusMessage}`);
  lines.push(`Tirante normal calculado yn (m);${result.root.toFixed(6)}`);
  lines.push(`Residuo final f(yn) (m3/s);${result.finalResidual.toExponential(6)}`);
  lines.push(`Solución de referencia y_ref (m);${result.referenceRoot.toFixed(8)}`);
  lines.push('');

  // Encabezados de la tabla de iteraciones
  lines.push(
    [
      'Iteracion',
      'a (m)',
      'b (m)',
      'f(a) (m3/s)',
      'f(b) (m3/s)',
      'xr (m)',
      'f(xr) (m3/s)',
      'Error Relativo Aprox ea (%)',
      'Error Absoluto Paso (m)',
      'Error Verdadero et (%)',
      'Nuevo Limite Reemplazado',
      'Nuevo Intervalo',
    ].join(';')
  );

  // Filas de iteraciones
  for (const it of result.iterations) {
    const row = [
      it.iteration,
      it.a.toFixed(6),
      it.b.toFixed(6),
      it.fa.toFixed(6),
      it.fb.toFixed(6),
      it.xr.toFixed(6),
      it.fxr.toExponential(6),
      it.approxRelativeError !== null ? it.approxRelativeError.toFixed(6) : 'N/A',
      it.absoluteStepError !== null ? it.absoluteStepError.toFixed(6) : 'N/A',
      it.trueRelativeError !== null ? it.trueRelativeError.toFixed(6) : 'N/A',
      it.nextInterval.replacedBound === 'exact_root'
        ? 'Raiz exacta'
        : it.nextInterval.replacedBound === 'a'
        ? 'Extremo inferior a'
        : 'Extremo superior b',
      `[${it.nextInterval.a.toFixed(5)}, ${it.nextInterval.b.toFixed(5)}]`,
    ];
    lines.push(row.join(';'));
  }

  return lines.join('\r\n');
}

/**
 * Descarga el archivo CSV en el navegador del usuario
 */
export function downloadCsvFile(content: string, filename = 'HydroSolve_Iteraciones.csv'): void {
  // BOM UTF-8 (\uFEFF) para garantizar correcta visualización de tildes y caracteres en Excel
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
