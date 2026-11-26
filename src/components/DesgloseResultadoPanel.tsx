import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  HelpCircle,
  Info,
  XCircle,
} from 'lucide-react';
import { ESTADO_APLICABILIDAD_LABELS } from '../engine/normativeRules';
import {
  DesgloseObligatorio,
  EstadoAplicabilidad,
  EstatusCalculo,
  Periodicidad,
} from '../engine/types';

interface DesgloseResultadoPanelProps {
  desglose: DesgloseObligatorio;
  onEditTarjeton: () => void;
}

function renderEstadoBadge(estado: EstadoAplicabilidad) {
  switch (estado) {
    case EstadoAplicabilidad.APLICABLE:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          {ESTADO_APLICABILIDAD_LABELS[estado]}
        </span>
      );
    case EstadoAplicabilidad.CONDICIONADO:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {ESTADO_APLICABILIDAD_LABELS[estado]}
        </span>
      );
    case EstadoAplicabilidad.NO_APLICABLE:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-800 border border-red-200 whitespace-nowrap shrink-0">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          {ESTADO_APLICABILIDAD_LABELS[estado]}
        </span>
      );
    case EstadoAplicabilidad.NO_DETERMINABLE:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-800 border border-slate-300 whitespace-nowrap shrink-0">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          {ESTADO_APLICABILIDAD_LABELS[estado]}
        </span>
      );
  }
}

export const DesgloseResultadoPanel: React.FC<DesgloseResultadoPanelProps> = ({
  desglose,
  onEditTarjeton,
}) => {
  const esPendienteValidacion =
    desglose.estatusCalculo === EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA;
  const esIncompleto = desglose.estatusCalculo === EstatusCalculo.INCOMPLETO;
  const esNoAplicable = desglose.estatusCalculo === EstatusCalculo.NO_APLICABLE;

  return (
    <section
      aria-label="Desglose obligatorio del resultado"
      className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200"
    >
      {/* Header Summary + Primary Result */}
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-semibold text-slate-900">
              Desglose Obligatorio · {desglose.tituloPrestacion}
            </h3>
            {renderEstadoBadge(desglose.estadoAplicabilidad)}
          </div>
          <p className="text-sm text-slate-700">{desglose.mensajeEstatus}</p>
          <p className="text-xs text-slate-500">
            {desglose.perfilLaboralLabel} · {desglose.periodoCalculado} ·{' '}
            {desglose.clausulaUtilizada}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
          <div className="text-left lg:text-right">
            <div className="text-xs font-medium text-slate-500">
              {esPendienteValidacion
                ? 'Resultado estimado'
                : esIncompleto
                  ? 'Estado de cálculo'
                  : esNoAplicable
                    ? 'Procedencia'
                    : 'Resultado estimado'}
            </div>
            {desglose.resultadoEstimado ? (
              <div className="text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
                {desglose.resultadoEstimado}
              </div>
            ) : (
              <div className="text-sm font-semibold text-amber-800 mt-1">
                {esIncompleto
                  ? 'Cálculo incompleto'
                  : esNoAplicable
                    ? 'No aplicable al perfil'
                    : 'Estimación pendiente de validación normativa'}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onEditTarjeton}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Corregir importes y volver a calcular
          </button>
        </div>
      </div>

      {/* 3-Layer Distinction: Dato Capturado vs Base Normativa vs Resultado */}
      <div className="p-5 sm:p-6">
        <h4 className="text-xs font-semibold text-slate-500 mb-3">
          Separación entre dato capturado del tarjetón, base normativa y resultado
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-medium text-slate-500">
              1. Dato capturado · Concepto 002
            </div>
            <div className="text-sm font-mono font-semibold tabular-nums text-slate-900 mt-1">
              {desglose.concepto002Capturado.importeOriginal ?? 'No capturado'}
            </div>
            <div className="text-xs text-slate-600 mt-1 tabular-nums">
              Periodicidad:{' '}
              {desglose.concepto002Capturado.periodicidadOriginal ===
              Periodicidad.QUINCENAL
                ? 'Quincenal'
                : 'Mensual'}
              {desglose.concepto002Capturado.periodicidadOriginal ===
                Periodicidad.QUINCENAL &&
                desglose.concepto002Capturado.equivalenteMensual && (
                  <span className="block font-mono text-emerald-800 mt-0.5">
                    Mensual (×2): {desglose.concepto002Capturado.equivalenteMensual}
                  </span>
                )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-medium text-slate-500">
              2. Dato capturado · Concepto 011
            </div>
            <div className="text-sm font-mono font-semibold tabular-nums text-slate-900 mt-1">
              {desglose.concepto011Capturado.importeOriginal ?? 'No capturado'}
            </div>
            <div className="text-xs text-slate-600 mt-1 tabular-nums">
              Periodicidad:{' '}
              {desglose.concepto011Capturado.periodicidadOriginal ===
              Periodicidad.QUINCENAL
                ? 'Quincenal'
                : 'Mensual'}
              {desglose.concepto011Capturado.periodicidadOriginal ===
                Periodicidad.QUINCENAL &&
                desglose.concepto011Capturado.equivalenteMensual && (
                  <span className="block font-mono text-emerald-800 mt-0.5">
                    Mensual (×2): {desglose.concepto011Capturado.equivalenteMensual}
                  </span>
                )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-medium text-slate-500">
              3. Base normativa aplicada
            </div>
            <div className="text-sm font-mono font-semibold tabular-nums text-slate-900 mt-1">
              {desglose.baseSalarialMonto ?? 'Pendiente de definición'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              {desglose.clausulaUtilizada}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <div className="text-xs font-medium text-slate-500">
              4. Resultado estimado neto
            </div>
            <div className="text-sm font-mono font-semibold tabular-nums text-slate-900 mt-1">
              {desglose.resultadoEstimado ?? 'Sin importe definitivo'}
            </div>
            <div className="text-xs text-slate-600 mt-1 tabular-nums">
              Anticipos descontados: {desglose.totalAnticiposDescontados}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory 13-Point Audit Specification Grid */}
      <div className="p-5 sm:p-6">
        <h4 className="text-xs font-semibold text-slate-500 mb-3">
          Ficha técnica normativa del cálculo
        </h4>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500">Perfil laboral</dt>
            <dd className="text-slate-900 font-medium mt-0.5">
              {desglose.perfilLaboralLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Periodo calculado</dt>
            <dd className="text-slate-900 font-medium mt-0.5">
              {desglose.periodoCalculado}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">
              Periodicidad de los importes
            </dt>
            <dd className="text-slate-800 mt-0.5">{desglose.periodicidadResumen}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">
              Días o meses considerados
            </dt>
            <dd className="text-slate-900 font-medium mt-0.5 tabular-nums">
              {desglose.diasOMesesConsiderados}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs font-medium text-slate-500">
              Base normativa aplicada y explicación
            </dt>
            <dd className="text-slate-800 mt-0.5">{desglose.baseNormativaAplicada}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs font-medium text-slate-500">
              Fundamento de aplicabilidad al perfil
            </dt>
            <dd className="text-slate-800 mt-0.5">
              {desglose.fundamentoAplicabilidad}
            </dd>
          </div>
        </dl>
      </div>

      {/* Step-by-step BigDecimal formula */}
      {desglose.formulaPasoAPaso.length > 0 && (
        <div className="p-5 sm:p-6">
          <h4 className="text-xs font-semibold text-slate-500 mb-3">
            Fórmula paso a paso (aritmética BigDecimal sin redondeos intermedios)
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold w-12">Paso</th>
                  <th className="py-2.5 px-3 font-semibold">Concepto</th>
                  <th className="py-2.5 px-3 font-semibold">Operación</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {desglose.formulaPasoAPaso.map((paso) => (
                  <tr key={paso.orden} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">
                      0{paso.orden}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {paso.descripcion}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                      {paso.expresion}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-slate-900 text-right whitespace-nowrap">
                      {paso.resultado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Breakdown items (Aguinaldo breakdown / Finiquito items / Credit & Pension partial refs) */}
      {desglose.partidasAdicionales && desglose.partidasAdicionales.length > 0 && (
        <div className="p-5 sm:p-6">
          <h4 className="text-xs font-semibold text-slate-500 mb-3">
            Desglose de partidas por cláusula
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">Partida</th>
                  <th className="py-2.5 px-3 font-semibold">Cláusula / Base</th>
                  <th className="py-2.5 px-3 font-semibold">Observación</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {desglose.partidasAdicionales.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {item.concepto}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <span className="block font-medium">{item.clausula}</span>
                      <span className="text-[11px] text-slate-500">{item.baseAplicada}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.nota}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-right whitespace-nowrap">
                      {item.montoEstimado ? (
                        <span className="text-slate-900">{item.montoEstimado}</span>
                      ) : (
                        <span className="text-amber-800">Pendiente validación</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advances or Previous Payments Deducted */}
      <div className="p-5 sm:p-6">
        <h4 className="text-xs font-semibold text-slate-500 mb-2">
          Anticipos o pagos previos descontados
        </h4>
        {desglose.anticiposOPagosPrevios.length === 0 ? (
          <p className="text-xs text-slate-600">
            Ningún anticipo o pago previo descontado en este cálculo ($0.00 MXN).
          </p>
        ) : (
          <div className="space-y-2">
            {desglose.anticiposOPagosPrevios.map((ant, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900">{ant.concepto}</span>
                  <span className="block text-slate-600">{ant.observacion}</span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                  − {ant.monto}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warnings, Assumptions, Missing Data */}
      <div className="p-5 sm:p-6 bg-slate-50/60 grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
        <div>
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            Advertencias y límites normativos
          </h4>
          <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
            {desglose.advertencias.map((adv, i) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            Supuestos aplicados
          </h4>
          {desglose.supuestos.length === 0 ? (
            <p className="text-slate-600">Sin supuestos adicionales.</p>
          ) : (
            <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
              {desglose.supuestos.map((sup, i) => (
                <li key={i}>{sup}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            Datos o documentos faltantes
          </h4>
          {desglose.datosFaltantes.length === 0 ? (
            <p className="text-emerald-800 font-medium">
              Sin datos faltantes para los conceptos contemplados en esta simulación.
            </p>
          ) : (
            <ul className="space-y-1.5 text-amber-950 list-disc pl-4">
              {desglose.datosFaltantes.map((fal, i) => (
                <li key={i}>{fal}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
