import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const GuiaConceptosView: React.FC = () => {
  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Guía Normativa de Conceptos del Tarjetón IMSS-SNTSS
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Reglas estrictas para identificar los conceptos salariales del tarjetón y evitar errores comunes de integración o duplicidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-md space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900">
                Conceptos válidos de captura base
              </h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 pt-1">
              <li>
                <span className="font-mono font-semibold text-emerald-900">002</span>{' '}
                <strong>Sueldo Base (Tabular):</strong> Remuneración base de la categoría en el tabulador. Es la única base utilizada para el Fondo de Ahorro (Cláusula 144).
              </li>
              <li>
                <span className="font-mono font-semibold text-emerald-900">011</span>{' '}
                <strong>Ayuda de Renta · Cláusula 63 Bis, inciso b:</strong> Prestación contractual específica. En Aguinaldo (Cláusula 107) y prestaciones nominales se conserva separado de 002 antes de calcular su base.
              </li>
            </ul>
          </div>

          <div className="p-4 bg-red-50/50 border border-red-200 rounded-md space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900">
                Conceptos prohibidos como sustituto o base
              </h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-2 pt-1">
              <li>
                <span className="font-mono font-semibold text-red-900">020 / 022</span>{' '}
                No reemplaces el Concepto 011 por otros conceptos de ayuda de renta o antigüedad.
              </li>
              <li>
                <span className="font-mono font-semibold text-red-900">049</span>{' '}
                <strong>Aguinaldo:</strong> Nunca uses el Concepto 049 ni anticipos de aguinaldo como salario base para calcular el propio aguinaldo.
              </li>
              <li>
                <strong>Total Líquido / Total Percepciones:</strong> No sustituyas el sueldo tabular ni la base nominal por el total líquido o bruto del tarjetón.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          Diferenciación de Bases por Cláusula del CCT 2025-2027
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Prestación</th>
                <th className="py-2.5 px-3 font-semibold">Cláusula / Norma</th>
                <th className="py-2.5 px-3 font-semibold">Conceptos aplicados</th>
                <th className="py-2.5 px-3 font-semibold">Regla clave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Aguinaldo</td>
                <td className="py-2.5 px-3">Cláusula 107 CCT</td>
                <td className="py-2.5 px-3 font-mono">002 + 011</td>
                <td className="py-2.5 px-3">
                  3 meses de sueldo nominal proporcional; anticipo de enero (½ mes), agosto (1 mes a solicitud) y saldo en diciembre.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Fondo de Ahorro</td>
                <td className="py-2.5 px-3">Cláusula 144 CCT</td>
                <td className="py-2.5 px-3 font-mono">Únicamente 002</td>
                <td className="py-2.5 px-3">
                  45 días de Sueldo Tabular (Concepto 011 excluido de la base).
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  Vacaciones y Prima Vacacional
                </td>
                <td className="py-2.5 px-3">Cláusula 47 CCT</td>
                <td className="py-2.5 px-3 font-mono">002 + 011</td>
                <td className="py-2.5 px-3">
                  2 periodos anuales de 10 días hábiles + días adicionales por antigüedad; 25% de prima vacacional.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Créditos</td>
                <td className="py-2.5 px-3">Cláusulas 145–146 / Art. 110 LFT</td>
                <td className="py-2.5 px-3 font-mono">002 (referencia)</td>
                <td className="py-2.5 px-3">
                  Requiere reglamento específico del préstamo y deducciones vigentes del tarjetón.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">Jubilación</td>
                <td className="py-2.5 px-3">RJP Arts. 4 y 5 / LSS 2008+</td>
                <td className="py-2.5 px-3">Sub-base parcial 002 + 011</td>
                <td className="py-2.5 px-3">
                  Pendiente de validación normativa hasta acreditar fecha de ingreso y totalidad de conceptos del Art. 5 RJP.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
