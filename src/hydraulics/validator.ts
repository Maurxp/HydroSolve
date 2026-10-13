import type { ChannelParameters, ParameterValidationError } from '../types/hydraulics';
import { evaluateHydraulicFunction } from './channel';

export interface ValidationResult {
  isValid: boolean;
  errors: ParameterValidationError[];
  hasSignChange: boolean;
  fa: number;
  fb: number;
  bracketWarning?: string;
  suggestedBracket?: { a: number; b0: number };
}

/**
 * Valida los parámetros físicos e hidráulicos de entrada
 */
export function validateParameters(params: ChannelParameters): ValidationResult {
  const errors: ParameterValidationError[] = [];

  if (isNaN(params.Q) || params.Q <= 0) {
    errors.push({ field: 'Q', message: 'El caudal de diseño Q debe ser un número positivo (m³/s).' });
  }

  if (isNaN(params.b) || params.b <= 0) {
    errors.push({ field: 'b', message: 'El ancho del fondo b debe ser mayor a cero (m).' });
  }

  if (isNaN(params.z) || params.z < 0) {
    errors.push({ field: 'z', message: 'El talud lateral z no puede ser negativo (z ≥ 0).' });
  }

  if (isNaN(params.S) || params.S <= 0) {
    errors.push({ field: 'S', message: 'La pendiente longitudinal S debe ser estrictamente positiva (m/m).' });
  }

  if (isNaN(params.n) || params.n <= 0) {
    errors.push({ field: 'n', message: 'El coeficiente de rugosidad de Manning n debe ser positivo (ej. 0.010 - 0.080).' });
  }

  if (isNaN(params.a) || params.a <= 0) {
    errors.push({ field: 'a', message: 'El extremo inferior inicial a debe ser estrictamente positivo (a > 0 m).' });
  }

  if (isNaN(params.b0) || params.b0 <= 0) {
    errors.push({ field: 'b0', message: 'El extremo superior inicial b₀ debe ser estrictamente positivo (b₀ > 0 m).' });
  }

  if (params.a >= params.b0) {
    errors.push({ field: 'b0', message: 'El extremo superior b₀ debe ser estrictamente mayor que el inferior a (a < b₀).' });
  }

  if (isNaN(params.tolerance) || params.tolerance <= 0) {
    errors.push({ field: 'tolerance', message: 'La tolerancia ε debe ser un porcentaje positivo mayor que cero (%).' });
  }

  if (isNaN(params.maxIterations) || params.maxIterations < 1 || !Number.isInteger(params.maxIterations)) {
    errors.push({ field: 'maxIterations', message: 'El número máximo de iteraciones debe ser un entero ≥ 1.' });
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      hasSignChange: false,
      fa: 0,
      fb: 0,
    };
  }

  // Evaluar cambio de signo de la función f(y)
  const fa = evaluateHydraulicFunction(params.a, params);
  const fb = evaluateHydraulicFunction(params.b0, params);
  const hasSignChange = fa * fb < 0;

  let bracketWarning: string | undefined;
  let suggestedBracket: { a: number; b0: number } | undefined;

  if (!hasSignChange) {
    if (fa === 0) {
      bracketWarning = `El extremo inferior a = ${params.a} m ya es una raíz exacta de la función (f(a) = 0).`;
    } else if (fb === 0) {
      bracketWarning = `El extremo superior b₀ = ${params.b0} m ya es una raíz exacta de la función (f(b₀) = 0).`;
    } else if (fa < 0 && fb < 0) {
      bracketWarning = `No existe cambio de signo: f(a) = ${fa.toFixed(4)} y f(b₀) = ${fb.toFixed(4)} son ambos negativos. El caudal conducido es menor a ${params.Q} m³/s en todo el intervalo. Se debe aumentar el extremo superior b₀.`;
    } else {
      bracketWarning = `No existe cambio de signo: f(a) = ${fa.toFixed(4)} y f(b₀) = ${fb.toFixed(4)} son ambos positivos. El caudal conducido supera a ${params.Q} m³/s en todo el intervalo. Se debe disminuir el extremo inferior a.`;
    }

    // Algoritmo de acotamiento automático sugerido
    suggestedBracket = findBracketingInterval(params);
  }

  return {
    isValid: true,
    errors: [],
    hasSignChange,
    fa,
    fb,
    bracketWarning,
    suggestedBracket,
  };
}

/**
 * Encuentra automáticamente un intervalo válido [a_sug, b_sug] donde f(a)*f(b) < 0
 */
export function findBracketingInterval(
  params: Pick<ChannelParameters, 'Q' | 'b' | 'z' | 'S' | 'n'>
): { a: number; b0: number } {
  let low = 0.1;
  let high = 1.0;
  let step = 0.5;

  // Buscar cota inferior donde f(low) < 0
  while (evaluateHydraulicFunction(low, params) > 0 && low > 0.001) {
    low /= 2;
  }

  // Buscar cota superior donde f(high) > 0
  while (evaluateHydraulicFunction(high, params) < 0 && high < 50) {
    high += step;
    step *= 1.5;
  }

  return {
    a: Math.max(0.05, Number(low.toFixed(2))),
    b0: Number((high * 1.1).toFixed(2)),
  };
}
