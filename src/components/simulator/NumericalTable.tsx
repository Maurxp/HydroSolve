import React, { useState } from 'react';
import type { NumericalMethodResult } from '../../types/numerical';
import type { ChannelParameters } from '../../types/hydraulics';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { generateIterationsCsv, downloadCsvFile } from '../../utils/csvExport';
import { Table, Download, Copy, Check, CheckCircle2 } from 'lucide-react';

interface NumericalTableProps {
  result: NumericalMethodResult;
  params: ChannelParameters;
  currentIndex: number;
  onSelectIteration: (idx: number) => void;
}

export const NumericalTable: React.FC<NumericalTableProps> = ({
  result,
  params,
  currentIndex,
  onSelectIteration,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const csv = generateIterationsCsv(params, result);
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleExportCsv = () => {
    const csv = generateIterationsCsv(params, result);
    downloadCsvFile(csv, `HydroSolve_Manning_RegulaFalsi_Q${params.Q}.csv`);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} id="tabla-numerica">
      {/* Header de la tabla */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.45rem', borderRadius: 'var(--radius-md)', color: 'var(--cyan-400)' }}>
            <Table size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Tabla Numérica de Iteraciones</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Historial completo del cálculo numérico (precisión interna de 64 bits en coma flotante)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            title="Copiar datos al portapapeles en formato CSV"
          >
            {copied ? (
              <>
                <Check size={14} color="var(--emerald-400)" /> ¡Copiado!
              </>
            ) : (
              <>
                <Copy size={14} /> Copiar Tabla
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportCsv}
            title="Descargar archivo CSV compatible con Excel"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Contenedor con scroll horizontal */}
      <div className="table-container">
        <table className="table-custom">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>i</th>
              <th>a (m)</th>
              <th>b (m)</th>
              <th>f(a) (m³/s)</th>
              <th>f(b) (m³/s)</th>
              <th>x<sub>r</sub> (m)</th>
              <th>f(x<sub>r</sub>) (m³/s)</th>
              <th>ε<sub>a</sub> (%)</th>
              <th>|Δx| (m)</th>
              <th>ε<sub>t</sub> (%)</th>
              <th>Reemplaza</th>
              <th>Nuevo [a, b]</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {result.iterations.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay iteraciones calculadas. Verifique los parámetros y el cambio de signo.
                </td>
              </tr>
            ) : (
              result.iterations.map((it, idx) => {
                const isActive = idx === currentIndex;
                const isLast = idx === result.iterations.length - 1;

                let rowClass = '';
                if (isActive) rowClass += ' row-active';
                if (it.isConverged) rowClass += ' row-converged';

                return (
                  <tr
                    key={it.iteration}
                    className={rowClass}
                    onClick={() => onSelectIteration(idx)}
                    style={{ cursor: 'pointer' }}
                    title={`Haga clic para ver el paso ${it.iteration} en el simulador y gráficos`}
                  >
                    <td style={{ fontWeight: 700, color: isActive ? 'var(--cyan-300)' : 'var(--text-muted)' }}>
                      {it.iteration}
                    </td>
                    <td>{formatNumber(it.a, 5)}</td>
                    <td>{formatNumber(it.b, 5)}</td>
                    <td style={{ color: it.fa < 0 ? 'var(--rose-400)' : 'var(--emerald-400)' }}>
                      {formatNumber(it.fa, 4)}
                    </td>
                    <td style={{ color: it.fb < 0 ? 'var(--rose-400)' : 'var(--emerald-400)' }}>
                      {formatNumber(it.fb, 4)}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--cyan-300)' }}>
                      {formatNumber(it.xr, 6)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {it.fxr.toExponential(4)}
                    </td>
                    <td style={{ fontWeight: 600, color: it.isConverged ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
                      {it.approxRelativeError !== null ? formatPercent(it.approxRelativeError, 4) : 'N/A'}
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>
                      {it.absoluteStepError !== null ? formatNumber(it.absoluteStepError, 5) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>
                      {it.trueRelativeError !== null ? formatPercent(it.trueRelativeError, 4) : '—'}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--amber-300)' }}>
                      {it.nextInterval.replacedBound === 'exact_root'
                        ? 'Raíz exacta'
                        : it.nextInterval.replacedBound === 'a'
                        ? 'a ← xr'
                        : 'b ← xr'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      [{formatNumber(it.nextInterval.a, 4)}, {formatNumber(it.nextInterval.b, 4)}]
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {it.isConverged ? (
                        <span style={{ color: 'var(--emerald-400)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem' }}>
                          <CheckCircle2 size={13} /> Convergió
                        </span>
                      ) : isLast ? (
                        <span style={{ color: 'var(--amber-400)', fontSize: '0.78rem' }}>Última</span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Iterando</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>Haga clic en cualquier fila para sincronizar instantáneamente el canal, las gráficas y el desarrollo matemático con esa iteración.</span>
        <span>Total de pasos: <strong>{result.iterations.length}</strong></span>
      </div>
    </div>
  );
};
