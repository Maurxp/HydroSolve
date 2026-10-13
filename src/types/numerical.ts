/**
 * Información detallada de una iteración del método de Falsa Posición (Regula Falsi)
 */
export interface IterationData {
  /** Número de iteración (1, 2, 3, ...) */
  iteration: number;
  /** Extremo inferior del intervalo a (m) */
  a: number;
  /** Extremo superior del intervalo b (m) */
  b: number;
  /** Valor de f(a) (m³/s) */
  fa: number;
  /** Valor de f(b) (m³/s) */
  fb: number;
  /** Nueva aproximación calculada de la raíz xr (m) */
  xr: number;
  /** Residuo de la función f(xr) (m³/s) */
  fxr: number;
  /** Nuevo intervalo para la siguiente iteración */
  nextInterval: {
    a: number;
    b: number;
    replacedBound: 'a' | 'b' | 'exact_root';
  };
  /** Error relativo aproximado porcentual ε_a (%), null en la primera iteración */
  approxRelativeError: number | null;
  /** Diferencia absoluta entre aproximaciones consecutivas |xr_i - xr_{i-1}| (m) */
  absoluteStepError: number | null;
  /** Error relativo verdadero respecto a la solución de referencia ε_t (%) */
  trueRelativeError: number | null;
  /** Indica si esta iteración cumplió el criterio de tolerancia */
  isConverged: boolean;
  /** Justificación textual de la actualización del intervalo */
  intervalUpdateReason: string;
}

/**
 * Estado general de la ejecución del algoritmo numérico
 */
export type ConvergenceStatus =
  | 'CONVERGED_TOLERANCE'
  | 'CONVERGED_EXACT_ROOT'
  | 'MAX_ITERATIONS_REACHED'
  | 'NO_SIGN_CHANGE'
  | 'INVALID_PARAMETERS';

/**
 * Resultado completo del cálculo del método numérico
 */
export interface NumericalMethodResult {
  /** Historial completo de iteraciones */
  iterations: IterationData[];
  /** Raíz final aproximada y_n (m) */
  root: number;
  /** Estado final de convergencia */
  status: ConvergenceStatus;
  /** Mensaje descriptivo del resultado */
  statusMessage: string;
  /** Número total de iteraciones ejecutadas */
  totalIterations: number;
  /** Error relativo aproximado final (%) */
  finalRelativeError: number | null;
  /** Residuo final f(xr) (m³/s) */
  finalResidual: number;
  /** Solución de referencia calculada de forma independiente a alta precisión (m) */
  referenceRoot: number;
  /** Error relativo verdadero final respecto a la referencia (%) */
  finalTrueError: number;
  /** Tiempo de ejecución computacional (ms) */
  executionTimeMs: number;
}

/**
 * Resultado comparativo entre múltiples métodos numéricos
 */
export interface ComparisonResult {
  methodName: 'Falsa Posición' | 'Bisección' | 'Newton-Raphson';
  root: number;
  iterationsCount: number;
  finalResidual: number;
  finalRelativeError: number | null;
  finalTrueError: number;
  converged: boolean;
  notes: string;
  history: Array<{
    iteration: number;
    estimate: number;
    residual: number;
    approxError: number | null;
  }>;
}
