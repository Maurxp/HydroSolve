import { describe, it, expect } from 'vitest';
import {
  calculateArea,
  calculateWettedPerimeter,
  calculateTopWidth,
  calculateHydraulicRadius,
  calculateManningDischarge,
  evaluateHydraulicFunction,
  evaluateHydraulicDerivative,
  calculateHydraulicProperties,
  calculateCriticalDepth,
} from '../src/hydraulics/channel';
import { validateParameters } from '../src/hydraulics/validator';
import { ChannelParameters } from '../src/types/hydraulics';

describe('Modelo Hidráulico de Canal Trapezoidal y Manning', () => {
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

  it('calcula correctamente el área hidráulica para y = 1.0 m', () => {
    // A(1) = 1 * (3 + 1.5 * 1) = 4.5 m²
    const A = calculateArea(1.0, baseParams.b, baseParams.z);
    expect(A).toBeCloseTo(4.5, 6);
  });

  it('calcula correctamente el perímetro mojado para y = 1.0 m', () => {
    // P(1) = 3 + 2 * 1 * √(1 + 1.5²) = 3 + 2 * √(3.25) ≈ 6.605551 m
    const P = calculateWettedPerimeter(1.0, baseParams.b, baseParams.z);
    expect(P).toBeCloseTo(6.605551, 5);
  });

  it('calcula correctamente el ancho superficial T para y = 1.0 m', () => {
    // T(1) = 3 + 2 * 1.5 * 1 = 6.0 m
    const T = calculateTopWidth(1.0, baseParams.b, baseParams.z);
    expect(T).toBeCloseTo(6.0, 6);
  });

  it('calcula el radio hidráulico R para y = 1.0 m', () => {
    // R(1) = 4.5 / 6.605551 ≈ 0.681245 m
    const R = calculateHydraulicRadius(1.0, baseParams.b, baseParams.z);
    expect(R).toBeCloseTo(0.681245, 5);
  });

  it('calcula el caudal de Manning Qc para y = 1.0 m y y = 2.0 m', () => {
    // Qc(1) = (1 / 0.025) * 4.5 * (R)^(2/3) * √0.001 ≈ 4.40698 m³/s
    const Qc1 = calculateManningDischarge(1.0, baseParams.b, baseParams.z, baseParams.S, baseParams.n);
    expect(Qc1).toBeCloseTo(4.40698, 3);

    // Qc(2) ≈ 16.90364 m³/s
    const Qc2 = calculateManningDischarge(2.0, baseParams.b, baseParams.z, baseParams.S, baseParams.n);
    expect(Qc2).toBeCloseTo(16.90364, 3);
  });

  it('evalúa la función f(y) = Qc(y) - Q verificando cambio de signo en [1.0, 2.0]', () => {
    const f1 = evaluateHydraulicFunction(1.0, baseParams);
    const f2 = evaluateHydraulicFunction(2.0, baseParams);

    expect(f1).toBeLessThan(0);
    expect(f1).toBeCloseTo(-7.59302, 3);

    expect(f2).toBeGreaterThan(0);
    expect(f2).toBeCloseTo(4.90364, 3);

    // Condición de Bolzano: f(a) * f(b) < 0
    expect(f1 * f2).toBeLessThan(0);
  });

  it('calcula la derivada analítica positiva continua', () => {
    const df = evaluateHydraulicDerivative(1.5, baseParams);
    expect(df).toBeGreaterThan(0);

    // Comparar con aproximación por diferencias finitas centradas
    const h = 1e-6;
    const fPlus = evaluateHydraulicFunction(1.5 + h, baseParams);
    const fMinus = evaluateHydraulicFunction(1.5 - h, baseParams);
    const numDeriv = (fPlus - fMinus) / (2 * h);
    expect(df).toBeCloseTo(numDeriv, 4);
  });

  it('determina propiedades completas de flujo hidráulico', () => {
    const props = calculateHydraulicProperties(1.61, baseParams);
    expect(props.V).toBeGreaterThan(0);
    expect(props.Fr).toBeGreaterThan(0);
    expect(['Subcrítico', 'Crítico', 'Supercrítico']).toContain(props.regime);
  });

  it('calcula el tirante crítico yc con condición Fr = 1', () => {
    const yc = calculateCriticalDepth(baseParams.Q, baseParams.b, baseParams.z);
    expect(yc).toBeGreaterThan(0);
    const A = calculateArea(yc, baseParams.b, baseParams.z);
    const T = calculateTopWidth(yc, baseParams.b, baseParams.z);
    const V = baseParams.Q / A;
    const Dh = A / T;
    const Fr = V / Math.sqrt(9.80665 * Dh);
    expect(Fr).toBeCloseTo(1.0, 3);
  });

  it('valida parámetros físicos detectando entradas incorrectas', () => {
    const invalidParams = { ...baseParams, Q: -5 };
    const valResult = validateParameters(invalidParams);
    expect(valResult.isValid).toBe(false);
    expect(valResult.errors.some((e) => e.field === 'Q')).toBe(true);
  });

  it('detecta intervalo sin cambio de signo', () => {
    const noSignChangeParams = { ...baseParams, a: 0.2, b0: 0.5 };
    const valResult = validateParameters(noSignChangeParams);
    expect(valResult.isValid).toBe(true);
    expect(valResult.hasSignChange).toBe(false);
    expect(valResult.bracketWarning).toBeDefined();
    expect(valResult.suggestedBracket).toBeDefined();
  });
});
