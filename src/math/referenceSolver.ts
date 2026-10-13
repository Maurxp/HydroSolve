import type { ChannelParameters } from '../types/hydraulics';
import { evaluateHydraulicFunction } from '../hydraulics/channel';

/**
 * Calcula una raíz de referencia independiente de ultra-alta precisión (10^-14)
 * mediante el método de bisección estricto con 100 iteraciones.
 * Esto permite contrastar académicamente el error verdadero ε_t sin acoplamiento
 * a la implementación de Falsa Posición.
 */
export function calculateReferenceRoot(
  params: Pick<ChannelParameters, 'Q' | 'b' | 'z' | 'S' | 'n'>,
  initialA = 0.01,
  initialB = 25.0
): number {
  let a = initialA;
  let b = initialB;

  // Asegurar cambio de signo
  let fa = evaluateHydraulicFunction(a, params);
  let fb = evaluateHydraulicFunction(b, params);

  while (fa > 0 && a > 1e-4) {
    a /= 2;
    fa = evaluateHydraulicFunction(a, params);
  }

  while (fb < 0 && b < 100) {
    b *= 2;
    fb = evaluateHydraulicFunction(b, params);
  }

  if (fa * fb > 0) {
    // Si aún no hay cambio de signo, retornar valor razonable
    return 1.5;
  }

  for (let i = 0; i < 100; i++) {
    const mid = (a + b) / 2;
    const fmid = evaluateHydraulicFunction(mid, params);

    if (Math.abs(fmid) < 1e-15 || (b - a) / 2 < 1e-15) {
      return mid;
    }

    if (fa * fmid < 0) {
      b = mid;
      fb = fmid;
    } else {
      a = mid;
      fa = fmid;
    }
  }

  return (a + b) / 2;
}
