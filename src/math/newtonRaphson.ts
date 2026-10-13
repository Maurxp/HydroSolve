import type { ChannelParameters } from '../types/hydraulics';
import type { ComparisonResult } from '../types/numerical';
import { evaluateHydraulicFunction, evaluateHydraulicDerivative } from '../hydraulics/channel';
import { calculateReferenceRoot } from './referenceSolver';

/**
 * Método de Newton-Raphson con derivada analítica exacta
 */
export function solveNewtonRaphson(
  params: ChannelParameters,
  initialGuess?: number
): ComparisonResult {
  const referenceRoot = calculateReferenceRoot(params, params.a, params.b0);
  let x = initialGuess ?? (params.a + params.b0) / 2;
  let prevX: number | null = null;
  const history: ComparisonResult['history'] = [];

  let finalX = x;
  let finalResidual = evaluateHydraulicFunction(x, params);
  let finalApproxError: number | null = null;
  let converged = false;
  let notes = 'Convergencia cuadrática de orden 2 cerca de la raíz; requiere cálculo de derivada y buen punto inicial.';

  for (let i = 1; i <= params.maxIterations; i++) {
    const fx = evaluateHydraulicFunction(x, params);
    const dfx = evaluateHydraulicDerivative(x, params);

    let approxError: number | null = null;
    if (prevX !== null) {
      approxError = Math.abs((x - prevX) / x) * 100;
    }

    history.push({
      iteration: i,
      estimate: x,
      residual: fx,
      approxError,
    });

    finalX = x;
    finalResidual = fx;
    finalApproxError = approxError;

    if (Math.abs(fx) < 1e-12 || (approxError !== null && approxError <= params.tolerance)) {
      converged = true;
      break;
    }

    if (Math.abs(dfx) < 1e-12) {
      notes = 'Derivada próxima a cero; el método no puede continuar sin riesgo de divergencia.';
      break;
    }

    const nextX = x - fx / dfx;

    // Salvaguarda física: el tirante no puede ser negativo o nulo
    if (nextX <= 0) {
      x = Math.max(0.01, x / 2);
    } else {
      prevX = x;
      x = nextX;
    }
  }

  const finalTrueError = Math.abs((referenceRoot - finalX) / referenceRoot) * 100;

  return {
    methodName: 'Newton-Raphson',
    root: finalX,
    iterationsCount: history.length,
    finalResidual,
    finalRelativeError: finalApproxError,
    finalTrueError,
    converged,
    notes,
    history,
  };
}
