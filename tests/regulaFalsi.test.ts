import { describe, it, expect } from 'vitest';
import { solveRegulaFalsi } from '../src/math/regulaFalsi';
import { solveBisection } from '../src/math/bisection';
import { solveNewtonRaphson } from '../src/math/newtonRaphson';
import { calculateReferenceRoot } from '../src/math/referenceSolver';
import { calculateManningDischarge } from '../src/hydraulics/channel';
import { ChannelParameters } from '../src/types/hydraulics';

describe('Método de Falsa Posición (Regula Falsi) y Métodos Comparativos', () => {
  const baseParams: ChannelParameters = {
    Q: 12.0,
    b: 3.0,
    z: 1.5,
    S: 0.001,
    n: 0.025,
    a: 1.0,
    b0: 2.0,
    tolerance: 0.01,
    maxIterations: 50,
  };

  it('resuelve el caso base de ingeniería civil con precisión y convergencia', () => {
    const result = solveRegulaFalsi(baseParams);

    expect(result.status).toBe('CONVERGED_TOLERANCE');
    expect(result.totalIterations).toBeGreaterThan(1);
    expect(result.totalIterations).toBeLessThan(20);

    // El tirante normal debe estar acotado entre [1.0, 2.0]
    expect(result.root).toBeGreaterThan(1.0);
    expect(result.root).toBeLessThan(2.0);

    // Comprobación de caudal con la ecuación de Manning: Qc(yn) ≈ 12 m³/s
    const calculatedQ = calculateManningDischarge(
      result.root,
      baseParams.b,
      baseParams.z,
      baseParams.S,
      baseParams.n
    );
    expect(calculatedQ).toBeCloseTo(12.0, 3);
    expect(Math.abs(result.finalResidual)).toBeLessThan(0.01);
  });

  it('rigor académico: la primera iteración no tiene error relativo aproximado (null)', () => {
    const result = solveRegulaFalsi(baseParams);
    const firstIter = result.iterations[0];

    expect(firstIter).toBeDefined();
    expect(firstIter.iteration).toBe(1);
    expect(firstIter.approxRelativeError).toBeNull();
    expect(firstIter.absoluteStepError).toBeNull();
  });

  it('las iteraciones subsecuentes calculan correctamente el error relativo aproximado', () => {
    const result = solveRegulaFalsi(baseParams);

    for (let i = 1; i < result.iterations.length; i++) {
      const it = result.iterations[i];
      const prev = result.iterations[i - 1];

      expect(it.approxRelativeError).not.toBeNull();
      const expectedError = (Math.abs(it.xr - prev.xr) / Math.abs(it.xr)) * 100;
      expect(it.approxRelativeError).toBeCloseTo(expectedError, 6);
    }
  });

  it('se cumple el criterio de tolerancia de parada en la última iteración', () => {
    const result = solveRegulaFalsi(baseParams);
    const lastIter = result.iterations[result.iterations.length - 1];

    expect(lastIter.isConverged).toBe(true);
    expect(lastIter.approxRelativeError).toBeLessThanOrEqual(baseParams.tolerance);
  });

  it('contrasta con una solución de referencia independiente de alta precisión', () => {
    const reference = calculateReferenceRoot(baseParams);
    const result = solveRegulaFalsi(baseParams);

    expect(result.referenceRoot).toBeCloseTo(reference, 8);
    // El error verdadero relativo porcentual debe ser muy pequeño
    expect(result.finalTrueError).toBeLessThan(0.1);
  });

  it('maneja el caso de intervalo sin cambio de signo', () => {
    const invalidBracketParams = { ...baseParams, a: 1.8, b0: 2.2 };
    const result = solveRegulaFalsi(invalidBracketParams);

    expect(result.status).toBe('NO_SIGN_CHANGE');
    expect(result.iterations.length).toBe(0);
    expect(result.statusMessage).toContain('No existe cambio de signo');
  });

  it('maneja el caso de raíz exacta en uno de los extremos', () => {
    const reference = calculateReferenceRoot(baseParams);
    const exactParams = { ...baseParams, a: reference, b0: 2.5 };
    const result = solveRegulaFalsi(exactParams);

    expect(result.status).toBe('CONVERGED_EXACT_ROOT');
    expect(result.root).toBeCloseTo(reference, 6);
  });

  it('compara adecuadamente con Bisección y Newton-Raphson', () => {
    const bisectResult = solveBisection(baseParams);
    const newtonResult = solveNewtonRaphson(baseParams);
    const falsePosResult = solveRegulaFalsi(baseParams);

    expect(bisectResult.converged).toBe(true);
    expect(newtonResult.converged).toBe(true);
    expect(falsePosResult.status).toBe('CONVERGED_TOLERANCE');

    // Las tres raíces deben coincidir dentro de la tolerancia física
    expect(bisectResult.root).toBeCloseTo(falsePosResult.root, 2);
    expect(newtonResult.root).toBeCloseTo(falsePosResult.root, 3);
  });
});
