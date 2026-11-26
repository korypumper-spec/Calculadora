import React from 'react';
import {
  AguinaldoParams,
  CausalFiniquito,
  CreditosParams,
  FiniquitoParams,
  FondoAhorroParams,
  JubilacionParams,
  ModoProporcionalAguinaldo,
  PrimaVacacionalParams,
  RegimenJubilacion,
  TipoPrestacion,
  VacacionesParams,
} from '../engine/types';

export interface CalculatorParamsState {
  aguinaldo: AguinaldoParams;
  vacaciones: VacacionesParams;
  primaVacacional: PrimaVacacionalParams;
  fondoAhorro: FondoAhorroParams;
  creditos: CreditosParams;
  jubilacion: JubilacionParams;
  finiquito: FiniquitoParams;
}

interface PrestacionParamsPanelProps {
  tipo: TipoPrestacion;
  state: CalculatorParamsState;
  onChange: <K extends keyof CalculatorParamsState>(
    key: K,
    value: CalculatorParamsState[K],
  ) => void;
}

export const PrestacionParamsPanel: React.FC<PrestacionParamsPanelProps> = ({
  tipo,
  state,
  onChange,
}) => {
  const inputCls =
    'w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700';
  const textInputCls =
    'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700';

  if (tipo === TipoPrestacion.AGUINALDO) {
    const p = state.aguinaldo;
    const set = (patch: Partial<AguinaldoParams>) =>
      onChange('aguinaldo', { ...p, ...patch });

    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Parámetros de Aguinaldo · Cláusula 107 CCT 2025-2027
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Tres meses de sueldo nominal proporcional a sueldos percibidos, con anticipo de medio mes en enero, un mes en agosto a solicitud y saldo en diciembre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Ejercicio anual
            </label>
            <input
              type="text"
              value={p.anio}
              onChange={(e) => set({ anio: e.target.value })}
              className={inputCls}
              placeholder="2026"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tiempo laborado en el periodo
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-md">
              {[
                { id: ModoProporcionalAguinaldo.ANIO_COMPLETO, label: 'Año completo' },
                { id: ModoProporcionalAguinaldo.MESES, label: 'Por meses' },
                { id: ModoProporcionalAguinaldo.DIAS, label: 'Por días' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => set({ modoProporcional: opt.id })}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap truncate ${
                    p.modoProporcional === opt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {p.modoProporcional === ModoProporcionalAguinaldo.MESES && (
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Meses laborados en el año (1 a 12)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={p.mesesLaborados}
              onChange={(e) => set({ mesesLaborados: e.target.value })}
              className={inputCls}
              placeholder="12"
            />
          </div>
        )}

        {p.modoProporcional === ModoProporcionalAguinaldo.DIAS && (
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Días laborados en el año (1 a 365)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={p.diasLaborados}
              onChange={(e) => set({ diasLaborados: e.target.value })}
              className={inputCls}
              placeholder="365"
            />
          </div>
        )}

        {/* Anticipos */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={p.anticipoEneroPagado}
                onChange={(e) => set({ anticipoEneroPagado: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
              />
              <span className="text-xs font-semibold text-slate-900">
                Descontar anticipo de enero (½ mes · Cláusula 107)
              </span>
            </label>
            {p.anticipoEneroPagado && (
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Monto exacto pagado en enero (opcional; si queda vacío usa 0.5 × sueldo nominal)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={p.anticipoEneroMonto}
                  onChange={(e) => set({ anticipoEneroMonto: e.target.value })}
                  className={inputCls}
                  placeholder="Automático (0.5 meses)"
                />
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={p.anticipoAgostoSolicitado}
                onChange={(e) => set({ anticipoAgostoSolicitado: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
              />
              <span className="text-xs font-semibold text-slate-900">
                Solicitó y recibió anticipo de agosto (1 mes · Cláusula 107)
              </span>
            </label>
            {p.anticipoAgostoSolicitado && (
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Monto exacto pagado en agosto (opcional; si queda vacío usa 1.0 × sueldo nominal)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={p.anticipoAgostoMonto}
                  onChange={(e) => set({ anticipoAgostoMonto: e.target.value })}
                  className={inputCls}
                  placeholder="Automático (1.0 mes)"
                />
              </div>
            )}
          </div>
        </div>

        {/* Incidencias con fundamento */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Días de incidencia sin goce (opcional)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={p.diasIncidenciaSinGoce}
              onChange={(e) => set({ diasIncidenciaSinGoce: e.target.value })}
              className={inputCls}
              placeholder="0"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Fundamento normativo de la incidencia (obligatorio si capturas días &gt; 0)
            </label>
            <input
              type="text"
              value={p.justificacionIncidencia}
              onChange={(e) => set({ justificacionIncidencia: e.target.value })}
              className={textInputCls}
              placeholder="Ej. Licencia sin goce de sueldo Cláusula 44 CCT"
            />
          </div>
        </div>
      </section>
    );
  }

  if (tipo === TipoPrestacion.VACACIONES) {
    const p = state.vacaciones;
    const set = (patch: Partial<VacacionesParams>) =>
      onChange('vacaciones', { ...p, ...patch });

    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Parámetros de Vacaciones · Cláusula 47 CCT 2025-2027
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Dos periodos anuales de 10 días hábiles cada uno (20 días base) con goce de sueldo, más días adicionales según antigüedad acreditada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Año
            </label>
            <input
              type="text"
              value={p.anio}
              onChange={(e) => set({ anio: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Años de antigüedad efectivos
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={p.aniosAntiguedad}
              onChange={(e) => set({ aniosAntiguedad: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Días adicionales verificados
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={p.diasAdicionalesVerificados}
              onChange={(e) => set({ diasAdicionalesVerificados: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Periodo a simular
            </label>
            <select
              value={p.periodoSolicitado}
              onChange={(e) =>
                set({
                  periodoSolicitado: e.target.value as VacacionesParams['periodoSolicitado'],
                })
              }
              className={textInputCls}
            >
              <option value="ANUAL_COMPLETO">Anual completo (2 periodos)</option>
              <option value="PRIMER_PERIODO">1er periodo semestral</option>
              <option value="SEGUNDO_PERIODO">2do periodo semestral</option>
            </select>
          </div>
        </div>
      </section>
    );
  }

  if (tipo === TipoPrestacion.PRIMA_VACACIONAL) {
    const p = state.primaVacacional;
    const set = (patch: Partial<PrimaVacacionalParams>) =>
      onChange('primaVacacional', { ...p, ...patch });

    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Parámetros de Prima Vacacional · Cláusula 47 CCT 2025-2027
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            25% sobre los sueldos correspondientes a los días del periodo vacacional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Año
            </label>
            <input
              type="text"
              value={p.anio}
              onChange={(e) => set({ anio: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Días de vacaciones del periodo
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={p.diasVacacionesBase}
              onChange={(e) => set({ diasVacacionesBase: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Periodicidad del pago
            </label>
            <select
              value={p.periodo}
              onChange={(e) =>
                set({ periodo: e.target.value as PrimaVacacionalParams['periodo'] })
              }
              className={textInputCls}
            >
              <option value="ANUAL">Anual (2 periodos)</option>
              <option value="SEMESTRAL">Semestral (1 periodo)</option>
            </select>
          </div>
        </div>
      </section>
    );
  }

  if (tipo === TipoPrestacion.FONDO_AHORRO) {
    const p = state.fondoAhorro;
    const set = (patch: Partial<FondoAhorroParams>) =>
      onChange('fondoAhorro', { ...p, ...patch });

    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Parámetros de Fondo de Ahorro · Cláusula 144 CCT 2025-2027
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            45 días de Sueldo Tabular (Concepto 002 únicamente; excluye Concepto 011). Ciclo del 1 de julio al 30 de junio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Ciclo (julio–junio)
            </label>
            <input
              type="text"
              value={p.ciclo}
              onChange={(e) => set({ ciclo: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Días laborados en el ciclo (1 a 365)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={p.diasLaboradosCiclo}
              onChange={(e) => set({ diasLaboradosCiclo: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Pagos o anticipos previos descontados (MXN)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={p.anticipoOProrrateoPrevio}
              onChange={(e) => set({ anticipoOProrrateoPrevio: e.target.value })}
              className={inputCls}
              placeholder="0"
            />
          </div>
        </div>
      </section>
    );
  }

  if (tipo === TipoPrestacion.CREDITOS) {
    const p = state.creditos;
    const set = (patch: Partial<CreditosParams>) =>
      onChange('creditos', { ...p, ...patch });

    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Parámetros de Créditos · Cláusulas 145 y 146 CCT / Art. 110 LFT
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Evaluación de referencia sobre Sueldo Tabular (002) y capacidad de descuento; el monto definitivo requiere validar el reglamento vigente y deducciones del tarjetón.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Tipo de crédito institucional
            </label>
            <select
              value={p.tipoCredito}
              onChange={(e) =>
                set({ tipoCredito: e.target.value as CreditosParams['tipoCredito'] })
              }
              className={textInputCls}
            >
              <option value="CORTO_PLAZO">Préstamo a Corto Plazo</option>
              <option value="MEDIANO_PLAZO">Préstamo a Mediano Plazo</option>
              <option value="HIPOTECARIO">Crédito Hipotecario / Vivienda</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Descuentos mensuales vigentes en tarjetón (MXN)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={p.descuentosActualesTarjeton}
              onChange={(e) => set({ descuentosActualesTarjeton: e.target.value })}
              className={inputCls}
              placeholder="Captura adeudos vigentes"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Monto de crédito de interés (MXN)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={p.montoSolicitado}
              onChange={(e) => set({ montoSolicitado: e.target.value })}
              className={inputCls}
              placeholder="Opcional"
            />
          </div>
        </div>
      </section>
    );
  }

  if (tipo === TipoPrestacion.JUBILACION) {
    const p = state.jubilacion;
    const set = (patch: Partial<JubilacionParams>) =>
      onChange('jubilacion', { ...p, ...patch });

    return (
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Parámetros de Jubilación · RJP (Arts. 4 y 5) / Cuentas Individuales LSS
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            El RJP tradicional exige validar fecha de ingreso y todos los conceptos integradores del Art. 5; no se inventa pensión únicamente con 002 y 011.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Régimen aplicable
            </label>
            <select
              value={p.regimen}
              onChange={(e) =>
                set({ regimen: e.target.value as RegimenJubilacion })
              }
              className={textInputCls}
            >
              <option value={RegimenJubilacion.RJP_TRADICIONAL}>
                RJP Tradicional (ingreso previo a reforma 2008)
              </option>
              <option value={RegimenJubilacion.CUENTAS_INDIVIDUALES_2008}>
                Cuentas Individuales / LSS (marzo 2008 en adelante)
              </option>
              <option value={RegimenJubilacion.DESCONOCIDO}>
                Por confirmar según constancia de ingreso
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Años efectivos de servicio
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={p.aniosServicio}
              onChange={(e) => set({ aniosServicio: e.target.value })}
              className={inputCls}
              placeholder="Ej. 27"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Edad actual (años)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={p.edad}
              onChange={(e) => set({ edad: e.target.value })}
              className={inputCls}
              placeholder="Ej. 55"
            />
          </div>
        </div>
      </section>
    );
  }

  // FINIQUITO
  const p = state.finiquito;
  const set = (patch: Partial<FiniquitoParams>) =>
    onChange('finiquito', { ...p, ...patch });

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Parámetros de Finiquito · Cláusulas 47, 56, 59 Bis, 107, 144 CCT y LFT
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">
          Desglose diferenciado: Aguinaldo y Vacaciones sobre 002+011; Fondo de Ahorro exclusivamente sobre 002 (Sueldo Tabular).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Causal de término
          </label>
          <select
            value={p.causal}
            onChange={(e) => set({ causal: e.target.value as CausalFiniquito })}
            className={textInputCls}
          >
            <option value={CausalFiniquito.RENUNCIA_VOLUNTARIA}>
              Renuncia voluntaria
            </option>
            <option value={CausalFiniquito.TERMINO_CONTRATO}>
              Término de contrato / obra
            </option>
            <option value={CausalFiniquito.DESPIDO_INJUSTIFICADO}>
              Rescisión / Despido injustificado
            </option>
            <option value={CausalFiniquito.NO_ESPECIFICADA}>
              Por determinar
            </option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Días pendientes de aguinaldo (0–365)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={p.diasAguinaldoPendientes}
            onChange={(e) => set({ diasAguinaldoPendientes: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Días pendientes de fondo de ahorro (0–365)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={p.diasFondoAhorroPendientes}
            onChange={(e) => set({ diasFondoAhorroPendientes: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Días de vacaciones pendientes
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={p.diasVacacionesPendientes}
            onChange={(e) => set({ diasVacacionesPendientes: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Anticipos de aguinaldo ya pagados (MXN)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={p.anticiposAguinaldoYaPagados}
            onChange={(e) => set({ anticiposAguinaldoYaPagados: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Años de antigüedad
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={p.aniosAntiguedad}
            onChange={(e) => set({ aniosAntiguedad: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </section>
  );
};
