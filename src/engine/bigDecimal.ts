import Decimal from 'decimal.js';

// Configure global precision for exact intermediate financial calculations.
// Never round in intermediate steps; rounding happens only when explicitly requested for final display.
Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
});

export class BigDecimal {
  private readonly inner: Decimal;

  private constructor(value: Decimal) {
    this.inner = value;
  }

  static of(value: string | number | BigDecimal | Decimal): BigDecimal {
    if (value instanceof BigDecimal) {
      return value;
    }
    if (value instanceof Decimal) {
      return new BigDecimal(value);
    }
    if (typeof value === 'string') {
      const cleaned = value.trim().replace(/,/g, '');
      return new BigDecimal(new Decimal(cleaned));
    }
    return new BigDecimal(new Decimal(value));
  }

  static zero(): BigDecimal {
    return new BigDecimal(new Decimal(0));
  }

  static tryParse(raw: string): BigDecimal | null {
    const trimmed = raw.trim().replace(/[$,\s]/g, '');
    if (!trimmed) {
      return null;
    }
    // Reject anything that isn't a valid decimal number
    if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return null;
    }
    try {
      const dec = new Decimal(trimmed);
      if (!dec.isFinite()) {
        return null;
      }
      return new BigDecimal(dec);
    } catch {
      return null;
    }
  }

  add(other: BigDecimal | string | number): BigDecimal {
    return new BigDecimal(this.inner.plus(BigDecimal.of(other).inner));
  }

  sub(other: BigDecimal | string | number): BigDecimal {
    return new BigDecimal(this.inner.minus(BigDecimal.of(other).inner));
  }

  mul(other: BigDecimal | string | number): BigDecimal {
    return new BigDecimal(this.inner.times(BigDecimal.of(other).inner));
  }

  div(other: BigDecimal | string | number): BigDecimal {
    const divisor = BigDecimal.of(other);
    if (divisor.isZero()) {
      throw new Error('División entre cero en BigDecimal');
    }
    return new BigDecimal(this.inner.dividedBy(divisor.inner));
  }

  max(other: BigDecimal | string | number): BigDecimal {
    const rhs = BigDecimal.of(other);
    return this.inner.gte(rhs.inner) ? this : rhs;
  }

  min(other: BigDecimal | string | number): BigDecimal {
    const rhs = BigDecimal.of(other);
    return this.inner.lte(rhs.inner) ? this : rhs;
  }

  round(decimalPlaces = 2): BigDecimal {
    return new BigDecimal(
      this.inner.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP),
    );
  }

  isZero(): boolean {
    return this.inner.isZero();
  }

  isNegative(): boolean {
    return this.inner.isNegative() && !this.inner.isZero();
  }

  isPositive(): boolean {
    return this.inner.isPositive() && !this.inner.isZero();
  }

  gt(other: BigDecimal | string | number): boolean {
    return this.inner.gt(BigDecimal.of(other).inner);
  }

  gte(other: BigDecimal | string | number): boolean {
    return this.inner.gte(BigDecimal.of(other).inner);
  }

  lt(other: BigDecimal | string | number): boolean {
    return this.inner.lt(BigDecimal.of(other).inner);
  }

  lte(other: BigDecimal | string | number): boolean {
    return this.inner.lte(BigDecimal.of(other).inner);
  }

  eq(other: BigDecimal | string | number): boolean {
    return this.inner.eq(BigDecimal.of(other).inner);
  }

  toFixed(decimalPlaces = 2): string {
    return this.inner.toFixed(decimalPlaces, Decimal.ROUND_HALF_UP);
  }

  toExactString(): string {
    return this.inner.toString();
  }

  toCurrencyMXN(): string {
    const rounded = this.round(2);
    const isNeg = rounded.isNegative();
    const absStr = (isNeg ? rounded.mul(-1) : rounded).toFixed(2);
    const [intPart, decPart] = absStr.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${isNeg ? '-' : ''}$${withCommas}.${decPart} MXN`;
  }
}
