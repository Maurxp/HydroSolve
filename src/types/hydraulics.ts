/**
 * Parámetros de entrada para el canal trapezoidal y el flujo uniforme
 */
export interface ChannelParameters {
  /** Caudal de diseño Q (m³/s) */
  Q: number;
  /** Ancho del fondo b (m) */
  b: number;
  /** Talud lateral horizontal/vertical z (H:1V) */
  z: number;
  /** Pendiente longitudinal del canal S (m/m) */
  S: number;
  /** Coeficiente de rugosidad de Manning n (adimensional / s/m^(1/3)) */
  n: number;
  /** Extremo inferior del intervalo inicial de búsqueda a (m) */
  a: number;
  /** Extremo superior del intervalo inicial de búsqueda b₀ (m) */
  b0: number;
  /** Tolerancia de error relativo aproximado ε (%) */
  tolerance: number;
  /** Número máximo de iteraciones permitidas */
  maxIterations: number;
}

/**
 * Propiedades hidráulicas calculadas para un tirante dado y
 */
export interface HydraulicProperties {
  /** Tirante o profundidad de agua y (m) */
  y: number;
  /** Espejo de agua o ancho superficial T(y) = b + 2zy (m) */
  T: number;
  /** Área hidráulica A(y) = y(b + zy) (m²) */
  A: number;
  /** Perímetro mojado P(y) = b + 2y√(1 + z²) (m) */
  P: number;
  /** Radio hidráulico R(y) = A(y) / P(y) (m) */
  R: number;
  /** Tirante hidráulico Dh(y) = A(y) / T(y) (m) */
  Dh: number;
  /** Caudal calculado mediante la ecuación de Manning Qc(y) (m³/s) */
  Qc: number;
  /** Valor de la función residual f(y) = Qc(y) - Q (m³/s) */
  fy: number;
  /** Derivada analítica df/dy (m²/s) */
  dfy: number;
  /** Velocidad media del flujo V = Q / A (m/s) */
  V: number;
  /** Número de Froude Fr = V / √(g Dh) */
  Fr: number;
  /** Régimen de flujo: 'Subcrítico' (Fr < 1), 'Crítico' (Fr = 1), 'Supercrítico' (Fr > 1) */
  regime: 'Subcrítico' | 'Crítico' | 'Supercrítico';
  /** Energía específica E = y + V²/(2g) (m) */
  E: number;
  /** Tensión de corte en el fondo τ₀ = γ R S (N/m²) */
  shearStress: number;
}

/**
 * Errores o advertencias de validación en parámetros
 */
export interface ParameterValidationError {
  field: keyof ChannelParameters;
  message: string;
}
