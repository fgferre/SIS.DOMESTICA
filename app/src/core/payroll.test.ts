import { describe, it, expect } from 'vitest';
import {
  calculateINSS,
  calculateIRRF,
  calculateFGTS,
  calculateSalarioFamilia,
  calculateFerias,
  calculate13thSalary,
  getIRRFBreakdown,
} from './payroll';

describe('Payroll Engine', () => {
  const date2025 = new Date('2025-01-01T12:00:00Z');
  const date2026 = new Date('2026-01-01T12:00:00Z');

  describe('INSS Calculation (2025)', () => {
    it('should calculate correct INSS for minimum wage (1518.00)', () => {
      expect(calculateINSS(1518.0, date2025)).toBe(113.85);
    });

    it('should calculate correct INSS for R$ 3000.00', () => {
      expect(calculateINSS(3000.0, date2025)).toBe(253.41);
    });
  });

  describe('IRRF Calculation (May 2023 Rules)', () => {
    it('should apply simplified discount if more beneficial', () => {
      expect(calculateIRRF(3000, 253.41, 0, date2025)).toBe(13.2);
    });
  });

  describe('IRRF Reduction (2026)', () => {
    it('should apply monthly reduction when applicable', () => {
      const b = getIRRFBreakdown(6000, 0, 0, date2026);
      expect(b.taxBeforeReduction).toBeGreaterThan(0);
      expect(b.tax).toBeLessThan(b.taxBeforeReduction);
    });

    it('should reduce tax to zero up to the reduction threshold', () => {
      const b = getIRRFBreakdown(5000, 0, 0, date2026);
      expect(b.tax).toBe(0);
    });
  });

  describe('FGTS Calculation', () => {
    it('should calculate 8% deposit and 3.2% fine', () => {
      const result = calculateFGTS(1000, date2025);
      expect(result.deposit).toBe(80.0);
      expect(result.fine).toBe(32.0);
      expect(result.total).toBe(112.0);
    });
  });

  describe('Salário Família', () => {
    it('should pay quota if under ceiling', () => {
      expect(calculateSalarioFamilia(1000, 2, date2025)).toBe(124.08);
    });

    it('should pay nothing if over ceiling', () => {
      expect(calculateSalarioFamilia(3000, 2, date2025)).toBe(0);
    });
  });

  // --- Phase 4 Tests ---

  describe('Vacation Calculation', () => {
    it('should calculate 30 days vacation with 1/3 bonus', () => {
      // Gross 3000.
      // 30 days = 3000.
      // 1/3 = 1000.
      // Total = 4000.
      const result = calculateFerias(3000, 30, 0, date2025, date2025);
      expect(result.vacationPay).toBe(3000.0);
      expect(result.oneThirdBonus).toBe(1000.0);
      expect(result.totalGross).toBe(4000.0);
    });

    it('should calculate 15 days vacation + 10 days sold', () => {
      // Gross 3000. Daily = 100.
      // 15 days vac = 1500.
      // 10 days sold = 1000.
      // Total Days for 1/3 calc = 25 (User logic: "Sell up to 1/3 of period"? Usually 1/3 of RIGHT).
      // Law: 1/3 applies to the sold days too.
      // 1/3 of (1500+1000) = 2500 / 3 = 833.33.

      const result = calculateFerias(3000, 15, 10, date2025, date2025);
      expect(result.vacationPay).toBe(1500.0);
      expect(result.allowanceVal).toBe(1000.0);
      expect(result.oneThirdBonus).toBe(833.33);
    });

    it('should throw error if days > 30', () => {
      expect(() => calculateFerias(3000, 31, 0, date2025, date2025)).toThrow();
    });
  });

    describe('13th Salary', () => {
      it('should calculate 1st installment (50% Gross)', () => {
        const result = calculate13thSalary(3000, 1, 12, 0, date2025);
        expect(result.gross).toBe(1500.0);
        expect(result.net).toBe(1500.0);
      });

    it('should calculate 2nd installment (Balance - Tax)', () => {
      // Gross 3000.
      // Full 13th = 3000.
      // INSS (on 3000) = 253.41.
      // IRRF (on 3000 - 253.41 = 2746.59) -> Tax = 13.20 (Simplified) ??
      // Wait, simplified deduction 564.80. Base 2435.20. Tax 13.20. (Yes, validated in IRRF test).

      // Total Net 13th = 3000 - 253.41 - 13.20 = 2733.39.
      // Paid 1st Inst = 1500.
      // To Pay = 1233.39.

        const result = calculate13thSalary(3000, 2, 12, 0, date2025, 1500);
        expect(result.inss).toBe(253.41);
        expect(result.irrf).toBe(13.2);
        expect(result.net).toBe(1233.39);
      });
    });
});
