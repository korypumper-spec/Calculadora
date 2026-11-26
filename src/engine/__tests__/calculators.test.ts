import { describe, expect, it } from 'vitest';
import {
  calcularAguinaldo,
  calcularCreditos,
  calcularFiniquito,
  calcularFondoAhorro,
  calcularJubilacion,
  calcularPrimaVacacional,
  calcularVacaciones,
} from '../calculators';
import {
  AguinaldoParams,
  CausalFiniquito,
  CreditosParams,
  EstadoAplicabilidad,
  EstatusCalculo,
  FiniquitoParams,
  FondoAhorroParams,
  JubilacionParams,
  ModoProporcionalAguinaldo,
  PerfilLaboral,
  Periodicidad,
  PrimaVacacionalParams,
  RegimenJubilacion,
  TarjetonData,
  VacacionesParams,
} from '../types';

const defaultAguinaldoParams: AguinaldoParams = {
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
};

describe('Validación de captura de Conceptos 002 y 011 y periodicidad', () => {
  it('marca el cálculo como incompleto cuando falta Concepto 002 o Concepto 011 (sin inventar importes)', () => {
    const tarjetonSin011: TarjetonData = {
      perfilLaboral: PerfilLaboral.BASE,
      concepto002: { rawAmount: '5000', periodicidad: Periodicidad.QUINCENAL },
      concepto011: { rawAmount: '', periodicidad: Periodicidad.QUINCENAL },
    };

    const res = calcularAguinaldo(tarjetonSin011, defaultAguinaldoParams);
    expect(res.estatusCalculo).toBe(EstatusCalculo.INCOMPLETO);
    expect(res.resultadoEstimado).toBeNull();
    expect(res.datosFaltantes.some((d) => d.includes('011'))).toBe(true);
  });

  it('convierte importes quincenales a mensuales (× 2) sin alterar los importes originales ni duplicar 011', () => {
    const tarjetonQuincenal: TarjetonData = {
      perfilLaboral: PerfilLaboral.BASE,
      concepto002: { rawAmount: '4500.00', periodicidad: Periodicidad.QUINCENAL },
      concepto011: { rawAmount: '1500.00', periodicidad: Periodicidad.QUINCENAL },
    };

    const res = calcularAguinaldo(tarjetonQuincenal, defaultAguinaldoParams);
    expect(res.estatusCalculo).toBe(EstatusCalculo.COMPLETO);
    expect(res.concepto002Capturado.importeOriginal).toBe('$4,500.00 MXN');
    expect(res.concepto002Capturado.equivalenteMensual).toBe('$9,000.00 MXN');
    expect(res.concepto011Capturado.importeOriginal).toBe('$1,500.00 MXN');
    expect(res.concepto011Capturado.equivalenteMensual).toBe('$3,000.00 MXN');
    // Sueldo nominal mensual = 9000 + 3000 = 12000 (011 NO duplicado)
    expect(res.baseSalarialMonto).toBe('$12,000.00 MXN');
    // 3 meses de sueldo nominal = 36000
    expect(res.resultadoEstimado).toBe('$36,000.00 MXN');
  });

  it('respeta periodicidades mixtas (ej. 002 quincenal y 011 mensual) sin mezclar bases', () => {
    const tarjetonMixto: TarjetonData = {
      perfilLaboral: PerfilLaboral.BASE,
      concepto002: { rawAmount: '4000', periodicidad: Periodicidad.QUINCENAL }, // mensual = 8000
      concepto011: { rawAmount: '2500', periodicidad: Periodicidad.MENSUAL }, // mensual = 2500
    };

    const res = calcularAguinaldo(tarjetonMixto, defaultAguinaldoParams);
    expect(res.concepto002Capturado.equivalenteMensual).toBe('$8,000.00 MXN');
    expect(res.concepto011Capturado.equivalenteMensual).toBe('$2,500.00 MXN');
    expect(res.baseSalarialMonto).toBe('$10,500.00 MXN');
    expect(res.resultadoEstimado).toBe('$31,500.00 MXN');
  });
});

describe('Cálculo de Aguinaldo conforme a Cláusula 107 CCT 2025-2027', () => {
  const tarjetonBase: TarjetonData = {
    perfilLaboral: PerfilLaboral.BASE,
    concepto002: { rawAmount: '10000', periodicidad: Periodicidad.MENSUAL },
    concepto011: { rawAmount: '2000', periodicidad: Periodicidad.MENSUAL },
  };

  it('desglosa y descuenta anticipo de enero (0.5 meses) y agosto (1 mes) una sola vez', () => {
    const res = calcularAguinaldo(tarjetonBase, {
      ...defaultAguinaldoParams,
      anticipoEneroPagado: true,
      anticipoAgostoSolicitado: true,
    });

    // Base = 12,000. Bruto = 36,000. Enero = 6,000. Agosto = 12,000. Total anticipos = 18,000. Saldo dic = 18,000.
    expect(res.totalAnticiposDescontados).toBe('$18,000.00 MXN');
    expect(res.anticiposOPagosPrevios).toHaveLength(2);
    expect(res.resultadoEstimado).toBe('$18,000.00 MXN');
  });

  it('calcula proporcional por meses e incidencias justificadas sin redondeos intermedios', () => {
    const res = calcularAguinaldo(tarjetonBase, {
      ...defaultAguinaldoParams,
      modoProporcional: ModoProporcionalAguinaldo.MESES,
      mesesLaborados: '6',
      diasIncidenciaSinGoce: '10',
      justificacionIncidencia: 'Licencia sin goce Cláusula 44',
    });

    // 36000 * (0.5 - 10/365) = 36000 * (182.5 - 10)/365 = 36000 * 172.5 / 365 = 17013.6986... -> 17,013.70
    expect(res.estatusCalculo).toBe(EstatusCalculo.COMPLETO);
    expect(res.resultadoEstimado).toBe('$17,013.70 MXN');
  });

  it('exige fundamento normativo si se capturan días de incidencia sin goce', () => {
    const res = calcularAguinaldo(tarjetonBase, {
      ...defaultAguinaldoParams,
      diasIncidenciaSinGoce: '5',
      justificacionIncidencia: '',
    });

    expect(res.estatusCalculo).toBe(EstatusCalculo.INCOMPLETO);
    expect(res.datosFaltantes.some((f) => f.toLowerCase().includes('incidencia'))).toBe(true);
  });
});

describe('Prestaciones del Tarjetón y Reglas Diferenciadas por Cláusula', () => {
  const tarjetonBase: TarjetonData = {
    perfilLaboral: PerfilLaboral.BASE,
    concepto002: { rawAmount: '5000', periodicidad: Periodicidad.QUINCENAL }, // 10,000 mensual
    concepto011: { rawAmount: '1500', periodicidad: Periodicidad.QUINCENAL }, // 3,000 mensual
  };

  it('Fondo de Ahorro (Cláusula 144) utiliza ÚNICAMENTE Sueldo Tabular (Concepto 002) y excluye Concepto 011', () => {
    const params: FondoAhorroParams = {
      ciclo: '2025-2026',
      diasLaboradosCiclo: '365',
      anticipoOProrrateoPrevio: '0',
    };
    const res = calcularFondoAhorro(tarjetonBase, params);

    expect(res.estatusCalculo).toBe(EstatusCalculo.COMPLETO);
    // Base = 10,000 (NO 13,000!) -> (10,000 / 30) * 45 = 15,000.00 exacto
    expect(res.baseSalarialMonto).toBe('$10,000.00 MXN');
    expect(res.resultadoEstimado).toBe('$15,000.00 MXN');
    expect(res.concepto011Capturado.equivalenteMensual).toBe('$3,000.00 MXN');
  });

  it('Prima Vacacional (Cláusula 47) calcula el 25% sobre los días vacacionales', () => {
    const params: PrimaVacacionalParams = {
      anio: '2026',
      aniosAntiguedad: '4',
      diasVacacionesBase: '20',
      periodo: 'ANUAL',
    };
    const res = calcularPrimaVacacional(tarjetonBase, params);

    // Base nominal = 13,000/mes -> diario = 13,000/30 -> 20 días = 8,666.6666... -> 25% = 2,166.67
    expect(res.estatusCalculo).toBe(EstatusCalculo.COMPLETO);
    expect(res.resultadoEstimado).toBe('$2,166.67 MXN');
  });

  it('Vacaciones (Cláusula 47) marca pendiente validación si antigüedad es menor a 1 año', () => {
    const params: VacacionesParams = {
      anio: '2026',
      aniosAntiguedad: '0.5',
      diasAdicionalesVerificados: '0',
      periodoSolicitado: 'ANUAL_COMPLETO',
    };
    const res = calcularVacaciones(tarjetonBase, params);
    expect(res.estatusCalculo).toBe(EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA);
    expect(res.estadoAplicabilidad).toBe(EstadoAplicabilidad.CONDICIONADO);
  });

  it('Créditos y Jubilación no inventan montos definitivos si faltan documentos/conceptos integradores', () => {
    const creditParams: CreditosParams = {
      tipoCredito: 'CORTO_PLAZO',
      descuentosActualesTarjeton: '',
      montoSolicitado: '50000',
    };
    const resCred = calcularCreditos(tarjetonBase, creditParams);
    expect(resCred.estatusCalculo).toBe(EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA);
    expect(resCred.resultadoEstimado).toBeNull();

    const jubParams: JubilacionParams = {
      regimen: RegimenJubilacion.RJP_TRADICIONAL,
      aniosServicio: '25',
      edad: '52',
      fechaIngreso: '2001-05-01',
    };
    const resJub = calcularJubilacion(tarjetonBase, jubParams);
    expect(resJub.estatusCalculo).toBe(EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA);
    expect(resJub.resultadoEstimado).toBeNull();
    expect(resJub.datosFaltantes.length).toBeGreaterThan(0);
  });

  it('Finiquito diferencia bases: 002+011 para aguinaldo/vacaciones y solo 002 para fondo de ahorro', () => {
    const finParams: FiniquitoParams = {
      causal: CausalFiniquito.RENUNCIA_VOLUNTARIA,
      aniosAntiguedad: '5',
      diasAguinaldoPendientes: '365',
      diasFondoAhorroPendientes: '365',
      diasVacacionesPendientes: '0',
      anticiposAguinaldoYaPagados: '0',
    };
    const resFin = calcularFiniquito(tarjetonBase, finParams);
    // Aguinaldo = 13,000 * 3 = 39,000
    // Fondo Ahorro = 10,000 / 30 * 45 = 15,000
    // Total determinable = 54,000.00
    expect(resFin.resultadoEstimado).toBe('$54,000.00 MXN');
  });
});

describe('Aplicabilidad por Perfil Laboral (no extensión automática)', () => {
  const baseInput: TarjetonData = {
    perfilLaboral: PerfilLaboral.CONFIANZA_A,
    concepto002: { rawAmount: '12000', periodicidad: Periodicidad.MENSUAL },
    concepto011: { rawAmount: '3000', periodicidad: Periodicidad.MENSUAL },
  };

  it('no extiende automáticamente Aguinaldo de Base a Confianza A ni Confianza B', () => {
    const resA = calcularAguinaldo(baseInput, defaultAguinaldoParams);
    expect(resA.estadoAplicabilidad).toBe(EstadoAplicabilidad.NO_DETERMINABLE);
    expect(resA.estatusCalculo).toBe(EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA);
    expect(resA.resultadoEstimado).toBeNull();

    const resB = calcularAguinaldo(
      { ...baseInput, perfilLaboral: PerfilLaboral.CONFIANZA_B },
      defaultAguinaldoParams,
    );
    expect(resB.estadoAplicabilidad).toBe(EstadoAplicabilidad.NO_DETERMINABLE);
    expect(resB.estatusCalculo).toBe(EstatusCalculo.PENDIENTE_VALIDACION_NORMATIVA);
  });

  it('marca Sustituto y Temporal como CONDICIONADO en Aguinaldo y NO APLICABLE en Créditos/Jubilación RJP', () => {
    const sustInput: TarjetonData = {
      ...baseInput,
      perfilLaboral: PerfilLaboral.SUSTITUTO,
    };
    const aguiSust = calcularAguinaldo(sustInput, {
      ...defaultAguinaldoParams,
      modoProporcional: ModoProporcionalAguinaldo.DIAS,
      diasLaborados: '90',
    });
    expect(aguiSust.estadoAplicabilidad).toBe(EstadoAplicabilidad.CONDICIONADO);
    expect(aguiSust.estatusCalculo).toBe(EstatusCalculo.COMPLETO);

    const credTemp = calcularCreditos(
      { ...baseInput, perfilLaboral: PerfilLaboral.TEMPORAL },
      { tipoCredito: 'CORTO_PLAZO', descuentosActualesTarjeton: '', montoSolicitado: '' },
    );
    expect(credTemp.estadoAplicabilidad).toBe(EstadoAplicabilidad.NO_APLICABLE);
    expect(credTemp.estatusCalculo).toBe(EstatusCalculo.NO_APLICABLE);

    const jubSust = calcularJubilacion(sustInput, {
      regimen: RegimenJubilacion.DESCONOCIDO,
      aniosServicio: '2',
      edad: '30',
      fechaIngreso: '',
    });
    expect(jubSust.estadoAplicabilidad).toBe(EstadoAplicabilidad.NO_APLICABLE);
    expect(jubSust.estatusCalculo).toBe(EstatusCalculo.NO_APLICABLE);
  });
});
