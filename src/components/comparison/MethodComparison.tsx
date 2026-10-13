import React, { useMemo } from 'react';
import type { ChannelParameters } from '../../types/hydraulics';
import type { NumericalMethodResult } from '../../types/numerical';
import { solveBisection } from '../../math/bisection';
import { solveNewtonRaphson } from '../../math/newtonRaphson';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { GitCompare, CheckCircle2, Info } from 'lucide-react';

interface MethodComparisonProps {
  params: ChannelParameters;
  falsePositionResult: NumericalMethodResult;
}

export const MethodComparison: React.FC<MethodComparisonProps> = ({
  params,
  falsePositionResult,
}) => {
  const bisectionResult = useMemo(() => solveBisection(params), [params]);
  const newtonResult = useMemo(() => solveNewtonRaphson(params), [params]);

  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="comparacion-metodos">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--blue-400)' }}>
            <GitCompare size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Comparación Rigurosa de Métodos Numéricos</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Evaluación paralela: Falsa Posición vs. Bisección vs. Newton-Raphson bajo las mismas tolerancias
            </p>
          </div>
        </div>

        <span className="badge badge-cyan">Mismo Problema Físico (Q = {params.Q} m³/s)</span>
      </div>

      {/* Tabla Comparativa */}
      <div className="table-container">
        <table className="table-custom">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Método Numérico</th>
              <th>Tipo de Algoritmo</th>
              <th>Iteraciones</th>
              <th>Tirante Raíz (m)</th>
              <th>Residuo |f(y<sub>n</sub>)|</th>
              <th>Error Aprox. ε<sub>a</sub></th>
              <th>Error Verdadero ε<sub>t</sub></th>
              <th>Convergencia</th>
            </tr>
          </thead>
          <tbody>
            {/* Falsa Posición */}
            <tr style={{ background: 'rgba(6, 182, 212, 0.08)' }}>
              <td style={{ textAlign: 'left', fontWeight: 700, color: 'var(--cyan-300)' }}>
                Falsa Posición (Regula Falsi)
              </td>
              <td style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Cerrado (Interpolación lineal)</td>
              <td style={{ fontWeight: 700, color: 'var(--cyan-200)' }}>{falsePositionResult.totalIterations}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatNumber(falsePositionResult.root, 6)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{Math.abs(falsePositionResult.finalResidual).toExponential(4)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{falsePositionResult.finalRelativeError !== null ? formatPercent(falsePositionResult.finalRelativeError, 4) : '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>{formatPercent(falsePositionResult.finalTrueError, 4)}</td>
              <td>
                <span style={{ color: 'var(--emerald-400)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                  <CheckCircle2 size={13} /> Sí (Tolerancia)
                </span>
              </td>
            </tr>

            {/* Bisección */}
            <tr>
              <td style={{ textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)' }}>
                Bisección
              </td>
              <td style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Cerrado (Punto medio)</td>
              <td style={{ fontWeight: 700 }}>{bisectionResult.iterationsCount}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatNumber(bisectionResult.root, 6)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{Math.abs(bisectionResult.finalResidual).toExponential(4)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{bisectionResult.finalRelativeError !== null ? formatPercent(bisectionResult.finalRelativeError, 4) : '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>{formatPercent(bisectionResult.finalTrueError, 4)}</td>
              <td>
                <span style={{ color: bisectionResult.converged ? 'var(--emerald-400)' : 'var(--amber-400)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                  <CheckCircle2 size={13} /> {bisectionResult.converged ? 'Sí (Tolerancia)' : 'Límite iteraciones'}
                </span>
              </td>
            </tr>

            {/* Newton-Raphson */}
            <tr>
              <td style={{ textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)' }}>
                Newton-Raphson
              </td>
              <td style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Abierto (Recta tangente y derivada)</td>
              <td style={{ fontWeight: 700 }}>{newtonResult.iterationsCount}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatNumber(newtonResult.root, 6)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{Math.abs(newtonResult.finalResidual).toExponential(4)}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{newtonResult.finalRelativeError !== null ? formatPercent(newtonResult.finalRelativeError, 4) : '—'}</td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>{formatPercent(newtonResult.finalTrueError, 4)}</td>
              <td>
                <span style={{ color: newtonResult.converged ? 'var(--emerald-400)' : 'var(--amber-400)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                  <CheckCircle2 size={13} /> {newtonResult.converged ? 'Sí (Cuadrática)' : 'Divergencia'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="table-scroll-hint">
        <span>↔ Desliza horizontalmente para ver la comparativa completa de métodos</span>
      </div>

      {/* Análisis Académico Comparativo (Sin declarar un ganador universal) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <h4 style={{ fontSize: '0.92rem', color: 'var(--cyan-300)', marginBottom: '0.4rem' }}>
            Falsa Posición (Regula Falsi)
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Aprovecha la magnitud de los valores f(a) y f(b) para acelerar la búsqueda mediante una recta secante. Garantiza el acotamiento de la raíz. Sin embargo, en funciones con curvatura pronunciada (como la curva de Manning donde f''(y) &gt; 0), puede sufrir el <strong>fenómeno de extremo estancado</strong>, donde uno de los límites no se actualiza durante varias iteraciones sucesivas.
          </p>
        </div>

        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Método de Bisección
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Divide el intervalo por la mitad de manera fija e independiente de la forma de f(y). Su tasa de convergencia es estrictamente lineal con factor 1/2. Nunca sufre estancamiento asimétrico, pero suele requerir un mayor número de evaluaciones que los métodos de interpolación para la misma tolerancia.
          </p>
        </div>

        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Método de Newton-Raphson
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Posee convergencia cuadrática (orden 2) cerca de la raíz. Sin embargo, no acota la solución (método abierto), requiere evaluar analíticamente la derivada compleja dQc/dy en cada iteración y es susceptible a división por cero o divergencia si el punto inicial está alejado o en pendientes casi nulas.
          </p>
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Info size={14} color="var(--blue-400)" />
        <span>Rigor científico: Ningún método numérico es universalmente superior en todas las situaciones; la elección óptima depende del costo de evaluar la derivada, la garantía requerida de convergencia y la concavidad de la función.</span>
      </div>
    </div>
  );
};
