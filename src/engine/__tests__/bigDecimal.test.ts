import { describe, expect, it } from 'vitest';
import { BigDecimal } from '../bigDecimal';

describe('BigDecimal precision and rounding guards', () => {
  it('avoids IEEE-754 floating point drift on monetary additions and multiplications', () => {
    const a = BigDecimal.of('0.1');
    const b = BigDecimal.of('0.2');
    expect(a.add(b).toExactString()).toBe('0.3');

    const quincenal = BigDecimal.of('4321.37');
    const mensual = quincenal.mul(2);
    expect(mensual.toExactString()).toBe('8642.74');
  });

  it('does not round intermediate division steps before final formatting', () => {
    const monthly = BigDecimal.of('10000');
    const daily = monthly.div(30); // 333.33333333...
    const fortyFiveDays = daily.mul(45); // Exact 15000.00!
    // If rounded early to 333.33 * 45 = 14999.85 (WRONG).
    // With BigDecimal without intermediate rounding: 10000 / 30 * 45 = 15000.00!
    expect(fortyFiveDays.toFixed(2)).toBe('15000.00');
    expect(fortyFiveDays.toCurrencyMXN()).toBe('$15,000.00 MXN');
  });

  it('parses valid currency strings and rejects invalid inputs cleanly', () => {
    expect(BigDecimal.tryParse('$12,450.50')?.toFixed(2)).toBe('12450.50');
    expect(BigDecimal.tryParse('')).toBeNull();
    expect(BigDecimal.tryParse('abc')).toBeNull();
  });
});
