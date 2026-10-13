import React from 'react';
import type { IterationData } from '../../types/numerical';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { MathFormula } from '../common/MathFormula';
import { CheckCircle2, Gauge, Target, Compass } from 'lucide-react';

interface IterationSummaryCardProps {
  iteration?: IterationData;
  tolerance: number;
}

export const IterationSummaryCard: React.FC<IterationSummaryCardProps> = ({
  iteration,
  tolerance,
}) => {
  if (!iteration) {
    return (
      <div className="glass-card flex-center" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No hay datos de iteración seleccionada.</p>
      </div>
    );
  }

  const {
    iteration: i,
    a,
    b,
    fa,
    fb,
    xr,
    fxr,
    nextInterval,
    approxRelativeError,
    absoluteStepError,
    trueRelativeError,
    isConverged,
    intervalUpdateReason,
  } = iteration;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header de la tarjeta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: 'var(--cyan-400)' }}>
            <Target size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Detalle Analítico: Iteración {i}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Evaluación geométrica de la recta secante y actualización del subintervalo
            </p>
          </div>
        </div>

        <div>
          {isConverged ? (
            <span className="badge badge-emerald">
              <CheckCircle2 size={13} /> Criterio de Tolerancia Cumplido
            </span>
          ) : (
            <span className="badge badge-cyan">
              <Compass size={13} /> Búsqueda en Progreso
            </span>
          )}
        </div>
      </div>

      {/* Grid de valores principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Extremo inferior a y f(a) */}
        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Extremo inferior (a)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--amber-300)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(a, 6)} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>m</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            f(a) = <span style={{ color: fa < 0 ? 'var(--rose-400)' : 'var(--emerald-400)' }}>{formatNumber(fa, 6)}</span> m³/s
          </div>
        </div>

        {/* Extremo superior b y f(b) */}
        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Extremo superior (b)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--amber-300)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(b, 6)} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>m</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            f(b) = <span style={{ color: fb < 0 ? 'var(--rose-400)' : 'var(--emerald-400)' }}>{formatNumber(fb, 6)}</span> m³/s
          </div>
        </div>

        {/* Nueva Aproximación xr */}
        <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-300)', marginBottom: '0.2rem' }}>Aproximación de raíz (x_r)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cyan-200)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(xr, 6)} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>m</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            f(x_r) = <span style={{ color: 'var(--cyan-300)' }}>{fxr.toExponential(4)}</span> m³/s
          </div>
        </div>

        {/* Error Relativo Aproximado εa */}
        <div style={{ background: isConverged ? 'rgba(16, 185, 129, 0.1)' : 'rgba(10, 17, 32, 0.75)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: isConverged ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Error Relativo Aproximado (ε_a)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isConverged ? 'var(--emerald-400)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {approxRelativeError !== null ? formatPercent(approxRelativeError, 5) : 'N/A (Paso 1)'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            Tolerancia meta: ≤ {tolerance}%
          </div>
        </div>
      </div>

      {/* Sustitución numérica de la fórmula de Falsa Posición */}
      <div style={{ background: 'rgba(14, 23, 42, 0.85)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Gauge size={14} color="var(--cyan-400)" />
          <span>Fórmula de Regula Falsi evaluada en el paso actual:</span>
        </div>
        <MathFormula
          block
          formula={`x_r = b - \\frac{f(b)(a - b)}{f(a) - f(b)} = ${b.toFixed(4)} - \\frac{(${fb.toFixed(4)})(${a.toFixed(4)} - ${b.toFixed(4)})}{(${fa.toFixed(4)}) - (${fb.toFixed(4)})} = ${xr.toFixed(6)}\\text{ m}`}
        />
      </div>

      {/* Razón de actualización del intervalo y Teorema de Bolzano */}
      <div
        style={{
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(10, 17, 32, 0.8)',
          borderLeft: '4px solid var(--cyan-400)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan-300)' }}>
            Criterio de Actualización del Intervalo (Teorema de Bolzano):
          </span>
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--amber-300)' }}>
            Siguiente Intervalo: [{nextInterval.a.toFixed(5)}, {nextInterval.b.toFixed(5)}]
          </span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {intervalUpdateReason}
        </p>

        {/* Comparaciones de error adicionales para rigor académico */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>
            Diferencia paso a paso: |x<sub>r,i</sub> − x<sub>r,i-1</sub>| ={' '}
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {absoluteStepError !== null ? `${formatNumber(absoluteStepError, 6)} m` : 'N/A'}
            </strong>
          </span>
          <span>
            Error verdadero ref.: ε<sub>t</sub> ={' '}
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {trueRelativeError !== null ? formatPercent(trueRelativeError, 5) : '—'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
