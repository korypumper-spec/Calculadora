import React, { useState } from 'react';
import {
  ESTADO_APLICABILIDAD_LABELS,
  obtenerReglaAplicabilidad,
  PERFIL_LABORAL_LABELS,
  PRESTACION_LABELS,
} from '../engine/normativeRules';
import {
  EstadoAplicabilidad,
  PerfilLaboral,
  TipoPrestacion,
} from '../engine/types';

interface MatrizPerfilesViewProps {
  perfilActual: PerfilLaboral;
  onSelectPerfilAndPrestacion: (
    perfil: PerfilLaboral,
    prestacion: TipoPrestacion,
  ) => void;
}

const PERFILES: PerfilLaboral[] = [
  PerfilLaboral.BASE,
  PerfilLaboral.SUSTITUTO,
  PerfilLaboral.TEMPORAL,
  PerfilLaboral.CONFIANZA_A,
  PerfilLaboral.CONFIANZA_B,
];

const PRESTACIONES: TipoPrestacion[] = [
  TipoPrestacion.AGUINALDO,
  TipoPrestacion.VACACIONES,
  TipoPrestacion.PRIMA_VACACIONAL,
  TipoPrestacion.FONDO_AHORRO,
  TipoPrestacion.CREDITOS,
  TipoPrestacion.JUBILACION,
  TipoPrestacion.FINIQUITO,
];

function stateStyle(estado: EstadoAplicabilidad): string {
  switch (estado) {
    case EstadoAplicabilidad.APLICABLE:
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case EstadoAplicabilidad.CONDICIONADO:
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case EstadoAplicabilidad.NO_APLICABLE:
      return 'bg-red-50 text-red-800 border-red-200';
    case EstadoAplicabilidad.NO_DETERMINABLE:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

export const MatrizPerfilesView: React.FC<MatrizPerfilesViewProps> = ({
  perfilActual,
  onSelectPerfilAndPrestacion,
}) => {
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<{
    prestacion: TipoPrestacion;
    perfil: PerfilLaboral;
  }>({
    prestacion: TipoPrestacion.AGUINALDO,
    perfil: perfilActual,
  });

  const reglaDetalle = obtenerReglaAplicabilidad(
    detalleSeleccionado.prestacion,
    detalleSeleccionado.perfil,
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Matriz de Aplicabilidad por Perfil Laboral · CCT 2025-2027
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            La aplicación no extiende automáticamente prestaciones del personal de base a sustitutos, temporales o personal de confianza. Haz clic en cualquier celda para consultar su fundamento o abrir la calculadora.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-3.5 font-semibold">Prestación</th>
                {PERFILES.map((perfil) => (
                  <th
                    key={perfil}
                    className={`py-3 px-3 font-semibold ${
                      perfil === perfilActual ? 'bg-emerald-50/70 text-emerald-950' : ''
                    }`}
                  >
                    {PERFIL_LABORAL_LABELS[perfil]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {PRESTACIONES.map((prestacion) => (
                <tr key={prestacion} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                    {PRESTACION_LABELS[prestacion]}
                  </td>
                  {PERFILES.map((perfil) => {
                    const regla = obtenerReglaAplicabilidad(prestacion, perfil);
                    const isSelected =
                      detalleSeleccionado.prestacion === prestacion &&
                      detalleSeleccionado.perfil === perfil;
                    return (
                      <td
                        key={perfil}
                        className={`py-2.5 px-3 ${
                          perfil === perfilActual ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setDetalleSeleccionado({ prestacion, perfil })
                          }
                          className={`w-full text-left px-2.5 py-1.5 text-[11px] font-semibold border rounded transition-colors whitespace-nowrap ${stateStyle(
                            regla.estado,
                          )} ${isSelected ? 'ring-2 ring-emerald-800/40' : ''}`}
                        >
                          {ESTADO_APLICABILIDAD_LABELS[regla.estado]}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="text-xs font-medium text-slate-500">
            {PRESTACION_LABELS[detalleSeleccionado.prestacion]} · Perfil{' '}
            {PERFIL_LABORAL_LABELS[detalleSeleccionado.perfil]} ·{' '}
            <span className="font-semibold text-slate-800">
              {ESTADO_APLICABILIDAD_LABELS[reglaDetalle.estado]}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {reglaDetalle.documentoAplicable}
          </h3>
          <p className="text-xs text-slate-700">{reglaDetalle.fundamento}</p>
        </div>

        <button
          type="button"
          onClick={() =>
            onSelectPerfilAndPrestacion(
              detalleSeleccionado.perfil,
              detalleSeleccionado.prestacion,
            )
          }
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          Simular con este perfil
        </button>
      </section>
    </div>
  );
};
