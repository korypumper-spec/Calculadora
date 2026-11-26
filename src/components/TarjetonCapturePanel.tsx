import React from 'react';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { BigDecimal } from '../engine/bigDecimal';
import {
  normalizarTarjeton,
  PERFIL_LABORAL_LABELS,
} from '../engine/normativeRules';
import {
  PerfilLaboral,
  Periodicidad,
  TarjetonData,
} from '../engine/types';

interface TarjetonCapturePanelProps {
  tarjeton: TarjetonData;
  onChange: (updated: TarjetonData) => void;
  onReset: () => void;
  c002InputRef: React.RefObject<HTMLInputElement | null>;
}

const PERFILES: PerfilLaboral[] = [
  PerfilLaboral.BASE,
  PerfilLaboral.SUSTITUTO,
  PerfilLaboral.TEMPORAL,
  PerfilLaboral.CONFIANZA_A,
  PerfilLaboral.CONFIANZA_B,
];

export const TarjetonCapturePanel: React.FC<TarjetonCapturePanelProps> = ({
  tarjeton,
  onChange,
  onReset,
  c002InputRef,
}) => {
  const norm = normalizarTarjeton(tarjeton);

  const updatePerfil = (perfil: PerfilLaboral) => {
    onChange({ ...tarjeton, perfilLaboral: perfil });
  };

  const updateConcepto = (
    key: 'concepto002' | 'concepto011',
    field: 'rawAmount' | 'periodicidad',
    value: string | Periodicidad,
  ) => {
    onChange({
      ...tarjeton,
      [key]: {
        ...tarjeton[key],
        [field]: value,
      },
    });
  };

  const renderEquivalenteMensual = (
    raw: string,
    periodicidad: Periodicidad,
  ) => {
    const parsed = BigDecimal.tryParse(raw);
    if (!parsed || parsed.lte(0)) {
      return (
        <span className="text-xs text-slate-500">
          Captura el importe exacto de tu tarjetón
        </span>
      );
    }
    if (periodicidad === Periodicidad.QUINCENAL) {
      const mensual = parsed.mul(2);
      return (
        <span className="text-xs text-emerald-800 font-medium tabular-nums">
          Original quincenal: <span className="font-mono">{parsed.toCurrencyMXN()}</span> · Equivalente mensual (× 2):{' '}
          <span className="font-mono font-semibold">{mensual.toCurrencyMXN()}</span>
        </span>
      );
    }
    return (
      <span className="text-xs text-slate-700 font-medium tabular-nums">
        Periodicidad mensual directa: <span className="font-mono font-semibold">{parsed.toCurrencyMXN()}</span>
      </span>
    );
  };

  return (
    <section
      aria-label="Captura de tarjetón y perfil laboral"
      className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Datos del Tarjetón de Pago y Perfil Laboral
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Captura por separado los conceptos 002 y 011 sin sustituir ni estimar datos faltantes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {norm.completo ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-emerald-800">Tarjetón completo</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-amber-800">Captura incompleta</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar captura
          </button>
        </div>
      </div>

      {/* Labor Profile Selector */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Perfil laboral para verificación de aplicabilidad normativa
        </label>
        <div
          role="radiogroup"
          aria-label="Perfil laboral"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
        >
          {PERFILES.map((perfil) => {
            const active = tarjeton.perfilLaboral === perfil;
            return (
              <button
                key={perfil}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updatePerfil(perfil)}
                className={`px-3 py-2.5 text-left text-xs font-medium rounded-md border transition-colors whitespace-nowrap truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                  active
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {PERFIL_LABORAL_LABELS[perfil]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Concept 002 & Concept 011 Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 pt-5 border-t border-slate-200">
        {/* Concepto 002 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="input-c002"
              className="text-sm font-semibold text-slate-900"
            >
              <span className="font-mono text-emerald-800 mr-1.5">002</span>
              Sueldo Base (Tabular)
            </label>
            <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md shrink-0">
              <button
                type="button"
                onClick={() =>
                  updateConcepto('concepto002', 'periodicidad', Periodicidad.QUINCENAL)
                }
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  tarjeton.concepto002.periodicidad === Periodicidad.QUINCENAL
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quincenal
              </button>
              <button
                type="button"
                onClick={() =>
                  updateConcepto('concepto002', 'periodicidad', Periodicidad.MENSUAL)
                }
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  tarjeton.concepto002.periodicidad === Periodicidad.MENSUAL
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-500">
              $
            </span>
            <input
              ref={c002InputRef}
              id="input-c002"
              type="text"
              inputMode="decimal"
              value={tarjeton.concepto002.rawAmount}
              onChange={(e) =>
                updateConcepto('concepto002', 'rawAmount', e.target.value)
              }
              placeholder="Ej. 4520.50"
              aria-describedby="help-c002"
              className={`w-full pl-7 pr-28 py-2.5 text-sm font-mono tabular-nums bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 ${
                norm.c002Detalle.errorValidacion && norm.c002Detalle.capturado
                  ? 'border-amber-400'
                  : 'border-slate-300'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
              MXN / {tarjeton.concepto002.periodicidad === Periodicidad.QUINCENAL ? 'Quincena' : 'Mes'}
            </span>
          </div>

          <div id="help-c002" className="flex flex-col gap-0.5">
            {renderEquivalenteMensual(
              tarjeton.concepto002.rawAmount,
              tarjeton.concepto002.periodicidad,
            )}
            <span className="text-[11px] text-slate-500">
              Importe exacto del Concepto 002 en tu tarjetón. No uses el Total Líquido ni el Concepto 049.
            </span>
          </div>
        </div>

        {/* Concepto 011 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="input-c011"
              className="text-sm font-semibold text-slate-900"
            >
              <span className="font-mono text-emerald-800 mr-1.5">011</span>
              Ayuda de Renta · Cláusula 63 Bis, inciso b
            </label>
            <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md shrink-0">
              <button
                type="button"
                onClick={() =>
                  updateConcepto('concepto011', 'periodicidad', Periodicidad.QUINCENAL)
                }
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  tarjeton.concepto011.periodicidad === Periodicidad.QUINCENAL
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quincenal
              </button>
              <button
                type="button"
                onClick={() =>
                  updateConcepto('concepto011', 'periodicidad', Periodicidad.MENSUAL)
                }
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  tarjeton.concepto011.periodicidad === Periodicidad.MENSUAL
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-500">
              $
            </span>
            <input
              id="input-c011"
              type="text"
              inputMode="decimal"
              value={tarjeton.concepto011.rawAmount}
              onChange={(e) =>
                updateConcepto('concepto011', 'rawAmount', e.target.value)
              }
              placeholder="Ej. 1680.00"
              aria-describedby="help-c011"
              className="w-full pl-7 pr-28 py-2.5 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
              MXN / {tarjeton.concepto011.periodicidad === Periodicidad.QUINCENAL ? 'Quincena' : 'Mes'}
            </span>
          </div>

          <div id="help-c011" className="flex flex-col gap-0.5">
            {renderEquivalenteMensual(
              tarjeton.concepto011.rawAmount,
              tarjeton.concepto011.periodicidad,
            )}
            <span className="text-[11px] text-slate-500">
              Exclusivamente Concepto 011 (Cláusula 63 Bis b). No lo reemplaces por los conceptos 020 o 022.
            </span>
          </div>
        </div>
      </div>

      {!norm.completo && (
        <div
          role="status"
          className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2.5 text-xs text-amber-950"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Cálculo incompleto: se requieren los importes del Concepto 002 y del Concepto 011.
            </p>
            <p className="mt-0.5 text-amber-900">
              Pendiente: {norm.datosFaltantes.join(' · ')}. La aplicación no estima ni inventa conceptos salariales faltantes.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
