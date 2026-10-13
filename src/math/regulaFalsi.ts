import type { ChannelParameters } from '../types/hydraulics';
import type { IterationData, NumericalMethodResult, ConvergenceStatus } from '../types/numerical';
import { evaluateHydraulicFunction } from '../hydraulics/channel';
import { calculateReferenceRoot } from './referenceSolver';

/**
 * Ejecuta el método de Falsa Posición (Regula Falsi) paso a paso
 * para encontrar el tirante normal yn que satisface f(y) = 0.
 */
export function solveRegulaFalsi(params: ChannelParameters): NumericalMethodResult {
  const startTime = performance.now();
  const iterations: IterationData[] = [];

  // Calcular solución de referencia independiente para contrastar error verdadero
  const referenceRoot = calculateReferenceRoot(params, params.a, params.b0);

  let a = params.a;
  let b = params.b0;

  let fa = evaluateHydraulicFunction(a, params);
  let fb = evaluateHydraulicFunction(b, params);

  // Verificación de cambio de signo en el intervalo inicial
  if (fa * fb > 0) {
    const elapsed = performance.now() - startTime;
    return {
      iterations: [],
      root: a,
      status: 'NO_SIGN_CHANGE',
      statusMessage: `No existe cambio de signo en el intervalo inicial [${a}, ${b}]. f(a) = ${fa.toFixed(4)}, f(b₀) = ${fb.toFixed(4)}. El método requiere f(a)·f(b₀) < 0.`,
      totalIterations: 0,
      finalRelativeError: null,
      finalResidual: Math.min(Math.abs(fa), Math.abs(fb)),
      referenceRoot,
      finalTrueError: Math.abs((referenceRoot - a) / referenceRoot) * 100,
      executionTimeMs: elapsed,
    };
  }

  // Verificar si alguno de los extremos ya es una raíz exacta
  if (Math.abs(fa) < 1e-12) {
    const elapsed = performance.now() - startTime;
    const iterData: IterationData = {
      iteration: 1,
      a,
      b,
      fa,
      fb,
      xr: a,
      fxr: fa,
      nextInterval: { a, b, replacedBound: 'exact_root' },
      approxRelativeError: null,
      absoluteStepError: null,
      trueRelativeError: Math.abs((referenceRoot - a) / referenceRoot) * 100,
      isConverged: true,
      intervalUpdateReason: 'El extremo inferior ya es raíz exacta (f(a) = 0).',
    };
    return {
      iterations: [iterData],
      root: a,
      status: 'CONVERGED_EXACT_ROOT',
      statusMessage: `Raíz exacta encontrada en el extremo inferior a = ${a.toFixed(6)} m.`,
      totalIterations: 1,
      finalRelativeError: 0,
      finalResidual: fa,
      referenceRoot,
      finalTrueError: iterData.trueRelativeError!,
      executionTimeMs: elapsed,
    };
  }

  if (Math.abs(fb) < 1e-12) {
    const elapsed = performance.now() - startTime;
    const iterData: IterationData = {
      iteration: 1,
      a,
      b,
      fa,
      fb,
      xr: b,
      fxr: fb,
      nextInterval: { a, b, replacedBound: 'exact_root' },
      approxRelativeError: null,
      absoluteStepError: null,
      trueRelativeError: Math.abs((referenceRoot - b) / referenceRoot) * 100,
      isConverged: true,
      intervalUpdateReason: 'El extremo superior ya es raíz exacta (f(b) = 0).',
    };
    return {
      iterations: [iterData],
      root: b,
      status: 'CONVERGED_EXACT_ROOT',
      statusMessage: `Raíz exacta encontrada en el extremo superior b₀ = ${b.toFixed(6)} m.`,
      totalIterations: 1,
      finalRelativeError: 0,
      finalResidual: fb,
      referenceRoot,
      finalTrueError: iterData.trueRelativeError!,
      executionTimeMs: elapsed,
    };
  }

  let prevXr: number | null = null;
  let status: ConvergenceStatus = 'MAX_ITERATIONS_REACHED';
  let statusMessage = `Se alcanzó el número máximo de ${params.maxIterations} iteraciones sin llegar a la tolerancia establecida.`;

  for (let i = 1; i <= params.maxIterations; i++) {
    // Evaluación en los extremos actuales
    fa = evaluateHydraulicFunction(a, params);
    fb = evaluateHydraulicFunction(b, params);

    const denom = fa - fb;
    if (Math.abs(denom) < 1e-18) {
      status = 'INVALID_PARAMETERS';
      statusMessage = 'División por cero detectada: f(a) y f(b) son numéricamente idénticos.';
      break;
    }

    // Fórmula canónica de Falsa Posición (Regula Falsi):
    // xr = b - (fb * (a - b)) / (fa - fb)
    const xr = b - (fb * (a - b)) / denom;
    const fxr = evaluateHydraulicFunction(xr, params);

    // Error relativo aproximado porcentual ε_a:
    // Para i = 1 es null (no disponible), para i > 1 es |(xr_i - xr_{i-1}) / xr_i| * 100%
    let approxRelativeError: number | null = null;
    let absoluteStepError: number | null = null;

    if (prevXr !== null) {
      absoluteStepError = Math.abs(xr - prevXr);
      approxRelativeError = Math.abs(xr - prevXr) / Math.abs(xr) * 100;
    }

    // Error relativo verdadero respecto a la solución independiente
    const trueRelativeError = Math.abs((referenceRoot - xr) / referenceRoot) * 100;

    // Criterios de convergencia
    const isExactRoot = Math.abs(fxr) < 1e-12;
    const isToleranceMet =
      approxRelativeError !== null && approxRelativeError <= params.tolerance;

    const isConverged = isExactRoot || isToleranceMet;

    // Actualización del intervalo para el siguiente paso
    let nextA = a;
    let nextB = b;
    let replacedBound: 'a' | 'b' | 'exact_root' = 'exact_root';
    let intervalUpdateReason = '';

    if (isExactRoot) {
      replacedBound = 'exact_root';
      intervalUpdateReason = `f(x_r) ≈ 0 (${fxr.toExponential(3)} m³/s). Se ha alcanzado la raíz dentro de la precisión numérica del computador.`;
    } else if (fa * fxr < 0) {
      nextB = xr;
      replacedBound = 'b';
      intervalUpdateReason = `f(a)·f(x_r) = (${fa.toFixed(4)})·(${fxr.toFixed(4)}) < 0. La raíz se ubica en [${a.toFixed(5)}, ${xr.toFixed(5)}]. Se actualiza el extremo superior: b = x_r.`;
    } else {
      nextA = xr;
      replacedBound = 'a';
      intervalUpdateReason = `f(b)·f(x_r) = (${fb.toFixed(4)})·(${fxr.toFixed(4)}) < 0. La raíz se ubica en [${xr.toFixed(5)}, ${b.toFixed(5)}]. Se actualiza el extremo inferior: a = x_r.`;
    }

    iterations.push({
      iteration: i,
      a,
      b,
      fa,
      fb,
      xr,
      fxr,
      nextInterval: {
        a: nextA,
        b: nextB,
        replacedBound,
      },
      approxRelativeError,
      absoluteStepError,
      trueRelativeError,
      isConverged,
      intervalUpdateReason,
    });

    if (isExactRoot) {
      status = 'CONVERGED_EXACT_ROOT';
      statusMessage = `Convergencia exitosa: residuo nulo f(x_r) ≈ 0 m³/s alcanzado en la iteración ${i}.`;
      break;
    }

    if (isToleranceMet) {
      status = 'CONVERGED_TOLERANCE';
      const errStr = approxRelativeError !== null ? approxRelativeError.toFixed(5) : '0';
      statusMessage = `Convergencia exitosa: error relativo aproximado (${errStr}%) menor o igual a la tolerancia (${params.tolerance}%) en la iteración ${i}.`;
      break;
    }

    // Avanzar variables de estado para la siguiente iteración
    prevXr = xr;
    a = nextA;
    b = nextB;
  }

  const lastIteration = iterations[iterations.length - 1];
  const finalRoot = lastIteration ? lastIteration.xr : a;
  const finalResidual = lastIteration ? lastIteration.fxr : fa;
  const finalRelativeError = lastIteration ? lastIteration.approxRelativeError : null;
  const finalTrueError = lastIteration ? lastIteration.trueRelativeError! : 0;
  const elapsed = performance.now() - startTime;

  return {
    iterations,
    root: finalRoot,
    status,
    statusMessage,
    totalIterations: iterations.length,
    finalRelativeError,
    finalResidual,
    referenceRoot,
    finalTrueError,
    executionTimeMs: elapsed,
  };
}
