import { calculateINSS, calculateIRRF } from './payroll';
import { getTaxTableForDate } from './taxTables';

/**
 * Calculates monthly provisions (1/12 of Vacation, 1/3 Vacation, 13th Salary)
 * and the employer charges on these provisions.
 */
export function calculateProvisions(grossSalary: number, date: Date) {
  // 1. Vacation Provision (1/12)
  const vacationProvision = grossSalary / 12;

  // 2. One-Third Vacation Provision (1/12 of 1/3)
  const oneThirdProvision = grossSalary / 3 / 12;

  // 3. 13th Salary Provision (1/12)
  const thirteenthProvision = grossSalary / 12;

  // Total Base for Charges
  const totalBase = vacationProvision + oneThirdProvision + thirteenthProvision;

  // 4. Employer Charges on Provisions (20% approx: 8% INSS + 8% FGTS + 3.2% Multa + 0.8% SAT)
  // Actually, let's use the exact rates from the table to be precise.
  const table = getTaxTableForDate(date);
  const rate =
    table.employerCharges.inssPatronal +
    table.employerCharges.fgtsDeposit +
    table.employerCharges.fgtsFine +
    table.employerCharges.sat;

  const chargesOnProvisions = totalBase * rate;

  return {
    vacationProvision: Number(vacationProvision.toFixed(2)),
    oneThirdProvision: Number(oneThirdProvision.toFixed(2)),
    thirteenthProvision: Number(thirteenthProvision.toFixed(2)),
    chargesOnProvisions: Number(chargesOnProvisions.toFixed(2)),
    total: Number((totalBase + chargesOnProvisions).toFixed(2)),
  };
}

/**
 * Finds the Gross Salary required to reach a specific Target Net Salary.
 * Uses Binary Search for performance and precision.
 */
export function findGrossFromNet(targetNet: number, dependents: number, date: Date): number {
  if (!Number.isFinite(targetNet) || targetNet <= 0) return 0;

  let low = targetNet;
  let high = targetNet * 2.5; // Heuristic upper bound
  let gross = 0;
  let attempts = 0;

  // Aproximação por busca binária (com arredondamento em centavos)
  while (attempts < 60) {
    // Max iterations to prevent infinite loop
    gross = (low + high) / 2;
    gross = Number(gross.toFixed(2)); // Round to 2 decimals at each step to simulate real world

    // Calculate Forward
    const inss = calculateINSS(gross, date);
    const irrf = calculateIRRF(gross, inss, dependents, date);
    const net = gross - inss - irrf;

    if (net < targetNet) {
      low = gross;
    } else {
      high = gross;
    }
    attempts++;
  }

  // Ajuste fino: varre alguns centavos ao redor para achar o melhor encaixe (evita -0,01 etc).
  const targetCents = Math.round(targetNet * 100);
  let bestGross = gross;
  let bestDiff = Number.POSITIVE_INFINITY;
  let bestIsBelow = false;

  const start = Math.max(0, gross - 2);
  const end = gross + 2;

  for (let g = start; g <= end + 1e-9; g = Number((g + 0.01).toFixed(2))) {
    const inss = calculateINSS(g, date);
    const irrf = calculateIRRF(g, inss, dependents, date);
    const net = g - inss - irrf;
    const netCents = Math.round(net * 100);
    const diffCents = Math.abs(netCents - targetCents);
    const isBelow = netCents < targetCents;

    if (
      diffCents < bestDiff ||
      (diffCents === bestDiff && bestIsBelow && !isBelow) // prefer não ficar abaixo do alvo
    ) {
      bestDiff = diffCents;
      bestGross = g;
      bestIsBelow = isBelow;
      if (bestDiff === 0 && !bestIsBelow) break;
    }
  }

  return bestGross;
}

/**
 * Calculates the "Bonus Pot" based on the Agreement Rules.
 *
 * REGRA DO ACORDO (CONFIRMADA):
 * - FGTS Depósito (8%) → 100% para o pote dela (dinheiro dela)
 * - FGTS Multa legal (3.2%) é apenas referência do DAE; NÃO é provisionada no pote
 * - Economia de Impostos → 50% para cada lado (empregador/empregado)
 *   - INSS Patronal (8%)
 *   - SAT (0.8%)
 *   - INSS Empregado (progressivo)
 *   - IRRF Empregado (com desconto simplificado)
 *
 * IMPORTANTE:
 * - Provisões não entram no split (não são impostos economizados; são dinheiro dela no futuro).
 * - O pote acumula mensalmente e é pago conforme regra (ex: 01/jul e 31/dez).
 *
 * @param grossSalary - Salário bruto calculado
 * @param dependents - Número de dependentes para cálculo do IRRF
 * @param date - Data de referência para buscar tabela de impostos
 * @returns Valor do bônus mensal para o pote da empregada
 */
export function calculateBonusPot(
  grossSalary: number,
  dependents: number,
  date: Date
): { monthlyBonus: number; breakdown: BonusBreakdown } {
  const table = getTaxTableForDate(date);

  // 1. FGTS depósito (8%) - 100% para o pote
  const fgtsDeposit = grossSalary * table.employerCharges.fgtsDeposit; // 8%

  // FGTS multa legal (3.2%) - referência DAE (não entra no pote)
  const fgtsFineRef = grossSalary * table.employerCharges.fgtsFine; // 3.2%

  // 2. Impostos Patronais sobre Salário
  const inssPatronal = grossSalary * table.employerCharges.inssPatronal; // 8%
  const sat = grossSalary * table.employerCharges.sat; // 0.8%

  // 3. Impostos do Empregado sobre Salário (retidos)
  const inssEmployee = calculateINSS(grossSalary, date);
  const irrfEmployee = calculateIRRF(grossSalary, inssEmployee, dependents, date);

  // 4. Provisões (Férias + 1/3 + 13º + encargos sobre provisões) - NÃO entram no split
  const provisions = calculateProvisions(grossSalary, date);
  const provisionsTotal = provisions.total;

  // Cálculo do Bônus: FGTS (100%) + impostos economizados (50%)
  const splitBase = inssPatronal + sat + inssEmployee + irrfEmployee;
  const taxSplit = splitBase / 2;

  const monthlyBonus = fgtsDeposit + taxSplit;

  const breakdown: BonusBreakdown = {
    fgtsDeposit: Number(fgtsDeposit.toFixed(2)),
    fgtsFineRef: Number(fgtsFineRef.toFixed(2)),
    inssPatronal: Number(inssPatronal.toFixed(2)),
    sat: Number(sat.toFixed(2)),
    inssEmployee: Number(inssEmployee.toFixed(2)),
    irrfEmployee: Number(irrfEmployee.toFixed(2)),
    provisionsTotal: Number(provisionsTotal.toFixed(2)),
    splitBase: Number(splitBase.toFixed(2)),
    taxSplit: Number(taxSplit.toFixed(2)),
    monthlyBonus: Number(monthlyBonus.toFixed(2)),
  };

  return { monthlyBonus: Number(monthlyBonus.toFixed(2)), breakdown };
}

/**
 * Interface para detalhamento do cálculo do bônus
 */
export interface BonusBreakdown {
  fgtsDeposit: number; // 8%
  fgtsFineRef: number; // 3.2% (referência DAE; não entra no pote)
  inssPatronal: number; // 8%
  sat: number; // 0.8%
  inssEmployee: number; // Progressivo
  irrfEmployee: number; // Com desconto simplificado
  provisionsTotal: number; // Férias + 1/3 + 13º + encargos
  splitBase: number; // Impostos correntes (sem FGTS e sem provisões)
  taxSplit: number; // 50% da base do split (impostos economizados)
  monthlyBonus: number; // FGTS depósito + taxSplit
}
