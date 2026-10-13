import React, { useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { ChannelParameters } from './types/hydraulics';
import { validateParameters } from './hydraulics/validator';
import { solveRegulaFalsi } from './math/regulaFalsi';
import { HeroSection } from './sections/HeroSection';
import { ParameterForm } from './components/forms/ParameterForm';
import { ChannelVisualizer } from './components/channel/ChannelVisualizer';
import { IterationSimulator } from './components/simulator/IterationSimulator';
import { IterationSummaryCard } from './components/simulator/IterationSummaryCard';
import { NumericalTable } from './components/simulator/NumericalTable';
import { HydraulicFunctionChart } from './components/charts/HydraulicFunctionChart';
import { ConvergenceChart } from './components/charts/ConvergenceChart';
import { ResultsDashboard } from './components/results/ResultsDashboard';
import { StepByStepMath } from './components/steps/StepByStepMath';
import { TheoreticalGuide } from './components/theory/TheoreticalGuide';
import { MethodComparison } from './components/comparison/MethodComparison';
import { Footer } from './sections/Footer';
import { Waves, Sparkles, Sliders, Droplet, LineChart, Table, BookOpen, CheckCircle2 } from 'lucide-react';

const INITIAL_PARAMS: ChannelParameters = {
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

export const App: React.FC = () => {
  const [params, setParams] = useState<ChannelParameters>(INITIAL_PARAMS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000);

  // Validación física y matemática de parámetros
  const validation = useMemo(() => validateParameters(params), [params]);

  // Ejecución del método de Falsa Posición (Regula Falsi)
  const result = useMemo(() => {
    if (!validation.isValid || !validation.hasSignChange) {
      return solveRegulaFalsi({ ...params, a: 1.0, b0: 2.0 });
    }
    return solveRegulaFalsi(params);
  }, [params, validation]);

  // Iteración actualmente seleccionada
  const activeIteration = useMemo(() => {
    if (result.iterations.length === 0) return undefined;
    return result.iterations[Math.min(currentIndex, result.iterations.length - 1)];
  }, [result, currentIndex]);

  // Tirante actual para el visualizador del canal
  const currentDepth = useMemo(() => {
    if (activeIteration) return activeIteration.xr;
    return result.root;
  }, [activeIteration, result]);

  // Manejadores de navegación en el simulador
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = Math.min(prev + 1, result.iterations.length - 1);
      if (nextIdx === result.iterations.length - 1 && result.status.startsWith('CONVERGED')) {
        // Celebración de convergencia
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#06b6d4', '#10b981', '#38bdf8'],
          });
        } catch {
          // Ignorar si no está disponible
        }
      }
      return nextIdx;
    });
  }, [result]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const handleSkipToEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(Math.max(0, result.iterations.length - 1));
    if (result.status.startsWith('CONVERGED')) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#10b981', '#38bdf8'],
        });
      } catch {
        // Ignorar
      }
    }
  }, [result]);

  const handlePlayToggle = useCallback(() => {
    if (currentIndex >= result.iterations.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentIndex, result.iterations.length]);

  const handleResetParams = () => {
    setParams(INITIAL_PARAMS);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleAutoBracket = () => {
    if (validation.suggestedBracket) {
      setParams((prev) => ({
        ...prev,
        a: validation.suggestedBracket!.a,
        b0: validation.suggestedBracket!.b0,
      }));
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de Navegación Superior */}
      {/* Barra de Navegación Superior */}
      <header className="app-header">
        <div className="container header-container">
          <div className="header-brand">
            <div className="header-logo-icon">
              <Waves size={20} />
            </div>
            <div>
              <span className="header-brand-title">
                Hydro<span style={{ color: 'var(--cyan-400)' }}>Solve</span>
              </span>
              <span className="header-brand-subtitle">
                Laboratorio de Métodos Numéricos
              </span>
            </div>
          </div>

          {/* Enlaces de anclaje rápido */}
          <nav className="header-nav">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => scrollToSection('panel-parametros')}>
              <Sliders size={13} /> Parámetros
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => scrollToSection('seccion-canal')}>
              <Droplet size={13} /> Canal SVG
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => scrollToSection('controlador-simulador')}>
              <Sparkles size={13} /> Simulador
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => scrollToSection('grafica-funcion')}>
              <LineChart size={13} /> Gráficas
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => scrollToSection('tabla-numerica')}>
              <Table size={13} /> Tabla
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => scrollToSection('desarrollo-matematico')}>
              <BookOpen size={13} /> 15 Pasos
            </button>
            <button type="button" className="btn btn-primary btn-sm nav-btn-highlight" onClick={() => scrollToSection('panel-resultados')}>
              <CheckCircle2 size={13} /> Resultados
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection onStartSimulation={() => scrollToSection('controlador-simulador')} />

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
          {/* Panel de Parámetros */}
          <ParameterForm
            params={params}
            onChange={(newP) => {
              setParams(newP);
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
            onReset={handleResetParams}
            onAutoBracket={handleAutoBracket}
            validation={validation}
            onCalculate={() => {
              setCurrentIndex(0);
              scrollToSection('controlador-simulador');
            }}
          />

          {/* Fila: Sección del Canal SVG + Simulador y Tarjeta de Iteración Activa */}
          <div className="dual-grid">
            <ChannelVisualizer
              params={params}
              currentDepth={currentDepth}
              isConverged={result.status.startsWith('CONVERGED') && currentIndex === result.iterations.length - 1}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <IterationSimulator
                currentIndex={currentIndex}
                totalIterations={result.iterations.length}
                isPlaying={isPlaying}
                onPlayToggle={handlePlayToggle}
                onNext={handleNext}
                onPrev={handlePrev}
                onReset={handleReset}
                onSkipToEnd={handleSkipToEnd}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
              />

              <IterationSummaryCard
                iteration={activeIteration}
                tolerance={params.tolerance}
              />
            </div>
          </div>

          {/* Fila: Gráficas Científicas A y B */}
          <div className="dual-grid">
            <HydraulicFunctionChart
              params={params}
              currentIteration={activeIteration}
              root={result.root}
            />

            <ConvergenceChart
              iterations={result.iterations}
              tolerance={params.tolerance}
              currentIterationIndex={currentIndex}
            />
          </div>

          {/* Tabla Numérica Completa con exportación CSV */}
          <NumericalTable
            result={result}
            params={params}
            currentIndex={currentIndex}
            onSelectIteration={(idx) => {
              setCurrentIndex(idx);
              setIsPlaying(false);
            }}
          />

          {/* Panel de Resultados y Diagnóstico de Ingeniería Civil */}
          <ResultsDashboard
            params={params}
            result={result}
          />

          {/* Desarrollo Matemático Paso a Paso (15 Pasos) */}
          <StepByStepMath
            params={params}
            currentIteration={activeIteration}
            result={result}
          />

          {/* Módulo Comparativo: Falsa Posición vs Bisección vs Newton-Raphson */}
          <MethodComparison
            params={params}
            falsePositionResult={result}
          />

          {/* Guía de Fundamentos Teóricos */}
          <TheoreticalGuide />
        </div>
      </main>

      {/* Footer Académico */}
      <Footer />
    </div>
  );
};

export default App;
