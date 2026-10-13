import React, { useState } from 'react';
import type { IterationData } from '../../types/numerical';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { TrendingDown, CheckCircle2 } from 'lucide-react';

interface ConvergenceChartProps {
  iterations: IterationData[];
  tolerance: number;
  currentIterationIndex: number;
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({
  iterations,
  tolerance,
  currentIterationIndex,
}) => {
  const [hoveredIter, setHoveredIter] = useState<IterationData | null>(null);

  // Filtrar iteraciones que tienen error relativo (a partir de la iteración 2)
  const validPoints = iterations.filter((it) => it.approxRelativeError !== null);

  const width = 640;
  const height = 340;
  const margin = { top: 30, right: 30, bottom: 45, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (iterations.length === 0) {
    return (
      <div className="glass-card flex-center" style={{ padding: '2rem', minHeight: 340 }}>
        <p style={{ color: 'var(--text-muted)' }}>No hay iteraciones calculadas para graficar convergencia.</p>
      </div>
    );
  }

  // Rango del eje X (iteraciones 1 .. total)
  const totalIters = Math.max(iterations.length, 5);
  const minX = 1;
  const maxX = totalIters;

  // Rango del eje Y para error relativo aproximado (%)
  // Usamos escala logarítmica o adaptativa para ver la caída desde 10% hasta 0.001%
  const allErrors = validPoints.map((it) => it.approxRelativeError!).concat([tolerance]);
  const minError = Math.min(...allErrors) * 0.5;
  const maxError = Math.max(...allErrors) * 1.5;

  const logMin = Math.log10(Math.max(1e-6, minError));
  const logMax = Math.log10(Math.max(1, maxError));

  const mapX = (iterNum: number) => {
    return margin.left + ((iterNum - minX) / (maxX - minX)) * innerWidth;
  };

  const mapY = (errVal: number) => {
    const logVal = Math.log10(Math.max(1e-6, errVal));
    return margin.top + innerHeight - ((logVal - logMin) / (logMax - logMin)) * innerHeight;
  };

  // Posición Y de la línea de tolerancia
  const tolY = mapY(tolerance);

  // Path SVG para la curva de error
  const pathD = validPoints.reduce((acc, it, idx) => {
    const xPx = mapX(it.iteration);
    const yPx = mapY(it.approxRelativeError!);
    return idx === 0 ? `M ${xPx} ${yPx}` : `${acc} L ${xPx} ${yPx}`;
  }, '');

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }} id="grafica-convergencia">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: 'var(--emerald-400)' }}>
            <TrendingDown size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Gráfica B: Curva de Convergencia del Error</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Evolución del error relativo aproximado porcentual ε<sub>a</sub> vs. iteración
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--cyan-400)' }}>
            <span style={{ width: 12, height: 3, background: 'var(--cyan-400)', borderRadius: 2 }}></span> Error ε<sub>a</sub> (%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald-400)' }}>
            <span style={{ width: 12, height: 2, background: 'var(--emerald-400)', borderStyle: 'dashed' }}></span> Tolerancia ε = {tolerance}%
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, rgba(8, 14, 26, 0.95) 0%, rgba(12, 20, 36, 0.95) 100%)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--card-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseLeave={() => setHoveredIter(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Gráfica de convergencia del error aproximado"
        >
          <defs>
            <pattern id="gridPatternConv" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid de fondo */}
          <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="url(#gridPatternConv)" />

          {/* Línea horizontal de tolerancia de parada ε */}
          {tolY >= margin.top && tolY <= height - margin.bottom && (
            <g>
              <line
                x1={margin.left}
                y1={tolY}
                x2={width - margin.right}
                y2={tolY}
                stroke="var(--emerald-400)"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />
              <rect x={width - margin.right - 140} y={tolY - 18} width="135" height="16" rx="3" fill="var(--bg-dark-900)" />
              <text x={width - margin.right - 5} y={tolY - 6} fill="var(--emerald-300)" fontSize="10" fontWeight="600" textAnchor="end" fontFamily="var(--font-mono)">
                Tolerancia ε = {tolerance}%
              </text>
            </g>
          )}

          {/* Curva de error aproximado εa */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--cyan-400)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Puntos de cada iteración */}
          {validPoints.map((it) => {
            const xPx = mapX(it.iteration);
            const yPx = mapY(it.approxRelativeError!);
            const isSelected = it.iteration === currentIterationIndex + 1;
            const isHovered = hoveredIter?.iteration === it.iteration;

            return (
              <g
                key={`point-${it.iteration}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIter(it)}
              >
                {/* Halo para iteración activa */}
                {isSelected && (
                  <circle cx={xPx} cy={yPx} r="11" fill="none" stroke="var(--cyan-400)" strokeWidth="2" strokeDasharray="3 2" />
                )}
                <circle
                  cx={xPx}
                  cy={yPx}
                  r={isSelected || isHovered ? 7 : 5}
                  fill={it.approxRelativeError! <= tolerance ? 'var(--emerald-400)' : 'var(--cyan-400)'}
                  stroke="var(--bg-dark-900)"
                  strokeWidth="2"
                />
                <text x={xPx} y={yPx - 10} fill="#cbd5e1" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">
                  {it.approxRelativeError!.toFixed(3)}%
                </text>
              </g>
            );
          })}

          {/* Mensaje de rigor para Iteración 1 */}
          <g>
            const x1 = mapX(1);
            <line x1={mapX(1)} y1={margin.top} x2={mapX(1)} y2={height - margin.bottom} stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" strokeDasharray="2 2" />
            <text x={mapX(1) + 6} y={height - margin.bottom - 15} fill="var(--text-dim)" fontSize="9" fontFamily="var(--font-mono)">
              Iteración 1: ε_a = N/A (Sin estimación previa)
            </text>
          </g>

          {/* Ejes y Ticks */}
          {/* Eje X */}
          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#475569" strokeWidth="1.5" />
          <text x={width / 2} y={height - 12} fill="#cbd5e1" fontSize="11" fontWeight="500" textAnchor="middle">
            Número de Iteración (i)
          </text>

          {/* Ticks X */}
          {Array.from({ length: maxX }, (_, i) => i + 1).map((iterNum) => {
            const xPx = mapX(iterNum);
            return (
              <g key={`x-tick-${iterNum}`}>
                <line x1={xPx} y1={height - margin.bottom} x2={xPx} y2={height - margin.bottom + 5} stroke="#64748b" strokeWidth="1" />
                <text x={xPx} y={height - margin.bottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
                  {iterNum}
                </text>
              </g>
            );
          })}

          {/* Eje Y */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#475569" strokeWidth="1.5" />
          <text
            x={-height / 2}
            y={20}
            fill="#cbd5e1"
            fontSize="11"
            fontWeight="500"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            Error Relativo Aprox. ε_a (%) [Escala Log]
          </text>
        </svg>

        {/* Tooltip de punto de convergencia */}
        {hoveredIter && hoveredIter.approxRelativeError !== null && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(10, 17, 32, 0.95)',
              border: '1px solid var(--emerald-400)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Iteración {hoveredIter.iteration}</div>
            <div style={{ color: 'var(--cyan-300)' }}>ε_a = {formatPercent(hoveredIter.approxRelativeError, 5)}</div>
            <div style={{ color: 'var(--amber-300)' }}>x_r = {formatNumber(hoveredIter.xr, 5)} m</div>
            <div style={{ color: 'var(--text-muted)' }}>|f(x_r)| = {Math.abs(hoveredIter.fxr).toExponential(3)} m³/s</div>
            {hoveredIter.approxRelativeError <= tolerance && (
              <div style={{ color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <CheckCircle2 size={13} /> Criterio alcanzado
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        La primera iteración no tiene aproximación previa válida y se identifica estrictamente como <strong>N/A</strong>. La línea horizontal punteada representa el criterio de parada establecido (<strong>ε = {tolerance}%</strong>).
      </div>
    </div>
  );
};
