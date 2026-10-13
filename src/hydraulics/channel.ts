import type { ChannelParameters, HydraulicProperties } from '../types/hydraulics';

export const GRAVITY = 9.80665; // Aceleración gravitacional (m/s²)
export const WATER_DENSITY = 1000; // Densidad del agua (kg/m³)

/**
 * Calcula el área hidráulica de la sección trapezoidal A(y) = y * (b + z * y)
 */
export function calculateArea(y: number, b: number, z: number): number {
  if (y <= 0) return 0;
  return y * (b + z * y);
}

/**
 * Calcula el perímetro mojado de la sección trapezoidal P(y) = b + 2 * y * √(1 + z²)
 */
export function calculateWettedPerimeter(y: number, b: number, z: number): number {
  if (y <= 0) return b;
  return b + 2 * y * Math.sqrt(1 + z * z);
}

/**
 * Calcula el ancho superficial o espejo de agua T(y) = b + 2 * z * y
 */
export function calculateTopWidth(y: number, b: number, z: number): number {
  if (y <= 0) return b;
  return b + 2 * z * y;
}

/**
 * Calcula el radio hidráulico R(y) = A(y) / P(y)
 */
export function calculateHydraulicRadius(y: number, b: number, z: number): number {
  const A = calculateArea(y, b, z);
  const P = calculateWettedPerimeter(y, b, z);
  if (P <= 0) return 0;
  return A / P;
}

/**
 * Calcula el tirante hidráulico Dh(y) = A(y) / T(y)
 */
export function calculateHydraulicDepth(y: number, b: number, z: number): number {
  const A = calculateArea(y, b, z);
  const T = calculateTopWidth(y, b, z);
  if (T <= 0) return 0;
  return A / T;
}

/**
 * Calcula el caudal conducido según la ecuación de Manning:
 * Qc(y) = (1/n) * A(y) * R(y)^(2/3) * √S
 */
export function calculateManningDischarge(
  y: number,
  b: number,
  z: number,
  S: number,
  n: number
): number {
  if (y <= 0 || n <= 0 || S <= 0) return 0;
  const A = calculateArea(y, b, z);
  const R = calculateHydraulicRadius(y, b, z);
  return (1 / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S);
}

/**
 * Evalúa la función no lineal residual f(y) = Qc(y) - Q
 */
export function evaluateHydraulicFunction(
  y: number,
  params: Pick<ChannelParameters, 'Q' | 'b' | 'z' | 'S' | 'n'>
): number {
  const Qc = calculateManningDischarge(y, params.b, params.z, params.S, params.n);
  return Qc - params.Q;
}

/**
 * Derivada analítica exacta de la función respecto al tirante:
 * f'(y) = dQc/dy = (√S / n) * R^(2/3) * [ (5/3)*T - (2/3)*R*(dP/dy) ]
 * donde dP/dy = 2 * √(1 + z²)
 */
export function evaluateHydraulicDerivative(
  y: number,
  params: Pick<ChannelParameters, 'b' | 'z' | 'S' | 'n'>
): number {
  if (y <= 0 || params.n <= 0 || params.S <= 0) return 0;
  const A = calculateArea(y, params.b, params.z);
  const P = calculateWettedPerimeter(y, params.b, params.z);
  const T = calculateTopWidth(y, params.b, params.z);
  const R = A / P;
  const dP_dy = 2 * Math.sqrt(1 + params.z * params.z);

  const term = (5 / 3) * T - (2 / 3) * R * dP_dy;
  return (Math.sqrt(params.S) / params.n) * Math.pow(R, 2 / 3) * term;
}

/**
 * Calcula todas las propiedades hidráulicas completas para un tirante y dado
 */
export function calculateHydraulicProperties(
  y: number,
  params: Pick<ChannelParameters, 'Q' | 'b' | 'z' | 'S' | 'n'>
): HydraulicProperties {
  const A = calculateArea(y, params.b, params.z);
  const P = calculateWettedPerimeter(y, params.b, params.z);
  const T = calculateTopWidth(y, params.b, params.z);
  const R = P > 0 ? A / P : 0;
  const Dh = T > 0 ? A / T : 0;
  const Qc = calculateManningDischarge(y, params.b, params.z, params.S, params.n);
  const fy = Qc - params.Q;
  const dfy = evaluateHydraulicDerivative(y, params);

  const V = A > 0 ? params.Q / A : 0;
  const Fr = Dh > 0 ? V / Math.sqrt(GRAVITY * Dh) : 0;

  let regime: 'Subcrítico' | 'Crítico' | 'Supercrítico' = 'Subcrítico';
  if (Math.abs(Fr - 1.0) < 0.01) {
    regime = 'Crítico';
  } else if (Fr > 1.0) {
    regime = 'Supercrítico';
  }

  const E = y + (V * V) / (2 * GRAVITY);
  const shearStress = WATER_DENSITY * GRAVITY * R * params.S;

  return {
    y,
    T,
    A,
    P,
    R,
    Dh,
    Qc,
    fy,
    dfy,
    V,
    Fr,
    regime,
    E,
    shearStress,
  };
}

/**
 * Calcula el tirante crítico yc mediante condición de energía mínima (Fr = 1):
 * Q² * T(yc) / (g * A(yc)³) = 1
 */
export function calculateCriticalDepth(
  Q: number,
  b: number,
  z: number
): number {
  // Búsqueda robusta por bisección para yc
  let low = 0.01;
  let high = 20.0;
  const g = GRAVITY;

  function criticalResidual(depth: number) {
    const A = calculateArea(depth, b, z);
    const T = calculateTopWidth(depth, b, z);
    return (Q * Q * T) / (g * Math.pow(A, 3)) - 1;
  }

  // Expandir límite superior si es necesario
  while (criticalResidual(high) > 0 && high < 100) {
    high *= 2;
  }

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const res = criticalResidual(mid);
    if (Math.abs(res) < 1e-10) return mid;
    if (res > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}
