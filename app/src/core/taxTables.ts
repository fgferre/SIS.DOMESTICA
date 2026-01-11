export interface INSSBracket {
  limit: number;
  rate: number;
}

export interface IRRFBracket {
  limit: number;
  rate: number;
  deduction: number;
}

export interface IRRFReductionRule {
  maxBaseZero: number; // até este valor, a redução zera o imposto
  maxReduction: number; // teto da redução
  linearFrom: number; // início da faixa linear
  linearTo: number; // fim da faixa linear
  linearA: number; // A - B*base
  linearB: number; // A - B*base
}

export interface TaxTable {
  validFrom: string; // ISO date "2024-01-01"
  validUntil: string; // ISO date "2024-12-31"
  inss: INSSBracket[];
  irrf: IRRFBracket[];
  inssDependentDeduction: number;
  simplifiedDeduction: number; // Novidade Maio/2023 (R$ 528,00)
  irrfReduction?: IRRFReductionRule; // Redução mensal (2026)
  employerCharges: {
    inssPatronal: number; // 8%
    fgtsDeposit: number; // 8%
    fgtsFine: number; // 3.2%
    sat: number; // 0.8%
  };
  minimumWage: number;
}

export const TAX_TABLES_HISTORY: TaxTable[] = [
  {
    validFrom: '2023-01-01',
    validUntil: '2023-04-30',
    inss: [
      { limit: 1302.0, rate: 0.075 },
      { limit: 2571.29, rate: 0.09 },
      { limit: 3856.94, rate: 0.12 },
      { limit: 7507.49, rate: 0.14 },
    ],
    irrf: [
      { limit: 1903.98, rate: 0, deduction: 0 },
      { limit: 2826.65, rate: 0.075, deduction: 142.8 },
      { limit: 3751.05, rate: 0.15, deduction: 354.8 },
      { limit: 4664.68, rate: 0.225, deduction: 636.13 },
      { limit: Infinity, rate: 0.275, deduction: 869.36 },
    ],
    inssDependentDeduction: 189.59,
    simplifiedDeduction: 0,
    employerCharges: {
      inssPatronal: 0.08,
      fgtsDeposit: 0.08,
      fgtsFine: 0.032,
      sat: 0.008,
    },
    minimumWage: 1302.0,
  },
  {
    validFrom: '2023-05-01',
    validUntil: '2023-12-31',
    inss: [
      { limit: 1302.0, rate: 0.075 },
      { limit: 2571.29, rate: 0.09 },
      { limit: 3856.94, rate: 0.12 },
      { limit: 7507.49, rate: 0.14 },
    ],
    irrf: [
      { limit: 2112.0, rate: 0, deduction: 0 },
      { limit: 2826.65, rate: 0.075, deduction: 158.4 },
      { limit: 3751.05, rate: 0.15, deduction: 370.4 },
      { limit: 4664.68, rate: 0.225, deduction: 651.73 },
      { limit: Infinity, rate: 0.275, deduction: 884.96 },
    ],
    inssDependentDeduction: 189.59,
    simplifiedDeduction: 528.0,
    employerCharges: {
      inssPatronal: 0.08,
      fgtsDeposit: 0.08,
      fgtsFine: 0.032,
      sat: 0.008,
    },
    minimumWage: 1302.0,
  },
  {
    validFrom: '2024-01-01',
    validUntil: '2024-01-31',
    inss: [
      { limit: 1412.0, rate: 0.075 },
      { limit: 2666.68, rate: 0.09 },
      { limit: 4000.03, rate: 0.12 },
      { limit: 7786.02, rate: 0.14 },
    ],
    irrf: [
      { limit: 2112.0, rate: 0, deduction: 0 },
      { limit: 2826.65, rate: 0.075, deduction: 158.4 },
      { limit: 3751.05, rate: 0.15, deduction: 370.4 },
      { limit: 4664.68, rate: 0.225, deduction: 651.73 },
      { limit: Infinity, rate: 0.275, deduction: 884.96 },
    ],
    inssDependentDeduction: 189.59,
    simplifiedDeduction: 528.0,
    employerCharges: {
      inssPatronal: 0.08,
      fgtsDeposit: 0.08,
      fgtsFine: 0.032,
      sat: 0.008,
    },
    minimumWage: 1412.0,
  },
  {
    validFrom: '2024-02-01',
    validUntil: '2024-12-31',
    inss: [
      { limit: 1412.0, rate: 0.075 },
      { limit: 2666.68, rate: 0.09 },
      { limit: 4000.03, rate: 0.12 },
      { limit: 7786.02, rate: 0.14 },
    ],
    irrf: [
      { limit: 2259.2, rate: 0, deduction: 0 },
      { limit: 2826.65, rate: 0.075, deduction: 169.44 },
      { limit: 3751.05, rate: 0.15, deduction: 381.44 },
      { limit: 4664.68, rate: 0.225, deduction: 662.77 },
      { limit: Infinity, rate: 0.275, deduction: 896.0 },
    ],
    inssDependentDeduction: 189.59,
    simplifiedDeduction: 564.8,
    employerCharges: {
      inssPatronal: 0.08,
      fgtsDeposit: 0.08,
      fgtsFine: 0.032,
      sat: 0.008,
    },
    minimumWage: 1412.0,
  },
  {
    validFrom: '2025-01-01',
    validUntil: '2025-04-30',
    inss: [
      { limit: 1518.0, rate: 0.075 },
      { limit: 2793.88, rate: 0.09 },
      { limit: 4190.83, rate: 0.12 },
      { limit: 8157.41, rate: 0.14 },
    ],
    irrf: [
      { limit: 2259.2, rate: 0, deduction: 0 },
      { limit: 2826.65, rate: 0.075, deduction: 169.44 },
      { limit: 3751.05, rate: 0.15, deduction: 381.44 },
      { limit: 4664.68, rate: 0.225, deduction: 662.77 },
      { limit: Infinity, rate: 0.275, deduction: 896.0 },
    ],
    inssDependentDeduction: 189.59,
    simplifiedDeduction: 564.8,
    employerCharges: {
      inssPatronal: 0.08,
      fgtsDeposit: 0.08,
      fgtsFine: 0.032,
      sat: 0.008,
    },
    minimumWage: 1518.0,
  },
  {
    validFrom: '2025-05-01',
    validUntil: '2025-12-31',
    inss: [
      { limit: 1518.0, rate: 0.075 },
      { limit: 2793.88, rate: 0.09 },
      { limit: 4190.83, rate: 0.12 },
      { limit: 8157.41, rate: 0.14 },
    ],
    irrf: [
      { limit: 2428.8, rate: 0, deduction: 0 },
      { limit: 2826.65, rate: 0.075, deduction: 182.16 },
      { limit: 3751.05, rate: 0.15, deduction: 394.16 },
      { limit: 4664.68, rate: 0.225, deduction: 675.49 },
      { limit: Infinity, rate: 0.275, deduction: 908.73 },
    ],
    inssDependentDeduction: 189.59,
    simplifiedDeduction: 607.2,
    employerCharges: {
      inssPatronal: 0.08,
      fgtsDeposit: 0.08,
      fgtsFine: 0.032,
      sat: 0.008,
    },
    minimumWage: 1518.0,
  },
  {
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    inss: [
      { limit: 1518.0, rate: 0.075 },
      { limit: 2793.88, rate: 0.09 },
      { limit: 4190.83, rate: 0.12 },
      { limit: 8157.41, rate: 0.14 },
    ],
    irrf: [
      { limit: 2428.8, rate: 0, deduction: 0 },
      { limit: 2826.65, rate: 0.075, deduction: 182.16 },
      { limit: 3751.05, rate: 0.15, deduction: 394.16 },
      { limit: 4664.68, rate: 0.225, deduction: 675.49 },
      { limit: Infinity, rate: 0.275, deduction: 908.73 },
    ],
    inssDependentDeduction: 189.59,
    simplifiedDeduction: 607.2,
    irrfReduction: {
      maxBaseZero: 5000,
      maxReduction: 312.89,
      linearFrom: 5000.01,
      linearTo: 7350,
      linearA: 978.62,
      linearB: 0.133145,
    },
    employerCharges: {
      inssPatronal: 0.08,
      fgtsDeposit: 0.08,
      fgtsFine: 0.032,
      sat: 0.008,
    },
    minimumWage: 1518.0,
  },
];

export function getTaxTableForDate(date: Date): TaxTable {
  // Use local calendar date to avoid timezone shifts affecting table selection.
  const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

  // Tentar encontrar tabela exata para a data
  const exactTable = TAX_TABLES_HISTORY.find(
    t => isoDate >= t.validFrom && isoDate <= t.validUntil
  );

  if (exactTable) {
    return exactTable;
  }

  // Fallback: usar a última tabela disponível para datas futuras
  const sortedTables = [...TAX_TABLES_HISTORY].sort((a, b) =>
    b.validFrom.localeCompare(a.validFrom)
  );
  const latestTable = sortedTables[0];

  if (latestTable && isoDate > latestTable.validUntil) {
    console.warn(
      `[taxTables] Usando tabela de ${latestTable.validFrom} como fallback para ${isoDate}. ` +
        `Atualize as tabelas de impostos quando disponíveis.`
    );
    return latestTable;
  }

  // Fallback para datas muito antigas: usar a primeira tabela
  const oldestTable = sortedTables[sortedTables.length - 1];
  if (oldestTable && isoDate < oldestTable.validFrom) {
    console.warn(
      `[taxTables] Usando tabela de ${oldestTable.validFrom} como fallback para ${isoDate}.`
    );
    return oldestTable;
  }

  throw new Error(`Não foi possível encontrar tabela de impostos para ${isoDate}`);
}
