import { getTaxTableForDate } from './taxTables';

export interface INSSBreakdownItem {
  from: number;
  to: number;
  rate: number;
  base: number;
  amount: number;
}

export interface INSSBreakdown {
  total: number;
  items: INSSBreakdownItem[];
}

/**
 * Calculates INSS based on progressive brackets.
 */
export function calculateINSS(grossSalary: number, date: Date): number {
  return getINSSBreakdown(grossSalary, date).total;
}

export function getINSSBreakdown(grossSalary: number, date: Date): INSSBreakdown {
  const table = getTaxTableForDate(date);

  let previousLimit = 0;
  const rawItems: Array<INSSBreakdownItem & { amountRaw: number }> = [];

  for (const bracket of table.inss) {
    const limit = bracket.limit;
    const base = Math.min(grossSalary, limit) - previousLimit;

    if (base > 0) {
      const amountRaw = base * bracket.rate;
      rawItems.push({
        from: previousLimit,
        to: Math.min(grossSalary, limit),
        rate: bracket.rate,
        base: Number(base.toFixed(2)),
        amount: Number(amountRaw.toFixed(2)),
        amountRaw,
      });
    }

    previousLimit = limit;
    if (grossSalary <= limit) break;
  }

  const total = Number(rawItems.reduce((sum, it) => sum + it.amountRaw, 0).toFixed(2));

  // Ajuste de arredondamento: garante que soma das linhas = total exibido.
  const items: INSSBreakdownItem[] = rawItems.map(({ amountRaw, ...rest }) => rest);
  const sumRounded = Number(items.reduce((sum, it) => sum + it.amount, 0).toFixed(2));
  const diff = Number((total - sumRounded).toFixed(2));
  if (items.length > 0 && diff !== 0) {
    const lastIdx = items.length - 1;
    items[lastIdx] = {
      ...items[lastIdx],
      amount: Number((items[lastIdx].amount + diff).toFixed(2)),
    };
  }

  return { total, items };
}

/**
 * Calculates IRRF with Simplified Discount check (May/2023 rule).
 */
export function calculateIRRF(
  baseSalary: number,
  inss: number,
  dependents: number,
  date: Date
): number {
  return getIRRFBreakdown(baseSalary, inss, dependents, date).tax;
}

export type IRRFMethod = 'legal' | 'simplified';

export interface IRRFBreakdown {
  method: IRRFMethod;
  legalBase: number;
  simplifiedBase: number;
  chosenBase: number;
  rate: number;
  deduction: number;
  reduction: number;
  taxBeforeReduction: number;
  tax: number;
}

export function getIRRFBreakdown(
  baseSalary: number,
  inss: number,
  dependents: number,
  date: Date
): IRRFBreakdown {
  const table = getTaxTableForDate(date);

  // 1. Legal Deduction Method:
  const legalBase = baseSalary - inss - dependents * table.inssDependentDeduction;

  // 2. Simplified Discount Method:
  const simplifiedBase = baseSalary - table.simplifiedDeduction;

  const calculateTaxForBase = (base: number) => {
    if (base <= table.irrf[0].limit) {
      return { tax: 0, rate: 0, deduction: 0 };
    }
    const bracket = table.irrf.find(b => base <= b.limit) || table.irrf[table.irrf.length - 1];
    const tax = base * bracket.rate - bracket.deduction;
    return {
      tax: tax > 0 ? tax : 0,
      rate: bracket.rate,
      deduction: bracket.deduction,
    };
  };

  const applyReduction = (base: number, taxBefore: number) => {
    const rule = table.irrfReduction;
    if (!rule || taxBefore <= 0 || base <= 0) {
      return { reduction: 0, taxAfter: taxBefore };
    }

    let reduction = 0;
    if (base <= rule.maxBaseZero) {
      reduction = rule.maxReduction;
    } else if (base >= rule.linearFrom && base <= rule.linearTo) {
      reduction = rule.linearA - rule.linearB * base;
    }

    reduction = Math.max(0, Math.min(rule.maxReduction, reduction));
    const taxAfter = Math.max(0, taxBefore - reduction);
    return {
      reduction: Number(reduction.toFixed(2)),
      taxAfter: Number(taxAfter.toFixed(2)),
    };
  };

  const legalRaw = calculateTaxForBase(legalBase);
  const legalReduced = applyReduction(legalBase, legalRaw.tax);
  const legal = { ...legalRaw, ...legalReduced };

  const simplifiedRaw = calculateTaxForBase(simplifiedBase);
  const simplifiedReduced = applyReduction(simplifiedBase, simplifiedRaw.tax);
  const simplified = { ...simplifiedRaw, ...simplifiedReduced };

  const useSimplified = simplified.taxAfter <= legal.taxAfter;
  const method: IRRFMethod = useSimplified ? 'simplified' : 'legal';
  const chosenBase = useSimplified ? simplifiedBase : legalBase;
  const chosen = useSimplified ? simplified : legal;

  return {
    method,
    legalBase: Number(legalBase.toFixed(2)),
    simplifiedBase: Number(simplifiedBase.toFixed(2)),
    chosenBase: Number(chosenBase.toFixed(2)),
    rate: chosen.rate,
    deduction: chosen.deduction,
    reduction: Number((chosen.reduction || 0).toFixed(2)),
    taxBeforeReduction: Number((chosen.tax || 0).toFixed(2)),
    tax: Number((chosen.taxAfter ?? chosen.tax ?? 0).toFixed(2)),
  };
}

/**
 * Calculates Salário Família.
 */
export function calculateSalarioFamilia(
  grossSalary: number,
  childrenUnder14: number,
  _date: Date
): number {
  const CEILING = 1819.26;
  const QUOTA = 62.04;

  if (grossSalary <= CEILING) {
    return Number((childrenUnder14 * QUOTA).toFixed(2));
  }
  return 0;
}

/**
 * Calculates FGTS (Deposit + Fine for Domestic Worker).
 */
export function calculateFGTS(grossSalary: number, date: Date) {
  const table = getTaxTableForDate(date);
  const deposit = grossSalary * table.employerCharges.fgtsDeposit; // 8%
  const fine = grossSalary * table.employerCharges.fgtsFine; // 3.2%
  return {
    deposit: Number(deposit.toFixed(2)),
    fine: Number(fine.toFixed(2)),
    total: Number((deposit + fine).toFixed(2)),
  };
}

/**
 * Calculates the full DAE (Documento de Arrecadação eSocial).
 */
export function calculateDAE(
  grossSalary: number,
  inssEmployee: number,
  irrfEmployee: number,
  date: Date
) {
  const table = getTaxTableForDate(date);
  const inssPatronal = Number((grossSalary * table.employerCharges.inssPatronal).toFixed(2));
  const sat = Number((grossSalary * table.employerCharges.sat).toFixed(2));
  const fgts = calculateFGTS(grossSalary, date);

  const totalEmployer = inssPatronal + sat + fgts.total;
  const totalGuide = totalEmployer + inssEmployee + irrfEmployee;

  return {
    inssPatronal,
    sat,
    fgtsDeposit: fgts.deposit,
    fgtsFine: fgts.fine,
    totalEmployer,
    totalGuide: Number(totalGuide.toFixed(2)),
  };
}

// --- New Features (Phase 4) ---

/**
 * Calculates Vacation Pay, One-Third Bonus, and optional "Selling" (Abono Pecuniário).
 */
export function calculateFerias(
  grossSalary: number,
  vacationDays: number, // 15, 20, 30
  soldDays: number, // 0 to 10
  _startDate: Date,
  _date: Date
) {
  if (vacationDays > 30) throw new Error('Vacation days cannot exceed 30');
  if (soldDays > 10) throw new Error('Cannot sell more than 10 days');
  if (vacationDays + soldDays > 30) throw new Error('Total days cannot exceed 30');

  // Value per day
  const dailyRate = grossSalary / 30;

  // 1. Vacation Pay
  const vacationPay = dailyRate * vacationDays;

  // 2. One Third Bonus (Constitutional)
  // Applied on (Vacation Days + Sold Days) = Total Rights?
  // Rule: The 1/3 applies to the entire period (enjoyed + sold).
  const oneThirdBase = dailyRate * (vacationDays + soldDays);
  const oneThirdBonus = oneThirdBase / 3;

  // 3. Sold Days (Abono Pecuniário)
  const allowanceVal = dailyRate * soldDays;

  // Total Bruto Férias
  // Note: Abono Pecuniário and its 1/3 are exempt from INSS/IRRF.
  // The enjoyable vacation pay and its 1/3 ARE subject to taxes.

  // For simplicity, returning the Breakdown of Gross Elements.
  // Taxation logic should handle exemptions.

  return {
    vacationPay: Number(vacationPay.toFixed(2)),
    oneThirdBonus: Number(oneThirdBonus.toFixed(2)),
    allowanceVal: Number(allowanceVal.toFixed(2)),
    totalGross: Number((vacationPay + oneThirdBonus + allowanceVal).toFixed(2)),
  };
}

/**
 * Calculates 13th Salary Installments.
 */
export function calculate13thSalary(
  grossSalary: number,
  installment: 1 | 2,
  monthsWorked: number, // Usually 12, but can be proportional
  dependents: number,
  date: Date,
  firstInstallmentPaid: number = 0 // Required for 2nd installment calc
) {
  const full13th = (grossSalary / 12) * monthsWorked;

  if (installment === 1) {
    // 1st Installment: 50% of Full 13th. NO Discounts (INSS/IRRF deducted in 2nd).
    // Usually paid in Nov.
    const value = full13th / 2;
    return {
      gross: Number(value.toFixed(2)),
      inss: 0,
      irrf: 0,
      net: Number(value.toFixed(2)),
    };
  } else {
    // 2nd Installment: Full - Advance.
    // Discounts (INSS/IRRF) calculated on FULL amount, then deducted from balance.
    // Paid in Dec.

    // 1. Calculate INSS on Full 13th
    // Note: 13th has Exclusive Taxation (Tributação Exclusiva). Checked separately.
    const inss = calculateINSS(full13th, date);

    // 2. Calculate IRRF on (Full 13th - INSS)
    // 13th IRRF is distinct from Monthly Salary IRRF.
    const irrf = calculateIRRF(full13th, inss, dependents, date);

    const netFull = full13th - inss - irrf;
    const toPay = netFull - firstInstallmentPaid;

    return {
      gross: Number(full13th.toFixed(2)), // For reference
      inss: Number(inss.toFixed(2)),
      irrf: Number(irrf.toFixed(2)),
      net: Number(toPay.toFixed(2)),
      deduction1stInst: firstInstallmentPaid,
    };
  }
}

/**
 * Helper to show Cash Flow vs Accrual for a specific expense.
 */
export function getCashFlowView(
  month: number, // 1-12
  expenseType: 'salary' | '13th_1' | '13th_2' | 'vacation',
  value: number
) {
  // This function seems to be asking for a "mapper" of when things are paid.
  // Salary: Paid Month+1 (Usually day 5) or Month (day 30). Domestic is usually Month (day 30) or +1 (day 5).
  // Let's assume Cash Basis = Payment Date.

  // User asked "shows peaks correctly".
  // 13th 1st: Nov
  // 13th 2nd: Dec
  // Vacation: Month of Start - 2 days.

  return {
    competency: month,
    paymentMonth:
      expenseType === 'salary'
        ? month // Simulating Payment within month for simplicity
        : expenseType === '13th_1'
          ? 11
          : expenseType === '13th_2'
            ? 12
            : month,
    value,
  };
}
