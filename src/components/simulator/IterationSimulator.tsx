import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface IterationSimulatorProps {
  currentIndex: number;
  totalIterations: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSkipToEnd: () => void;
  playbackSpeed: number; // en ms por paso
  onSpeedChange: (speedMs: number) => void;
}

export const IterationSimulator: React.FC<IterationSimulatorProps> = ({
  currentIndex,
  totalIterations,
  isPlaying,
  onPlayToggle,
  onNext,
  onPrev,
  onReset,
  onSkipToEnd,
  playbackSpeed,
  onSpeedChange,
}) => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manejador del temporizador para auto-reproducción segura
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentIndex < totalIterations - 1) {
          onNext();
        } else {
          onPlayToggle(); // Pausar al llegar al final
        }
      }, playbackSpeed);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentIndex, totalIterations, playbackSpeed, onNext, onPlayToggle]);

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
      id="controlador-simulador"
    >
      {/* Indicador de progreso de iteración */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.4rem 0.85rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--cyan-300)',
          }}
        >
          Paso {totalIterations > 0 ? currentIndex + 1 : 0} / {totalIterations}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Simulador de Falsa Posición
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Navegación paso a paso de las aproximaciones numéricas
          </span>
        </div>
      </div>

      {/* Controles de reproducción */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Reiniciar al inicio */}
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onReset}
          disabled={currentIndex === 0 || totalIterations === 0}
          title="Reiniciar a la primera iteración"
        >
          <RotateCcw size={16} />
        </button>

        {/* Paso Anterior */}
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onPrev}
          disabled={currentIndex <= 0}
          title="Paso anterior (←)"
        >
          <SkipBack size={16} />
        </button>

        {/* Play / Pausa Principal */}
        <button
          type="button"
          className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
          onClick={onPlayToggle}
          disabled={totalIterations === 0}
          style={{ minWidth: '115px' }}
          title={isPlaying ? 'Pausar simulación' : 'Reproducir automáticamente'}
        >
          {isPlaying ? (
            <>
              <Pause size={16} /> Pausar
            </>
          ) : (
            <>
              <Play size={16} /> {currentIndex >= totalIterations - 1 ? 'Repetir' : 'Reproducir'}
            </>
          )}
        </button>

        {/* Siguiente Paso */}
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onNext}
          disabled={currentIndex >= totalIterations - 1}
          title="Siguiente paso (→)"
        >
          <SkipForward size={16} />
        </button>

        {/* Ir al final */}
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={onSkipToEnd}
          disabled={currentIndex >= totalIterations - 1}
          title="Saltar a la solución final calculada"
        >
          <FastForward size={16} />
        </button>
      </div>

      {/* Selector de velocidad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Velocidad:</span>
        {[
          { label: '0.5s', ms: 500 },
          { label: '1.0s', ms: 1000 },
          { label: '2.0s', ms: 2000 },
        ].map((spd) => (
          <button
            key={spd.ms}
            type="button"
            className={`btn btn-sm ${playbackSpeed === spd.ms ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
            onClick={() => onSpeedChange(spd.ms)}
          >
            {spd.label}
          </button>
        ))}
      </div>
    </div>
  );
};
