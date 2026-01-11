export type MonthStatus = 'pending' | 'paid' | 'partial';

export type ViewMode = 'caixa' | 'competencia';

import { Variation } from './adjustments';
import { BonusBreakdown } from '@/core/adjustments';

export type TerminationType = 'employer' | 'employee';

export type PaymentMethod = 'pix' | 'transfer' | 'cash' | 'other';

export type PaymentKind =
  | 'salary'
  | 'thirteenth_1'
  | 'thirteenth_2'
  | 'bonus'
  | 'termination_fine'
  | 'termination_entitlements';

export interface PaymentRecord {
  id: string;
  kind: PaymentKind;
  amount: number;
  paidAt: string; // ISO date "YYYY-MM-DD"
  method: PaymentMethod;
  note?: string;
}

export interface SalaryEvent {
  id: string;
  effectiveMonth: string; // ISO date "YYYY-MM-01" (mês fechado)
  targetNet: number; // salário-base líquido mensal (mês cheio)
}

export interface LedgerEntry {
  month: number; // 1-12
  year: number;
  targetNet: number; // Salário líquido-base (mês cheio, histórico de aumentos)
  daysWorked: number; // 0-30 (dias corridos, divisor fixo 30)
  proRataFactor: number; // daysWorked/30
  targetNetProrated: number; // targetNet * proRataFactor
  isInEmployment: boolean; // dentro do período de contrato?
  grossSalary: number; // Calculado via reverse
  netSalary: number; // Após descontos
  inssEmployee: number;
  irrfEmployee: number;
  dae: number; // Guia DAE total
  provisions: number; // Provisões 1/12 (Férias + 1/3 + 13º)
  monthlyBonus: number; // Bônus mensal (FGTS 100% + base do split 50%)
  bonusBreakdown?: BonusBreakdown; // Detalhamento do cálculo do bônus
  runningBalance: number; // Pote acumulado até este mês
  variations: Variation[]; // Jobs, prêmios, faltas, etc.
  toPayBase: number; // Salário/lançamentos do mês (sem pagamentos do pote)
  bonusPayout: number; // Pagamento do pote feito no mês (agendado + antecipações)
  scheduledBonusPayout: number; // Parcela agendada (01/jul e 31/dez)
  bonusCarryDue: number; // Saldo de bônus vencido trazido de meses anteriores
  terminationPayout: number; // Quitação integral do pote na rescisão (se aplicável)
  terminationFine: number; // Multa 40% FGTS depósito acumulado (se deslig. empregador)
  terminationEntitlementsNet: number; // Férias prop + 1/3 + 13º prop (líquido) no desligamento
  terminationEntitlements?: {
    vacationNet: number;
    oneThirdNet: number;
    thirteenthNet: number;
  };
  toPay: number; // Valor final a pagar (toPayBase + bonusPayout)
  status: MonthStatus;
  payments?: PaymentRecord[]; // Pagamentos registrados por verba (data/método/valor)
  isExpanded: boolean; // UI state
  isVacation: boolean; // Mês de férias?
  vacation?: VacationDetails;
  workedHoliday?: boolean; // Trabalhou em feriado? (pago em dobro)
  is13th1st?: boolean; // Novembro
  is13th2nd?: boolean; // Dezembro
  payment13th?: {
    gross: number;
    net: number;
    inss: number;
    irrf: number;
    type: 1 | 2;
    fgtsBonus: number; // FGTS do 13º (100%)
    taxBonus: number; // Impostos do 13º (50%)
    totalBonus: number; // fgtsBonus + taxBonus
  };
  anticipatedBonus?: number; // Valor antecipado do bônus (desconta do pote)
  anticipationDate?: string; // Data da antecipação (ISO)
}

export interface ExtraDiscount {
  id: string;
  type: 'extra' | 'discount';
  category: string; // "Hora Extra 50%", "Falta", etc.
  description: string;
  value: number;
  affectsTaxes: boolean; // Incide INSS/IRRF?
  date: string; // ISO date
}

export interface VacationDetails {
  days: number; // 15, 20, 30
  startDate: string; // ISO date
  endDate: string;
  sellDays: number; // Abono pecuniário (0-10)
  vacationPay: number;
  oneThirdBonus: number;
}

export interface EmployeeInfo {
  name: string;
  cpf: string;
  admissionDate: string; // ISO date
  terminationDate?: string; // ISO date
  terminationType?: TerminationType;
  dependents: number;
  isRetired: boolean; // Aposentado (afeta FGTS?)
}

export interface AuditBreakdown {
  dae: {
    inssPatronal: number;
    fgtsDeposit: number;
    fgtsFine: number;
    sat: number;
    inssEmployee: number;
    irrfEmployee: number;
    total: number;
  };
  provisions: {
    vacationAccrual: number; // 1/12 de Férias
    oneThirdAccrual: number; // 1/12 de 1/3
    thirteenthAccrual: number; // 1/12 de 13º
    chargesOnProvisions: number; // Encargos sobre provisões
    total: number;
  };
  bonus: {
    fgtsNotDeposited: number; // 11.2% → 100% pote
    taxSavingsSplit: number; // (INSS Patr + SAT) / 2
    provisionsSavingsSplit: number; // Provisões / 2
    monthlyBonus: number;
    accumulated: number;
  };
}
