import { describe, it, expect } from 'vitest';
import { findGrossFromNet, calculateProvisions, calculateBonusPot } from './adjustments';
import { calculateINSS, calculateIRRF } from './payroll';

describe('Adjustments Engine (Reverse Calc & Provisions)', () => {
  const date2025 = new Date('2025-01-01T12:00:00Z');

  describe('findGrossFromNet', () => {
    it('should find correct Gross for Net R$ 3000.00 (2025)', () => {
      // Target Net: 3000.
      // Gross approx 3418?
      // INSS(3418) approx 303.
      // Base IR = 3115.
      // Tax approx...

      const gross = findGrossFromNet(3000, 0, date2025);

      // Verify Forward
      const inss = calculateINSS(gross, date2025);
      const irrf = calculateIRRF(gross, inss, 0, date2025);
      const net = gross - inss - irrf;

      expect(net).toBeCloseTo(3000, 1); // Exact within 0.1
    });

    it('should find correct Gross for Net R$ 2700.00 (2025)', () => {
      const gross = findGrossFromNet(2700, 0, date2025);
      // Verify Forward
      const inss = calculateINSS(gross, date2025);
      const irrf = calculateIRRF(gross, inss, 0, date2025);
      const net = gross - inss - irrf;

      expect(net).toBeCloseTo(2700, 1);
    });
  });

  describe('calculateProvisions', () => {
    it('should return correct 1/12 values', () => {
      const gross = 1200; // Easy math
      // Vac = 100
      // 1/3 = 400 / 12 = 33.33
      // 13th = 100
      // Total Base = 233.33
      // Charge 20% = 46.66

      const result = calculateProvisions(gross, date2025);
      expect(result.vacationProvision).toBe(100.0);
      expect(result.thirteenthProvision).toBe(100.0);
      expect(result.oneThirdProvision).toBe(33.33);
      expect(result.chargesOnProvisions).toBe(46.67); // 20% of 233.33 = 46.666
    });
  });

    describe('calculateBonusPot', () => {
      it('should calculate bonus pot correctly', () => {
      // Gross = 1000 (abaixo do salário mínimo, mas ok para teste)
      // INSS Empregado = 75 (7.5%)
      // IRRF = 0 (base muito baixa)

      // Regra do Acordo:
      // 1. FGTS Depósito (8%) = 80 → 100% para o pote
      // 2. Impostos (50% para cada):
      //    - INSS Patr (8%) = 80
      //    - SAT (0.8%) = 8
      //    - INSS Emp = 75
      //    - IRRF Emp = 0
      //    - SplitBase = 80 + 8 + 75 + 0 = 163
      //    - Split (50%) = 81.50

      // Expected Pot = 80 (FGTS 100%) + 81.50 (Split 50%) = 161.50

      const result = calculateBonusPot(1000, 0, date2025);

      // Verificar estrutura do retorno
      expect(result).toHaveProperty('monthlyBonus');
      expect(result).toHaveProperty('breakdown');

      // FGTS depósito deve ser 8% do bruto
      expect(result.breakdown.fgtsDeposit).toBeCloseTo(80, 2);

      // Bônus mensal deve ser FGTS + metade dos impostos economizados
      expect(result.breakdown.splitBase).toBeCloseTo(163, 2);
      expect(result.breakdown.taxSplit).toBeCloseTo(81.5, 2);
      expect(result.monthlyBonus).toBeCloseTo(161.5, 2);
    });

    it('should calculate bonus for R$ 3000 net scenario', () => {
      // Primeiro achar o bruto para líquido 3000
      const gross = findGrossFromNet(3000, 0, date2025);
      // Gross é aproximadamente R$ 3.418

      // Calcular bônus
      const result = calculateBonusPot(gross, 0, date2025);

      // Verificar FGTS depósito (8% do bruto ~3418) = ~273
      expect(result.breakdown.fgtsDeposit).toBeCloseTo(gross * 0.08, 1);

      // Bônus mensal composto de:
      // - FGTS depósito (8%): ~273 (100% pro pote)
      // - Impostos economizados (50%): ~301
      // Total: ~684
      // O valor está correto: FGTS integral + metade dos impostos economizados
      expect(result.monthlyBonus).toBeGreaterThan(500);
      expect(result.monthlyBonus).toBeLessThan(900);

      // Verificar que o breakdown está consistente
      const expectedBonus = result.breakdown.fgtsDeposit + result.breakdown.taxSplit;
      expect(result.monthlyBonus).toBeCloseTo(expectedBonus, 1);
    });
  });
});
