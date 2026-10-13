import React from 'react';
import type { ChannelParameters } from '../../types/hydraulics';
import type { ValidationResult } from '../../hydraulics/validator';
import { RotateCcw, Sparkles, AlertTriangle, CheckCircle2, Sliders, Play } from 'lucide-react';

interface ParameterFormProps {
  params: ChannelParameters;
  onChange: (newParams: ChannelParameters) => void;
  onReset: () => void;
  onAutoBracket: () => void;
  validation: ValidationResult;
  onCalculate: () => void;
}

export const ParameterForm: React.FC<ParameterFormProps> = ({
  params,
  onChange,
  onReset,
  onAutoBracket,
  validation,
  onCalculate,
}) => {
  const getFieldError = (field: keyof ChannelParameters): string | undefined => {
    return validation.errors.find((e) => e.field === field)?.message;
  };

  const handleFieldChange = (field: keyof ChannelParameters, value: string) => {
    const num = parseFloat(value);
    onChange({
      ...params,
      [field]: isNaN(num) ? 0 : num,
    });
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'base') {
      onChange({
        Q: 12.0,
        b: 3.0,
        z: 1.5,
        S: 0.001,
        n: 0.025,
        a: 1.0,
        b0: 2.0,
        tolerance: 0.01,
        maxIterations: 50,
      });
    } else if (presetName === 'riego') {
      onChange({
        Q: 4.5,
        b: 2.0,
        z: 1.0,
        S: 0.0008,
        n: 0.02,
        a: 0.5,
        b0: 2.0,
        tolerance: 0.01,
        maxIterations: 50,
      });
    } else if (presetName === 'pluvial') {
      onChange({
        Q: 25.0,
        b: 4.5,
        z: 2.0,
        S: 0.002,
        n: 0.015,
        a: 0.8,
        b0: 2.5,
        tolerance: 0.01,
        maxIterations: 50,
      });
    } else if (presetName === 'rectangular') {
      onChange({
        Q: 15.0,
        b: 4.0,
        z: 0.0,
        S: 0.0015,
        n: 0.018,
        a: 0.8,
        b0: 2.8,
        tolerance: 0.01,
        maxIterations: 50,
      });
    }
  };

  return (
    <div className="glass-card" style={{ padding: 'clamp(1rem, 3vw, 1.75rem)' }} id="panel-parametros">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--cyan-400)' }}>
            <Sliders size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Panel de Parámetros del Canal</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configuración geométrica, hidráulica y criterios numéricos</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            title="Restaurar parámetros originales del problema académico"
          >
            <RotateCcw size={14} /> Restaurar Iniciales
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onCalculate}
            disabled={!validation.isValid || !validation.hasSignChange}
          >
            <Play size={14} /> Recalcular Simulación
          </button>
        </div>
      </div>

      {/* Presets Rápidos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Casos de Estudio:</span>
        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }} onClick={() => loadPreset('base')}>
          Problema Académico (Q=12 m³/s)
        </button>
        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }} onClick={() => loadPreset('riego')}>
          Canal de Riego (Q=4.5 m³/s)
        </button>
        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }} onClick={() => loadPreset('pluvial')}>
          Canal Pluvial (Q=25 m³/s)
        </button>
        <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }} onClick={() => loadPreset('rectangular')}>
          Canal Rectangular (z = 0)
        </button>
      </div>

      {/* Formulario en Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem' }}>
        {/* Q */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-q">
            <span>Caudal de diseño (Q)</span>
            <span className="form-unit">m³/s</span>
          </label>
          <input
            id="param-q"
            type="number"
            step="0.1"
            className={`form-input ${getFieldError('Q') ? 'has-error' : ''}`}
            value={params.Q || ''}
            onChange={(e) => handleFieldChange('Q', e.target.value)}
          />
          {getFieldError('Q') && <span className="error-text">{getFieldError('Q')}</span>}
        </div>

        {/* b */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-b">
            <span>Ancho del fondo (b)</span>
            <span className="form-unit">m</span>
          </label>
          <input
            id="param-b"
            type="number"
            step="0.1"
            className={`form-input ${getFieldError('b') ? 'has-error' : ''}`}
            value={params.b || ''}
            onChange={(e) => handleFieldChange('b', e.target.value)}
          />
          {getFieldError('b') && <span className="error-text">{getFieldError('b')}</span>}
        </div>

        {/* z */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-z">
            <span>Talud lateral (z)</span>
            <span className="form-unit">H:1V</span>
          </label>
          <input
            id="param-z"
            type="number"
            step="0.1"
            className={`form-input ${getFieldError('z') ? 'has-error' : ''}`}
            value={params.z ?? ''}
            onChange={(e) => handleFieldChange('z', e.target.value)}
          />
          {getFieldError('z') && <span className="error-text">{getFieldError('z')}</span>}
        </div>

        {/* S */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-s">
            <span>Pendiente longitudinal (S)</span>
            <span className="form-unit">m/m</span>
          </label>
          <input
            id="param-s"
            type="number"
            step="0.0001"
            className={`form-input ${getFieldError('S') ? 'has-error' : ''}`}
            value={params.S || ''}
            onChange={(e) => handleFieldChange('S', e.target.value)}
          />
          {getFieldError('S') && <span className="error-text">{getFieldError('S')}</span>}
        </div>

        {/* n */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-n">
            <span>Rugosidad Manning (n)</span>
            <span className="form-unit">s/m^(1/3)</span>
          </label>
          <input
            id="param-n"
            type="number"
            step="0.001"
            className={`form-input ${getFieldError('n') ? 'has-error' : ''}`}
            value={params.n || ''}
            onChange={(e) => handleFieldChange('n', e.target.value)}
          />
          {getFieldError('n') && <span className="error-text">{getFieldError('n')}</span>}
        </div>

        {/* a */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-a">
            <span>Extremo inferior inicial (a)</span>
            <span className="form-unit">m</span>
          </label>
          <input
            id="param-a"
            type="number"
            step="0.05"
            className={`form-input ${getFieldError('a') ? 'has-error' : ''}`}
            value={params.a || ''}
            onChange={(e) => handleFieldChange('a', e.target.value)}
          />
          {getFieldError('a') && <span className="error-text">{getFieldError('a')}</span>}
        </div>

        {/* b0 */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-b0">
            <span>Extremo superior inicial (b₀)</span>
            <span className="form-unit">m</span>
          </label>
          <input
            id="param-b0"
            type="number"
            step="0.05"
            className={`form-input ${getFieldError('b0') ? 'has-error' : ''}`}
            value={params.b0 || ''}
            onChange={(e) => handleFieldChange('b0', e.target.value)}
          />
          {getFieldError('b0') && <span className="error-text">{getFieldError('b0')}</span>}
        </div>

        {/* tolerance */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-tol">
            <span>Tolerancia de error (ε)</span>
            <span className="form-unit">%</span>
          </label>
          <input
            id="param-tol"
            type="number"
            step="0.001"
            className={`form-input ${getFieldError('tolerance') ? 'has-error' : ''}`}
            value={params.tolerance || ''}
            onChange={(e) => handleFieldChange('tolerance', e.target.value)}
          />
          {getFieldError('tolerance') && <span className="error-text">{getFieldError('tolerance')}</span>}
        </div>

        {/* maxIterations */}
        <div className="form-group">
          <label className="form-label" htmlFor="param-max-iter">
            <span>Máximo de iteraciones</span>
            <span className="form-unit">iter</span>
          </label>
          <input
            id="param-max-iter"
            type="number"
            step="1"
            min="1"
            max="200"
            className={`form-input ${getFieldError('maxIterations') ? 'has-error' : ''}`}
            value={params.maxIterations || ''}
            onChange={(e) => handleFieldChange('maxIterations', e.target.value)}
          />
          {getFieldError('maxIterations') && <span className="error-text">{getFieldError('maxIterations')}</span>}
        </div>
      </div>

      {/* Nota aclaratoria de b vs b0 */}
      <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>Nota de rigor académico:</span>
        <span>El símbolo <strong>b₀</strong> representa el extremo superior del intervalo inicial de búsqueda matemática, distinguiéndose de <strong>b</strong> que es el ancho físico del fondo del canal.</span>
      </div>

      {/* Mensaje de validación de cambio de signo (Teorema de Bolzano) */}
      <div style={{ marginTop: '1.25rem' }}>
        {validation.isValid && validation.hasSignChange && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={18} color="var(--emerald-400)" />
              <span style={{ fontSize: '0.86rem', color: 'var(--emerald-400)' }}>
                <strong>Intervalo válido con cambio de signo (Teorema de Bolzano):</strong> f({params.a}) = {validation.fa.toFixed(4)} m³/s &lt; 0 y f({params.b0}) = {validation.fb.toFixed(4)} m³/s &gt; 0. Raíz acotada.
              </span>
            </div>
          </div>
        )}

        {validation.isValid && !validation.hasSignChange && (
          <div
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
              <AlertTriangle size={20} color="var(--amber-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--amber-400)', fontSize: '0.9rem' }}>Advertencia de acotamiento:</strong>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {validation.bracketWarning}
                </p>
              </div>
            </div>

            {validation.suggestedBracket && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onAutoBracket}
                style={{ borderColor: 'var(--amber-400)', color: 'var(--amber-300)' }}
              >
                <Sparkles size={14} /> Aplicar intervalo sugerido [{validation.suggestedBracket.a}, {validation.suggestedBracket.b0}]
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
