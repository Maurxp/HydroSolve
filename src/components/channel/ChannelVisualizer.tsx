import React from 'react';
import type { ChannelParameters } from '../../types/hydraulics';
import { calculateArea, calculateTopWidth, calculateWettedPerimeter, calculateHydraulicRadius } from '../../hydraulics/channel';
import { formatNumber } from '../../utils/formatters';
import { Droplet, Info } from 'lucide-react';

interface ChannelVisualizerProps {
  params: ChannelParameters;
  currentDepth: number;
  isConverged?: boolean;
}

export const ChannelVisualizer: React.FC<ChannelVisualizerProps> = ({
  params,
  currentDepth,
  isConverged = false,
}) => {
  const { b, z } = params;
  const y = Math.max(0.01, currentDepth);

  const A = calculateArea(y, b, z);
  const T = calculateTopWidth(y, b, z);
  const P = calculateWettedPerimeter(y, b, z);
  const R = calculateHydraulicRadius(y, b, z);
  const V = A > 0 ? params.Q / A : 0;

  // Altura total del canal con borde libre estimado
  const freeboard = Math.max(0.4, y * 0.3);
  const totalHeight = y + freeboard;
  const topBankWidth = b + 2 * z * totalHeight;

  // ViewBox coordinado en SVG
  const svgWidth = 650;
  const svgHeight = 360;
  const paddingX = 75;
  const paddingY = 45;

  const drawableWidth = svgWidth - 2 * paddingX;
  const drawableHeight = svgHeight - 2 * paddingY;

  // Escala para mantener proporción geométrica
  const scaleX = drawableWidth / Math.max(topBankWidth * 1.15, b * 1.5);
  const scaleY = drawableHeight / (totalHeight * 1.2);
  const scale = Math.min(scaleX, scaleY);

  const centerX = svgWidth / 2;
  const bedY = svgHeight - paddingY - 15;

  // Coordenadas del fondo del canal
  const bedHalfWidthPx = (b * scale) / 2;
  const bedLeftX = centerX - bedHalfWidthPx;
  const bedRightX = centerX + bedHalfWidthPx;

  // Coordenadas de las coronas del canal
  const bankTopY = bedY - totalHeight * scale;
  const bankTopHalfWidthPx = (topBankWidth * scale) / 2;
  const bankTopLeftX = centerX - bankTopHalfWidthPx;
  const bankTopRightX = centerX + bankTopHalfWidthPx;

  // Coordenadas de la superficie del agua
  const waterSurfaceY = bedY - y * scale;
  const waterHalfWidthPx = (T * scale) / 2;
  const waterLeftX = centerX - waterHalfWidthPx;
  const waterRightX = centerX + waterHalfWidthPx;

  // Coordenadas de bermas superiores
  const bermWidth = 35;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} id="seccion-canal">
      {/* Header del visualizador */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: 'var(--cyan-400)' }}>
            <Droplet size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Sección Transversal del Canal Trapezoidal</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Geometría hidráulica dinámica con nivel de agua en tiempo real
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className={`badge ${isConverged ? 'badge-emerald' : 'badge-cyan'}`}>
            {isConverged ? 'Tirante Normal Convergido' : 'Aproximación en Proceso'}
          </span>
        </div>
      </div>

      {/* Lienzo SVG */}
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, rgba(10, 17, 32, 0.95) 0%, rgba(14, 23, 42, 0.95) 100%)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--card-border)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Representación gráfica de la sección del canal trapezoidal y nivel del agua"
        >
          <defs>
            {/* Gradiente del agua */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.82" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.90" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.96" />
            </linearGradient>

            {/* Gradiente de paredes del canal */}
            <linearGradient id="concreteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Patrón de líneas de cimentación */}
            <pattern id="hatchPattern" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            </pattern>

            {/* Marcadores de flechas */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--cyan-400)" />
            </marker>
            <marker id="arrowAmber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--amber-400)" />
            </marker>
          </defs>

          {/* Terreno / Capa de concreto detrás del canal */}
          <polygon
            points={`
              ${bankTopLeftX - bermWidth},${bankTopY} 
              ${bankTopLeftX},${bankTopY} 
              ${bedLeftX},${bedY} 
              ${bedRightX},${bedY} 
              ${bankTopRightX},${bankTopY} 
              ${bankTopRightX + bermWidth},${bankTopY}
              ${bankTopRightX + bermWidth},${svgHeight}
              ${bankTopLeftX - bermWidth},${svgHeight}
            `}
            fill="url(#concreteGradient)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <polygon
            points={`
              ${bankTopLeftX - bermWidth},${bankTopY} 
              ${bankTopLeftX},${bankTopY} 
              ${bedLeftX},${bedY} 
              ${bedRightX},${bedY} 
              ${bankTopRightX},${bankTopY} 
              ${bankTopRightX + bermWidth},${bankTopY}
              ${bankTopRightX + bermWidth},${svgHeight}
              ${bankTopLeftX - bermWidth},${svgHeight}
            `}
            fill="url(#hatchPattern)"
          />

          {/* Sección de flujo (Agua líquida) */}
          <polygon
            points={`
              ${bedLeftX},${bedY}
              ${waterLeftX},${waterSurfaceY}
              ${waterRightX},${waterSurfaceY}
              ${bedRightX},${bedY}
            `}
            fill="url(#waterGradient)"
            stroke="var(--cyan-300)"
            strokeWidth="2"
            style={{ transition: 'all 0.35s ease-out' }}
          />

          {/* Línea de superficie libre de agua */}
          <line
            x1={waterLeftX}
            y1={waterSurfaceY}
            x2={waterRightX}
            y2={waterSurfaceY}
            stroke="#a5f3fc"
            strokeWidth="3"
            strokeDasharray="none"
            style={{ transition: 'all 0.35s ease-out' }}
          />

          {/* Onditas suaves de agua en la superficie */}
          <path
            d={`M ${centerX - 35} ${waterSurfaceY - 3} Q ${centerX - 20} ${waterSurfaceY - 6} ${centerX} ${waterSurfaceY - 3} T ${centerX + 35} ${waterSurfaceY - 3}`}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Línea de cota para Ancho del Fondo b */}
          <g>
            <line
              x1={bedLeftX}
              y1={bedY + 20}
              x2={bedRightX}
              y2={bedY + 20}
              stroke="var(--cyan-400)"
              strokeWidth="1.5"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            {/* Ticks verticales */}
            <line x1={bedLeftX} y1={bedY + 5} x2={bedLeftX} y2={bedY + 28} stroke="var(--cyan-400)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={bedRightX} y1={bedY + 5} x2={bedRightX} y2={bedY + 28} stroke="var(--cyan-400)" strokeWidth="1" strokeDasharray="2 2" />
            <rect x={centerX - 42} y={bedY + 10} width="84" height="20" rx="4" fill="var(--bg-dark-900)" stroke="var(--card-border)" />
            <text x={centerX} y={bedY + 24} fill="var(--text-primary)" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="var(--font-mono)">
              b = {formatNumber(b, 2)} m
            </text>
          </g>

          {/* Línea de cota para Tirante de agua y */}
          <g style={{ transition: 'all 0.35s ease-out' }}>
            const dimX = bedRightX + 35;
            <line
              x1={bedRightX + 35}
              y1={bedY}
              x2={bedRightX + 35}
              y2={waterSurfaceY}
              stroke="var(--amber-400)"
              strokeWidth="1.5"
              markerStart="url(#arrowAmber)"
              markerEnd="url(#arrowAmber)"
            />
            <line x1={bedRightX} y1={bedY} x2={bedRightX + 45} y2={bedY} stroke="var(--amber-400)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={waterRightX} y1={waterSurfaceY} x2={bedRightX + 45} y2={waterSurfaceY} stroke="var(--amber-400)" strokeWidth="1" strokeDasharray="2 2" />
            <rect x={bedRightX + 48} y={(bedY + waterSurfaceY) / 2 - 12} width="88" height="24" rx="4" fill="var(--bg-dark-900)" stroke="var(--amber-500)" />
            <text x={bedRightX + 92} y={(bedY + waterSurfaceY) / 2 + 4} fill="var(--amber-300)" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
              y = {formatNumber(y, 3)} m
            </text>
          </g>

          {/* Línea de cota para Ancho superficial T */}
          <g style={{ transition: 'all 0.35s ease-out' }}>
            <line
              x1={waterLeftX}
              y1={waterSurfaceY - 18}
              x2={waterRightX}
              y2={waterSurfaceY - 18}
              stroke="var(--cyan-300)"
              strokeWidth="1.5"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <line x1={waterLeftX} y1={waterSurfaceY} x2={waterLeftX} y2={waterSurfaceY - 24} stroke="var(--cyan-300)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1={waterRightX} y1={waterSurfaceY} x2={waterRightX} y2={waterSurfaceY - 24} stroke="var(--cyan-300)" strokeWidth="1" strokeDasharray="2 2" />
            <rect x={centerX - 46} y={waterSurfaceY - 29} width="92" height="20" rx="4" fill="var(--bg-dark-900)" stroke="var(--card-border)" />
            <text x={centerX} y={waterSurfaceY - 15} fill="var(--cyan-200)" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="var(--font-mono)">
              T = {formatNumber(T, 2)} m
            </text>
          </g>

          {/* Triángulo indicador de talud 1 : z */}
          <g>
            const slopeX = bankTopLeftX + 30;
            const slopeY = bedY - (totalHeight * scale) * 0.45;
            <polyline
              points={`
                ${bankTopLeftX + 25},${bedY - 60}
                ${bankTopLeftX + 55},${bedY - 60}
                ${bankTopLeftX + 55},${bedY - 40}
              `}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <text x={bankTopLeftX + 40} y={bedY - 66} fill="#cbd5e1" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
              z = {formatNumber(z, 2)}
            </text>
            <text x={bankTopLeftX + 63} y={bedY - 47} fill="#cbd5e1" fontSize="10" textAnchor="start" fontFamily="var(--font-mono)">
              1
            </text>
          </g>
        </svg>
      </div>

      {/* Tarjetas de propiedades hidráulicas instantáneas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(10, 17, 32, 0.7)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Área Hidráulica (A)</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(A, 3)} <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>m²</span>
          </div>
        </div>

        <div style={{ background: 'rgba(10, 17, 32, 0.7)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Perímetro Mojado (P)</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(P, 3)} <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>m</span>
          </div>
        </div>

        <div style={{ background: 'rgba(10, 17, 32, 0.7)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Radio Hidráulico (R)</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(R, 3)} <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>m</span>
          </div>
        </div>

        <div style={{ background: 'rgba(10, 17, 32, 0.7)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Espejo de Agua (T)</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(T, 3)} <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>m</span>
          </div>
        </div>

        <div style={{ background: 'rgba(10, 17, 32, 0.7)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Velocidad Media (V)</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatNumber(V, 3)} <span style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>m/s</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <Info size={14} color="var(--cyan-400)" />
        <span>El nivel de agua en el gráfico se actualiza dinámicamente con la aproximación <strong>x<sub>r</sub></strong> calculada en cada paso del algoritmo.</span>
      </div>
    </div>
  );
};
