import React, { useState } from 'react';
import { MathFormula } from '../common/MathFormula';
import { GraduationCap, BookOpen, Layers, ShieldCheck, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';

export const TheoreticalGuide: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('fundamentos');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="fundamentos-teoricos">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--cyan-400)' }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Módulo de Fundamentos Teóricos y Académicos</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Marco matemático de Regula Falsi, hidráulica de canales abiertos y consideraciones de ingeniería
            </p>
          </div>
        </div>
      </div>

      {/* Secciones plegables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* 1. ¿Qué es Falsa Posición? */}
        <div style={{ borderRadius: 'var(--radius-md)', background: 'rgba(10, 17, 32, 0.75)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('fundamentos')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <BookOpen size={17} color="var(--cyan-400)" />
              <span style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                1. Naturaleza del Método de Falsa Posición (Regula Falsi)
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>{openSection === 'fundamentos' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
          </button>

          {openSection === 'fundamentos' && (
            <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', borderTop: '1px solid rgba(56, 189, 248, 0.08)', paddingTop: '0.85rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '0.6rem' }}>
                El método de Falsa Posición es un algoritmo de búsqueda de raíces para ecuaciones no lineales continuas f(x) = 0. Pertenece a la familia de los <strong>métodos cerrados o de intervalo</strong>, lo que garantiza que la raíz permanecerá atrapada entre dos extremos [a, b] en cada iteración.
              </p>
              <p style={{ marginBottom: '0.6rem' }}>
                A diferencia de la Bisección (que divide el intervalo ciegamente por su punto medio sin considerar la magnitud de la función), la Falsa Posición traza una <strong>recta secante</strong> entre los puntos (a, f(a)) y (b, f(b)). El punto donde esta recta cruza el eje horizontal (y = 0) se convierte en la nueva aproximación x<sub>r</sub>:
              </p>
              <MathFormula block formula="x_r = b - \frac{f(b)(a - b)}{f(a) - f(b)} = \frac{a \cdot f(b) - b \cdot f(a)}{f(b) - f(a)}" />
            </div>
          )}
        </div>

        {/* 2. El fenómeno del extremo estancado */}
        <div style={{ borderRadius: 'var(--radius-md)', background: 'rgba(10, 17, 32, 0.75)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('estancamiento')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Layers size={17} color="var(--amber-400)" />
              <span style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                2. Ventajas, Limitaciones y el Fenómeno del Extremo Estancado
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>{openSection === 'estancamiento' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
          </button>

          {openSection === 'estancamiento' && (
            <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', borderTop: '1px solid rgba(56, 189, 248, 0.08)', paddingTop: '0.85rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '0.6rem' }}>
                <strong>No es cierto que Falsa Posición sea siempre más rápida que Bisección:</strong> Cuando la función evaluada tiene una curvatura constante en el intervalo (f''(x) &gt; 0 o f''(x) &lt; 0), como ocurre frecuentemente con la ecuación de Manning, la recta secante tiende a aproximar la raíz siempre desde un mismo lado.
              </p>
              <p style={{ marginBottom: '0.6rem' }}>
                Esto produce que <strong>uno de los extremos del intervalo quede estancado o congelado</strong> (por ejemplo, el extremo superior b nunca se reemplaza, solo el inferior a se desplaza sucesivamente). Como consecuencia, la tasa de reducción del intervalo original [a, b] puede volverse lenta, dando una convergencia asimétrica. Modificaciones avanzadas como el método de Illinois o Anderson-Björck mitigan este problema dividiendo el valor del extremo estancado entre 2.
              </p>
            </div>
          )}
        </div>

        {/* 3. Ecuación de Manning y flujo uniforme */}
        <div style={{ borderRadius: 'var(--radius-md)', background: 'rgba(10, 17, 32, 0.75)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('manning')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ShieldCheck size={17} color="var(--emerald-400)" />
              <span style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                3. Hipótesis Hidráulicas de la Ecuación de Manning y Flujo Uniforme
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>{openSection === 'manning' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
          </button>

          {openSection === 'manning' && (
            <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', borderTop: '1px solid rgba(56, 189, 248, 0.08)', paddingTop: '0.85rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '0.6rem' }}>
                La fórmula de Manning fue presentada por el ingeniero irlandés Robert Manning en 1889 para flujo turbulento totalmente desarrollado en canales abiertos y conducciones a superficie libre:
              </p>
              <MathFormula block formula="V = \frac{1}{n} R^{2/3} \sqrt{S} \implies Q = \frac{1}{n} A R^{2/3} \sqrt{S}" />
              <p style={{ margin: '0.6rem 0' }}>
                <strong>Hipótesis fundamentales del modelo:</strong>
              </p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>Flujo uniforme:</strong> El tirante, el área y la velocidad se mantienen invariantes a lo largo del eje longitudinal del canal.</li>
                <li><strong>Pendiente del fondo igual a la línea de energía:</strong> S₀ = S_f = S_w.</li>
                <li><strong>Flujo turbulento rugoso:</strong> La resistencia está dominada por las asperezas de la pared del canal y no por la viscosidad del fluido (número de Reynolds Re &gt; 10⁴).</li>
                <li><strong>Geometría prismática:</strong> Sección transversal trapezoidal constante sin transiciones ni curvas abruptas.</li>
              </ul>
            </div>
          )}
        </div>

        {/* 4. Aplicaciones en Ingeniería Civil */}
        <div style={{ borderRadius: 'var(--radius-md)', background: 'rgba(10, 17, 32, 0.75)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('aplicaciones')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <HelpCircle size={17} color="var(--blue-400)" />
              <span style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                4. Aplicaciones de Métodos Numéricos en Obras Hidráulicas Civiles
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>{openSection === 'aplicaciones' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
          </button>

          {openSection === 'aplicaciones' && (
            <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', borderTop: '1px solid rgba(56, 189, 248, 0.08)', paddingTop: '0.85rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '0.6rem' }}>
                En la práctica profesional de la ingeniería civil, la mayoría de ecuaciones de diseño hidráulico carecen de solución analítica explícita para la profundidad (como ocurre con el tirante normal en secciones trapezoidales, circulares de alcantarillado o parabólicas).
              </p>
              <p>
                Los métodos numéricos como la Falsa Posición se emplean para:
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Dimensionamiento de canales de riego, drenaje pluvial y trasvases hidroeléctricos.</li>
                <li>Cálculo del tirante crítico en aliviaderos de presas y estructuras de control.</li>
                <li>Resolución de redes de tuberías a presión mediante el algoritmo de Hardy Cross.</li>
                <li>Integración numérica de perfiles de flujo gradualmente variado (curvas de remanso M1, M2, S1, etc.) mediante el método de paso directo o Runge-Kutta.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
