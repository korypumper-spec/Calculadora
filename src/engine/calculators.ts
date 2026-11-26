import { BigDecimal } from './bigDecimal';
import {
  normalizarTarjeton,
  obtenerReglaAplicabilidad,
  PERFIL_LABORAL_LABELS,
  PRESTACION_LABELS,
  TarjetonNormalizado,
} from './normativeRules';
import {
  AguinaldoParams,
  AnticipoDetalle,
  CausalFiniquito,
  CreditosParams,
  DesgloseObligatorio,
  EstadoAplicabilidad,
  EstatusCalculo,
  FiniquitoParams,
  FondoAhorroParams,
  JubilacionParams,
  ModoProporcionalAguinaldo,
  PartidaDesglose,
  PasoFormula,
  PerfilLaboral,
  Periodicidad,
  PrimaVacacionalParams,
  RegimenJubilacion,
  TarjetonData,
  TipoPrestacion,
  VacacionesParams,
} from './types';

function generarResumenPeriodicidad(tarjeton: TarjetonData): string {
  const p002 =
    tarjeton.concepto002.periodicidad === Periodicidad.QUINCENAL
      ? 'Quincenal (convertido a mensual × 2 para cálculo)'
      : 'Mensual';
  const p011 =
    tarjeton.concepto011.periodicidad === Periodicidad.QUINCENAL
      ? 'Quincenal (convertido a mensual × 2 para cálculo)'
      : 'Mensual';
  if (tarjeton.concepto002.periodicidad === tarjeton.concepto011.periodicidad) {
    return tarjeton.concepto002.periodicidad === Periodicidad.QUINCENAL
      ? 'Ambos conceptos capturados como Quincenal (equivalente mensual = importe × 2 sin alterar el dato original).'
      : 'Ambos conceptos capturados como Mensual (aplicación directa sin conversión).';
  }
  return `Mixta controlada: Concepto 002 en ${p002}; Concepto 011 en ${p011}.`;
}

function construirRespuestaIncompleta(
  tipo: TipoPrestacion,
  tarjeton: TarjetonData,
  norm: TarjetonNormalizado,
  periodoCalculado: string,
  baseNormativaAplicada: string,
  clausulaUtilizada: string,
  diasOMesesConsiderados: string,
  extraFaltantes: string[] = [],
  extraAdvertencias: string[] = [],
): DesgloseObligatorio {
  const regla = obtenerReglaAplicabilidad(tipo, tarjeton.perfilLaboral);
  const faltantes = [...norm.datosFaltantes, ...extraFaltantes];

  return {
    tipoPrestacion: tipo,
    tituloPrestacion: PRESTACION_LABELS[tipo],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada,
    baseSalarialMonto: null,
    clausulaUtilizada,
    formulaPasoAPaso: [],
    diasOMesesConsiderados,
    anticiposOPagosPrevios: [],
    totalAnticiposDescontados: '$0.00 MXN',
    resultadoEstimado: null,
    estatusCalculo: EstatusCalculo.INCOMPLETO,
    mensajeEstatus:
      'Cálculo incompleto: falta capturar los importes reales de tu tarjetón. La aplicación no inventa ni estima importes faltantes.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias: [
      'Este simulador no sustituye ni inventa importes salariales faltantes.',
      'No confundas el Concepto 011 (Ayuda de Renta, Cláusula 63 Bis b) con los conceptos 020 o 022.',
      'Simulación informativa: no constituye una determinación oficial del IMSS.',
      ...extraAdvertencias,
    ],
    supuestos: [
      'El cálculo se habilitará únicamente cuando los conceptos requeridos del tarjetón tengan importes válidos.',
    ],
    datosFaltantes: faltantes,
  };
}

function construirRespuestaPendienteEstatuto(
  tipo: TipoPrestacion,
  tarjeton: TarjetonData,
  norm: TarjetonNormalizado,
  periodoCalculado: string,
  baseNormativaAplicada: string,
  clausulaUtilizada: string,
  diasOMesesConsiderados: string,
  documentoFaltante: string,
  extraAdvertencias: string[] = [],
): DesgloseObligatorio {
  const regla = obtenerReglaAplicabilidad(tipo, tarjeton.perfilLaboral);
  return {
    tipoPrestacion: tipo,
    tituloPrestacion: PRESTACION_LABELS[tipo],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada,
    baseSalarialMonto: null,
    clausulaUtilizada,
    formulaPasoAPaso: [],
    diasOMesesConsiderados,
    anticiposOPagosPrevios: [],
    totalAnticiposDescontados: '$0.00 MXN',
    resultadoEstimado: null,
    estatusCalculo: EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA,
    mensajeEstatus:
      'Estimación pendiente de validación normativa: no existe regla automática aplicable al perfil laboral seleccionado con los datos disponibles.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias: [
      'No se extiende automáticamente una prestación de personal de base a otros perfiles laborales.',
      'Simulación informativa: no constituye una determinación oficial del IMSS.',
      ...extraAdvertencias,
    ],
    supuestos: [
      'Se conservan los importes capturados de Concepto 002 y Concepto 011 sin mezclar conceptos externos.',
    ],
    datosFaltantes: [documentoFaltante, ...norm.datosFaltantes],
  };
}

// ============================================================================
// 1. AGUINALDO — Cláusula 107 CCT IMSS-SNTSS 2025-2027
// ============================================================================
export function calcularAguinaldo(
  tarjeton: TarjetonData,
  params: AguinaldoParams,
): DesgloseObligatorio {
  const norm = normalizarTarjeton(tarjeton);
  const regla = obtenerReglaAplicabilidad(
    TipoPrestacion.AGUINALDO,
    tarjeton.perfilLaboral,
  );
  const periodoStr = `Ejercicio anual ${params.anio || 'vigente'}`;

  if (!norm.completo || !norm.c002Mensual || !norm.c011Mensual) {
    return construirRespuestaIncompleta(
      TipoPrestacion.AGUINALDO,
      tarjeton,
      norm,
      periodoStr,
      'Sueldo Nominal mensual (Cláusula 107 CCT: requiere Concepto 002 Sueldo Base y Concepto 011 Ayuda de Renta Cláusula 63 Bis b).',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 107 y Cláusula 63 Bis inciso b)',
      'Pendiente de determinar según periodo capturado',
    );
  }

  if (
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_A ||
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_B
  ) {
    return construirRespuestaPendienteEstatuto(
      TipoPrestacion.AGUINALDO,
      tarjeton,
      norm,
      periodoStr,
      'Pendiente de validar Estatuto de Personal de Confianza y nombramiento individual.',
      regla.documentoAplicable,
      'Pendiente de regla estatutaria',
      'Estatuto de Personal de Confianza vigente y condiciones del nombramiento (días de aguinaldo e integración salarial aplicable).',
    );
  }

  // Validate proportional days/months for Sustituto/Temporal or partial period
  const faltantesExtra: string[] = [];
  let factorProporcional = BigDecimal.of(1);
  let descripcionTiempo = '12 meses / 365 días (Año completo)';

  if (params.modoProporcional === ModoProporcionalAguinaldo.MESES) {
    const meses = BigDecimal.tryParse(params.mesesLaborados);
    if (!meses || meses.lte(0) || meses.gt(12)) {
      faltantesExtra.push(
        'Número válido de meses laborados en el ejercicio (mayor a 0 y hasta 12).',
      );
    } else {
      factorProporcional = meses.div(12);
      descripcionTiempo = `${meses.toExactString()} meses de 12 meses`;
    }
  } else if (params.modoProporcional === ModoProporcionalAguinaldo.DIAS) {
    const dias = BigDecimal.tryParse(params.diasLaborados);
    if (!dias || dias.lte(0) || dias.gt(366)) {
      faltantesExtra.push(
        'Número válido de días laborados en el ejercicio (mayor a 0 y hasta 365/366).',
      );
    } else {
      factorProporcional = dias.div(365);
      descripcionTiempo = `${dias.toExactString()} días de 365 días`;
    }
  } else if (
    (tarjeton.perfilLaboral === PerfilLaboral.SUSTITUTO ||
      tarjeton.perfilLaboral === PerfilLaboral.TEMPORAL) &&
    params.modoProporcional === ModoProporcionalAguinaldo.ANIO_COMPLETO
  ) {
    // Allowed if they actually worked full year, but add explicit warning
  }

  // Incidence deduction ONLY if explicitly provided with normative justification
  let diasIncidencia = BigDecimal.zero();
  const incRaw = params.diasIncidenciaSinGoce.trim();
  const advertencias: string[] = [
    'Simulación informativa conforme al CCT IMSS-SNTSS 2025-2027; no constituye una determinación oficial del IMSS.',
    'No se incluye el Concepto 049 (Aguinaldo) ni el total líquido del tarjetón dentro de la base salarial.',
    'No se confunde ni sustituye el Concepto 011 (Cláusula 63 Bis b) con los conceptos 020 o 022.',
  ];

  if (incRaw) {
    const parsedInc = BigDecimal.tryParse(incRaw);
    if (!parsedInc || parsedInc.lt(0) || parsedInc.gt(365)) {
      faltantesExtra.push(
        'Días de licencia sin goce o faltas injustificadas debe ser un número entre 0 y 365.',
      );
    } else if (parsedInc.gt(0)) {
      if (!params.justificacionIncidencia.trim()) {
        faltantesExtra.push(
          'Fundamento o descripción de la incidencia sin goce de sueldo (requerido para aplicar descuento proporcional en Cláusula 107).',
        );
      } else {
        diasIncidencia = parsedInc;
      }
    }
  }

  if (faltantesExtra.length > 0) {
    return construirRespuestaIncompleta(
      TipoPrestacion.AGUINALDO,
      tarjeton,
      norm,
      periodoStr,
      'Sueldo Nominal mensual (Concepto 002 + Concepto 011)',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 107',
      descripcionTiempo,
      faltantesExtra,
    );
  }

  // Step 1: Separate monthly equivalents
  const c002M = norm.c002Mensual;
  const c011M = norm.c011Mensual;
  const sueldoNominalMensual = c002M.add(c011M);

  // Step 2: Annual aguinaldo = 3 months of nominal salary (Cláusula 107)
  const aguinaldoAnual = sueldoNominalMensual.mul(3);

  // Step 3: Proportional factor and incidence adjustment (no intermediate rounding!)
  let factorFinal = factorProporcional;
  if (diasIncidencia.gt(0)) {
    const factorDescuentoInc = diasIncidencia.div(365);
    factorFinal = factorProporcional.sub(factorDescuentoInc).max(0);
    descripcionTiempo += ` (menos ${diasIncidencia.toExactString()} días por ${params.justificacionIncidencia.trim()})`;
  }

  const aguinaldoProporcional = aguinaldoAnual.mul(factorFinal);

  // Step 4: Advances (January = 0.5 month, August = 1 month if requested). Never double-deduct!
  const anticipos: AnticipoDetalle[] = [];
  let totalAnticipos = BigDecimal.zero();

  if (params.anticipoEneroPagado) {
    const customEnero = params.anticipoEneroMonto.trim()
      ? BigDecimal.tryParse(params.anticipoEneroMonto)
      : null;
    if (params.anticipoEneroMonto.trim() && (!customEnero || customEnero.lt(0))) {
      return construirRespuestaIncompleta(
        TipoPrestacion.AGUINALDO,
        tarjeton,
        norm,
        periodoStr,
        'Sueldo Nominal mensual (Concepto 002 + Concepto 011)',
        'CCT IMSS-SNTSS 2025-2027, Cláusula 107',
        descripcionTiempo,
        ['Importe válido (mayor o igual a 0) para el anticipo de enero capturado.'],
      );
    }
    const montoEnero = customEnero ?? sueldoNominalMensual.mul('0.5');
    totalAnticipos = totalAnticipos.add(montoEnero);
    anticipos.push({
      concepto: 'Anticipo de enero (Cláusula 107)',
      monto: montoEnero.toCurrencyMXN(),
      observacion: customEnero
        ? 'Importe capturado por el usuario; descontado una sola vez.'
        : 'Equivalente a medio mes (0.5 × sueldo nominal mensual); descontado una sola vez.',
    });
  }

  if (params.anticipoAgostoSolicitado) {
    const customAgosto = params.anticipoAgostoMonto.trim()
      ? BigDecimal.tryParse(params.anticipoAgostoMonto)
      : null;
    if (
      params.anticipoAgostoMonto.trim() &&
      (!customAgosto || customAgosto.lt(0))
    ) {
      return construirRespuestaIncompleta(
        TipoPrestacion.AGUINALDO,
        tarjeton,
        norm,
        periodoStr,
        'Sueldo Nominal mensual (Concepto 002 + Concepto 011)',
        'CCT IMSS-SNTSS 2025-2027, Cláusula 107',
        descripcionTiempo,
        ['Importe válido (mayor o igual a 0) para el anticipo de agosto capturado.'],
      );
    }
    const montoAgosto = customAgosto ?? sueldoNominalMensual.mul(1);
    totalAnticipos = totalAnticipos.add(montoAgosto);
    anticipos.push({
      concepto: 'Anticipo de agosto a solicitud (Cláusula 107)',
      monto: montoAgosto.toCurrencyMXN(),
      observacion: customAgosto
        ? 'Importe capturado por el usuario; descontado una sola vez.'
        : 'Equivalente a un mes (1.0 × sueldo nominal mensual); descontado una sola vez.',
    });
  }

  const saldoDiciembre = aguinaldoProporcional.sub(totalAnticipos);

  if (saldoDiciembre.isNegative()) {
    advertencias.push(
      'Los anticipos previamente pagados superan el aguinaldo proporcional devengado en el periodo; podría generarse diferencia a compensar.',
    );
  }
  if (
    tarjeton.perfilLaboral === PerfilLaboral.SUSTITUTO ||
    tarjeton.perfilLaboral === PerfilLaboral.TEMPORAL
  ) {
    advertencias.push(
      `Perfil ${PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral]}: verifica que los días o meses capturados correspondan exactamente a los sueldos percibidos en sustituciones o contratos vigentes.`,
    );
  }
  advertencias.push(
    'Si percibes otros conceptos nominales fijos permanentes en tu tarjetón distintos a 002 y 011, el sueldo nominal real del IMSS podría variar.',
  );

  const pasos: PasoFormula[] = [
    {
      orden: 1,
      descripcion: 'Normalización mensual de Concepto 002 (Sueldo Base)',
      expresion:
        tarjeton.concepto002.periodicidad === Periodicidad.QUINCENAL
          ? `${norm.c002Original!.toCurrencyMXN()} × 2 quincenas`
          : `${norm.c002Original!.toCurrencyMXN()} (ya capturado mensual)`,
      resultado: c002M.toCurrencyMXN(),
    },
    {
      orden: 2,
      descripcion:
        'Normalización mensual de Concepto 011 (Ayuda de Renta · Cláusula 63 Bis b)',
      expresion:
        tarjeton.concepto011.periodicidad === Periodicidad.QUINCENAL
          ? `${norm.c011Original!.toCurrencyMXN()} × 2 quincenas`
          : `${norm.c011Original!.toCurrencyMXN()} (ya capturado mensual)`,
      resultado: c011M.toCurrencyMXN(),
    },
    {
      orden: 3,
      descripcion: 'Integración de Sueldo Nominal Mensual de referencia',
      expresion: `${c002M.toCurrencyMXN()} (002) + ${c011M.toCurrencyMXN()} (011)`,
      resultado: sueldoNominalMensual.toCurrencyMXN(),
    },
    {
      orden: 4,
      descripcion: 'Aguinaldo anual equivalente a 3 meses (Cláusula 107)',
      expresion: `${sueldoNominalMensual.toCurrencyMXN()} × 3 meses`,
      resultado: aguinaldoAnual.toCurrencyMXN(),
    },
    {
      orden: 5,
      descripcion: 'Proporcionalidad del periodo e incidencias justificadas',
      expresion: `${aguinaldoAnual.toCurrencyMXN()} × ${factorFinal.toFixed(6)}`,
      resultado: aguinaldoProporcional.toCurrencyMXN(),
    },
    {
      orden: 6,
      descripcion: 'Descuento de anticipos ya pagados (sin duplicidad)',
      expresion: `${aguinaldoProporcional.toCurrencyMXN()} − ${totalAnticipos.toCurrencyMXN()}`,
      resultado: saldoDiciembre.toCurrencyMXN(),
    },
  ];

  const partidasAdicionales: PartidaDesglose[] = [
    {
      concepto: 'Aguinaldo anual bruto (3 meses)',
      clausula: 'Cláusula 107 CCT 2025-2027',
      baseAplicada: '002 + 011 mensual',
      montoEstimado: aguinaldoAnual.toCurrencyMXN(),
      estado: 'CALCULADO',
      nota: 'Referencia de 12 meses completos.',
    },
    {
      concepto: 'Aguinaldo proporcional del periodo',
      clausula: 'Cláusula 107 CCT 2025-2027',
      baseAplicada: 'Proporcional al tiempo laborado',
      montoEstimado: aguinaldoProporcional.toCurrencyMXN(),
      estado: 'CALCULADO',
      nota: descripcionTiempo,
    },
    {
      concepto: 'Saldo estimado de diciembre (neto de anticipos)',
      clausula: 'Cláusula 107 CCT 2025-2027',
      baseAplicada: 'Aguinaldo proporcional − anticipos enero/agosto',
      montoEstimado: saldoDiciembre.toCurrencyMXN(),
      estado: 'CALCULADO',
      nota: 'Los anticipos no se suman al salario base ni se descuentan dos veces.',
    },
  ];

  return {
    tipoPrestacion: TipoPrestacion.AGUINALDO,
    tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.AGUINALDO],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado: periodoStr,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada:
      'Sueldo Nominal mensual (integrado para esta simulación por Concepto 002 Sueldo Base + Concepto 011 Ayuda de Renta Cláusula 63 Bis inciso b).',
    baseSalarialMonto: sueldoNominalMensual.toCurrencyMXN(),
    clausulaUtilizada:
      'CCT IMSS-SNTSS 2025-2027, Cláusula 107 y Cláusula 63 Bis inciso b)',
    formulaPasoAPaso: pasos,
    diasOMesesConsiderados: descripcionTiempo,
    anticiposOPagosPrevios: anticipos,
    totalAnticiposDescontados: totalAnticipos.toCurrencyMXN(),
    resultadoEstimado: saldoDiciembre.toCurrencyMXN(),
    partidasAdicionales,
    estatusCalculo: EstatusCalculo.COMPLETO,
    mensajeEstatus:
      'Saldo estimado de aguinaldo en diciembre calculado conforme a la Cláusula 107 (sin redondeos intermedios).',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias,
    supuestos: [
      'Cálculo exacto con aritmética BigDecimal sin redondeos en pasos intermedios; redondeo a 2 decimales aplicado únicamente al resultado final.',
      'Los importes quincenales se convierten a mensuales (× 2) preservando intacto el valor quincenal capturado.',
      'Anticipo de enero corresponde a 0.5 meses y anticipo de agosto (a solicitud) a 1.0 mes, salvo captura de monto real pagado.',
    ],
    datosFaltantes: [],
  };
}

// ============================================================================
// 2. VACACIONES — Cláusula 47 CCT IMSS-SNTSS 2025-2027
// ============================================================================
export function calcularVacaciones(
  tarjeton: TarjetonData,
  params: VacacionesParams,
): DesgloseObligatorio {
  const norm = normalizarTarjeton(tarjeton);
  const regla = obtenerReglaAplicabilidad(
    TipoPrestacion.VACACIONES,
    tarjeton.perfilLaboral,
  );
  const periodoStr = `Ejercicio vacacional ${params.anio || 'vigente'}`;

  if (!norm.completo || !norm.c002Mensual || !norm.c011Mensual) {
    return construirRespuestaIncompleta(
      TipoPrestacion.VACACIONES,
      tarjeton,
      norm,
      periodoStr,
      'Sueldo Nominal diario (002 + 011) durante días hábiles de descanso con goce de sueldo (Cláusula 47).',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
      'Pendiente de antigüedad y periodo',
    );
  }

  if (
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_A ||
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_B
  ) {
    return construirRespuestaPendienteEstatuto(
      TipoPrestacion.VACACIONES,
      tarjeton,
      norm,
      periodoStr,
      'Pendiente de validar Estatuto de Personal de Confianza.',
      regla.documentoAplicable,
      'Pendiente de validación estatutaria',
      'Estatuto de Personal de Confianza y nombramiento (tabla de días vacacionales aplicable al nivel de confianza).',
    );
  }

  const antiguedad = BigDecimal.tryParse(params.aniosAntiguedad);
  const diasAdicionales = params.diasAdicionalesVerificados.trim()
    ? BigDecimal.tryParse(params.diasAdicionalesVerificados)
    : BigDecimal.zero();

  const faltantes: string[] = [];
  if (!antiguedad || antiguedad.lt(0)) {
    faltantes.push('Años efectivos de antigüedad (número mayor o igual a 0).');
  }
  if (!diasAdicionales || diasAdicionales.lt(0)) {
    faltantes.push(
      'Días adicionales por antigüedad verificados (0 o número positivo).',
    );
  }

  if (faltantes.length > 0 || !antiguedad || !diasAdicionales) {
    return construirRespuestaIncompleta(
      TipoPrestacion.VACACIONES,
      tarjeton,
      norm,
      periodoStr,
      'Sueldo Nominal diario durante los días hábiles de vacaciones (Cláusula 47).',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
      'Falta antigüedad',
      faltantes,
    );
  }

  if (antiguedad.lt(1)) {
    return {
      tipoPrestacion: TipoPrestacion.VACACIONES,
      tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.VACACIONES],
      perfilLaboral: tarjeton.perfilLaboral,
      perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
      periodoCalculado: periodoStr,
      concepto002Capturado: norm.c002Detalle,
      concepto011Capturado: norm.c011Detalle,
      periodicidadResumen: generarResumenPeriodicidad(tarjeton),
      baseNormativaAplicada:
        'Derecho vacacional sujeto a cumplir 1 año de servicios continuos (Cláusula 47 CCT).',
      baseSalarialMonto: norm.c002Mensual.add(norm.c011Mensual).toCurrencyMXN(),
      clausulaUtilizada: 'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
      formulaPasoAPaso: [],
      diasOMesesConsiderados: `${antiguedad.toExactString()} años de antigüedad (< 1 año)`,
      anticiposOPagosPrevios: [],
      totalAnticiposDescontados: '$0.00 MXN',
      resultadoEstimado: null,
      estatusCalculo: EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA,
      mensajeEstatus:
        'Estimación pendiente de validación normativa: con menos de 1 año de antigüedad no se devengan los 2 periodos ordinarios completos; solo procede parte proporcional en caso de término.',
      estadoAplicabilidad: EstadoAplicabilidad.CONDICIONADO,
      fundamentoAplicabilidad: regla.fundamento,
      advertencias: [
        'Las vacaciones se disfrutan con goce de sueldo ordinario; no constituyen un sobresueldo adicional salvo la Prima Vacacional.',
        'Simulación informativa: no constituye una determinación oficial del IMSS.',
      ],
      supuestos: ['Antigüedad capturada menor a un año efectivo.'],
      datosFaltantes: [
        'Días efectivos laborados para prorrateo únicamente si existe terminación laboral.',
      ],
    };
  }

  const baseDiasAnuales = BigDecimal.of(20); // 2 periodos de 10 días hábiles
  const diasTotalesPeriodo =
    params.periodoSolicitado === 'ANUAL_COMPLETO'
      ? baseDiasAnuales.add(diasAdicionales)
      : BigDecimal.of(10).add(diasAdicionales.div(2));

  const sueldoNominalMensual = norm.c002Mensual.add(norm.c011Mensual);
  const sueldoDiarioNominal = sueldoNominalMensual.div(30);
  const valorSueldoPeriodo = sueldoDiarioNominal.mul(diasTotalesPeriodo);

  const pasos: PasoFormula[] = [
    {
      orden: 1,
      descripcion: 'Sueldo Nominal Mensual (002 + 011)',
      expresion: `${norm.c002Mensual.toCurrencyMXN()} + ${norm.c011Mensual.toCurrencyMXN()}`,
      resultado: sueldoNominalMensual.toCurrencyMXN(),
    },
    {
      orden: 2,
      descripcion: 'Cuota diaria de Sueldo Nominal (÷ 30 días)',
      expresion: `${sueldoNominalMensual.toCurrencyMXN()} ÷ 30`,
      resultado: sueldoDiarioNominal.toCurrencyMXN(),
    },
    {
      orden: 3,
      descripcion:
        'Días hábiles de vacaciones (Cláusula 47: 2 periodos de 10 días + adicionales verificados)',
      expresion:
        params.periodoSolicitado === 'ANUAL_COMPLETO'
          ? `20 días base + ${diasAdicionales.toExactString()} días adicionales`
          : `10 días del periodo + ${diasAdicionales.div(2).toExactString()} adicionales`,
      resultado: `${diasTotalesPeriodo.toExactString()} días hábiles`,
    },
    {
      orden: 4,
      descripcion:
        'Valor económico del sueldo cubierto durante los días de descanso',
      expresion: `${sueldoDiarioNominal.toCurrencyMXN()} × ${diasTotalesPeriodo.toExactString()} días`,
      resultado: valorSueldoPeriodo.toCurrencyMXN(),
    },
  ];

  const advertencias = [
    'Importante: las vacaciones son días de descanso con goce de sueldo ordinario; este monto representa el sueldo devengado durante ese lapso, NO un pago extra sobre tu quincena habitual (el pago adicional corresponde a la Prima Vacacional).',
    'Si cuentas con más de 5 años de antigüedad, verifica en tu tarjetón o control de asistencia los días adicionales que te otorga la escala de la Cláusula 47.',
    'Simulación informativa: no constituye una determinación oficial del IMSS.',
  ];

  return {
    tipoPrestacion: TipoPrestacion.VACACIONES,
    tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.VACACIONES],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado: periodoStr,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada:
      'Sueldo Nominal diario (002 + 011 ÷ 30) aplicado a los días hábiles vacacionales con goce de sueldo (Cláusula 47).',
    baseSalarialMonto: sueldoNominalMensual.toCurrencyMXN(),
    clausulaUtilizada: 'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
    formulaPasoAPaso: pasos,
    diasOMesesConsiderados: `${diasTotalesPeriodo.toExactString()} días hábiles (${antiguedad.toExactString()} años de antigüedad)`,
    anticiposOPagosPrevios: [],
    totalAnticiposDescontados: '$0.00 MXN',
    resultadoEstimado: valorSueldoPeriodo.toCurrencyMXN(),
    estatusCalculo: EstatusCalculo.COMPLETO,
    mensajeEstatus:
      'Equivalente salarial cubierto durante los días hábiles de vacaciones calculado conforme a la Cláusula 47.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias,
    supuestos: [
      'Factor diario calculado dividiendo el sueldo mensual entre 30 días sin redondeos intermedios.',
      'Días adicionales por antigüedad se consideran únicamente si fueron verificados por el usuario.',
    ],
    datosFaltantes: [],
  };
}

// ============================================================================
// 3. PRIMA VACACIONAL — Cláusula 47 CCT IMSS-SNTSS 2025-2027
// ============================================================================
export function calcularPrimaVacacional(
  tarjeton: TarjetonData,
  params: PrimaVacacionalParams,
): DesgloseObligatorio {
  const norm = normalizarTarjeton(tarjeton);
  const regla = obtenerReglaAplicabilidad(
    TipoPrestacion.PRIMA_VACACIONAL,
    tarjeton.perfilLaboral,
  );
  const periodoStr = `${params.periodo === 'ANUAL' ? 'Anual (2 periodos)' : 'Semestral (1 periodo)'} · ${params.anio || 'vigente'}`;

  if (!norm.completo || !norm.c002Mensual || !norm.c011Mensual) {
    return construirRespuestaIncompleta(
      TipoPrestacion.PRIMA_VACACIONAL,
      tarjeton,
      norm,
      periodoStr,
      '25% sobre los sueldos correspondientes a los días del periodo vacacional (Cláusula 47).',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
      'Pendiente de captura de tarjetón',
    );
  }

  if (
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_A ||
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_B
  ) {
    return construirRespuestaPendienteEstatuto(
      TipoPrestacion.PRIMA_VACACIONAL,
      tarjeton,
      norm,
      periodoStr,
      'Pendiente de validar porcentaje y base en el Estatuto de Personal de Confianza.',
      regla.documentoAplicable,
      'Pendiente de regla estatutaria',
      'Estatuto de Personal de Confianza vigente y nombramiento individual.',
    );
  }

  const diasVac = BigDecimal.tryParse(params.diasVacacionesBase);
  if (!diasVac || diasVac.lte(0) || diasVac.gt(60)) {
    return construirRespuestaIncompleta(
      TipoPrestacion.PRIMA_VACACIONAL,
      tarjeton,
      norm,
      periodoStr,
      '25% sobre los sueldos correspondientes a los días del periodo vacacional (Cláusula 47).',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
      'Días inválidos',
      ['Número válido de días de vacaciones del periodo (entre 1 y 60 días).'],
    );
  }

  const sueldoNominalMensual = norm.c002Mensual.add(norm.c011Mensual);
  const sueldoDiario = sueldoNominalMensual.div(30);
  const sueldoDiasVacaciones = sueldoDiario.mul(diasVac);
  const primaVacacional = sueldoDiasVacaciones.mul('0.25');

  const pasos: PasoFormula[] = [
    {
      orden: 1,
      descripcion: 'Sueldo Nominal Mensual de referencia (002 + 011)',
      expresion: `${norm.c002Mensual.toCurrencyMXN()} + ${norm.c011Mensual.toCurrencyMXN()}`,
      resultado: sueldoNominalMensual.toCurrencyMXN(),
    },
    {
      orden: 2,
      descripcion: 'Cuota diaria de referencia (÷ 30 días)',
      expresion: `${sueldoNominalMensual.toCurrencyMXN()} ÷ 30`,
      resultado: sueldoDiario.toCurrencyMXN(),
    },
    {
      orden: 3,
      descripcion: `Sueldo correspondiente a ${diasVac.toExactString()} días de vacaciones`,
      expresion: `${sueldoDiario.toCurrencyMXN()} × ${diasVac.toExactString()} días`,
      resultado: sueldoDiasVacaciones.toCurrencyMXN(),
    },
    {
      orden: 4,
      descripcion: 'Prima Vacacional del 25% (Cláusula 47)',
      expresion: `${sueldoDiasVacaciones.toCurrencyMXN()} × 25% (0.25)`,
      resultado: primaVacacional.toCurrencyMXN(),
    },
  ];

  return {
    tipoPrestacion: TipoPrestacion.PRIMA_VACACIONAL,
    tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.PRIMA_VACACIONAL],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado: periodoStr,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada:
      'Sueldo Nominal correspondiente a los días de vacaciones (integrado en esta simulación por Concepto 002 + Concepto 011 ÷ 30), aplicando 25%.',
    baseSalarialMonto: sueldoNominalMensual.toCurrencyMXN(),
    clausulaUtilizada: 'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
    formulaPasoAPaso: pasos,
    diasOMesesConsiderados: `${diasVac.toExactString()} días vacacionales`,
    anticiposOPagosPrevios: [],
    totalAnticiposDescontados: '$0.00 MXN',
    resultadoEstimado: primaVacacional.toCurrencyMXN(),
    estatusCalculo: EstatusCalculo.COMPLETO,
    mensajeEstatus:
      'Prima Vacacional (25%) estimada conforme a la Cláusula 47 del CCT.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias: [
      'No incluye la ayuda para actividades culturales y recreativas (concepto distinto dentro de la Cláusula 47) ni otros conceptos variables por categoría no capturados.',
      'Simulación informativa: no constituye una determinación oficial del IMSS.',
    ],
    supuestos: [
      'Porcentaje legal/contractual del 25% aplicado sin redondeos intermedios.',
    ],
    datosFaltantes: [],
  };
}

// ============================================================================
// 4. FONDO DE AHORRO — Cláusula 144 CCT IMSS-SNTSS 2025-2027
//    IMPORTANTE: Usa ÚNICAMENTE Sueldo Tabular (Concepto 002). NO suma 011!
// ============================================================================
export function calcularFondoAhorro(
  tarjeton: TarjetonData,
  params: FondoAhorroParams,
): DesgloseObligatorio {
  const norm = normalizarTarjeton(tarjeton);
  const regla = obtenerReglaAplicabilidad(
    TipoPrestacion.FONDO_AHORRO,
    tarjeton.perfilLaboral,
  );
  const periodoStr = `Ciclo Fondo de Ahorro ${params.ciclo || '1 jul - 30 jun'}`;

  if (!norm.completo || !norm.c002Mensual || !norm.c011Mensual) {
    return construirRespuestaIncompleta(
      TipoPrestacion.FONDO_AHORRO,
      tarjeton,
      norm,
      periodoStr,
      'Sueldo Tabular mensual (únicamente Concepto 002 Sueldo Base; el Concepto 011 NO integra esta base conforme a la Cláusula 144).',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 144',
      'Pendiente de captura de tarjetón',
    );
  }

  if (
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_A ||
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_B
  ) {
    return construirRespuestaPendienteEstatuto(
      TipoPrestacion.FONDO_AHORRO,
      tarjeton,
      norm,
      periodoStr,
      'Pendiente de validar Estatuto de Personal de Confianza (no se extiende automáticamente la Cláusula 144).',
      regla.documentoAplicable,
      'Pendiente de validación estatutaria',
      'Estatuto de Personal de Confianza vigente y condiciones del nombramiento.',
    );
  }

  const diasCiclo = BigDecimal.tryParse(params.diasLaboradosCiclo);
  const anticipoPrevio = params.anticipoOProrrateoPrevio.trim()
    ? BigDecimal.tryParse(params.anticipoOProrrateoPrevio)
    : BigDecimal.zero();

  const faltantes: string[] = [];
  if (!diasCiclo || diasCiclo.lte(0) || diasCiclo.gt(366)) {
    faltantes.push(
      'Días laborados en el ciclo julio–junio (número mayor a 0 y hasta 365/366).',
    );
  }
  if (!anticipoPrevio || anticipoPrevio.lt(0)) {
    faltantes.push('Monto válido (mayor o igual a 0) para pagos/anticipos previos.');
  }

  if (faltantes.length > 0 || !diasCiclo || !anticipoPrevio) {
    return construirRespuestaIncompleta(
      TipoPrestacion.FONDO_AHORRO,
      tarjeton,
      norm,
      periodoStr,
      'Sueldo Tabular (Concepto 002 únicamente)',
      'CCT IMSS-SNTSS 2025-2027, Cláusula 144',
      'Días del ciclo inválidos',
      faltantes,
    );
  }

  // Cláusula 144: 45 días de Sueldo Tabular (Concepto 002 ONLY; Concepto 011 is explicitly excluded!)
  const c002M = norm.c002Mensual;
  const sueldoTabularDiario = c002M.div(30);
  const fondoAnualBruto = sueldoTabularDiario.mul(45);
  const factorCiclo = diasCiclo.div(365);
  const fondoProporcional = fondoAnualBruto.mul(factorCiclo);
  const saldoNeto = fondoProporcional.sub(anticipoPrevio);

  const anticiposDetalle: AnticipoDetalle[] = [];
  if (anticipoPrevio.gt(0)) {
    anticiposDetalle.push({
      concepto: 'Pagos o anticipos previos descontados en el ciclo',
      monto: anticipoPrevio.toCurrencyMXN(),
      observacion: 'Importe capturado por el usuario; descontado una sola vez.',
    });
  }

  const pasos: PasoFormula[] = [
    {
      orden: 1,
      descripcion:
        'Base normativa estricta: Sueldo Tabular mensual (únicamente Concepto 002)',
      expresion:
        tarjeton.concepto002.periodicidad === Periodicidad.QUINCENAL
          ? `${norm.c002Original!.toCurrencyMXN()} × 2 quincenas (Concepto 011 excluido por Cláusula 144)`
          : `${norm.c002Original!.toCurrencyMXN()} mensual (Concepto 011 excluido por Cláusula 144)`,
      resultado: c002M.toCurrencyMXN(),
    },
    {
      orden: 2,
      descripcion: 'Sueldo Tabular diario (Concepto 002 ÷ 30 días)',
      expresion: `${c002M.toCurrencyMXN()} ÷ 30`,
      resultado: sueldoTabularDiario.toCurrencyMXN(),
    },
    {
      orden: 3,
      descripcion: 'Fondo de Ahorro anual equivalente a 45 días (Cláusula 144)',
      expresion: `${sueldoTabularDiario.toCurrencyMXN()} × 45 días`,
      resultado: fondoAnualBruto.toCurrencyMXN(),
    },
    {
      orden: 4,
      descripcion: 'Proporción del ciclo julio–junio y resta de pagos previos',
      expresion: `(${fondoAnualBruto.toCurrencyMXN()} × ${diasCiclo.toExactString()} ÷ 365) − ${anticipoPrevio.toCurrencyMXN()}`,
      resultado: saldoNeto.toCurrencyMXN(),
    },
  ];

  return {
    tipoPrestacion: TipoPrestacion.FONDO_AHORRO,
    tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.FONDO_AHORRO],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado: periodoStr,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada:
      'Sueldo Tabular (únicamente Concepto 002 Sueldo Base). El Concepto 011 se conserva separado y NO se suma a esta base porque la Cláusula 144 refiere expresamente a sueldo tabular.',
    baseSalarialMonto: c002M.toCurrencyMXN(),
    clausulaUtilizada: 'CCT IMSS-SNTSS 2025-2027, Cláusula 144',
    formulaPasoAPaso: pasos,
    diasOMesesConsiderados: `${diasCiclo.toExactString()} días de 365 días (ciclo 1 jul – 30 jun)`,
    anticiposOPagosPrevios: anticiposDetalle,
    totalAnticiposDescontados: anticipoPrevio.toCurrencyMXN(),
    resultadoEstimado: saldoNeto.toCurrencyMXN(),
    estatusCalculo: EstatusCalculo.COMPLETO,
    mensajeEstatus:
      'Fondo de Ahorro (45 días de Sueldo Tabular) calculado con exclusión normativa del Concepto 011.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias: [
      'El Concepto 011 (Ayuda de Renta, Cláusula 63 Bis b) NO se suma al cálculo del Fondo de Ahorro conforme a la Cláusula 144 (sueldo tabular).',
      'No sustituye el sueldo tabular por el total de percepciones.',
      'Simulación informativa: no constituye una determinación oficial del IMSS.',
    ],
    supuestos: [
      'Aritmética BigDecimal sin redondeo intermedio.',
      'Periodo anual ordinario de Fondo de Ahorro del 1 de julio al 30 de junio (365 días).',
    ],
    datosFaltantes: [],
  };
}

// ============================================================================
// 5. CRÉDITOS — Cláusulas 145 y 146 CCT 2025-2027 + Art. 110 LFT
// ============================================================================
export function calcularCreditos(
  tarjeton: TarjetonData,
  params: CreditosParams,
): DesgloseObligatorio {
  const norm = normalizarTarjeton(tarjeton);
  const regla = obtenerReglaAplicabilidad(
    TipoPrestacion.CREDITOS,
    tarjeton.perfilLaboral,
  );
  const periodoStr = `Evaluación crediticia (${params.tipoCredito.replace('_', ' ').toLowerCase()})`;

  if (!norm.completo || !norm.c002Mensual || !norm.c011Mensual) {
    return construirRespuestaIncompleta(
      TipoPrestacion.CREDITOS,
      tarjeton,
      norm,
      periodoStr,
      'Sueldo Tabular (002) y capacidad líquida de descuento conforme a reglamento aplicable.',
      'CCT IMSS-SNTSS 2025-2027, Cláusulas 145 y 146; Art. 110 LFT',
      'Evaluación mensual vigente',
    );
  }

  if (
    tarjeton.perfilLaboral === PerfilLaboral.SUSTITUTO ||
    tarjeton.perfilLaboral === PerfilLaboral.TEMPORAL
  ) {
    return {
      tipoPrestacion: TipoPrestacion.CREDITOS,
      tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.CREDITOS],
      perfilLaboral: tarjeton.perfilLaboral,
      perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
      periodoCalculado: periodoStr,
      concepto002Capturado: norm.c002Detalle,
      concepto011Capturado: norm.c011Detalle,
      periodicidadResumen: generarResumenPeriodicidad(tarjeton),
      baseNormativaAplicada:
        'Créditos institucionales sujetos a plaza definitiva (base) conforme al reglamento de préstamos.',
      baseSalarialMonto: norm.c002Mensual.toCurrencyMXN(),
      clausulaUtilizada: regla.documentoAplicable,
      formulaPasoAPaso: [],
      diasOMesesConsiderados: 'No aplica al perfil seleccionado',
      anticiposOPagosPrevios: [],
      totalAnticiposDescontados: '$0.00 MXN',
      resultadoEstimado: null,
      estatusCalculo: EstatusCalculo.NO_APLICABLE,
      mensajeEstatus:
        'No aplicable: los créditos institucionales del CCT requieren nombramiento definitivo de base.',
      estadoAplicabilidad: EstadoAplicabilidad.NO_APLICABLE,
      fundamentoAplicabilidad: regla.fundamento,
      advertencias: [
        'No se extienden automáticamente prestaciones crediticias de personal de base a trabajadores sustitutos o temporales.',
        'Simulación informativa: no constituye una determinación oficial del IMSS.',
      ],
      supuestos: [],
      datosFaltantes: [],
    };
  }

  const descuentos = params.descuentosActualesTarjeton.trim()
    ? BigDecimal.tryParse(params.descuentosActualesTarjeton)
    : null;

  const c002M = norm.c002Mensual;
  // Reference 30% ceiling on Concepto 002 (conservative tabular reference) without inventing loan authorization
  const referenciaTope30Tabular = c002M.mul('0.30');
  const capacidadDisponibleRef =
    descuentos && descuentos.gte(0)
      ? referenciaTope30Tabular.sub(descuentos).max(0)
      : null;

  const pasos: PasoFormula[] = [
    {
      orden: 1,
      descripcion: 'Sueldo Tabular mensual capturado (Concepto 002)',
      expresion: norm.c002Detalle.equivalenteMensual!,
      resultado: c002M.toCurrencyMXN(),
    },
    {
      orden: 2,
      descripcion:
        'Concepto 011 conservado por separado (no sumado automáticamente a base tabular de préstamo)',
      expresion: norm.c011Detalle.equivalenteMensual!,
      resultado: norm.c011Mensual.toCurrencyMXN(),
    },
    {
      orden: 3,
      descripcion:
        'Referencia orientativa del 30% sobre Concepto 002 (no sustituye autorización del fondo)',
      expresion: `${c002M.toCurrencyMXN()} × 30%`,
      resultado: referenciaTope30Tabular.toCurrencyMXN(),
    },
  ];

  if (capacidadDisponibleRef && descuentos) {
    pasos.push({
      orden: 4,
      descripcion: 'Referencia orientativa menos descuentos vigentes capturados',
      expresion: `${referenciaTope30Tabular.toCurrencyMXN()} − ${descuentos.toCurrencyMXN()}`,
      resultado: capacidadDisponibleRef.toCurrencyMXN(),
    });
  }

  const faltantes = [
    'Reglamento y tabla de montos máximos/plazos vigentes para el tipo de crédito seleccionado (Cláusulas 145 / 146).',
    'Constancia de antigüedad efectiva y presupuesto disponible del Fondo de Préstamos.',
  ];
  if (!descuentos) {
    faltantes.unshift(
      'Importe total de deducciones/préstamos vigentes en tu tarjetón para calcular liquidez real.',
    );
  }

  return {
    tipoPrestacion: TipoPrestacion.CREDITOS,
    tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.CREDITOS],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado: periodoStr,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada:
      'Sueldo Tabular (Concepto 002) y capacidad de descuento conforme al Reglamento de Préstamos respectivo y Art. 110 LFT; el monto definitivo no puede determinarse solo con 002 y 011.',
    baseSalarialMonto: c002M.toCurrencyMXN(),
    clausulaUtilizada: regla.documentoAplicable,
    formulaPasoAPaso: pasos,
    diasOMesesConsiderados: 'Evaluación mensual de capacidad de descuento',
    anticiposOPagosPrevios: descuentos
      ? [
          {
            concepto: 'Descuentos vigentes capturados en tarjetón',
            monto: descuentos.toCurrencyMXN(),
            observacion: 'Restados de la referencia orientativa.',
          },
        ]
      : [],
    totalAnticiposDescontados: descuentos
      ? descuentos.toCurrencyMXN()
      : '$0.00 MXN',
    resultadoEstimado: null,
    partidasAdicionales: [
      {
        concepto: 'Referencia orientativa 30% sobre Sueldo Tabular (002)',
        clausula: 'Art. 110 LFT / Referencia tabular',
        baseAplicada: 'Concepto 002 mensual únicamente',
        montoEstimado: (capacidadDisponibleRef ?? referenciaTope30Tabular).toCurrencyMXN(),
        estado: 'PENDIENTE_VALIDACION',
        nota: 'Solo referencia técnica de liquidez; NO representa un monto aprobado ni fórmula oficial de préstamo.',
      },
    ],
    estatusCalculo: EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA,
    mensajeEstatus:
      'Estimación pendiente de validación normativa: no se inventa el monto ni la tabla de amortización sin el reglamento específico y el total de deducciones del tarjetón.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias: [
      'Nunca se debe suponer que 002 + 011 equivalen al monto autorizado de un crédito ni se incluyen deducciones no capturadas.',
      'Simulación informativa: no constituye una determinación oficial del IMSS.',
    ],
    supuestos: [
      'Se mantiene el Concepto 002 separado del Concepto 011.',
    ],
    datosFaltantes: faltantes,
  };
}

// ============================================================================
// 6. JUBILACIÓN — RJP (Arts. 4 y 5) vs. Cuentas Individuales (LSS / 2008+)
// ============================================================================
export function calcularJubilacion(
  tarjeton: TarjetonData,
  params: JubilacionParams,
): DesgloseObligatorio {
  const norm = normalizarTarjeton(tarjeton);
  const regla = obtenerReglaAplicabilidad(
    TipoPrestacion.JUBILACION,
    tarjeton.perfilLaboral,
  );
  const periodoStr = `Proyección pensionaria (${params.regimen === RegimenJubilacion.RJP_TRADICIONAL ? 'RJP Tradicional' : params.regimen === RegimenJubilacion.CUENTAS_INDIVIDUALES_2008 ? 'Cuentas Individuales LSS' : 'Régimen por confirmar'})`;

  if (!norm.completo || !norm.c002Mensual || !norm.c011Mensual) {
    return construirRespuestaIncompleta(
      TipoPrestacion.JUBILACION,
      tarjeton,
      norm,
      periodoStr,
      'Salario Base del Art. 5 del RJP o cuenta individual LSS según fecha de ingreso.',
      regla.documentoAplicable,
      'Pendiente de captura de tarjetón',
    );
  }

  if (
    tarjeton.perfilLaboral === PerfilLaboral.SUSTITUTO ||
    tarjeton.perfilLaboral === PerfilLaboral.TEMPORAL
  ) {
    return {
      tipoPrestacion: TipoPrestacion.JUBILACION,
      tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.JUBILACION],
      perfilLaboral: tarjeton.perfilLaboral,
      perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
      periodoCalculado: periodoStr,
      concepto002Capturado: norm.c002Detalle,
      concepto011Capturado: norm.c011Detalle,
      periodicidadResumen: generarResumenPeriodicidad(tarjeton),
      baseNormativaAplicada:
        'Régimen General de la Ley del Seguro Social (semanas cotizadas), no RJP contractual de base.',
      baseSalarialMonto: null,
      clausulaUtilizada: regla.documentoAplicable,
      formulaPasoAPaso: [],
      diasOMesesConsiderados: 'No aplica al RJP contractual',
      anticiposOPagosPrevios: [],
      totalAnticiposDescontados: '$0.00 MXN',
      resultadoEstimado: null,
      estatusCalculo: EstatusCalculo.NO_APLICABLE,
      mensajeEstatus:
        'No aplicable al Régimen de Jubilaciones y Pensiones (RJP) contractual mientras no cuente con plaza definitiva aplicable.',
      estadoAplicabilidad: EstadoAplicabilidad.NO_APLICABLE,
      fundamentoAplicabilidad: regla.fundamento,
      advertencias: [
        'Los periodos como sustituto o temporal cotizan ante el régimen general de la LSS.',
        'Simulación informativa: no constituye una determinación oficial del IMSS.',
      ],
      supuestos: [],
      datosFaltantes: [],
    };
  }

  const sumaParcial002y011 = norm.c002Mensual.add(norm.c011Mensual);
  const faltantes: string[] = [];

  if (params.regimen === RegimenJubilacion.DESCONOCIDO) {
    faltantes.push(
      'Constancia de fecha de ingreso o régimen aplicable (RJP previo a reforma de marzo 2008 vs. Cuentas Individuales).',
    );
  }
  if (!params.aniosServicio.trim()) {
    faltantes.push('Años efectivos de servicio reconocidos por el IMSS.');
  }
  if (!params.edad.trim()) {
    faltantes.push('Edad del trabajador para validar requisitos del Art. 4 RJP / LSS.');
  }

  if (params.regimen === RegimenJubilacion.CUENTAS_INDIVIDUALES_2008) {
    faltantes.push(
      'Estado de cuenta AFORE actualizado, semanas cotizadas ante el IMSS y saldo de aportaciones adicionales.',
    );
  } else {
    faltantes.push(
      'Tarjetón completo con los demás conceptos integradores del Art. 5 del RJP (antigüedad, ayuda de actividades culturales, parte proporcional de aguinaldo y fondo de ahorro, conceptos por categoría/riesgo).',
      'Cálculo exacto de deducciones estatutarias del Art. 5 del RJP (cuota sindical, fondo de jubilación y retención fiscal equivalente) y tabla porcentual oficial del Art. 4 RJP.',
    );
  }

  const pasos: PasoFormula[] = [
    {
      orden: 1,
      descripcion: 'Concepto 002 (Sueldo Base) normalizado mensual',
      expresion: norm.c002Detalle.equivalenteMensual!,
      resultado: norm.c002Mensual.toCurrencyMXN(),
    },
    {
      orden: 2,
      descripcion: 'Concepto 011 (Ayuda de Renta Cláusula 63 Bis b) normalizado mensual',
      expresion: norm.c011Detalle.equivalenteMensual!,
      resultado: norm.c011Mensual.toCurrencyMXN(),
    },
    {
      orden: 3,
      descripcion:
        'Sub-base parcial capturada (NO es el salario base pensionable completo)',
      expresion: `${norm.c002Mensual.toCurrencyMXN()} + ${norm.c011Mensual.toCurrencyMXN()}`,
      resultado: sumaParcial002y011.toCurrencyMXN(),
    },
  ];

  return {
    tipoPrestacion: TipoPrestacion.JUBILACION,
    tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.JUBILACION],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado: periodoStr,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada:
      params.regimen === RegimenJubilacion.CUENTAS_INDIVIDUALES_2008
        ? 'Régimen de Cuentas Individuales (LSS / Convenio 2008): la pensión depende del saldo AFORE y semanas cotizadas, no de la tabla del Art. 4 RJP.'
        : 'Artículos 4 y 5 del Régimen de Jubilaciones y Pensiones (RJP anexo al CCT): el salario base se integra por múltiples conceptos del tarjetón además de 002 y 011, menos deducciones estatutarias.',
    baseSalarialMonto: sumaParcial002y011.toCurrencyMXN(),
    clausulaUtilizada: regla.documentoAplicable,
    formulaPasoAPaso: pasos,
    diasOMesesConsiderados: params.aniosServicio.trim()
      ? `${params.aniosServicio} años de servicio · Edad: ${params.edad.trim() || 'No capturada'}`
      : 'Años de servicio no capturados',
    anticiposOPagosPrevios: [],
    totalAnticiposDescontados: '$0.00 MXN',
    resultadoEstimado: null,
    partidasAdicionales: [
      {
        concepto: 'Sub-base parcial identificada (únicamente 002 + 011)',
        clausula: 'Art. 5 RJP (referencia parcial)',
        baseAplicada: 'Conceptos capturados del tarjetón',
        montoEstimado: sumaParcial002y011.toCurrencyMXN(),
        estado: 'PENDIENTE_VALIDACION',
        nota: 'Faltan conceptos del Art. 5 RJP, deducciones reglamentarias y tabla Art. 4; no se inventa pensión.',
      },
    ],
    estatusCalculo: EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA,
    mensajeEstatus:
      'Estimación pendiente de validación normativa: con los conceptos 002 y 011 únicamente no debe inventarse una cuantía oficial de pensión o jubilación.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias: [
      'No se supone que 002 + 011 constituyen el salario pensionable completo del Art. 5 del RJP.',
      'Simulación informativa: no constituye una determinación oficial del IMSS.',
    ],
    supuestos: [
      'Se muestra únicamente la sub-base parcial de 002 y 011 capturados sin extrapolar porcentajes ni conceptos faltantes.',
    ],
    datosFaltantes: faltantes,
  };
}

// ============================================================================
// 7. FINIQUITO — Cláusulas 107, 144, 47, 56/59 Bis y LFT
// ============================================================================
export function calcularFiniquito(
  tarjeton: TarjetonData,
  params: FiniquitoParams,
): DesgloseObligatorio {
  const norm = normalizarTarjeton(tarjeton);
  const regla = obtenerReglaAplicabilidad(
    TipoPrestacion.FINIQUITO,
    tarjeton.perfilLaboral,
  );
  const periodoStr = `Liquidación / Finiquito (${params.causal.replace(/_/g, ' ').toLowerCase()})`;

  if (!norm.completo || !norm.c002Mensual || !norm.c011Mensual) {
    return construirRespuestaIncompleta(
      TipoPrestacion.FINIQUITO,
      tarjeton,
      norm,
      periodoStr,
      'Múltiples bases por partida: Cláusula 107 (002+011), Cláusula 144 (únicamente 002), Cláusula 47 (002+011) y Art. 162 LFT.',
      regla.documentoAplicable,
      'Pendiente de captura de tarjetón',
    );
  }

  const faltantes: string[] = [];
  const dAgui = BigDecimal.tryParse(params.diasAguinaldoPendientes);
  const dFondo = BigDecimal.tryParse(params.diasFondoAhorroPendientes);
  const dVac = BigDecimal.tryParse(params.diasVacacionesPendientes);
  const anticAgui = params.anticiposAguinaldoYaPagados.trim()
    ? BigDecimal.tryParse(params.anticiposAguinaldoYaPagados)
    : BigDecimal.zero();

  if (!dAgui || dAgui.lt(0) || dAgui.gt(366)) {
    faltantes.push('Días pendientes para aguinaldo proporcional (0 a 365).');
  }
  if (!dFondo || dFondo.lt(0) || dFondo.gt(366)) {
    faltantes.push('Días pendientes para fondo de ahorro proporcional (0 a 365).');
  }
  if (!dVac || dVac.lt(0) || dVac.gt(90)) {
    faltantes.push('Días de vacaciones pendientes no disfrutadas (0 a 90).');
  }
  if (!anticAgui || anticAgui.lt(0)) {
    faltantes.push('Anticipos de aguinaldo ya pagados debe ser mayor o igual a 0.');
  }

  if (
    faltantes.length > 0 ||
    !dAgui ||
    !dFondo ||
    !dVac ||
    !anticAgui
  ) {
    return construirRespuestaIncompleta(
      TipoPrestacion.FINIQUITO,
      tarjeton,
      norm,
      periodoStr,
      'Desglose diferenciado por prestación (002 para Fondo de Ahorro; 002+011 para Aguinaldo y Vacaciones).',
      regla.documentoAplicable,
      'Días proporcionales inválidos',
      faltantes,
    );
  }

  const c002M = norm.c002Mensual;
  const c011M = norm.c011Mensual;
  const nominalMensual = c002M.add(c011M);
  const nominalDiario = nominalMensual.div(30);
  const tabularDiario = c002M.div(30);

  // 1) Aguinaldo proporcional (Cláusula 107 -> Base 002+011, 3 meses/año, minus advances once)
  const aguinaldoPropBruto = nominalMensual.mul(3).mul(dAgui.div(365));
  const aguinaldoPropNeto = aguinaldoPropBruto.sub(anticAgui);

  // 2) Fondo de Ahorro proporcional (Cláusula 144 -> Base ONLY 002 Sueldo Tabular, 45 días/año)
  const esConfianza =
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_A ||
    tarjeton.perfilLaboral === PerfilLaboral.CONFIANZA_B;
  const fondoAhorroProp = esConfianza
    ? null
    : tabularDiario.mul(45).mul(dFondo.div(365));

  // 3) Vacaciones pendientes + Prima vacacional 25% (Cláusula 47)
  const vacacionesPendMonto = nominalDiario.mul(dVac);
  const primaVacPendMonto = vacacionesPendMonto.mul('0.25');

  let totalDeterminable = aguinaldoPropNeto
    .add(vacacionesPendMonto)
    .add(primaVacPendMonto);
  if (fondoAhorroProp) {
    totalDeterminable = totalDeterminable.add(fondoAhorroProp);
  }

  const partidas: PartidaDesglose[] = [
    {
      concepto: 'Aguinaldo proporcional neto',
      clausula: 'Cláusula 107 CCT 2025-2027 (o LFT Art. 87 según perfil)',
      baseAplicada: 'Sueldo Nominal (002 + 011)',
      montoEstimado: aguinaldoPropNeto.toCurrencyMXN(),
      estado: esConfianza ? 'PENDIENTE_VALIDACION' : 'CALCULADO',
      nota: esConfianza
        ? 'Calculado con regla general 3 meses como referencia; validar días aplicables en Estatuto de Confianza.'
        : `${dAgui.toExactString()} días de 365 menos ${anticAgui.toCurrencyMXN()} de anticipos.`,
    },
    {
      concepto: 'Fondo de Ahorro proporcional (45 días anuales)',
      clausula: 'Cláusula 144 CCT 2025-2027',
      baseAplicada: 'Únicamente Sueldo Tabular (Concepto 002 · 011 excluido)',
      montoEstimado: fondoAhorroProp
        ? fondoAhorroProp.toCurrencyMXN()
        : null,
      estado: fondoAhorroProp ? 'CALCULADO' : 'PENDIENTE_VALIDACION',
      nota: fondoAhorroProp
        ? `${dFondo.toExactString()} días de 365 usando exclusivamente Concepto 002.`
        : 'Pendiente de validar en Estatuto de Personal de Confianza.',
    },
    {
      concepto: 'Vacaciones pendientes no disfrutadas',
      clausula: 'Cláusula 47 CCT / LFT Art. 79',
      baseAplicada: 'Sueldo Nominal diario (002 + 011 ÷ 30)',
      montoEstimado: vacacionesPendMonto.toCurrencyMXN(),
      estado: 'CALCULADO',
      nota: `${dVac.toExactString()} días pendientes.`,
    },
    {
      concepto: 'Prima vacacional proporcional (25%)',
      clausula: 'Cláusula 47 CCT / LFT Art. 80',
      baseAplicada: '25% sobre vacaciones pendientes',
      montoEstimado: primaVacPendMonto.toCurrencyMXN(),
      estado: 'CALCULADO',
      nota: '25% aplicado sobre las vacaciones pendientes calculadas.',
    },
    {
      concepto: 'Prima de Antigüedad e Indemnización (si procede por causal)',
      clausula: 'Cláusula 56 / 59 Bis CCT y Arts. 48, 50, 162 LFT',
      baseAplicada: 'Salario Diario Integrado completo y tope legal (2× SMG/UMA)',
      montoEstimado: null,
      estado: 'PENDIENTE_VALIDACION',
      nota: 'Requiere causal acreditada, antigüedad exacta y todos los conceptos integradores del tarjetón (no disponibles solo con 002 y 011).',
    },
  ];

  const pasos: PasoFormula[] = [
    {
      orden: 1,
      descripcion: 'Aguinaldo proporcional (Base 002 + 011) menos anticipos previos',
      expresion: `(${nominalMensual.toCurrencyMXN()} × 3 × ${dAgui.toExactString()} ÷ 365) − ${anticAgui.toCurrencyMXN()}`,
      resultado: aguinaldoPropNeto.toCurrencyMXN(),
    },
    {
      orden: 2,
      descripcion:
        'Fondo de Ahorro proporcional (Base estricta: únicamente Concepto 002)',
      expresion: fondoAhorroProp
        ? `(${tabularDiario.toCurrencyMXN()} × 45 × ${dFondo.toExactString()} ÷ 365)`
        : 'Pendiente de validar Estatuto de Confianza',
      resultado: fondoAhorroProp
        ? fondoAhorroProp.toCurrencyMXN()
        : 'Pendiente de validación',
    },
    {
      orden: 3,
      descripcion: 'Vacaciones pendientes + 25% Prima Vacacional',
      expresion: `(${nominalDiario.toCurrencyMXN()} × ${dVac.toExactString()}) × 1.25`,
      resultado: vacacionesPendMonto.add(primaVacPendMonto).toCurrencyMXN(),
    },
    {
      orden: 4,
      descripcion: 'Subtotal de partidas proporcionales determinables',
      expresion: 'Suma de partidas devengadas calculadas con 002 y 011',
      resultado: totalDeterminable.toCurrencyMXN(),
    },
  ];

  const faltantesNormativos: string[] = [
    'Otros conceptos permanentes del tarjetón para determinar el Salario Diario Integrado (art. 84 LFT / Cláusula 56) en caso de indemnización.',
  ];
  if (params.causal === CausalFiniquito.NO_ESPECIFICADA) {
    faltantesNormativos.unshift(
      'Causal jurídica de terminación de la relación laboral para determinar procedencia de indemnización o prima de antigüedad.',
    );
  }
  if (esConfianza) {
    faltantesNormativos.unshift(
      'Estatuto de Personal de Confianza para confirmar Fondo de Ahorro y días contractuales de aguinaldo.',
    );
  }

  return {
    tipoPrestacion: TipoPrestacion.FINIQUITO,
    tituloPrestacion: PRESTACION_LABELS[TipoPrestacion.FINIQUITO],
    perfilLaboral: tarjeton.perfilLaboral,
    perfilLaboralLabel: PERFIL_LABORAL_LABELS[tarjeton.perfilLaboral],
    periodoCalculado: periodoStr,
    concepto002Capturado: norm.c002Detalle,
    concepto011Capturado: norm.c011Detalle,
    periodicidadResumen: generarResumenPeriodicidad(tarjeton),
    baseNormativaAplicada:
      'Bases diferenciadas: Aguinaldo y Vacaciones usan 002+011; Fondo de Ahorro usa únicamente 002 (Cláusula 144); Prima de Antigüedad/Indemnización requiere salario integrado completo.',
    baseSalarialMonto: `Nominal: ${nominalMensual.toCurrencyMXN()} · Tabular (002): ${c002M.toCurrencyMXN()}`,
    clausulaUtilizada: regla.documentoAplicable,
    formulaPasoAPaso: pasos,
    diasOMesesConsiderados: `Aguinaldo: ${dAgui.toExactString()}d · Fondo Ahorro: ${dFondo.toExactString()}d · Vacaciones: ${dVac.toExactString()}d`,
    anticiposOPagosPrevios: anticAgui.gt(0)
      ? [
          {
            concepto: 'Anticipos de aguinaldo ya pagados',
            monto: anticAgui.toCurrencyMXN(),
            observacion: 'Descontados una sola vez de la partida de aguinaldo.',
          },
        ]
      : [],
    totalAnticiposDescontados: anticAgui.toCurrencyMXN(),
    resultadoEstimado: totalDeterminable.toCurrencyMXN(),
    partidasAdicionales: partidas,
    estatusCalculo:
      params.causal === CausalFiniquito.DESPIDO_INJUSTIFICADO || esConfianza
        ? EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA
        : EstatusCalculo.COMPLETO,
    mensajeEstatus:
      'Subtotal de partes proporcionales calculado diferenciando las bases de cada cláusula; partidas indemnizatorias sujetas a validación normativa.',
    estadoAplicabilidad: regla.estado,
    fundamentoAplicabilidad: regla.fundamento,
    advertencias: [
      'No incluye descuentos fiscales (ISR) ni adeudos vigentes con el IMSS.',
      'La prima de antigüedad (Art. 162 LFT) e indemnizaciones no se estiman sin causal acreditada y salario integrado completo.',
      'Simulación informativa: no constituye una determinación oficial del IMSS.',
    ],
    supuestos: [
      'Cada partida usa estrictamente la base de su cláusula (Fondo de Ahorro excluye el Concepto 011).',
    ],
    datosFaltantes: faltantesNormativos,
  };
}
