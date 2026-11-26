import { BigDecimal } from './bigDecimal';
import {
  ConceptoNormalizadoDetalle,
  EstadoAplicabilidad,
  PerfilLaboral,
  Periodicidad,
  TarjetonData,
  TipoPrestacion,
} from './types';

export const PERFIL_LABORAL_LABELS: Record<PerfilLaboral, string> = {
  [PerfilLaboral.BASE]: 'Base',
  [PerfilLaboral.SUSTITUTO]: 'Sustituto',
  [PerfilLaboral.TEMPORAL]: 'Temporal u obra determinada',
  [PerfilLaboral.CONFIANZA_A]: 'Confianza A',
  [PerfilLaboral.CONFIANZA_B]: 'Confianza B',
};

export const ESTADO_APLICABILIDAD_LABELS: Record<EstadoAplicabilidad, string> = {
  [EstadoAplicabilidad.APLICABLE]: 'APLICABLE',
  [EstadoAplicabilidad.CONDICIONADO]: 'CONDICIONADO',
  [EstadoAplicabilidad.NO_APLICABLE]: 'NO APLICABLE',
  [EstadoAplicabilidad.NO_DETERMINABLE]: 'NO DETERMINABLE',
};

export const PRESTACION_LABELS: Record<TipoPrestacion, string> = {
  [TipoPrestacion.AGUINALDO]: 'Aguinaldo',
  [TipoPrestacion.VACACIONES]: 'Vacaciones',
  [TipoPrestacion.PRIMA_VACACIONAL]: 'Prima Vacacional',
  [TipoPrestacion.FONDO_AHORRO]: 'Fondo de Ahorro',
  [TipoPrestacion.CREDITOS]: 'Créditos',
  [TipoPrestacion.JUBILACION]: 'Jubilación',
  [TipoPrestacion.FINIQUITO]: 'Finiquito',
};

export interface ReglaAplicabilidad {
  estado: EstadoAplicabilidad;
  documentoAplicable: string;
  fundamento: string;
  requiereValidacionEstatuto: boolean;
}

const MATRIZ_APLICABILIDAD: Record<
  TipoPrestacion,
  Record<PerfilLaboral, ReglaAplicabilidad>
> = {
  [TipoPrestacion.AGUINALDO]: {
    [PerfilLaboral.BASE]: {
      estado: EstadoAplicabilidad.APLICABLE,
      documentoAplicable: 'CCT IMSS-SNTSS 2025-2027, Cláusula 107',
      fundamento:
        'Aplica directamente al personal de base sindicalizado: tres meses de sueldo nominal anuales, proporcional a los sueldos percibidos, con anticipo de medio mes en enero, un mes en agosto a solicitud y saldo en diciembre.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.SUSTITUTO]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusula 107 y Cláusulas aplicables a Sustitutos / Bolsa de Trabajo',
      fundamento:
        'Condicionado a los días efectivamente sustituidos y sueldos nominales percibidos durante el año calendario; el pago se calcula de forma estrictamente proporcional al tiempo laborado.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.TEMPORAL]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusula 107 y Contrato Temporal o por Obra Determinada (LFT Art. 87)',
      fundamento:
        'Condicionado a la vigencia del contrato temporal o por obra determinada y a los días efectivamente laborados dentro del ejercicio; no aplica anticipo anual completo si la contratación es menor al periodo.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.CONFIANZA_A]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS y Nombramiento Individual',
      fundamento:
        'El personal de Confianza A no se rige automáticamente por la Cláusula 107 del CCT sindicalizado; se requiere validar su Estatuto vigente y nombramiento para confirmar días e integración salarial.',
      requiereValidacionEstatuto: true,
    },
    [PerfilLaboral.CONFIANZA_B]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS / Reglamento Aplicable y Nombramiento',
      fundamento:
        'El personal de Confianza B está sujeto a su Estatuto y condiciones específicas de nombramiento; no debe extenderse automáticamente la Cláusula 107 del CCT sin validación normativa.',
      requiereValidacionEstatuto: true,
    },
  },
  [TipoPrestacion.VACACIONES]: {
    [PerfilLaboral.BASE]: {
      estado: EstadoAplicabilidad.APLICABLE,
      documentoAplicable: 'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
      fundamento:
        'Aplica al personal de base con al menos un año de servicios continuos: dos periodos anuales de 10 días hábiles cada uno con goce de sueldo, más días adicionales según escala de antigüedad.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.SUSTITUTO]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusula 47 y Reglamento de Bolsa de Trabajo / LFT Art. 76-79',
      fundamento:
        'Condicionado al cumplimiento de periodos continuos o acumulación de servicios efectivos que generen derecho vacacional o parte proporcional al término de contratación.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.TEMPORAL]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'Contrato Temporal / Obra Determinada y LFT Arts. 76 y 79 (CCT Cláusula 47 en lo conducente)',
      fundamento:
        'Condicionado a la duración del contrato y al tiempo efectivamente laborado; en contrataciones menores a un año procede parte proporcional al concluir la relación.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.CONFIANZA_A]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS y Nombramiento',
      fundamento:
        'Los días y periodos vacacionales del personal de Confianza A se rigen por su Estatuto y nombramiento específico, no de forma automática por la Cláusula 47 del CCT.',
      requiereValidacionEstatuto: true,
    },
    [PerfilLaboral.CONFIANZA_B]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS / Reglamento Interior',
      fundamento:
        'Los periodos vacacionales para Confianza B dependen del Estatuto de Confianza y nombramiento vigente; requiere validación documental previa.',
      requiereValidacionEstatuto: true,
    },
  },
  [TipoPrestacion.PRIMA_VACACIONAL]: {
    [PerfilLaboral.BASE]: {
      estado: EstadoAplicabilidad.APLICABLE,
      documentoAplicable: 'CCT IMSS-SNTSS 2025-2027, Cláusula 47',
      fundamento:
        'Aplica al personal de base: 25% sobre los salarios correspondientes a los días del periodo vacacional.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.SUSTITUTO]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusula 47 / LFT Art. 80',
      fundamento:
        'Condicionado a haber generado derecho a días de vacaciones o parte proporcional por tiempo efectivo sustituido.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.TEMPORAL]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'Contrato Temporal / Obra Determinada y LFT Art. 80',
      fundamento:
        'Condicionado al periodo efectivamente laborado; mínimo 25% proporcional sobre los días vacacionales generados.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.CONFIANZA_A]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS y Nombramiento',
      fundamento:
        'El porcentaje y base de prima vacacional para Confianza A dependen de su Estatuto y nombramiento, no automáticamente del CCT sindicalizado.',
      requiereValidacionEstatuto: true,
    },
    [PerfilLaboral.CONFIANZA_B]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS / Reglamento',
      fundamento:
        'Requiere validar en el Estatuto de Confianza B el porcentaje aplicable y los conceptos que integran la base vacacional.',
      requiereValidacionEstatuto: true,
    },
  },
  [TipoPrestacion.FONDO_AHORRO]: {
    [PerfilLaboral.BASE]: {
      estado: EstadoAplicabilidad.APLICABLE,
      documentoAplicable: 'CCT IMSS-SNTSS 2025-2027, Cláusula 144',
      fundamento:
        'Aplica al personal de base: equivalente anual a 45 días de Sueldo Tabular (Concepto 002 únicamente) por el periodo del 1 de julio al 30 de junio, proporcional al tiempo laborado.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.SUSTITUTO]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusula 144 y disposiciones de sustitución',
      fundamento:
        'Condicionado a los días efectivamente laborados y cotizados durante el ciclo julio–junio bajo nombramiento de sustitución.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.TEMPORAL]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusula 144 y Contrato Temporal/Obra',
      fundamento:
        'Condicionado a los términos de la contratación temporal/obra determinada y días efectivos laborados dentro del ciclo julio–junio.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.CONFIANZA_A]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS y Nombramiento',
      fundamento:
        'No debe extenderse automáticamente la Cláusula 144 del CCT; el Fondo de Ahorro o compensación equivalente de Confianza A requiere validar el Estatuto correspondiente.',
      requiereValidacionEstatuto: true,
    },
    [PerfilLaboral.CONFIANZA_B]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS / Reglamento',
      fundamento:
        'Requiere validación expresa en el Estatuto de Personal de Confianza B y nombramiento vigente.',
      requiereValidacionEstatuto: true,
    },
  },
  [TipoPrestacion.CREDITOS]: {
    [PerfilLaboral.BASE]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusulas 145 y 146; Reglamento de Préstamos y LFT Art. 110',
      fundamento:
        'Condicionado a antigüedad mínima, capacidad de descuento vigente en el tarjetón (sin exceder topes legales/reglamentarios), ausencia de adeudos vencidos y disponibilidad del reglamento del préstamo específico.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.SUSTITUTO]: {
      estado: EstadoAplicabilidad.NO_APLICABLE,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusulas 145 y 146; Reglamentos de Préstamos IMSS',
      fundamento:
        'Por regla general los préstamos institucionales a mediano plazo e hipotecarios del CCT exigen plaza definitiva (base) y antigüedad consolidada; un trabajador sustituto sin base no accede automáticamente salvo norma expresa de corto plazo.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.TEMPORAL]: {
      estado: EstadoAplicabilidad.NO_APLICABLE,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027, Cláusulas 145 y 146; Reglamentos de Préstamos',
      fundamento:
        'Las contrataciones temporales o por obra determinada carecen de plaza definitiva para garantizar créditos institucionales a mediano plazo o hipotecarios.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.CONFIANZA_A]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza y Normativa de Préstamos Institucionales',
      fundamento:
        'Requiere validar las reglas crediticias aplicables al personal de Confianza A, capacidad líquida de descuento y reglamento vigente.',
      requiereValidacionEstatuto: true,
    },
    [PerfilLaboral.CONFIANZA_B]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza y Normativa de Préstamos Institucionales',
      fundamento:
        'Requiere validar las reglas crediticias aplicables al personal de Confianza B y su capacidad de descuento real.',
      requiereValidacionEstatuto: true,
    },
  },
  [TipoPrestacion.JUBILACION]: {
    [PerfilLaboral.BASE]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'Régimen de Jubilaciones y Pensiones (RJP anexo al CCT, Arts. 4 y 5) o LSS / Convenio 2008 (Cuentas Individuales)',
      fundamento:
        'Condicionado a la fecha de ingreso (RJP tradicional antes de la reforma de marzo 2008 vs. Cuentas Individuales posterior), cumplimiento de años de servicio/edad y desglose completo de conceptos del Art. 5 RJP.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.SUSTITUTO]: {
      estado: EstadoAplicabilidad.NO_APLICABLE,
      documentoAplicable:
        'Régimen de Jubilaciones y Pensiones (RJP) / Ley del Seguro Social (LSS)',
      fundamento:
        'El RJP contractual aplica a trabajadores de base con relación definitiva en los términos del convenio; los periodos como sustituto cotizan ante el régimen general de la Ley del Seguro Social mientras no exista basificación aplicable.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.TEMPORAL]: {
      estado: EstadoAplicabilidad.NO_APLICABLE,
      documentoAplicable:
        'Régimen de Jubilaciones y Pensiones (RJP) / Ley del Seguro Social (LSS)',
      fundamento:
        'El personal temporal o por obra determinada no accede al RJP contractual de base; su pensión se rige por las semanas cotizadas y cuenta individual bajo la Ley del Seguro Social.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.CONFIANZA_A]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza, RJP (si ingresó previo a reforma) o LSS Cuentas Individuales',
      fundamento:
        'Requiere constancia de régimen pensionario por fecha de ingreso, nombramiento de Confianza A y desglose completo de conceptos integradores.',
      requiereValidacionEstatuto: true,
    },
    [PerfilLaboral.CONFIANZA_B]: {
      estado: EstadoAplicabilidad.NO_DETERMINABLE,
      documentoAplicable:
        'Estatuto de Personal de Confianza, RJP (si ingresó previo a reforma) o LSS Cuentas Individuales',
      fundamento:
        'Requiere validar fecha de ingreso, régimen aplicable (RJP vs. LSS) y conceptos integradores en el nombramiento de Confianza B.',
      requiereValidacionEstatuto: true,
    },
  },
  [TipoPrestacion.FINIQUITO]: {
    [PerfilLaboral.BASE]: {
      estado: EstadoAplicabilidad.APLICABLE,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027 (Cláusulas 47, 56, 59 Bis, 107, 144) y LFT Arts. 48, 50, 79, 80, 87, 162',
      fundamento:
        'Aplica al concluir la relación laboral: partes proporcionales de aguinaldo (Cláus. 107), fondo de ahorro (Cláus. 144), vacaciones y prima vacacional (Cláus. 47); prima de antigüedad e indemnización quedan sujetas a causal y antigüedad.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.SUSTITUTO]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'CCT IMSS-SNTSS 2025-2027 (en lo proporcional) y LFT Arts. 79, 80, 87',
      fundamento:
        'Condicionado a las percepciones devengadas y partes proporcionales pendientes de pago por cada sustitución concluida.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.TEMPORAL]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'Contrato Temporal / Obra Determinada, CCT en lo conducente y LFT Arts. 79, 80, 87',
      fundamento:
        'Condicionado al término de la obra o tiempo determinado: cubre partes proporcionales devengadas de aguinaldo, vacaciones y prima vacacional; indemnizaciones dependen de si hubo terminación anticipada injustificada.',
      requiereValidacionEstatuto: false,
    },
    [PerfilLaboral.CONFIANZA_A]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS y Ley Federal del Trabajo',
      fundamento:
        'Las partes proporcionales devengadas proceden conforme a LFT y Estatuto de Confianza A, pero las prestaciones contractuales específicas (Cláusulas 107/144/56) requieren validar su aplicabilidad en el Estatuto.',
      requiereValidacionEstatuto: true,
    },
    [PerfilLaboral.CONFIANZA_B]: {
      estado: EstadoAplicabilidad.CONDICIONADO,
      documentoAplicable:
        'Estatuto de Personal de Confianza del IMSS y Ley Federal del Trabajo',
      fundamento:
        'Las partes proporcionales legales proceden conforme a LFT; las prestaciones contractuales del CCT requieren validación frente al Estatuto de Confianza B y nombramiento.',
      requiereValidacionEstatuto: true,
    },
  },
};

export function obtenerReglaAplicabilidad(
  prestacion: TipoPrestacion,
  perfil: PerfilLaboral,
): ReglaAplicabilidad {
  return MATRIZ_APLICABILIDAD[prestacion][perfil];
}

export interface TarjetonNormalizado {
  completo: boolean;
  c002Detalle: ConceptoNormalizadoDetalle;
  c011Detalle: ConceptoNormalizadoDetalle;
  c002Mensual: BigDecimal | null;
  c011Mensual: BigDecimal | null;
  c002Original: BigDecimal | null;
  c011Original: BigDecimal | null;
  datosFaltantes: string[];
}

function normalizarConceptoIndividual(
  codigo: '002' | '011',
  nombre: string,
  rawAmount: string,
  periodicidad: Periodicidad,
): {
  detalle: ConceptoNormalizadoDetalle;
  original: BigDecimal | null;
  mensual: BigDecimal | null;
  faltante: string | null;
} {
  const trimmed = rawAmount.trim();
  if (!trimmed) {
    return {
      detalle: {
        codigo,
        nombre,
        capturado: false,
        importeOriginal: null,
        periodicidadOriginal: periodicidad,
        equivalenteMensual: null,
        esValido: false,
        errorValidacion: `Falta capturar el importe del Concepto ${codigo} (${nombre}).`,
      },
      original: null,
      mensual: null,
      faltante: `Concepto ${codigo} (${nombre}) en periodicidad ${periodicidad.toLowerCase()}`,
    };
  }

  const parsed = BigDecimal.tryParse(trimmed);
  if (!parsed || parsed.lte(0)) {
    return {
      detalle: {
        codigo,
        nombre,
        capturado: true,
        importeOriginal: trimmed,
        periodicidadOriginal: periodicidad,
        equivalenteMensual: null,
        esValido: false,
        errorValidacion: `El Concepto ${codigo} debe ser un importe numérico positivo mayor a cero.`,
      },
      original: null,
      mensual: null,
      faltante: `Importe válido mayor a cero para Concepto ${codigo} (${nombre})`,
    };
  }

  // Exact conversion without mutating original captured amount:
  // If quincenal, mensual = original * 2 (exact BigDecimal). If mensual, mensual = original.
  const mensual =
    periodicidad === Periodicidad.QUINCENAL ? parsed.mul(2) : parsed;

  return {
    detalle: {
      codigo,
      nombre,
      capturado: true,
      importeOriginal: parsed.toCurrencyMXN(),
      periodicidadOriginal: periodicidad,
      equivalenteMensual: mensual.toCurrencyMXN(),
      esValido: true,
      errorValidacion: null,
    },
    original: parsed,
    mensual,
    faltante: null,
  };
}

export function normalizarTarjeton(tarjeton: TarjetonData): TarjetonNormalizado {
  const c002 = normalizarConceptoIndividual(
    '002',
    'Sueldo Base',
    tarjeton.concepto002.rawAmount,
    tarjeton.concepto002.periodicidad,
  );
  const c011 = normalizarConceptoIndividual(
    '011',
    'Ayuda de Renta · Cláusula 63 Bis, inciso b',
    tarjeton.concepto011.rawAmount,
    tarjeton.concepto011.periodicidad,
  );

  const datosFaltantes: string[] = [];
  if (c002.faltante) datosFaltantes.push(c002.faltante);
  if (c011.faltante) datosFaltantes.push(c011.faltante);

  return {
    completo: Boolean(c002.mensual && c011.mensual),
    c002Detalle: c002.detalle,
    c011Detalle: c011.detalle,
    c002Mensual: c002.mensual,
    c011Mensual: c011.mensual,
    c002Original: c002.original,
    c011Original: c011.original,
    datosFaltantes,
  };
}
