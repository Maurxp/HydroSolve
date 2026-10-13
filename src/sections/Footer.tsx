import React from 'react';
import { Waves, BookOpen, Code, FileText, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: 'rgba(6, 11, 19, 0.95)',
        borderTop: '1px solid rgba(56, 189, 248, 0.12)',
        padding: '3rem 0 2rem 0',
        marginTop: '4rem',
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Columna 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--cyan-400)' }}>
                <Waves size={18} />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>HydroSolve</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Laboratorio de Métodos Numéricos aplicados a la Ingeniería Civil. Simulación interactiva de hidráulica de canales abiertos mediante Falsa Posición (Regula Falsi) y la ecuación de Manning.
            </p>
          </div>

          {/* Columna 2: Enlaces a Documentación */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--cyan-300)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Documentación Académica
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
              <li>
                <a href="#desarrollo-matematico" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={14} color="var(--cyan-400)" /> Informe Matemático Paso a Paso
                </a>
              </li>
              <li>
                <a href="#fundamentos-teoricos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={14} color="var(--cyan-400)" /> Fundamentos Teóricos de Manning
                </a>
              </li>
              <li>
                <a href="#comparacion-metodos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Code size={14} color="var(--cyan-400)" /> Comparación: Bisección y Newton-Raphson
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información Universitaria */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--emerald-400)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contexto Académico
            </h4>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div>Asignatura: <strong>Métodos Numéricos para Ingeniería</strong></div>
              <div>Disciplina: <strong>Ingeniería Civil e Hidráulica Fluvial</strong></div>
              <div>Software: <strong>React + TypeScript + Vite + KaTeX</strong></div>
              <div style={{ marginTop: '0.4rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} /> Verificado mediante Vitest (19 pruebas unitarias)
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div
          style={{
            borderTop: '1px solid rgba(56, 189, 248, 0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            © 2026 HydroSolve. Proyecto de Código Abierto con Fines Académicos y Universitarios.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>Licencia MIT</span>
            <span>Estética Digital Lab</span>
            <span>WCAG Accesible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
