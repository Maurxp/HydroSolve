import React from 'react';
import { Waves, Activity, Binary, Award } from 'lucide-react';

interface HeroSectionProps {
  onStartSimulation: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartSimulation }) => {
  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(2rem, 4.5vw, 3.75rem) 0 clamp(1.5rem, 3.5vw, 2.75rem) 0',
        borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
        overflow: 'hidden',
      }}
      id="inicio"
    >
      <div className="container">
        {/* Badges superiores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">
            <Binary size={13} /> Métodos Numéricos & Análisis Matemático
          </span>
          <span className="badge badge-emerald">
            <Waves size={13} /> Ingeniería Civil & Hidráulica de Canales
          </span>
          <span className="badge badge-amber">
            <Award size={13} /> Proyecto Académico Universitario
          </span>
        </div>

        {/* Título Principal */}
        <div style={{ maxWidth: '900px' }}>
          <h1
            style={{
              fontSize: 'clamp(1.65rem, 4.2vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.18,
              marginBottom: '0.85rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            HydroSolve — Laboratorio de Métodos Numéricos
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2.2vw, 1.3rem)',
              color: 'var(--cyan-300)',
              fontWeight: 500,
              marginBottom: '1.15rem',
              lineHeight: 1.4,
            }}
          >
            Cálculo del tirante normal mediante el método de falsa posición (Regula Falsi)
          </p>

          <p
            style={{
              fontSize: 'clamp(0.88rem, 1.8vw, 1rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '1.75rem',
              maxWidth: '820px',
            }}
          >
            Plataforma interactiva de simulación científica aplicada a la ingeniería civil. Resuelve paso a paso la ecuación no lineal de Manning para determinar la profundidad de agua en régimen uniforme permanente dentro de un canal trapezoidal de concreto. Incorpora visualización geométrica SVG en tiempo real, gráficos de interpolación secante, trazado de convergencia y contrastación con soluciones de referencia.
          </p>

          {/* Botones de acción rápida */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onStartSimulation}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            >
              <Activity size={18} /> Iniciar Simulación Numérica
            </button>

            <a
              href="#desarrollo-matematico"
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.35rem', fontSize: '0.95rem' }}
            >
              Ver Desarrollo Matemático (15 Pasos)
            </a>

            <a
              href="#fundamentos-teoricos"
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.35rem', fontSize: '0.95rem' }}
            >
              Fundamentos Teóricos
            </a>
          </div>
        </div>

        {/* Resumen del Problema en Tarjetas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '1rem',
            marginTop: '2.5rem',
          }}
        >
          <div style={{ background: 'rgba(14, 23, 42, 0.75)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              El Problema Físico
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Determinar el tirante y tal que el caudal conducido sea exactamente <strong>Q = 12 m³/s</strong> en un canal de concreto (<strong>n = 0.025</strong>) con pendiente <strong>S = 0.001</strong>.
            </div>
          </div>

          <div style={{ background: 'rgba(14, 23, 42, 0.75)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              El Modelo Matemático
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              La ecuación de Manning f(y) = (1/n) A R^(2/3) √S − Q = 0 genera una función no lineal implícita con potencias fraccionarias sin despeje algebraico directo.
            </div>
          </div>

          <div style={{ background: 'rgba(14, 23, 42, 0.75)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--amber-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              El Método Numérico
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Regula Falsi interpola linealmente los extremos del intervalo [a, b₀] = [1.0, 2.0] m hasta alcanzar una tolerancia de error relativo <strong>ε &lt; 0.01%</strong>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
