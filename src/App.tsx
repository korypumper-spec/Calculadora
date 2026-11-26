import React, { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Calculator,
  Calendar,
  CreditCard,
  FileText,
  Landmark,
  Menu,
  PiggyBank,
  Scale,
  X,
} from 'lucide-react';
import { DesgloseResultadoPanel } from './components/DesgloseResultadoPanel';
import { GuiaConceptosView } from './components/GuiaConceptosView';
import { MatrizPerfilesView } from './components/MatrizPerfilesView';
import {
  CalculatorParamsState,
  PrestacionParamsPanel,
} from './components/PrestacionParamsPanel';
import { TarjetonCapturePanel } from './components/TarjetonCapturePanel';
import {
  calcularAguinaldo,
  calcularCreditos,
  calcularFiniquito,
  calcularFondoAhorro,
  calcularJubilacion,
  calcularPrimaVacacional,
  calcularVacaciones,
} from './engine/calculators';
import {
  PERFIL_LABORAL_LABELS,
  PRESTACION_LABELS,
} from './engine/normativeRules';
import {
  CausalFiniquito,
  DesgloseObligatorio,
  ModoProporcionalAguinaldo,
  PerfilLaboral,
  Periodicidad,
  RegimenJubilacion,
  TarjetonData,
  TipoPrestacion,
} from './engine/types';

type ActiveSection =
  | { kind: 'CALCULATOR'; tipo: TipoPrestacion }
  | { kind: 'MATRIZ' }
  | { kind: 'GUIA' };

const INITIAL_TARJETON: TarjetonData = {
  perfilLaboral: PerfilLaboral.BASE,
  concepto002: { rawAmount: '', periodicidad: Periodicidad.QUINCENAL },
  concepto011: { rawAmount: '', periodicidad: Periodicidad.QUINCENAL },
};

const INITIAL_PARAMS: CalculatorParamsState = {
  aguinaldo: {
    anio: '2026',
    modoProporcional: ModoProporcionalAguinaldo.ANIO_COMPLETO,
    mesesLaborados: '12',
    diasLaborados: '365',
    diasIncidenciaSinGoce: '',
    justificacionIncidencia: '',
    anticipoEneroPagado: false,
    anticipoEneroMonto: '',
    anticipoAgostoSolicitado: false,
    anticipoAgostoMonto: '',
  },
  vacaciones: {
    anio: '2026',
    aniosAntiguedad: '3',
    diasAdicionalesVerificados: '0',
    periodoSolicitado: 'ANUAL_COMPLETO',
  },
  primaVacacional: {
    anio: '2026',
    aniosAntiguedad: '3',
    diasVacacionesBase: '20',
    periodo: 'ANUAL',
  },
  fondoAhorro: {
    ciclo: '2025-2026',
    diasLaboradosCiclo: '365',
    anticipoOProrrateoPrevio: '0',
  },
  creditos: {
    tipoCredito: 'CORTO_PLAZO',
    descuentosActualesTarjeton: '',
    montoSolicitado: '',
  },
  jubilacion: {
    regimen: RegimenJubilacion.RJP_TRADICIONAL,
    aniosServicio: '',
    edad: '',
    fechaIngreso: '',
  },
  finiquito: {
    causal: CausalFiniquito.RENUNCIA_VOLUNTARIA,
    aniosAntiguedad: '5',
    diasAguinaldoPendientes: '180',
    diasFondoAhorroPendientes: '180',
    diasVacacionesPendientes: '10',
    anticiposAguinaldoYaPagados: '0',
  },
};

const NAV_CALCULATORS: {
  tipo: TipoPrestacion;
  label: string;
  clausula: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    tipo: TipoPrestacion.AGUINALDO,
    label: '01. Aguinaldo',
    clausula: 'Cláus. 107',
    icon: Calculator,
  },
  {
    tipo: TipoPrestacion.VACACIONES,
    label: '02. Vacaciones',
    clausula: 'Cláus. 47',
    icon: Calendar,
  },
  {
    tipo: TipoPrestacion.PRIMA_VACACIONAL,
    label: '03. Prima Vacacional',
    clausula: 'Cláus. 47',
    icon: Briefcase,
  },
  {
    tipo: TipoPrestacion.FONDO_AHORRO,
    label: '04. Fondo de Ahorro',
    clausula: 'Cláus. 144',
    icon: PiggyBank,
  },
  {
    tipo: TipoPrestacion.CREDITOS,
    label: '05. Créditos',
    clausula: 'Cláus. 145-146',
    icon: CreditCard,
  },
  {
    tipo: TipoPrestacion.JUBILACION,
    label: '06. Jubilación',
    clausula: 'RJP / LSS',
    icon: Landmark,
  },
  {
    tipo: TipoPrestacion.FINIQUITO,
    label: '07. Finiquito',
    clausula: 'Multi-cláusula',
    icon: FileText,
  },
];

export default function App() {
  const [section, setSection] = useState<ActiveSection>({
    kind: 'CALCULATOR',
    tipo: TipoPrestacion.AGUINALDO,
  });
  const [tarjeton, setTarjeton] = useState<TarjetonData>(INITIAL_TARJETON);
  const [params, setParams] = useState<CalculatorParamsState>(INITIAL_PARAMS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const c002InputRef = useRef<HTMLInputElement | null>(null);

  const updateParamGroup = <K extends keyof CalculatorParamsState>(
    key: K,
    value: CalculatorParamsState[K],
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditTarjeton = () => {
    c002InputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => c002InputRef.current?.focus(), 200);
  };

  const handleResetTarjeton = () => {
    setTarjeton(INITIAL_TARJETON);
    setTimeout(() => c002InputRef.current?.focus(), 100);
  };

  const desgloseActivo: DesgloseObligatorio | null = useMemo(() => {
    if (section.kind !== 'CALCULATOR') return null;
    switch (section.tipo) {
      case TipoPrestacion.AGUINALDO:
        return calcularAguinaldo(tarjeton, params.aguinaldo);
      case TipoPrestacion.VACACIONES:
        return calcularVacaciones(tarjeton, params.vacaciones);
      case TipoPrestacion.PRIMA_VACACIONAL:
        return calcularPrimaVacacional(tarjeton, params.primaVacacional);
      case TipoPrestacion.FONDO_AHORRO:
        return calcularFondoAhorro(tarjeton, params.fondoAhorro);
      case TipoPrestacion.CREDITOS:
        return calcularCreditos(tarjeton, params.creditos);
      case TipoPrestacion.JUBILACION:
        return calcularJubilacion(tarjeton, params.jubilacion);
      case TipoPrestacion.FINIQUITO:
        return calcularFiniquito(tarjeton, params.finiquito);
    }
  }, [section, tarjeton, params]);

  const breadcrumbActual =
    section.kind === 'CALCULATOR'
      ? PRESTACION_LABELS[section.tipo]
      : section.kind === 'MATRIZ'
        ? 'Matriz de Perfiles Laborales'
        : 'Guía Normativa de Conceptos';

  const selectCalculator = (tipo: TipoPrestacion) => {
    setSection({ kind: 'CALCULATOR', tipo });
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 flex items-center border-b border-slate-200 shrink-0">
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
          DRK Normativa
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6" aria-label="Navegación principal">
        <div>
          <div className="px-2.5 mb-2 text-[11px] font-semibold text-slate-500">
            Calculadoras CCT 2025-2027
          </div>
          <ul className="space-y-1">
            {NAV_CALCULATORS.map((item) => {
              const Icon = item.icon;
              const isActive =
                section.kind === 'CALCULATOR' && section.tipo === item.tipo;
              return (
                <li key={item.tipo}>
                  <button
                    type="button"
                    onClick={() => selectCalculator(item.tipo)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono shrink-0 ${
                        isActive ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {item.clausula}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="px-2.5 mb-2 text-[11px] font-semibold text-slate-500">
            Referencia y Control
          </div>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  setSection({ kind: 'MATRIZ' });
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  section.kind === 'MATRIZ'
                    ? 'bg-emerald-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Scale className="w-4 h-4 shrink-0" />
                <span>Matriz de Perfiles</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSection({ kind: 'GUIA' });
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  section.kind === 'GUIA'
                    ? 'bg-emerald-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Guía de Conceptos</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        Base normativa: CCT IMSS-SNTSS 2025-2027 · Aritmética BigDecimal · Simulación informativa no oficial.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full border-r border-slate-200 z-10">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-4 p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary action on right */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Abrir menú de navegación"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 truncate">
              <span className="font-medium text-slate-700 whitespace-nowrap">
                DRK
              </span>
              <span aria-hidden="true">/</span>
              <span className="hidden sm:inline whitespace-nowrap">
                CCT IMSS-SNTSS 2025-2027
              </span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">
                {breadcrumbActual}
              </span>
              <span className="hidden md:inline" aria-hidden="true">
                ·
              </span>
              <span className="hidden md:inline text-xs text-slate-500 whitespace-nowrap">
                Perfil: {PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral]}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (section.kind !== 'CALCULATOR') {
                setSection({
                  kind: 'CALCULATOR',
                  tipo: TipoPrestacion.AGUINALDO,
                });
              }
              handleEditTarjeton();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Capturar / Corregir Tarjetón
          </button>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className="space-y-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                {section.kind === 'CALCULATOR'
                  ? `Simulador de ${PRESTACION_LABELS[section.tipo]}`
                  : section.kind === 'MATRIZ'
                    ? 'Aplicabilidad Normativa por Perfil Laboral'
                    : 'Guía Normativa de Conceptos 002 y 011'}
              </h1>
              <p className="text-sm text-slate-600 max-w-3xl">
                Cálculo normativo basado en el Contrato Colectivo de Trabajo IMSS-SNTSS 2025-2027 y los conceptos 002 (Sueldo Base) y 011 (Ayuda de Renta, Cláusula 63 Bis inciso b) de tu tarjetón de pago.
              </p>
            </div>

            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-lg border border-slate-200 bg-white p-1.5 flex items-center justify-center">
              {!imgError ? (
                <img
                  src="/assets/aistudio/a_clean_transparent_background_png_style_illustrat_7ae40feb.png"
                  alt="Proyecto DRK"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-display text-sm font-bold text-slate-700 text-center">
                  Proyecto DRK
                </span>
              )}
            </div>
          </div>

          {section.kind === 'CALCULATOR' && (
            <>
              <TarjetonCapturePanel
                tarjeton={tarjeton}
                onChange={setTarjeton}
                onReset={handleResetTarjeton}
                c002InputRef={c002InputRef}
              />

              <PrestacionParamsPanel
                tipo={section.tipo}
                state={params}
                onChange={updateParamGroup}
              />

              {desgloseActivo && (
                <DesgloseResultadoPanel
                  desglose={desgloseActivo}
                  onEditTarjeton={handleEditTarjeton}
                />
              )}
            </>
          )}

          {section.kind === 'MATRIZ' && (
            <MatrizPerfilesView
              perfilActual={tarjeton.perfilLaboral}
              onSelectPerfilAndPrestacion={(perfil, tipo) => {
                setTarjeton((prev) => ({ ...prev, perfilLaboral: perfil }));
                setSection({ kind: 'CALCULATOR', tipo });
              }}
            />
          )}

          {section.kind === 'GUIA' && <GuiaConceptosView />}
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              DRK · Simulador informativo conforme al CCT IMSS-SNTSS 2025-2027. No sustituye recibos ni constituye una determinación oficial del IMSS.
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Conceptos base: 002 y 011 (Cláusula 63 Bis b)
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
