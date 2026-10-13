import React, { useState } from 'react';
import type { ChannelParameters } from '../../types/hydraulics';
import type { IterationData } from '../../types/numerical';
import { evaluateHydraulicFunction } from '../../hydraulics/channel';
import { formatNumber } from '../../utils/formatters';
import { LineChart, Crosshair } from 'lucide-react';

interface HydraulicFunctionChartProps {
  params: ChannelParameters;
  currentIteration?: IterationData;
  root: number;
}

export const HydraulicFunctionChart: React.FC<HydraulicFunctionChartProps> = ({
  params,
  currentIteration,
  root,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ y: number; fy: number; px: number; py: number } | null>(null);

  // Determinar dominio de graficación para y
  const minDomainY = Math.max(0.1, Math.min(params.a, root) * 0.7);
  const maxDomainY = Math.max(params.b0, root) * 1.25;

  // Parámetros del gráfico SVG
  const width = 640;
  const height = 340;
  const margin = { top: 30, right: 30, bottom: 45, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Generar puntos de la curva f(y)
  const steps = 70;
  const curvePoints: Array<{ y: number; fy: number }> = [];
  let minFy = 0;
  let maxFy = 0;

  for (let i = 0; i <= steps; i++) {
    const yVal = minDomainY + (i / steps) * (maxDomainY - minDomainY);
    const fyVal = evaluateHydraulicFunction(yVal, params);
    curvePoints.push({ y: yVal, fy: fyVal });
    if (fyVal < minFy) minFy = fyVal;
    if (fyVal > maxFy) maxFy = fyVal;
  }

  // Añadir márgenes a los ejes
  const yAxisMin = minFy * 1.15;
  const yAxisMax = maxFy * 1.15;

  // Funciones de mapeo de coordenadas
  const mapX = (yVal: number) => {
    return margin.left + ((yVal - minDomainY) / (maxDomainY - minDomainY)) * innerWidth;
  };

  const mapY = (fyVal: number) => {
    return margin.top + innerHeight - ((fyVal - yAxisMin) / (yAxisMax - yAxisMin)) * innerHeight;
  };

  // Coordenada Y de la línea f(y) = 0
  const zeroY = mapY(0);

  // Path SVG de la función f(y)
  const pathD = curvePoints.reduce((acc, pt, idx) => {
    const xPx = mapX(pt.y);
    const yPx = mapY(pt.fy);
    return idx === 0 ? `M ${xPx} ${yPx}` : `${acc} L ${xPx} ${yPx}`;
  }, '');

  // Datos de la iteración actual para la recta secante
  const a = currentIteration?.a ?? params.a;
  const b = currentIteration?.b ?? params.b0;
  const fa = currentIteration?.fa ?? evaluateHydraulicFunction(a, params);
  const fb = currentIteration?.fb ?? evaluateHydraulicFunction(b, params);
  const xr = currentIteration?.xr ?? root;
  const fxr = currentIteration?.fxr ?? evaluateHydraulicFunction(xr, params);

  const aPx = mapX(a);
  const faPx = mapY(fa);
  const bPx = mapX(b);
  const fbPx = mapY(fb);
  const xrPx = mapX(xr);
  const fxrPx = mapY(fxr);

  // Posicionamiento dinámico de etiquetas a y b (alto contraste, protección contra bordes)
  const aBadgeWidth = 68;
  const aBadgeHalfWidth = aBadgeWidth / 2;
  const aLabelX = Math.max(margin.left + aBadgeHalfWidth + 2, Math.min(aPx, width - margin.right - aBadgeHalfWidth - 2));
  const aLabelY = fa > 0 ? (faPx - 24 >= margin.top + 2 ? faPx - 24 : faPx + 8) : (faPx + 8 <= height - margin.bottom - 22 ? faPx + 8 : faPx - 24);

  const bBadgeWidth = 68;
  const bBadgeHalfWidth = bBadgeWidth / 2;
  const bLabelX = Math.max(margin.left + bBadgeHalfWidth + 2, Math.min(bPx, width - margin.right - bBadgeHalfWidth - 2));
  const bLabelY = fb > 0 ? (fbPx - 24 >= margin.top + 2 ? fbPx - 24 : fbPx + 8) : (fbPx + 8 <= height - margin.bottom - 22 ? fbPx + 8 : fbPx - 24);

  // Posicionamiento dinámico de etiqueta xr para evitar solapamientos con (xr, f(xr)), ejes y bordes
  const xrBadgeWidth = 114;
  const xrBadgeHeight = 22;
  const xrBadgeHalfWidth = xrBadgeWidth / 2;
  const minBadgeX = margin.left + xrBadgeHalfWidth + 4;
  const maxBadgeX = width - margin.right - xrBadgeHalfWidth - 4;
  const xrLabelX = Math.max(minBadgeX, Math.min(xrPx, maxBadgeX));

  let xrBadgeY: number;
  if (fxrPx >= zeroY) {
    // El punto en la curva está por debajo de la línea cero (fxr <= 0). Ubicar etiqueta xr ARRIBA de la línea cero.
    if (zeroY - 26 >= margin.top + 4) {
      xrBadgeY = zeroY - 26;
    } else {
      xrBadgeY = Math.min(height - margin.bottom - xrBadgeHeight - 4, Math.max(zeroY + 14, fxrPx + 14));
    }
  } else {
    // El punto en la curva está por arriba de la línea cero (fxr > 0). Ubicar etiqueta xr ABAJO de la línea cero.
    if (zeroY + 14 + xrBadgeHeight <= height - margin.bottom - 4) {
      xrBadgeY = zeroY + 14;
    } else {
      xrBadgeY = Math.max(margin.top + 4, Math.min(zeroY - 26, fxrPx - 26));
    }
  }

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }} id="grafica-funcion">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: 'var(--cyan-400)' }}>
            <LineChart size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Gráfica A: Función Hidráulica f(y) y Cuerda Secante</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Curva f(y) = Q<sub>c</sub>(y) − Q y aproximación de la raíz por Regula Falsi
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--cyan-400)' }}>
            <span style={{ width: 12, height: 3, background: 'var(--cyan-400)', borderRadius: 2 }}></span> Curva f(y)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--amber-400)' }}>
            <span style={{ width: 12, height: 2, background: 'var(--amber-400)', borderStyle: 'dashed' }}></span> Secante [a, b]
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald-400)' }}>
            <span style={{ width: 8, height: 8, background: 'var(--emerald-400)', borderRadius: '50%' }}></span> Raíz x<sub>r</sub>
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
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Gráfica de la función hidráulica f(y) y el método de falsa posición"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const normX = (mouseX / rect.width) * width;
            if (normX >= margin.left && normX <= width - margin.right) {
              const yVal = minDomainY + ((normX - margin.left) / innerWidth) * (maxDomainY - minDomainY);
              const fyVal = evaluateHydraulicFunction(yVal, params);
              setHoveredPoint({ y: yVal, fy: fyVal, px: normX, py: mapY(fyVal) });
            }
          }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="gridPattern" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid de fondo */}
          <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="url(#gridPattern)" />

          {/* Eje horizontal f(y) = 0 */}
          {zeroY >= margin.top && zeroY <= height - margin.bottom && (
            <g>
              <line
                x1={margin.left}
                y1={zeroY}
                x2={width - margin.right}
                y2={zeroY}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={width - margin.right - 5} y={zeroY - 6} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                f(y) = 0 (Equilibrio Manning)
              </text>
            </g>
          )}

          {/* Curva no lineal f(y) */}
          <path d={pathD} fill="none" stroke="var(--cyan-400)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Recta Secante entre (a, f(a)) y (b, f(b)) */}
          <line
            x1={aPx}
            y1={faPx}
            x2={bPx}
            y2={fbPx}
            stroke="var(--amber-400)"
            strokeWidth="2"
            strokeDasharray="5 3"
          />

          {/* Líneas proyectadas de los extremos a y b */}
          <line x1={aPx} y1={faPx} x2={aPx} y2={zeroY} stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={bPx} y1={fbPx} x2={bPx} y2={zeroY} stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Puntos (a, f(a)) y (b, f(b)) con etiquetas de alto contraste */}
          <circle cx={aPx} cy={faPx} r="5" fill="var(--amber-400)" stroke="var(--bg-dark-900)" strokeWidth="2" />
          <rect
            x={aLabelX - aBadgeHalfWidth}
            y={aLabelY}
            width={aBadgeWidth}
            height="18"
            rx="4"
            fill="rgba(10, 17, 32, 0.94)"
            stroke="var(--amber-400)"
            strokeWidth="1.2"
          />
          <text
            x={aLabelX}
            y={aLabelY + 13}
            fill="#ffffff"
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
          >
            a ({formatNumber(a, 2)})
          </text>

          <circle cx={bPx} cy={fbPx} r="5" fill="var(--amber-400)" stroke="var(--bg-dark-900)" strokeWidth="2" />
          <rect
            x={bLabelX - bBadgeHalfWidth}
            y={bLabelY}
            width={bBadgeWidth}
            height="18"
            rx="4"
            fill="rgba(10, 17, 32, 0.94)"
            stroke="var(--amber-400)"
            strokeWidth="1.2"
          />
          <text
            x={bLabelX}
            y={bLabelY + 13}
            fill="#ffffff"
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
          >
            b ({formatNumber(b, 2)})
          </text>

          {/* Punto de intersección de la secante con f(y)=0: xr */}
          <circle cx={xrPx} cy={zeroY} r="7" fill="var(--emerald-400)" stroke="var(--bg-dark-900)" strokeWidth="2.5" />

          {/* Etiqueta xr con posicionamiento inteligente anti-solapamiento */}
          <g style={{ transition: 'all 0.3s ease-out' }}>
            {Math.abs(xrLabelX - xrPx) > 8 && (
              <line
                x1={xrPx}
                y1={zeroY}
                x2={xrLabelX}
                y2={xrBadgeY + xrBadgeHeight / 2}
                stroke="var(--emerald-400)"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            )}
            <rect
              x={xrLabelX - xrBadgeHalfWidth}
              y={xrBadgeY}
              width={xrBadgeWidth}
              height={xrBadgeHeight}
              rx="5"
              fill="rgba(10, 17, 32, 0.95)"
              stroke="var(--emerald-400)"
              strokeWidth="1.4"
            />
            <text
              x={xrLabelX}
              y={xrBadgeY + 15}
              fill="#ffffff"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              x_r = {formatNumber(xr, 3)} m
            </text>
          </g>

          {/* Punto en la curva (xr, f(xr)) */}
          <circle cx={xrPx} cy={fxrPx} r="4.5" fill="var(--cyan-300)" stroke="var(--bg-dark-900)" strokeWidth="1.5" />

          {/* Línea vertical de xr hacia f(xr) */}
          <line x1={xrPx} y1={zeroY} x2={xrPx} y2={fxrPx} stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Marcador al pasar el ratón (Hover) */}
          {hoveredPoint && (
            <g>
              <line x1={hoveredPoint.px} y1={margin.top} x2={hoveredPoint.px} y2={height - margin.bottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={hoveredPoint.px} cy={hoveredPoint.py} r="5" fill="#ffffff" stroke="var(--cyan-500)" strokeWidth="2" />
            </g>
          )}

          {/* Ejes y Ticks */}
          {/* Eje X */}
          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#475569" strokeWidth="1.5" />
          <text x={width / 2} y={height - 12} fill="#cbd5e1" fontSize="11" fontWeight="500" textAnchor="middle">
            Tirante de agua y (m)
          </text>

          {/* Ticks X */}
          {[0.5, 1.0, 1.5, 2.0, 2.5].filter((v) => v >= minDomainY && v <= maxDomainY).map((v) => {
            const xPx = mapX(v);
            return (
              <g key={`tick-x-${v}`}>
                <line x1={xPx} y1={height - margin.bottom} x2={xPx} y2={height - margin.bottom + 5} stroke="#64748b" strokeWidth="1" />
                <text x={xPx} y={height - margin.bottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
                  {v.toFixed(1)}
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
            Residuo f(y) = Q_c(y) − Q (m³/s)
          </text>

          {/* Ticks Y */}
          {[-8, -4, 0, 4, 8].filter((v) => v >= yAxisMin && v <= yAxisMax).map((v) => {
            const yPx = mapY(v);
            return (
              <g key={`tick-y-${v}`}>
                <line x1={margin.left - 5} y1={yPx} x2={margin.left} y2={yPx} stroke="#64748b" strokeWidth="1" />
                <text x={margin.left - 8} y={yPx + 3} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                  {v > 0 ? `+${v}` : v}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip flotante */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(10, 17, 32, 0.92)',
              border: '1px solid var(--cyan-400)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Crosshair size={14} color="var(--cyan-400)" />
            <span>y = {hoveredPoint.y.toFixed(3)} m</span>
            <span style={{ color: hoveredPoint.fy >= 0 ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
              f(y) = {hoveredPoint.fy >= 0 ? '+' : ''}{hoveredPoint.fy.toFixed(3)} m³/s
            </span>
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        La recta secante (en ámbar) une los puntos <strong>(a, f(a))</strong> y <strong>(b, f(b))</strong>. Su intersección con el eje horizontal f(y) = 0 genera la nueva aproximación <strong>x<sub>r</sub></strong> (en esmeralda).
      </div>
    </div>
  );
};
