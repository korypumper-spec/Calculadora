export enum PerfilLaboral {
  BASE = 'BASE',
  SUSTITUTO = 'SUSTITUTO',
  TEMPORAL = 'TEMPORAL',
  CONFIANZA_A = 'CONFIANZA_A',
  CONFIANZA_B = 'CONFIANZA_B',
}

export enum EstadoAplicabilidad {
  APLICABLE = 'APLICABLE',
  CONDICIONADO = 'CONDICIONADO',
  NO_APLICABLE = 'NO_APLICABLE',
  NO_DETERMINABLE = 'NO_DETERMINABLE',
}

export enum Periodicidad {
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
}

export enum TipoPrestacion {
  AGUINALDO = 'AGUINALDO',
  VACACIONES = 'VACACIONES',
  PRIMA_VACACIONAL = 'PRIMA_VACACIONAL',
  FONDO_AHORRO = 'FONDO_AHORRO',
  CREDITOS = 'CREDITOS',
  JUBILACION = 'JUBILACION',
  FINIQUITO = 'FINIQUITO',
}

export enum EstatusCalculo {
  COMPLETO = 'COMPLETO',
  INCOMPLETO = 'INCOMPLETO',
  PENDIENTE_VALIDACION_NORMATIVA = 'PENDIENTE_VALIDACION_NORMATIVA',
  NO_APLICABLE = 'NO_APLICABLE',
}

export enum ModoProporcionalAguinaldo {
  ANIO_COMPLETO = 'ANIO_COMPLETO',
  MESES = 'MESES',
  DIAS = 'DIAS',
}

export enum RegimenJubilacion {
  RJP_TRADICIONAL = 'RJP_TRADICIONAL',
  CUENTAS_INDIVIDUALES_2008 = 'CUENTAS_INDIVIDUALES_2008',
  DESCONOCIDO = 'DESCONOCIDO',
}

export enum CausalFiniquito {
  RENUNCIA_VOLUNTARIA = 'RENUNCIA_VOLUNTARIA',
  TERMINO_CONTRATO = 'TERMINO_CONTRATO',
  DESPIDO_INJUSTIFICADO = 'DESPIDO_INJUSTIFICADO',
  NO_ESPECIFICADA = 'NO_ESPECIFICADA',
}

export interface ConceptoTarjetonInput {
  rawAmount: string;
  periodicidad: Periodicidad;
}

export interface TarjetonData {
  perfilLaboral: PerfilLaboral;
  concepto002: ConceptoTarjetonInput;
  concepto011: ConceptoTarjetonInput;
}

export interface AguinaldoParams {
  anio: string;
  modoProporcional: ModoProporcionalAguinaldo;
  mesesLaborados: string;
  diasLaborados: string;
  diasIncidenciaSinGoce: string;
  justificacionIncidencia: string;
  anticipoEneroPagado: boolean;
  anticipoEneroMonto: string;
  anticipoAgostoSolicitado: boolean;
  anticipoAgostoMonto: string;
}

export interface VacacionesParams {
  anio: string;
  aniosAntiguedad: string;
  diasAdicionalesVerificados: string;
  periodoSolicitado: 'ANUAL_COMPLETO' | 'PRIMER_PERIODO' | 'SEGUNDO_PERIODO';
}

export interface PrimaVacacionalParams {
  anio: string;
  aniosAntiguedad: string;
  diasVacacionesBase: string;
  periodo: 'ANUAL' | 'SEMESTRAL';
}

export interface FondoAhorroParams {
  ciclo: string;
  diasLaboradosCiclo: string;
  anticipoOProrrateoPrevio: string;
}

export interface CreditosParams {
  tipoCredito: 'CORTO_PLAZO' | 'MEDIANO_PLAZO' | 'HIPOTECARIO';
  descuentosActualesTarjeton: string;
  montoSolicitado: string;
}

export interface JubilacionParams {
  regimen: RegimenJubilacion;
  aniosServicio: string;
  edad: string;
  fechaIngreso: string;
}

export interface FiniquitoParams {
  causal: CausalFiniquito;
  aniosAntiguedad: string;
  diasAguinaldoPendientes: string;
  diasFondoAhorroPendientes: string;
  diasVacacionesPendientes: string;
  anticiposAguinaldoYaPagados: string;
}

export interface PasoFormula {
  orden: number;
  descripcion: string;
  expresion: string;
  resultado: string;
}

export interface ConceptoNormalizadoDetalle {
  codigo: '002' | '011';
  nombre: string;
  capturado: boolean;
  importeOriginal: string | null;
  periodicidadOriginal: Periodicidad;
  equivalenteMensual: string | null;
  esValido: boolean;
  errorValidacion: string | null;
}

export interface AnticipoDetalle {
  concepto: string;
  monto: string;
  observacion: string;
}

export interface PartidaDesglose {
  concepto: string;
  clausula: string;
  baseAplicada: string;
  montoEstimado: string | null;
  estado: 'CALCULADO' | 'PENDIENTE_VALIDACION';
  nota: string;
}

export interface DesgloseObligatorio {
  tipoPrestacion: TipoPrestacion;
  tituloPrestacion: string;
  perfilLaboral: PerfilLaboral;
  perfilLaboralLabel: string;
  periodoCalculado: string;
  concepto002Capturado: ConceptoNormalizadoDetalle;
  concepto011Capturado: ConceptoNormalizadoDetalle;
  periodicidadResumen: string;
  baseNormativaAplicada: string;
  baseSalarialMonto: string | null;
  clausulaUtilizada: string;
  formulaPasoAPaso: PasoFormula[];
  diasOMesesConsiderados: string;
  anticiposOPagosPrevios: AnticipoDetalle[];
  totalAnticiposDescontados: string;
  resultadoEstimado: string | null;
  partidasAdicionales?: PartidaDesglose[];
  estatusCalculo: EstatusCalculo;
  mensajeEstatus: string;
  estadoAplicabilidad: EstadoAplicabilidad;
  fundamentoAplicabilidad: string;
  advertencias: string[];
  supuestos: string[];
  datosFaltantes: string[];
}
