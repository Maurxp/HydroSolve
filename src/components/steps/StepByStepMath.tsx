import React, { useState } from 'react';
import type { ChannelParameters } from '../../types/hydraulics';
import type { IterationData, NumericalMethodResult } from '../../types/numerical';
import { MathFormula } from '../common/MathFormula';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { calculateArea, calculateWettedPerimeter, calculateHydraulicRadius, calculateTopWidth } from '../../hydraulics/channel';
import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface StepByStepMathProps {
  params: ChannelParameters;
  currentIteration?: IterationData;
  result: NumericalMethodResult;
}

export const StepByStepMath: React.FC<StepByStepMathProps> = ({
  params,
  currentIteration,
  result,
}) => {
  const [activeStepTab, setActiveStepTab] = useState<number | 'all'>('all');

  const { Q, b, z, S, n, a: initA, b0: initB, tolerance } = params;
  const it = currentIteration ?? result.iterations[0];

  const a = it ? it.a : initA;
  const bBound = it ? it.b : initB;
  const fa = it ? it.fa : 0;
  const fb = it ? it.fb : 0;
  const xr = it ? it.xr : 0;
  const fxr = it ? it.fxr : 0;
  const ea = it ? it.approxRelativeError : null;

  // Propiedades en xr
  const Axr = calculateArea(xr, b, z);
  const Pxr = calculateWettedPerimeter(xr, b, z);
  const Rxr = calculateHydraulicRadius(xr, b, z);
  const Txr = calculateTopWidth(xr, b, z);
  const Vxr = Axr > 0 ? Q / Axr : 0;

  const stepsList = [
    {
      num: 1,
      title: 'Presentación del Enunciado Ingenieril',
      content: (
        <div>
          <p style={{ marginBottom: '0.5rem' }}>
            Se requiere determinar el <strong>tirante normal (y<sub>n</sub>)</strong> en un canal de concreto con sección transversal trapezoidal bajo régimen de flujo uniforme permanente. El caudal conducido debe ser exactamente de <strong>{Q} m³/s</strong>.
          </p>
          <div style={{ background: 'rgba(10, 17, 32, 0.6)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--cyan-400)' }}>
            <strong>Condición física de flujo uniforme:</strong> Las fuerzas gravitacionales que impulsan el agua hacia aguas abajo están en equilibrio dinámico con las fuerzas de fricción cortante generadas por la rugosidad de las paredes del canal, manteniendo el tirante y la velocidad constantes a lo largo de la conducción.
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Identificación de Parámetros Físicos y Unidades',
      content: (
        <div>
          <p style={{ marginBottom: '0.5rem' }}>Variables de entrada del canal en el Sistema Internacional (SI):</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
            <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Caudal de diseño (Q): <strong>{Q} m³/s</strong></div>
            <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Ancho de fondo (b): <strong>{b} m</strong></div>
            <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Talud lateral (z): <strong>{z} (H:1V)</strong></div>
            <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Pendiente longitudinal (S): <strong>{S} m/m</strong></div>
            <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Rugosidad Manning (n): <strong>{n}</strong></div>
            <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Intervalo inicial [a, b₀]: <strong>[{initA}, {initB}] m</strong></div>
            <div style={{ background: 'rgba(14, 23, 42, 0.7)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Tolerancia requerida (ε): <strong>{tolerance} %</strong></div>
          </div>
        </div>
      ),
    },
    {
      num: 3,
      title: 'Cálculo del Área Hidráulica A(y)',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>Para la geometría trapezoidal, el área mojada es la suma del rectángulo base y dos triángulos laterales:</p>
          <MathFormula block formula="A(y) = y(b + zy)" />
          <p style={{ marginTop: '0.4rem', fontSize: '0.86rem' }}>
            Sustituyendo con b = {b} m, z = {z} y evaluando en la aproximación actual x<sub>r</sub> = {formatNumber(xr, 4)} m:
          </p>
          <MathFormula
            block
            formula={`A(${xr.toFixed(4)}) = ${xr.toFixed(4)} \\cdot (${b} + ${z} \\cdot ${xr.toFixed(4)}) = ${Axr.toFixed(4)}\\text{ m}^2`}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Cálculo del Perímetro Mojado P(y)',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>El perímetro en contacto con las paredes del canal se calcula mediante el teorema de Pitágoras en los taludes:</p>
          <MathFormula block formula="P(y) = b + 2y\sqrt{1 + z^2}" />
          <p style={{ marginTop: '0.4rem', fontSize: '0.86rem' }}>
            Sustituyendo con z = {z} (donde √(1 + {z}²) = {Math.sqrt(1 + z * z).toFixed(4)}):
          </p>
          <MathFormula
            block
            formula={`P(${xr.toFixed(4)}) = ${b} + 2(${xr.toFixed(4)})\\sqrt{1 + ${z}^2} = ${Pxr.toFixed(4)}\\text{ m}`}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'Cálculo del Radio Hidráulico R(y)',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>El radio hidráulico representa la eficiencia geométrica de la conducción:</p>
          <MathFormula block formula="R(y) = \frac{A(y)}{P(y)}" />
          <p style={{ marginTop: '0.4rem', fontSize: '0.86rem' }}>Evaluando para el tirante actual:</p>
          <MathFormula
            block
            formula={`R(${xr.toFixed(4)}) = \\frac{${Axr.toFixed(4)}}{${Pxr.toFixed(4)}} = ${Rxr.toFixed(4)}\\text{ m}`}
          />
        </div>
      ),
    },
    {
      num: 6,
      title: 'Construcción de la Función No Lineal f(y)',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>
            Partiendo de la ecuación empírica de Robert Manning para flujo uniforme:
          </p>
          <MathFormula block formula="Q_c(y) = \frac{1}{n} A(y) R(y)^{2/3} \sqrt{S}" />
          <p style={{ margin: '0.4rem 0', fontSize: '0.86rem' }}>
            Definimos la función no lineal de raíz f(y) como la discrepancia entre el caudal conducido y el caudal de diseño:
          </p>
          <MathFormula block formula="f(y) = \frac{1}{n} A(y) R(y)^{2/3} \sqrt{S} - Q = 0" />
          <p style={{ marginTop: '0.4rem', fontSize: '0.86rem' }}>
            Con los datos del canal: f(y) = (1 / {n}) · A(y) · R(y)^(2/3) · √({S}) − {Q}
          </p>
        </div>
      ),
    },
    {
      num: 7,
      title: 'Evaluación en los Extremos del Intervalo Actual',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>Evaluación numérica de la función en los extremos vigentes [a, b]:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(10, 17, 32, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Extremo inferior a = {formatNumber(a, 5)} m</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: fa < 0 ? 'var(--rose-400)' : 'var(--emerald-400)', fontWeight: 600 }}>
                f(a) = {formatNumber(fa, 5)} m³/s
              </div>
            </div>
            <div style={{ background: 'rgba(10, 17, 32, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Extremo superior b = {formatNumber(bBound, 5)} m</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: fb < 0 ? 'var(--rose-400)' : 'var(--emerald-400)', fontWeight: 600 }}>
                f(b) = {formatNumber(fb, 5)} m³/s
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 8,
      title: 'Verificación del Cambio de Signo (Teorema de Bolzano)',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>
            El Teorema del Valor Intermedio (Bolzano) establece que si f(y) es continua en [a, b] y f(a)·f(b) &lt; 0, existe al menos una raíz en dicho intervalo:
          </p>
          <MathFormula
            block
            formula={`f(a) \\cdot f(b) = (${fa.toFixed(4)}) \\cdot (${fb.toFixed(4)}) = ${(fa * fb).toFixed(4)} < 0 \\implies \\text{¡Raíz estrictamente acotada!}`}
          />
        </div>
      ),
    },
    {
      num: 9,
      title: 'Aplicación de la Fórmula de Falsa Posición (Regula Falsi)',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>
            La aproximación se deduce geométricamente mediante la ecuación de la recta secante que une (a, f(a)) con (b, f(b)) y encontrando su intersección con el eje de las abscisas (y = 0):
          </p>
          <MathFormula block formula="x_r = b - \frac{f(b)(a - b)}{f(a) - f(b)}" />
          <p style={{ marginTop: '0.4rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Forma equivalente: x_r = (a·f(b) − b·f(a)) / (f(b) − f(a)).
          </p>
        </div>
      ),
    },
    {
      num: 10,
      title: 'Cálculo de la Nueva Aproximación x_r',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>Sustituyendo los valores numéricos correspondientes al paso actual:</p>
          <MathFormula
            block
            formula={`x_r = ${bBound.toFixed(5)} - \\frac{(${fb.toFixed(5)}) \\cdot (${a.toFixed(5)} - ${bBound.toFixed(5)})}{(${fa.toFixed(5)}) - (${fb.toFixed(5)})} = ${xr.toFixed(6)}\\text{ m}`}
          />
        </div>
      ),
    },
    {
      num: 11,
      title: 'Evaluación de la Función en la Aproximación f(x_r)',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>Evaluando el residuo hidráulico en la nueva estimación tirante x<sub>r</sub>:</p>
          <MathFormula
            block
            formula={`f(x_r) = f(${xr.toFixed(6)}) = ${fxr.toExponential(5)}\\text{ m}^3/\\text{s}`}
          />
          <p style={{ fontSize: '0.84rem', marginTop: '0.4rem' }}>
            El caudal conducido estimado es Q_c({xr.toFixed(4)}) = {(Q + fxr).toFixed(4)} m³/s (discrepancia respecto al caudal de diseño de {Q} m³/s: {Math.abs(fxr).toExponential(4)} m³/s).
          </p>
        </div>
      ),
    },
    {
      num: 12,
      title: 'Criterio de Actualización del Subintervalo',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>Se examina el producto de signos entre f(a), f(x_r) y f(b):</p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>Si f(a) · f(x_r) &lt; 0: la raíz se encuentra entre a y x_r → nuevo intervalo [a, x_r], se actualiza <strong>b ← x_r</strong>.</li>
            <li>Si f(b) · f(x_r) &lt; 0: la raíz se encuentra entre x_r y b → nuevo intervalo [x_r, b], se actualiza <strong>a ← x_r</strong>.</li>
            <li>Si f(x_r) = 0: x_r es la raíz exacta.</li>
          </ul>
          <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.85rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--cyan-400)' }}>
            <strong>Acción ejecutada:</strong> {it ? it.intervalUpdateReason : 'Actualización en curso.'}
          </div>
        </div>
      ),
    },
    {
      num: 13,
      title: 'Cálculo del Error Relativo Aproximado Porcentual ε_a',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>El error relativo aproximado mide la variación porcentual entre dos estimaciones sucesivas:</p>
          <MathFormula block formula="\varepsilon_a = \left| \frac{x_{r,i} - x_{r,i-1}}{x_{r,i}} \right| \times 100\%" />
          {it && it.iteration === 1 ? (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', color: 'var(--amber-300)', fontSize: '0.84rem' }}>
              <strong>Regla académica rigurosa:</strong> En la primera iteración no existe una estimación previa x_{'r,0'} válida. Por ende, el error aproximado no es cero, sino que se define estrictamente como <strong>No Disponible (N/A)</strong>.
            </div>
          ) : (
            <MathFormula
              block
              formula={`\\varepsilon_a = ${ea !== null ? formatPercent(ea, 5) : 'N/A'}`}
            />
          )}
        </div>
      ),
    },
    {
      num: 14,
      title: 'Verificación del Criterio de Parada',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>
            Se evalúa si el error relativo aproximado es menor o igual a la tolerancia fijada por el usuario (ε ≤ {tolerance}%):
          </p>
          <div style={{ padding: '0.6rem 0.85rem', background: it?.isConverged ? 'rgba(16, 185, 129, 0.12)' : 'rgba(10, 17, 32, 0.7)', borderRadius: 'var(--radius-sm)', border: it?.isConverged ? '1px solid var(--emerald-400)' : '1px solid var(--card-border)' }}>
            {it?.isConverged ? (
              <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>
                ✓ ¡Criterio cumplido! ε_a ({formatPercent(ea, 5)}) ≤ {tolerance}%. El algoritmo finaliza con éxito.
              </span>
            ) : (
              <span style={{ color: 'var(--cyan-300)' }}>
                El error actual ({ea !== null ? formatPercent(ea, 4) : 'N/A'}) supera la tolerancia de {tolerance}%. Se continúa a la siguiente iteración.
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      num: 15,
      title: 'Presentación de la Solución Final e Interpretación Ingenieril',
      content: (
        <div>
          <p style={{ marginBottom: '0.4rem' }}>
            Tirante normal convergido: <strong>y<sub>n</sub> = {result.root.toFixed(5)} m</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>
            Para una conducción de {Q} m³/s en este canal trapezoidal, el agua fluirá a una profundidad constante de {result.root.toFixed(3)} m con un ancho superficial de {Txr.toFixed(3)} m y una velocidad media de {Vxr.toFixed(3)} m/s.
          </p>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--blue-400)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong>Nota de ingeniería civil:</strong> La profundidad calculada satisface la condición matemática del modelo unidimensional de Manning. En el proyecto constructivo real, debe verificarse el borde libre mínimo recomendado (típicamente 30 cm a 50 cm por encima del tirante normal) y asegurarse de que la velocidad del agua permanezca dentro de los límites permisibles del concreto para evitar sedimentación o erosión.
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="desarrollo-matematico">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--cyan-400)' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Desarrollo Matemático Paso a Paso</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Demostración pedagógica formal con valores numéricos sustituidos en tiempo real
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeStepTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveStepTab('all')}
          >
            Ver los 15 pasos
          </button>
        </div>
      </div>

      {/* Lista de pasos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {stepsList.map((st) => {
          const isOpen = activeStepTab === 'all' || activeStepTab === st.num;

          return (
            <div
              key={st.num}
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'rgba(10, 17, 32, 0.75)',
                border: '1px solid var(--card-border)',
                overflow: 'hidden',
                transition: 'all var(--transition-fast)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveStepTab(activeStepTab === st.num ? 'all' : st.num)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--cyan-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {st.num}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Paso {st.num}: {st.title}
                  </span>
                </div>

                <div style={{ color: 'var(--text-muted)' }}>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '0 1.15rem 1.15rem 1.15rem', borderTop: '1px solid rgba(56, 189, 248, 0.08)', paddingTop: '0.85rem' }}>
                  {st.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
