import type { ChannelParameters } from '../types/hydraulics';
import type { ComparisonResult } from '../types/numerical';
import { evaluateHydraulicFunction } from '../hydraulics/channel';
import { calculateReferenceRoot } from './referenceSolver';

/**
 * Método de Bisección estándar para comparación
 */
export function solveBisection(params: ChannelParameters): ComparisonResult {
  const referenceRoot = calculateReferenceRoot(params, params.a, params.b0);
  let a = params.a;
  let b = params.b0;
  let prevXm: number | null = null;
  const history: ComparisonResult['history'] = [];

  let fa = evaluateHydraulicFunction(a, params);
  let fb = evaluateHydraulicFunction(b, params);

  if (fa * fb > 0) {
    return {
      methodName: 'Bisección',
      root: a,
      iterationsCount: 0,
      finalResidual: fa,
      finalRelativeError: null,
      finalTrueError: Math.abs((referenceRoot - a) / referenceRoot) * 100,
      converged: false,
      notes: 'No hay cambio de signo en el intervalo inicial.',
      history: [],
    };
  }

  let finalXm = a;
  let finalResidual = fa;
  let finalApproxError: number | null = null;
  let converged = false;

  for (let i = 1; i <= params.maxIterations; i++) {
    const xm = (a + b) / 2;
    const fxm = evaluateHydraulicFunction(xm, params);

    let approxError: number | null = null;
    if (prevXm !== null) {
      approxError = Math.abs((xm - prevXm) / xm) * 100;
    }

    history.push({
      iteration: i,
      estimate: xm,
      residual: fxm,
      approxError,
    });

    finalXm = xm;
    finalResidual = fxm;
    finalApproxError = approxError;

    if (Math.abs(fxm) < 1e-12 || (approxError !== null && approxError <= params.tolerance)) {
      converged = true;
      break;
    }

    if (fa * fxm < 0) {
      b = xm;
      fb = fxm;
    } else {
      a = xm;
      fa = fxm;
    }

    prevXm = xm;
  }

  const finalTrueError = Math.abs((referenceRoot - finalXm) / referenceRoot) * 100;

  return {
    methodName: 'Bisección',
    root: finalXm,
    iterationsCount: history.length,
    finalResidual,
    finalRelativeError: finalApproxError,
    finalTrueError,
    converged,
    notes: 'Convergencia lineal garantizada (tasa 1/2 por paso), independiente de la forma de la curva.',
    history,
  };
}
