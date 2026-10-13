import React from 'react';
import type { ChannelParameters, HydraulicProperties } from '../../types/hydraulics';
import type { NumericalMethodResult } from '../../types/numerical';
import { calculateHydraulicProperties, calculateCriticalDepth } from '../../hydraulics/channel';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { CheckCircle2, Waves, ShieldAlert } from 'lucide-react';

interface ResultsDashboardProps {
  params: ChannelParameters;
  result: NumericalMethodResult;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  params,
  result,
}) => {
  const { root, totalIterations, finalRelativeError, finalResidual, status } = result;

  const props: HydraulicProperties = calculateHydraulicProperties(root, params);
  const yc = calculateCriticalDepth(params.Q, params.b, params.z);

  const isSubcritical = props.Fr < 1.0;
  const freeboardRec = Math.max(0.3, props.y * 0.3); // Recomendación de borde libre

  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} id="panel-resultados">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--emerald-400)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Panel de Resultados y Diagnóstico Hidráulico</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Resumen ejecutivo de la convergencia numérica y comportamiento del flujo
            </p>
          </div>
        </div>

        <div>
          <span className={`badge ${status.startsWith('CONVERGED') ? 'badge-emerald' : 'badge-amber'}`}>
            {result.statusMessage}
          </span>
        </div>
      </div>

      {/* Tarjetas métricas clave */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {/* Tirante Normal yn */}
        <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--cyan-300)', marginBottom: '0.2rem' }}>Tirante Normal Calculado (y_n)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--cyan-200)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(root, 4)} <span style={{ fontSize: '0.9rem', color: 'var(--cyan-400)' }}>m</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Intervalo inicial: [{params.a}, {params.b0}] m
          </div>
        </div>

        {/* Caudal Comprobado Manning */}
        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Caudal Calculado Q_c(y_n)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(props.Qc, 4)} <span style={{ fontSize: '0.9rem', color: 'var(--emerald-500)' }}>m³/s</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Caudal de diseño: {params.Q} m³/s (Δ = {Math.abs(finalResidual).toExponential(3)})
          </div>
        </div>

        {/* Iteraciones y Error */}
        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Iteraciones Ejecutadas</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {totalIterations} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>pasos</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            ε_a final: {finalRelativeError !== null ? formatPercent(finalRelativeError, 4) : '—'} (tol: {params.tolerance}%)
          </div>
        </div>

        {/* Régimen de Flujo y Froude */}
        <div style={{ background: 'rgba(10, 17, 32, 0.75)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Número de Froude (Fr)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: props.regime === 'Subcrítico' ? 'var(--blue-400)' : 'var(--amber-400)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(props.Fr, 3)}
          </div>
          <div style={{ fontSize: '0.78rem', color: props.regime === 'Subcrítico' ? 'var(--blue-300)' : 'var(--amber-300)', marginTop: '0.2rem', fontWeight: 600 }}>
            Régimen {props.regime} (y_n {isSubcritical ? '>' : '<'} y_c = {formatNumber(yc, 3)} m)
          </div>
        </div>
      </div>

      {/* Parámetros Hidráulicos Complementarios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
        <div style={{ background: 'rgba(14, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Velocidad media (V)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNumber(props.V, 3)} m/s</div>
        </div>
        <div style={{ background: 'rgba(14, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Área hidráulica (A)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNumber(props.A, 3)} m²</div>
        </div>
        <div style={{ background: 'rgba(14, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Radio hidráulico (R)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNumber(props.R, 3)} m</div>
        </div>
        <div style={{ background: 'rgba(14, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Espejo de agua (T)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNumber(props.T, 3)} m</div>
        </div>
        <div style={{ background: 'rgba(14, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Energía específica (E)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNumber(props.E, 3)} m</div>
        </div>
        <div style={{ background: 'rgba(14, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Tensión de corte (τ₀)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNumber(props.shearStress, 2)} N/m²</div>
        </div>
      </div>

      {/* Interpretación Técnica de Ingeniería Civil */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(10, 17, 32, 0.85)',
          borderLeft: '4px solid var(--cyan-400)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <h4 style={{ fontSize: '0.98rem', color: 'var(--cyan-300)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Waves size={16} /> Interpretación Técnica en Ingeniería Civil
        </h4>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          El tirante normal calculado de <strong>y<sub>n</sub> = {formatNumber(root, 3)} m</strong> representa la profundidad de agua que se establecerá a lo largo del canal trapezoidal cuando el flujo alcance el régimen uniforme permanente. Con este tirante, el canal conducirá con exactitud el caudal de diseño de <strong>{params.Q} m³/s</strong> con una velocidad media de <strong>{formatNumber(props.V, 2)} m/s</strong>.
        </p>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Dado que el número de Froude es <strong>Fr = {formatNumber(props.Fr, 3)} ({isSubcritical ? '< 1, régimen subcrítico o tranquilo' : '> 1, régimen supercrítico o rápido'})</strong> y el tirante normal es {isSubcritical ? 'mayor' : 'menor'} que el tirante crítico (y<sub>c</sub> = {formatNumber(yc, 3)} m), las perturbaciones superficiales {isSubcritical ? 'pueden propagarse hacia aguas arriba' : 'son arrastradas exclusivamente hacia aguas abajo'}.
        </p>

        {/* Advertencia académica obligatoria */}
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            fontSize: '0.82rem',
            color: 'var(--amber-300)',
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Alcance y límites del modelo:</strong> La convergencia matemática del método de Falsa Posición garantiza que se ha encontrado la raíz de la ecuación de Manning unidimensional para las condiciones ideales especificadas. Esto <em>no sustituye un diseño hidráulico integral</em>, el cual requiere verificar borde libre constructivo (mínimo recomendado: ~{formatNumber(freeboardRec, 2)} m), estabilidad geotécnica de los taludes (z = {params.z}), velocidad máxima de arrastre para evitar abrasión del concreto y análisis de curvas de remanso ante controles hidráulicos.
          </div>
        </div>
      </div>
    </div>
  );
};
