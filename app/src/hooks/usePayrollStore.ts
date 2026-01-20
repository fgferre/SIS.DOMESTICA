import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LedgerEntry, EmployeeInfo, SalaryEvent, PaymentRecord } from '@/types/payroll';
import { Variation, VARIATION_META } from '@/types/adjustments';
import { findGrossFromNet, calculateBonusPot, calculateProvisions } from '@/core/adjustments';
import { calculateINSS, calculateIRRF, calculateDAE, calculate13thSalary } from '@/core/payroll';

interface YearData {
  ledger: LedgerEntry[];
  settings: {
    useSimplifiedIRRF: boolean;
    employerSavedPercentage: number; // For bonus pot split (default 0.5)
  };
}

interface PayrollState {
  version: number;
  activeYear: number;
  employee: EmployeeInfo;
  salaryEvents: SalaryEvent[];
  years: { [year: number]: YearData };
  lastCelebration?: { id: string; year: number; month: number; type: 'month_paid' };

  // Actions
  setActiveYear: (year: number) => void;
  initializeYear: (year: number) => void;
  setTargetNet: (month: number, value: number) => void;
  updateEmployee: (info: Partial<EmployeeInfo>) => void;
  addSalaryEvent: (event: SalaryEvent) => void;
  removeSalaryEvent: (eventId: string) => void;
  addVariation: (month: number, variation: Variation) => void;
  removeVariation: (month: number, variationId: string) => void;
  setAnticipatedBonus: (month: number, value: number) => void;
  toggleVacation: (month: number) => void;
  addPayment: (month: number, payment: Omit<PaymentRecord, 'id'>) => void;
  removePayment: (month: number, paymentId: string) => void;
  clearCelebration: () => void;
  toggleHoliday: (month: number) => void;
  toggle13th: (month: number, installment: 1 | 2) => void;
  calculateRunningBalance: () => void;

  // Data Management
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

const INITIAL_VERSION = 5;

const round2 = (n: number) => Number(n.toFixed(2));
const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}-01`;

const sortSalaryEvents = (events: SalaryEvent[]) =>
  [...events].sort((a, b) => a.effectiveMonth.localeCompare(b.effectiveMonth));

const targetNetForMonth = (events: SalaryEvent[], year: number, month: number) => {
  const key = monthKey(year, month);
  const sorted = sortSalaryEvents(events);
  let chosen: SalaryEvent | undefined;
  for (const ev of sorted) {
    if (ev.effectiveMonth <= key) chosen = ev;
    else break;
  }
  return chosen?.targetNet ?? 0;
};

const parseISODateLocal = (iso?: string) => {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-').map(n => Number(n));
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, 12, 0, 0);
};

const computeEmploymentForMonth = (employee: EmployeeInfo, year: number, month: number) => {
  const admission = parseISODateLocal(employee.admissionDate);
  const termination = parseISODateLocal(employee.terminationDate);

  // Compat: sem cadastro → assume mês cheio (não quebra o app)
  if (!admission) {
    return { isInEmployment: true, daysWorked: 30, proRataFactor: 1 };
  }

  const monthStart = new Date(year, month - 1, 1, 12, 0, 0);
  const monthEnd = new Date(year, month, 0, 12, 0, 0);

  // Mês cheio no modelo (divisor fixo 30): se trabalhou o mês inteiro, considera 30/30
  const workedFullMonth =
    admission.getTime() <= monthStart.getTime() &&
    (!termination || termination.getTime() >= monthEnd.getTime());
  if (workedFullMonth) {
    return { isInEmployment: true, daysWorked: 30, proRataFactor: 1 };
  }

  const effectiveStart = admission > monthStart ? admission : monthStart;
  const effectiveEnd = termination && termination < monthEnd ? termination : monthEnd;

  if (effectiveEnd.getTime() < effectiveStart.getTime()) {
    return { isInEmployment: false, daysWorked: 0, proRataFactor: 0 };
  }

  const msDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / msDay) + 1;
  const daysWorked = Math.max(0, Math.min(30, days));
  return { isInEmployment: daysWorked > 0, daysWorked, proRataFactor: daysWorked / 30 };
};

const recalcEntry = (
  entry: LedgerEntry,
  targetNet: number,
  dependents: number,
  date: Date
): LedgerEntry => {
  // --- VARIATION LOGIC ---
  let grossModifiers = 0;
  let netModifiers = 0;

  entry.variations.forEach(v => {
    const meta = VARIATION_META[v.type];
    if (meta.impact === 'gross_add') grossModifiers += v.value;
    if (meta.impact === 'gross_deduct') grossModifiers -= v.value;
    if (meta.impact === 'net_add') netModifiers += v.value;
    if (meta.impact === 'net_deduct') netModifiers -= v.value;
  });

  let baseGross = findGrossFromNet(targetNet, dependents, date);

  if (entry.isVacation) {
    const vacationNetTotal = targetNet + targetNet / 3;
    baseGross = findGrossFromNet(vacationNetTotal, dependents, date);
  }

  if (entry.workedHoliday) {
    baseGross += baseGross / 30;
  }

  const totalGross = baseGross + grossModifiers;
  const inss = calculateINSS(totalGross, date);
  const irrf = calculateIRRF(totalGross, inss, dependents, date);
  const netFromWork = totalGross - inss - irrf;

  let toPay = netFromWork + netModifiers;
  const dae = calculateDAE(totalGross, inss, irrf, date);

  let payment13th = undefined;

  if (entry.is13th1st) {
    const res13th = calculate13thSalary(totalGross, 1, 12, dependents, date);
    toPay += res13th.net;
    payment13th = {
      ...res13th,
      type: 1 as const,
      fgtsBonus: 0,
      taxBonus: 0,
      totalBonus: 0,
    };
  }

  if (entry.is13th2nd) {
    const firstInstValue = totalGross / 2;
    const res13th = calculate13thSalary(totalGross, 2, 12, dependents, date, firstInstValue);
    toPay += res13th.net;

    // Encargos do 13º (sobre o valor total do 13º) - referência DAE
    const fgts13thRef = res13th.gross * 0.112;
    const inssPatr13th = res13th.gross * 0.08;
    const sat13th = res13th.gross * 0.008;

    // Bônus do 13º-2: FGTS depósito (100%) + Impostos (50%)
    const fgtsBonus13th = res13th.gross * 0.08;
    const allTaxes13th = inssPatr13th + sat13th + res13th.inss + res13th.irrf;
    const taxBonus13th = allTaxes13th / 2;

    payment13th = {
      ...res13th,
      type: 2 as const,
      fgtsBonus: round2(fgtsBonus13th),
      taxBonus: round2(taxBonus13th),
      totalBonus: round2(fgtsBonus13th + taxBonus13th),
    };

    // Mantém a referência DAE do 13º (impacta só auditoria)
    dae.totalGuide = round2(
      dae.totalGuide + fgts13thRef + inssPatr13th + sat13th + res13th.inss + res13th.irrf
    );
    dae.totalEmployer = round2(dae.totalEmployer + fgts13thRef + inssPatr13th + sat13th);
    dae.inssPatronal = round2(dae.inssPatronal + inssPatr13th);
    dae.sat = round2(dae.sat + sat13th);
    dae.fgtsDeposit = round2(dae.fgtsDeposit + res13th.gross * 0.08);
    dae.fgtsFine = round2(dae.fgtsFine + res13th.gross * 0.032);
  }

  const provisions = calculateProvisions(totalGross, date);
  const bonusResult = calculateBonusPot(totalGross, dependents, date);

  return {
    ...entry,
    targetNet,
    grossSalary: totalGross,
    netSalary: round2(netFromWork),
    inssEmployee: inss,
    irrfEmployee: irrf,
    dae: dae.totalGuide,
    provisions: provisions.total,
    monthlyBonus: bonusResult.monthlyBonus,
    bonusBreakdown: bonusResult.breakdown,
    toPayBase: round2(toPay),
    toPay: round2(toPay),
    payment13th,
  };
};

const zeroComputedEntry = (entry: LedgerEntry): LedgerEntry => ({
  ...entry,
  grossSalary: 0,
  netSalary: 0,
  inssEmployee: 0,
  irrfEmployee: 0,
  dae: 0,
  provisions: 0,
  monthlyBonus: 0,
  bonusBreakdown: undefined,
  toPayBase: 0,
  bonusCarryDue: 0,
  terminationPayout: 0,
  terminationFine: 0,
  terminationEntitlementsNet: 0,
  terminationEntitlements: undefined,
  toPay: 0,
  payment13th: undefined,
});

const recalcLedgerForYear = (
  yearData: YearData,
  year: number,
  employee: EmployeeInfo,
  salaryEvents: SalaryEvent[],
  fromMonth: number = 1
) => {
  const dependents = employee.dependents;

  return yearData.ledger.map(entry => {
    if (entry.month < fromMonth) return entry;

    const { isInEmployment, daysWorked, proRataFactor } = computeEmploymentForMonth(
      employee,
      year,
      entry.month
    );

    const baseTargetNet = isInEmployment ? targetNetForMonth(salaryEvents, year, entry.month) : 0;
    const targetNetProrated = round2(baseTargetNet * proRataFactor);

    const base: LedgerEntry = {
      ...entry,
      year,
      targetNet: baseTargetNet,
      isInEmployment,
      daysWorked,
      proRataFactor: round2(proRataFactor),
      targetNetProrated,
    };

    if (!isInEmployment || targetNetProrated <= 0) {
      return zeroComputedEntry(base);
    }

    const date = new Date(year, entry.month - 1, 1);
    const recalced = recalcEntry(base, targetNetProrated, dependents, date);

    // Mantém "targetNet" como salário base do mês cheio; cálculo usa "targetNetProrated".
    return {
      ...recalced,
      targetNet: baseTargetNet,
      targetNetProrated,
      isInEmployment,
      daysWorked,
      proRataFactor: round2(proRataFactor),
    };
  });
};

const createEmptyMonth = (month: number, year: number): LedgerEntry => ({
  month,
  year,
  targetNet: 0,
  daysWorked: 0,
  proRataFactor: 0,
  targetNetProrated: 0,
  isInEmployment: false,
  grossSalary: 0,
  netSalary: 0,
  inssEmployee: 0,
  irrfEmployee: 0,
  dae: 0,
  provisions: 0,
  monthlyBonus: 0,
  runningBalance: 0,
  variations: [],
  toPayBase: 0,
  bonusPayout: 0,
  scheduledBonusPayout: 0,
  bonusCarryDue: 0,
  terminationPayout: 0,
  terminationFine: 0,
  terminationEntitlementsNet: 0,
  terminationEntitlements: undefined,
  toPay: 0,
  status: 'pending',
  payments: [],
  isExpanded: false,
  isVacation: false,
  workedHoliday: false,
  is13th1st: false,
  is13th2nd: false,
});

const createInitialYearData = (): YearData => ({
  ledger: Array.from({ length: 12 }, (_, i) => createEmptyMonth(i + 1, new Date().getFullYear())),
  settings: {
    useSimplifiedIRRF: true,
    employerSavedPercentage: 0.5,
  },
});

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      version: INITIAL_VERSION,
      activeYear: new Date().getFullYear(),
      lastCelebration: undefined,
      employee: {
        name: '',
        cpf: '',
        admissionDate: '',
        terminationDate: undefined,
        terminationType: undefined,
        dependents: 0,
        isRetired: false,
      },
      salaryEvents: [],
      years: {
        [new Date().getFullYear()]: createInitialYearData(),
      },

      setActiveYear: year => {
        const { years } = get();
        if (!years[year]) {
          // Lazy init if year doesn't exist
          get().initializeYear(year);
        }
        set({ activeYear: year });
      },

      initializeYear: year => {
        set(state => {
          if (state.years[year]) return state; // Already exists

          const newYearData = createInitialYearData();
          newYearData.ledger = recalcLedgerForYear(
            newYearData,
            year,
            state.employee,
            state.salaryEvents
          );

          return {
            years: {
              ...state.years,
              [year]: newYearData,
            },
          };
        });
      },

      setTargetNet: (month, targetNet) => {
        set(state => {
          const year = state.activeYear;
          const currentYearData = state.years[year];
          if (!currentYearData) return state;

          const effective = monthKey(year, month);
          const salaryEvents = sortSalaryEvents(
            (() => {
              const existing = state.salaryEvents.find(ev => ev.effectiveMonth === effective);
              if (existing) {
                return state.salaryEvents.map(ev =>
                  ev.id === existing.id ? { ...ev, targetNet } : ev
                );
              }
              return [...state.salaryEvents, { id: newId(), effectiveMonth: effective, targetNet }];
            })()
          );

          const newYears: PayrollState['years'] = {};
          for (const [yKey, yData] of Object.entries(state.years)) {
            const y = Number(yKey);

            if (y < year) {
              newYears[y] = yData;
            } else if (y === year) {
              newYears[y] = {
                ...yData,
                ledger: recalcLedgerForYear(yData, y, state.employee, salaryEvents, month),
              };
            } else {
              newYears[y] = {
                ...yData,
                ledger: recalcLedgerForYear(yData, y, state.employee, salaryEvents, 1),
              };
            }
          }

          return {
            salaryEvents,
            years: {
              ...newYears,
            },
          };
        });

        get().calculateRunningBalance();
      },

      addVariation: (month, variation) => {
        set(state => {
          const year = state.activeYear;
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          newLedger[idx].variations = [...newLedger[idx].variations, variation];

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        // Recalculate using the existing target net
        const entry = get().years[get().activeYear].ledger.find(l => l.month === month);
        if (entry) get().setTargetNet(month, entry.targetNet);
      },

      removeVariation: (month, variationId) => {
        set(state => {
          const year = state.activeYear;
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          newLedger[idx].variations = newLedger[idx].variations.filter(v => v.id !== variationId);

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        const entry = get().years[get().activeYear].ledger.find(l => l.month === month);
        if (entry) get().setTargetNet(month, entry.targetNet);
      },

      setAnticipatedBonus: (month, value) => {
        set(state => {
          const year = state.activeYear;
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          const v = Number(value.toFixed(2));
          newLedger[idx].anticipatedBonus = v > 0 ? v : undefined;
          newLedger[idx].anticipationDate = v > 0 ? new Date().toISOString() : undefined;

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        get().calculateRunningBalance();
      },

      toggleVacation: month => {
        set(state => {
          const year = state.activeYear;
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          const enable = !newLedger[idx].isVacation;
          for (let i = 0; i < newLedger.length; i++) {
            newLedger[i] = {
              ...newLedger[i],
              isVacation: i === idx ? enable : enable ? false : newLedger[i].isVacation,
            };
          }

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        const entry = get().years[get().activeYear].ledger.find(l => l.month === month);
        if (entry) get().setTargetNet(month, entry.targetNet);
      },

      addPayment: (month, payment) => {
        const year = get().activeYear;
        const prev = get().years[year]?.ledger.find(l => l.month === month);
        const prevStatus = prev?.status;

        set(state => {
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          const next: PaymentRecord = { id: newId(), ...payment };
          const payments = [...(newLedger[idx].payments ?? []), next];
          newLedger[idx] = { ...newLedger[idx], payments };

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        get().calculateRunningBalance();

        const next = get().years[year]?.ledger.find(l => l.month === month);
        if (prevStatus !== 'paid' && next?.status === 'paid') {
          set({
            lastCelebration: { id: newId(), year, month, type: 'month_paid' },
          });
        }
      },

      removePayment: (month, paymentId) => {
        set(state => {
          const year = state.activeYear;
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          const payments = (newLedger[idx].payments ?? []).filter(p => p.id !== paymentId);
          newLedger[idx] = { ...newLedger[idx], payments };

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        get().calculateRunningBalance();
      },

      clearCelebration: () => set({ lastCelebration: undefined }),

      toggleHoliday: month => {
        set(state => {
          const year = state.activeYear;
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          newLedger[idx].workedHoliday = !newLedger[idx].workedHoliday;

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        const entry = get().years[get().activeYear].ledger.find(l => l.month === month);
        if (entry) get().setTargetNet(month, entry.targetNet);
      },

      toggle13th: (month, installment) => {
        set(state => {
          const year = state.activeYear;
          const yearData = state.years[year];
          if (!yearData) return state;

          const newLedger = [...yearData.ledger];
          const idx = newLedger.findIndex(l => l.month === month);
          if (idx === -1) return state;

          if (installment === 1) {
            newLedger[idx].is13th1st = !newLedger[idx].is13th1st;
          } else {
            newLedger[idx].is13th2nd = !newLedger[idx].is13th2nd;
          }

          return {
            years: { ...state.years, [year]: { ...yearData, ledger: newLedger } },
          };
        });
        const entry = get().years[get().activeYear].ledger.find(l => l.month === month);
        if (entry) get().setTargetNet(month, entry.targetNet);
      },

      updateEmployee: info => {
        set(state => {
          const employee = { ...state.employee, ...info };

          const newYears: PayrollState['years'] = {};
          for (const [yKey, yData] of Object.entries(state.years)) {
            const y = Number(yKey);
            newYears[y] = {
              ...yData,
              ledger: recalcLedgerForYear(yData, y, employee, state.salaryEvents),
            };
          }

          return { employee, years: newYears };
        });
        get().calculateRunningBalance();
      },

      addSalaryEvent: event => {
        set(state => {
          const salaryEvents = sortSalaryEvents([
            ...state.salaryEvents.filter(e => e.effectiveMonth !== event.effectiveMonth),
            event,
          ]);

          const [evYearStr, evMonthStr] = event.effectiveMonth.split('-');
          const evYear = Number(evYearStr);
          const evMonth = Number(evMonthStr);

          const newYears: PayrollState['years'] = {};
          for (const [yKey, yData] of Object.entries(state.years)) {
            const y = Number(yKey);

            if (y < evYear) {
              newYears[y] = yData;
            } else if (y === evYear) {
              newYears[y] = {
                ...yData,
                ledger: recalcLedgerForYear(yData, y, state.employee, salaryEvents, evMonth),
              };
            } else {
              newYears[y] = {
                ...yData,
                ledger: recalcLedgerForYear(yData, y, state.employee, salaryEvents, 1),
              };
            }
          }

          return { salaryEvents, years: newYears };
        });
        get().calculateRunningBalance();
      },

      removeSalaryEvent: eventId => {
        set(state => {
          const removedEvent = state.salaryEvents.find(e => e.id === eventId);
          const salaryEvents = sortSalaryEvents(state.salaryEvents.filter(e => e.id !== eventId));

          let evYear = 0;
          let evMonth = 1;

          if (removedEvent) {
            const [y, m] = removedEvent.effectiveMonth.split('-');
            evYear = Number(y);
            evMonth = Number(m);
          }

          const newYears: PayrollState['years'] = {};
          for (const [yKey, yData] of Object.entries(state.years)) {
            const y = Number(yKey);

            if (removedEvent) {
              if (y < evYear) {
                newYears[y] = yData;
              } else if (y === evYear) {
                newYears[y] = {
                  ...yData,
                  ledger: recalcLedgerForYear(yData, y, state.employee, salaryEvents, evMonth),
                };
              } else {
                newYears[y] = {
                  ...yData,
                  ledger: recalcLedgerForYear(yData, y, state.employee, salaryEvents, 1),
                };
              }
            } else {
              newYears[y] = {
                ...yData,
                ledger: recalcLedgerForYear(yData, y, state.employee, salaryEvents),
              };
            }
          }

          return { salaryEvents, years: newYears };
        });
        get().calculateRunningBalance();
      },

      calculateRunningBalance: () => {
        set(state => {
          const yearKeys = Object.keys(state.years)
            .map(Number)
            .filter(n => Number.isFinite(n))
            .sort((a, b) => a - b);

          if (yearKeys.length === 0) return state;

          const termination = parseISODateLocal(state.employee.terminationDate);
          const termYear = termination?.getFullYear();
          const termMonth = termination ? termination.getMonth() + 1 : undefined;
          const terminationType = state.employee.terminationType;

          let potBalance = 0; // saldo do pote (passivo devido)
          let carryDue = 0; // bônus vencido (deve ser pago antes do novo agendamento)
          let fgtsDepositTotal = 0; // para multa 40% na rescisão (depósito acumulado)

          // Provisões (líquido) para acerto/rescisão (modelo: sempre líquido) — atravessa anos
          let vacationAccruedNet = 0;
          let oneThirdAccruedNet = 0;

          const newYears: PayrollState['years'] = {};

          for (const year of yearKeys) {
            const yearData = state.years[year];
            if (!yearData) continue;

            let thirteenthAccruedNetYear = 0;
            let thirteenthPaidNetYear = 0;

            const ledger = yearData.ledger
              .slice()
              .sort((a, b) => a.month - b.month)
              .map(entry => {
                const accrual = round2(entry.monthlyBonus + (entry.payment13th?.totalBonus || 0));

                const payments = entry.payments ?? [];
                const sumPaid = (kind: PaymentRecord['kind']) =>
                  round2(
                    payments
                      .filter(p => p.kind === kind)
                      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
                  );

                const hasBonusPayments = payments.some(p => p.kind === 'bonus');
                const legacyAnticipatedBonus = !hasBonusPayments
                  ? round2(entry.anticipatedBonus || 0)
                  : 0;

                const paidSalary = sumPaid('salary');
                const paid13th1 = sumPaid('thirteenth_1');
                const paid13th2 = sumPaid('thirteenth_2');
                const paidBonus = round2(sumPaid('bonus') + legacyAnticipatedBonus);
                const paidTerminationFine = sumPaid('termination_fine');
                const paidTerminationEntitlements = sumPaid('termination_entitlements');

                const fgtsFromMonth = round2(entry.bonusBreakdown?.fgtsDeposit || 0);
                const fgtsFrom13th = round2(entry.payment13th?.fgtsBonus || 0);
                fgtsDepositTotal = round2(fgtsDepositTotal + fgtsFromMonth + fgtsFrom13th);

                const isTerminationMonth =
                  Boolean(termination) && year === termYear && entry.month === termMonth;

                let scheduled = 0;
                let terminationPayout = 0;
                let terminationFine = 0;
                let terminationEntitlements: LedgerEntry['terminationEntitlements'] = undefined;
                let terminationEntitlementsNet = 0;

                // 01/jul: 50% do saldo não vencido (saldo até Jun), mantendo carryDue integral
                if (entry.month === 7 && !isTerminationMonth) {
                  scheduled = round2(Math.max(0, (potBalance - carryDue) * 0.5));
                }

                // Provisões líquidas (para acerto): acumula por mês trabalhado (dias/30 já embutido no targetNetProrated)
                if (entry.isInEmployment && entry.targetNetProrated > 0) {
                  vacationAccruedNet = round2(vacationAccruedNet + entry.targetNetProrated / 12);
                  oneThirdAccruedNet = round2(oneThirdAccruedNet + entry.targetNetProrated / 36);
                  thirteenthAccruedNetYear = round2(
                    thirteenthAccruedNetYear + entry.targetNetProrated / 12
                  );
                }

                if (entry.payment13th) {
                  const due13th = round2(entry.payment13th.net);
                  const paid13th = entry.payment13th.type === 1 ? paid13th1 : paid13th2;
                  thirteenthPaidNetYear = round2(
                    thirteenthPaidNetYear + Math.min(due13th, paid13th)
                  );
                }

                // Se as férias do ano foram pagas, reinicia o período aquisitivo (modelo simplificado)
                if (entry.isVacation) {
                  const thirteenthNet = round2(entry.payment13th?.net || 0);
                  const base = round2((entry.toPayBase ?? entry.toPay ?? 0) as number);
                  const salaryDue = round2(Math.max(0, base - thirteenthNet));
                  if (salaryDue > 0 && paidSalary >= round2(salaryDue - 0.01)) {
                    vacationAccruedNet = 0;
                    oneThirdAccruedNet = 0;
                  }
                }

                // Acúmulo do mês (salário + 13º bônus)
                potBalance = round2(potBalance + accrual);

                // 31/dez: paga 100% do pote (tudo vence)
                if (entry.month === 12 && !isTerminationMonth) {
                  carryDue = 0;
                  scheduled = round2(Math.max(0, potBalance));
                }

                // Rescisão: quita 100% do pote no mês do desligamento
                if (isTerminationMonth) {
                  carryDue = 0;
                  terminationPayout = round2(Math.max(0, potBalance));
                  if (terminationType === 'employer') {
                    terminationFine = round2(Math.max(0, fgtsDepositTotal * 0.4));
                  }

                  const vacationNet = round2(vacationAccruedNet);
                  const oneThirdNet = round2(oneThirdAccruedNet);
                  const thirteenthNet = round2(
                    Math.max(0, thirteenthAccruedNetYear - thirteenthPaidNetYear)
                  );
                  terminationEntitlements = { vacationNet, oneThirdNet, thirteenthNet };
                  terminationEntitlementsNet = round2(vacationNet + oneThirdNet + thirteenthNet);
                }

                // entry.anticipatedBonus é legado; usar payments kind='bonus' para adiantamentos.

                // Valor devido no mês (bônus vencido + parcela agendada + antecipação + quitação rescisão)
                const bonusCarryDue = round2(carryDue);
                const bonusDue = round2(bonusCarryDue + scheduled + terminationPayout);
                const bonusPayout = bonusDue;

                // Pagamentos do pote (kind='bonus') reduzem o saldo; excedente conta como adiantamento.
                potBalance = round2(Math.max(0, potBalance - paidBonus));
                carryDue = round2(Math.max(0, bonusDue - paidBonus));

                // Atualiza carryDue caso não tenha sido pago no mês
                if (isTerminationMonth && carryDue <= 0.01) {
                  vacationAccruedNet = 0;
                  oneThirdAccruedNet = 0;
                  thirteenthAccruedNetYear = 0;
                  thirteenthPaidNetYear = 0;
                }

                const toPayBase = round2((entry.toPayBase ?? entry.toPay ?? 0) as number);
                const toPay = round2(
                  toPayBase + bonusPayout + terminationFine + terminationEntitlementsNet
                );

                const thirteenthNet = round2(entry.payment13th?.net || 0);
                const salaryDue = round2(Math.max(0, toPayBase - thirteenthNet));
                const thirteenth1Due = entry.payment13th?.type === 1 ? thirteenthNet : 0;
                const thirteenth2Due = entry.payment13th?.type === 2 ? thirteenthNet : 0;

                const bonusDueForStatus = round2(bonusPayout);
                const terminationFineDue = round2(terminationFine);
                const terminationEntitlementsDue = round2(terminationEntitlementsNet);

                const totalDue = round2(
                  salaryDue +
                    thirteenth1Due +
                    thirteenth2Due +
                    bonusDueForStatus +
                    terminationFineDue +
                    terminationEntitlementsDue
                );

                const paidTowardDue = round2(
                  Math.min(paidSalary, salaryDue) +
                    Math.min(paid13th1, thirteenth1Due) +
                    Math.min(paid13th2, thirteenth2Due) +
                    Math.min(paidBonus, bonusDueForStatus) +
                    Math.min(paidTerminationFine, terminationFineDue) +
                    Math.min(paidTerminationEntitlements, terminationEntitlementsDue)
                );

                const status =
                  !entry.isInEmployment && totalDue <= 0
                    ? ('pending' as const)
                    : totalDue > 0 && paidTowardDue >= round2(totalDue - 0.01)
                      ? ('paid' as const)
                      : paidTowardDue > 0.01
                        ? ('partial' as const)
                        : ('pending' as const);

                return {
                  ...entry,
                  bonusCarryDue,
                  scheduledBonusPayout: scheduled,
                  terminationPayout,
                  terminationFine,
                  terminationEntitlements,
                  terminationEntitlementsNet,
                  bonusPayout,
                  toPayBase,
                  toPay,
                  status,
                  runningBalance: potBalance,
                };
              });

            newYears[year] = { ...yearData, ledger };
          }

          return { years: { ...state.years, ...newYears } };
        });
      },

      exportData: () => {
        const { employee, salaryEvents, years, activeYear } = get();
        return JSON.stringify({ employee, salaryEvents, years, activeYear });
      },

      importData: json => {
        try {
          const data = JSON.parse(json);
          // Basic validation
          if (!data || typeof data !== 'object') return false;

          if (data.years) {
            set({
              years: data.years,
              employee: data.employee ?? get().employee,
              salaryEvents: data.salaryEvents ?? get().salaryEvents,
              activeYear: data.activeYear ?? get().activeYear,
            });
          } else {
            // Compat: import antigo era só "years"
            set({ years: data });
          }
          get().calculateRunningBalance();
          return true;
        } catch (e) {
          console.error('Import failed', e);
          return false;
        }
      },

      resetData: () => {
        set({
          version: INITIAL_VERSION,
          activeYear: new Date().getFullYear(),
          employee: {
            name: '',
            cpf: '',
            admissionDate: '',
            terminationDate: undefined,
            terminationType: undefined,
            dependents: 0,
            isRetired: false,
          },
          salaryEvents: [],
          years: { [new Date().getFullYear()]: createInitialYearData() },
        });
        // Force reload to clear any component state
        window.location.reload();
      },
    }),
    {
      name: 'sis-domestica-storage', // key in local storage
      version: INITIAL_VERSION,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      migrate: (persistedState: any, _version) => {
        if (!persistedState || typeof persistedState !== 'object') return persistedState;
        /* eslint-disable @typescript-eslint/no-explicit-any */

        const rootLooksLikeYears =
          !persistedState.years &&
          Object.keys(persistedState).some(k => /^\d{4}$/.test(k)) &&
          typeof persistedState[
            Object.keys(persistedState).find(k => /^\d{4}$/.test(k)) as string
          ] === 'object';

        const years: any =
          persistedState.years && typeof persistedState.years === 'object'
            ? persistedState.years
            : rootLooksLikeYears
              ? persistedState
              : {};

        let employee = persistedState.employee;
        if (!employee) {
          for (const yearData of Object.values<any>(years)) {
            if (yearData?.employee) {
              employee = yearData.employee;
              break;
            }
          }
        }
        if (!employee) {
          employee = {
            name: '',
            cpf: '',
            admissionDate: '',
            terminationDate: undefined,
            terminationType: undefined,
            dependents: 0,
            isRetired: false,
          };
        }

        let salaryEvents: SalaryEvent[] = Array.isArray(persistedState.salaryEvents)
          ? persistedState.salaryEvents
          : [];
        if (salaryEvents.length === 0) {
          const points: Array<{ key: string; targetNet: number }> = [];
          const yearKeys = Object.keys(years)
            .filter(k => /^\d{4}$/.test(k))
            .sort();
          for (const yKey of yearKeys) {
            const yData: any = years[yKey];
            if (!yData?.ledger || !Array.isArray(yData.ledger)) continue;
            for (const entry of yData.ledger) {
              const y = Number(entry?.year || yKey);
              const m = Number(entry?.month || 0);
              const tn = Number(entry?.targetNet || 0);
              if (m < 1 || m > 12) continue;
              points.push({ key: monthKey(y, m), targetNet: tn });
            }
          }
          points.sort((a, b) => a.key.localeCompare(b.key));
          let last = NaN;
          for (const p of points) {
            if (!Number.isFinite(p.targetNet) || p.targetNet <= 0) continue;
            if (!Number.isFinite(last) || p.targetNet !== last) {
              salaryEvents.push({ id: newId(), effectiveMonth: p.key, targetNet: p.targetNet });
              last = p.targetNet;
            }
          }
          salaryEvents = sortSalaryEvents(salaryEvents);
        } else {
          salaryEvents = sortSalaryEvents(salaryEvents);
        }

        for (const [yearKey, yearData] of Object.entries<any>(years)) {
          if (!yearData?.ledger || !Array.isArray(yearData.ledger)) continue;

          yearData.ledger = yearData.ledger.map((entry: any) => {
            const month = Number(entry?.month || 0);
            const year = Number(entry?.year || yearKey);
            const date = new Date(year, Math.max(0, month - 1), 1);
            const grossSalary = Number(entry?.grossSalary || 0);

            const bonusBreakdown = entry?.bonusBreakdown;
            if (bonusBreakdown && typeof bonusBreakdown === 'object') {
              const splitBaseFallback =
                Number(bonusBreakdown.inssPatronal || 0) +
                Number(bonusBreakdown.sat || 0) +
                Number(bonusBreakdown.inssEmployee || 0) +
                Number(bonusBreakdown.irrfEmployee || 0);

              const splitBase = Number.isFinite(bonusBreakdown.splitBase)
                ? Number(bonusBreakdown.splitBase)
                : splitBaseFallback;

              const taxSplit = Number.isFinite(bonusBreakdown.taxSplit)
                ? Number(bonusBreakdown.taxSplit)
                : splitBase / 2;

              const provisionsTotal = Number.isFinite(bonusBreakdown.provisionsTotal)
                ? Number(bonusBreakdown.provisionsTotal)
                : calculateProvisions(grossSalary, date).total;

              const fgtsFineRef = Number.isFinite(bonusBreakdown.fgtsFineRef)
                ? Number(bonusBreakdown.fgtsFineRef)
                : Number.isFinite(bonusBreakdown.fgtsFine)
                  ? Number(bonusBreakdown.fgtsFine)
                  : 0;

              const fgtsDeposit = Number(bonusBreakdown.fgtsDeposit || 0);

              entry.bonusBreakdown = {
                ...bonusBreakdown,
                splitBase: round2(splitBase),
                taxSplit: round2(taxSplit),
                provisionsTotal: round2(provisionsTotal),
                fgtsFineRef: round2(fgtsFineRef),
              };

              entry.monthlyBonus = round2(fgtsDeposit + taxSplit);
            }

            entry.toPayBase = Number.isFinite(entry?.toPayBase)
              ? Number(entry.toPayBase)
              : Number.isFinite(entry?.toPay)
                ? Number(entry.toPay)
                : 0;

            entry.bonusPayout = Number.isFinite(entry?.bonusPayout) ? Number(entry.bonusPayout) : 0;
            entry.scheduledBonusPayout = Number.isFinite(entry?.scheduledBonusPayout)
              ? Number(entry.scheduledBonusPayout)
              : 0;

            if (!Array.isArray(entry.payments)) {
              entry.payments = [];
            }

            // Compat: versões antigas usavam status/paymentDate para "quitar" o mês inteiro.
            if (
              entry.payments.length === 0 &&
              entry.status === 'paid' &&
              typeof entry.paymentDate === 'string' &&
              entry.paymentDate.length >= 10
            ) {
              const paidAt = entry.paymentDate.slice(0, 10);
              const thirteenthNet = Number(entry?.payment13th?.net || 0);
              const salaryAmount = Math.max(
                0,
                Number((entry.toPayBase - thirteenthNet).toFixed(2))
              );

              if (salaryAmount > 0) {
                entry.payments.push({
                  id: newId(),
                  kind: 'salary',
                  amount: salaryAmount,
                  paidAt,
                  method: 'other',
                  note: 'Migrado (status antigo)',
                });
              }

              if (thirteenthNet > 0) {
                entry.payments.push({
                  id: newId(),
                  kind: entry.payment13th?.type === 1 ? 'thirteenth_1' : 'thirteenth_2',
                  amount: Number(thirteenthNet.toFixed(2)),
                  paidAt,
                  method: 'other',
                  note: 'Migrado (status antigo)',
                });
              }

              const bonusAmount = Number(entry?.bonusPayout || 0);
              if (bonusAmount > 0) {
                entry.payments.push({
                  id: newId(),
                  kind: 'bonus',
                  amount: Number(bonusAmount.toFixed(2)),
                  paidAt,
                  method: 'other',
                  note: 'Migrado (status antigo)',
                });
              }

              const fineAmount = Number(entry?.terminationFine || 0);
              if (fineAmount > 0) {
                entry.payments.push({
                  id: newId(),
                  kind: 'termination_fine',
                  amount: Number(fineAmount.toFixed(2)),
                  paidAt,
                  method: 'other',
                  note: 'Migrado (status antigo)',
                });
              }

              const entAmount = Number(entry?.terminationEntitlementsNet || 0);
              if (entAmount > 0) {
                entry.payments.push({
                  id: newId(),
                  kind: 'termination_entitlements',
                  amount: Number(entAmount.toFixed(2)),
                  paidAt,
                  method: 'other',
                  note: 'Migrado (status antigo)',
                });
              }
            }

            return entry;
          });

          // Recalcula o ledger completo com a lógica atual (inclui pró-rata "dias/30" correto por contrato).
          const y = Number(yearKey);
          if (Number.isFinite(y)) {
            yearData.ledger = recalcLedgerForYear(yearData, y, employee, salaryEvents);
          }
        }

        return {
          ...persistedState,
          version: INITIAL_VERSION,
          years,
          employee,
          salaryEvents,
        };
        /* eslint-enable @typescript-eslint/no-explicit-any */
      },
      partialize: state => ({
        version: state.version,
        activeYear: state.activeYear,
        employee: state.employee,
        salaryEvents: state.salaryEvents,
        years: state.years,
      }), // Save these fields
      onRehydrateStorage: () => state => {
        // console.log('Storage Hydrated', state);
        state?.calculateRunningBalance();
      },
    }
  )
);
