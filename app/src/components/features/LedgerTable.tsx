import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { formatCurrency, cn } from '@/utils/utils';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ChevronRight, MoreHorizontal, CalendarDays, PiggyBank, Gift } from 'lucide-react';
import { AuditPanel } from './AuditPanel';
import { ExtrasManager } from './ExtrasManager';
import { PaymentsManager } from './PaymentsManager';
import { useToast } from '@/components/ui/Toast';
import { AnimatedCollapse } from '@/components/ui/AnimatedCollapse';
import { getTaxTableForDate } from '@/core/taxTables';
import type { LedgerEntry } from '@/types/payroll';

export function LedgerTable() {
  const { years, activeYear, employee, setTargetNet, toggleVacation, toggleHoliday, toggle13th } =
    usePayrollStore();
  const { showToast } = useToast();
  const yearData = years[activeYear];

  const [viewMode, setViewMode] = useState<'caixa' | 'competencia'>('caixa');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [editingExtrasMonth, setEditingExtrasMonth] = useState<number | null>(null);
  const [editingPaymentsMonth, setEditingPaymentsMonth] = useState<number | null>(null);
  const [compactMode, setCompactMode] = useState(true);
  const [actionsMenuMonth, setActionsMenuMonth] = useState<number | null>(null);
  const [actionsMenuPos, setActionsMenuPos] = useState<{ top: number; left: number } | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const actionsMenuAnchorRef = useRef<HTMLElement | null>(null);
  const today = new Date();
  const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  const isPast = (due: Date) => dateOnly(today).getTime() > dateOnly(due).getTime();
  const terminationDate = employee.terminationDate
    ? new Date(`${employee.terminationDate}T12:00:00`)
    : undefined;

  const handleSalaryChange = (entry: LedgerEntry, val: number) => {
    const minWage = getTaxTableForDate(new Date(activeYear, entry.month - 1, 1)).minimumWage;
    if (val < minWage * 0.9) {
      if (entry.proRataFactor >= 1) {
        showToast('Atenção: Valor abaixo do Salário Mínimo!', 'warning');
      }
    }
    setTargetNet(entry.month, val);
  };

  // Reset expansion when switching year or employee (using CPF as proxy for ID)
  useEffect(() => {
    setExpandedRows([]);
  }, [activeYear, employee?.cpf]);

  const closeActionsMenu = () => {
    setActionsMenuMonth(null);
    setActionsMenuPos(null);
    actionsMenuAnchorRef.current = null;
  };

  const openActionsMenu = (month: number, anchor: HTMLElement) => {
    actionsMenuAnchorRef.current = anchor;
    setActionsMenuPos(null);
    setActionsMenuMonth(month);
  };

  const computeActionsMenuPos = () => {
    const anchor = actionsMenuAnchorRef.current;
    const menuEl = actionsMenuRef.current;
    if (!anchor || !menuEl) return;

    const rect = anchor.getBoundingClientRect();
    const menuW = menuEl.offsetWidth || 240;
    const menuH = menuEl.offsetHeight || 160;
    const margin = 8;

    let left = rect.right - menuW;
    let top = rect.bottom + margin;

    const maxLeft = Math.max(margin, window.innerWidth - menuW - margin);
    left = Math.min(Math.max(margin, left), maxLeft);

    if (top + menuH > window.innerHeight - margin) {
      top = rect.top - margin - menuH;
    }
    const maxTop = Math.max(margin, window.innerHeight - menuH - margin);
    top = Math.min(Math.max(margin, top), maxTop);

    setActionsMenuPos({ top, left });
  };

  useLayoutEffect(() => {
    if (actionsMenuMonth == null) return;
    computeActionsMenuPos();
  }, [actionsMenuMonth]);

  useEffect(() => {
    if (actionsMenuMonth == null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeActionsMenu();
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (actionsMenuRef.current?.contains(target)) return;
      if (actionsMenuAnchorRef.current?.contains(target)) return;
      closeActionsMenu();
    };

    const onReposition = () => computeActionsMenuPos();

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [actionsMenuMonth]);

  if (!yearData) return <div>Carregando ano...</div>;

  const allMonths = yearData.ledger.map(e => e.month);
  const allExpanded = expandedRows.length === allMonths.length;
  const toggleExpandAll = () => {
    setExpandedRows(allExpanded ? [] : allMonths);
  };

  const toggleExpand = (month: number) => {
    setExpandedRows(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const getMonthName = (month: number) => {
    return new Date(2025, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  };

  const actionsMenuEntry =
    actionsMenuMonth != null ? yearData.ledger.find(e => e.month === actionsMenuMonth) : undefined;
  const actionsMenuDisabled = !actionsMenuEntry?.isInEmployment;

  return (
    <div className="glass-panel rounded-xl clip-corner border border-black/10 dark:border-white/10 overflow-hidden">
      {editingExtrasMonth && (
        <ExtrasManager
          month={editingExtrasMonth}
          isOpen={true}
          onClose={() => setEditingExtrasMonth(null)}
        />
      )}

      {editingPaymentsMonth && (
        <PaymentsManager
          month={editingPaymentsMonth}
          isOpen={true}
          onClose={() => setEditingPaymentsMonth(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-end sm:items-center border-b border-black/10 dark:border-white/10 pb-4 gap-4 relative px-4 pt-6">
        <div className="absolute bottom-0 right-0 w-20 h-px bg-secondary shadow-[0_0_10px_#06b6d4]" />
        <div>
          <h2 className="font-display text-xl text-slate-900 dark:text-white font-bold tracking-wide uppercase flex items-center gap-3">
            <span className="text-primary">▸</span>
            Demonstrativo Financeiro {activeYear}
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-primary to-transparent mt-1 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={toggleExpandAll}
            className="px-4 py-1.5 rounded bg-transparent border border-black/15 dark:border-white/20 text-xs font-bold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:border-black/25 dark:hover:border-white/40 text-slate-700 dark:text-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark"
          >
            {allExpanded ? 'Recolher Tudo' : 'Expandir Tudo'}
          </button>
          <div className="bg-white/60 dark:bg-glass-bg rounded border border-black/15 dark:border-white/20 p-1 flex shadow-lg">
            <button
              onClick={() => setCompactMode(v => !v)}
              className={cn(
                'px-4 py-1 rounded text-xs font-bold uppercase transition-all',
                compactMode
                  ? 'bg-secondary/20 text-secondary shadow-neon-cyan border border-secondary/30 hover:bg-secondary/30'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              )}
              title="Alterna entre modo compacto e detalhado"
            >
              {compactMode ? 'Compacto' : 'Detalhado'}
            </button>
            <button
              onClick={() => setViewMode('caixa')}
              className={cn(
                'px-4 py-1 rounded text-xs font-bold uppercase transition-all',
                viewMode === 'caixa'
                  ? 'bg-primary/20 text-primary shadow-neon-purple border border-primary/30 hover:bg-primary/30'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Caixa
            </button>
            <button
              onClick={() => setViewMode('competencia')}
              className={cn(
                'px-4 py-1 rounded text-xs font-bold uppercase transition-all',
                viewMode === 'competencia'
                  ? 'bg-accent/15 text-accent shadow-neon-red border border-accent/30 hover:bg-accent/20'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Competência
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-0 md:min-w-[1120px]">
          {/* Column headers (desktop) */}
          <div className="hidden md:grid grid-cols-[repeat(15,minmax(72px,1fr))] gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-2 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="col-span-3 pl-2">Mês / Status</div>
            <div className="col-span-2 text-right border-l border-black/5 dark:border-white/5 pr-2">
              Líquido Acordado
            </div>
            <div className="col-span-1 text-center border-l border-black/5 dark:border-white/5">
              Ações
            </div>
            <div className="col-span-2 text-right border-l border-black/5 dark:border-white/5">
              Bruto Calc.
            </div>
            <div className="col-span-2 text-right text-accent border-l border-black/5 dark:border-white/5">
              INSS+IRRF (Desc)
            </div>
            <div className="col-span-1 text-right border-l border-black/5 dark:border-white/5">
              {viewMode === 'caixa' ? 'Guia DAE' : 'Provisão'}
            </div>
            <div className="col-span-2 text-right border-l border-black/5 dark:border-white/5">
              A Pagar
            </div>
            <div className="col-span-2 text-right text-secondary border-l border-black/5 dark:border-white/5">
              Acúmulo
            </div>
          </div>

          <div className="space-y-6 px-4 pb-6">
            {yearData.ledger.map(entry => {
              const isExpanded = expandedRows.includes(entry.month);
              const employeeTaxes = entry.inssEmployee + entry.irrfEmployee;

              const isTerminationMonth =
                Boolean(terminationDate) &&
                entry.year === terminationDate!.getFullYear() &&
                entry.month === terminationDate!.getMonth() + 1;

              const bonusDueDate =
                isTerminationMonth && terminationDate
                  ? terminationDate
                  : entry.scheduledBonusPayout > 0
                    ? entry.month === 7
                      ? new Date(entry.year, 6, 1, 12, 0, 0)
                      : entry.month === 12
                        ? new Date(entry.year, 11, 31, 12, 0, 0)
                        : undefined
                    : undefined;

              const thirteenthDueDate =
                entry.month === 11 && entry.is13th1st
                  ? new Date(entry.year, 10, 30, 12, 0, 0)
                  : entry.month === 12 && entry.is13th2nd
                    ? new Date(entry.year, 11, 20, 12, 0, 0)
                    : undefined;

              const payments = entry.payments ?? [];
              const sumKind = (kind: string) =>
                payments
                  .filter(p => p.kind === kind)
                  .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

              const thirteenthNet = entry.payment13th?.net ?? 0;
              const salaryDue = Math.max(0, Number((entry.toPayBase - thirteenthNet).toFixed(2)));
              const paidSalary = sumKind('salary');
              const isSalaryPaid = salaryDue <= 0 || paidSalary >= salaryDue - 0.01;
              const salaryDueDate = entry.isInEmployment
                ? new Date(
                    entry.month === 12 ? entry.year + 1 : entry.year,
                    entry.month === 12 ? 0 : entry.month,
                    5,
                    12,
                    0,
                    0
                  )
                : undefined;

              const bonusDue = entry.bonusPayout ?? 0;
              const paidBonus = sumKind('bonus');
              const isBonusPaid = bonusDue <= 0 || paidBonus >= bonusDue - 0.01;

              const thirteenthDue = thirteenthNet;
              const paid13th =
                entry.payment13th?.type === 1
                  ? sumKind('thirteenth_1')
                  : entry.payment13th?.type === 2
                    ? sumKind('thirteenth_2')
                    : 0;
              const is13thPaid = thirteenthDue <= 0 || paid13th >= thirteenthDue - 0.01;

              const lastPaidAtForKind = (kind: string) =>
                payments
                  .filter(p => p.kind === kind)
                  .map(p => p.paidAt)
                  .filter(Boolean)
                  .sort()
                  .slice(-1)[0];

              const lastSalaryPaidAt = lastPaidAtForKind('salary');
              const isSalaryLatePaid =
                Boolean(salaryDueDate) &&
                isSalaryPaid &&
                Boolean(lastSalaryPaidAt) &&
                dateOnly(new Date(`${lastSalaryPaidAt}T12:00:00`)).getTime() >
                  dateOnly(salaryDueDate!).getTime();

              const lastBonusPaidAt = lastPaidAtForKind('bonus');
              const isBonusLatePaid =
                Boolean(bonusDueDate) &&
                isBonusPaid &&
                Boolean(lastBonusPaidAt) &&
                dateOnly(new Date(`${lastBonusPaidAt}T12:00:00`)).getTime() >
                  dateOnly(bonusDueDate!).getTime();

              const last13thPaidAt =
                entry.payment13th?.type === 1
                  ? lastPaidAtForKind('thirteenth_1')
                  : entry.payment13th?.type === 2
                    ? lastPaidAtForKind('thirteenth_2')
                    : undefined;
              const is13thLatePaid =
                Boolean(thirteenthDueDate) &&
                is13thPaid &&
                Boolean(last13thPaidAt) &&
                dateOnly(new Date(`${last13thPaidAt}T12:00:00`)).getTime() >
                  dateOnly(thirteenthDueDate!).getTime();

              const hasCarryOverdue = entry.bonusCarryDue > 0 && !isBonusPaid;
              const isOverdueSalary = salaryDueDate && !isSalaryPaid && isPast(salaryDueDate);
              const isOverdueBonus =
                hasCarryOverdue || (bonusDueDate && !isBonusPaid && isPast(bonusDueDate));
              const isOverdue13th = thirteenthDueDate && !is13thPaid && isPast(thirteenthDueDate);

              const paymentDates = (entry.payments ?? [])
                .map(p => p.paidAt)
                .filter(Boolean)
                .sort();
              const lastPaymentDate =
                paymentDates.length > 0 ? paymentDates[paymentDates.length - 1] : undefined;

              const dueBadge = (
                kind: 'salary' | 'bonus' | 'thirteenth',
                state: 'ok' | 'due' | 'overdue' | 'late',
                title: string
              ) => {
                const base =
                  'inline-flex items-center justify-center w-5 h-5 rounded border text-[10px] font-bold select-none';
                const cls =
                  state === 'overdue'
                    ? 'border-red-500/30 bg-red-500/10 text-red-200'
                    : state === 'late'
                      ? 'border-orange-500/30 bg-orange-500/10 text-orange-200'
                      : state === 'due'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-200'
                        : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 text-slate-700 dark:text-gray-300';

                const IconComp =
                  kind === 'salary' ? CalendarDays : kind === 'bonus' ? PiggyBank : Gift;
                return (
                  <span title={title} className={cn(base, cls)}>
                    <IconComp size={12} />
                  </span>
                );
              };

              const statusPill = (
                <button
                  onClick={() => setEditingPaymentsMonth(entry.month)}
                  className={cn(
                    'inline-flex items-center h-5 text-[10px] font-bold px-1.5 rounded border transition-all uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark',
                    !entry.isInEmployment
                      ? 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
                      : entry.status === 'paid'
                        ? 'bg-success/15 text-success border-success/40 hover:bg-success/20'
                        : entry.status === 'partial'
                          ? 'bg-orange-500/15 text-orange-200 border-orange-500/40 hover:bg-orange-500/20'
                          : 'bg-yellow-500/15 text-yellow-200 border-yellow-500/40 hover:bg-yellow-500/20'
                  )}
                  title="Abrir pagamentos"
                >
                  {!entry.isInEmployment
                    ? 'FORA'
                    : entry.status === 'paid'
                      ? 'PAGO'
                      : entry.status === 'partial'
                        ? 'PARCIAL'
                        : 'PENDENTE'}
                </button>
              );

              return (
                <div key={entry.month} className="relative group">
                  <div
                    className={cn(
                      'glass-panel rounded-lg p-4 md:px-6 md:py-5 grid grid-cols-1 md:grid-cols-[repeat(15,minmax(72px,1fr))] gap-4 items-center border-l-4 border-l-transparent hover:border-l-primary transition-all duration-300 z-20 relative beam-border hover:bg-black/5 dark:hover:bg-white/5',
                      (isOverdueSalary || isOverdueBonus || isOverdue13th) && 'border-l-accent/80'
                    )}
                    role="row"
                  >
                    {/* Month + Status */}
                    <div className="col-span-3 flex items-center gap-4 md:min-w-[280px]">
                      <button
                        type="button"
                        className="text-primary hover:text-slate-900 dark:hover:text-white transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark"
                        onClick={() => toggleExpand(entry.month)}
                        title={isExpanded ? 'Recolher' : 'Expandir'}
                      >
                        <ChevronRight
                          size={20}
                          className={cn(
                            'transition-transform duration-200',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      </button>
                      <div className="min-w-0">
                        <span className="block font-display font-bold text-slate-900 dark:text-white text-lg tracking-wide capitalize truncate">
                          {getMonthName(entry.month)}
                        </span>
                        <div className="month-chip-row flex items-center gap-1 mt-1 flex-nowrap overflow-x-auto custom-scrollbar min-w-0 pr-2">
                          {statusPill}
                          {compactMode &&
                            entry.isInEmployment &&
                            salaryDueDate &&
                            dueBadge(
                              'salary',
                              isOverdueSalary
                                ? 'overdue'
                                : isSalaryLatePaid
                                  ? 'late'
                                  : isSalaryPaid
                                    ? 'ok'
                                    : 'due',
                              `Salário: ${isSalaryPaid ? 'pago' : 'pendente'} • Vence ${salaryDueDate.toLocaleDateString(
                                'pt-BR'
                              )}`
                            )}
                          {compactMode &&
                            dueBadge(
                              'bonus',
                              isOverdueBonus
                                ? 'overdue'
                                : isBonusLatePaid
                                  ? 'late'
                                  : isBonusPaid
                                    ? 'ok'
                                    : 'due',
                              bonusDueDate
                                ? `Bônus: ${isBonusPaid ? 'pago' : 'pendente'} • Vence ${bonusDueDate.toLocaleDateString(
                                    'pt-BR'
                                  )}`
                                : `Bônus: ${isBonusPaid ? 'pago' : 'pendente'}`
                            )}
                          {compactMode &&
                            entry.payment13th &&
                            dueBadge(
                              'thirteenth',
                              isOverdue13th
                                ? 'overdue'
                                : is13thLatePaid
                                  ? 'late'
                                  : is13thPaid
                                    ? 'ok'
                                    : 'due',
                              thirteenthDueDate
                                ? `13º: ${is13thPaid ? 'pago' : 'pendente'} • Vence ${thirteenthDueDate.toLocaleDateString(
                                    'pt-BR'
                                  )}`
                                : `13º: ${is13thPaid ? 'pago' : 'pendente'}`
                            )}
                          {compactMode && entry.bonusCarryDue > 0 && (
                            <span
                              className="inline-flex items-center justify-center h-5 text-[10px] font-bold text-red-200 bg-red-500/10 border border-red-500/20 rounded px-1.5 whitespace-nowrap"
                              title={`Carry vencido: ${formatCurrency(entry.bonusCarryDue)}`}
                            >
                              CARRY
                            </span>
                          )}
                          {entry.variations && entry.variations.length > 0 && (
                            <span className="text-[10px] font-bold border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-200">
                              {entry.variations.length}
                            </span>
                          )}
                          {entry.isVacation && (
                            <span className="text-[10px] font-bold border border-orange-500/20 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-200">
                              Férias
                            </span>
                          )}
                          {entry.is13th1st && (
                            <span className="text-[10px] font-bold border border-primary/20 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              13º-1
                            </span>
                          )}
                          {entry.is13th2nd && (
                            <span className="text-[10px] font-bold border border-primary/20 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              13º-2
                            </span>
                          )}
                          {lastPaymentDate && (
                            <span className="inline-flex items-center h-6 text-[10px] text-slate-600 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
                              {new Date(`${lastPaymentDate}T12:00:00`).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        {!compactMode && (
                          <div className="mt-2 space-y-0.5">
                            {(isOverdueSalary || isOverdueBonus || isOverdue13th) && (
                              <div className="text-[10px] text-accent font-bold">ATRASADO</div>
                            )}
                            {salaryDueDate && !isSalaryPaid && !isOverdueSalary && (
                              <div className="text-[10px] text-secondary">
                                Salário vence {salaryDueDate.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {salaryDueDate && isOverdueSalary && (
                              <div className="text-[10px] text-accent">
                                Salário venceu {salaryDueDate.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {isSalaryLatePaid && (
                              <div className="text-[10px] text-orange-200 font-bold">
                                Salário pago em atraso
                              </div>
                            )}

                            {hasCarryOverdue && (
                              <div className="text-[10px] text-accent">
                                Bônus vencido (carry): {formatCurrency(entry.bonusCarryDue)}
                              </div>
                            )}
                            {!isOverdueBonus && bonusDueDate && !isBonusPaid && (
                              <div className="text-[10px] text-secondary">
                                Bônus vence {bonusDueDate.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {isOverdueBonus && bonusDueDate && (
                              <div className="text-[10px] text-accent">
                                Bônus venceu {bonusDueDate.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {isBonusLatePaid && (
                              <div className="text-[10px] text-orange-200 font-bold">
                                Bônus pago em atraso
                              </div>
                            )}

                            {!isOverdue13th && thirteenthDueDate && !is13thPaid && (
                              <div className="text-[10px] text-secondary">
                                13º vence {thirteenthDueDate.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {isOverdue13th && thirteenthDueDate && (
                              <div className="text-[10px] text-accent">
                                13º venceu {thirteenthDueDate.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {is13thLatePaid && (
                              <div className="text-[10px] text-orange-200 font-bold">
                                13º pago em atraso
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Target Net */}
                    <div className="col-span-2 flex flex-col items-end justify-center opacity-90">
                      <div
                        className={cn(
                          'w-full max-w-[180px] px-3 py-1.5 rounded border transition-all cursor-text',
                          'bg-transparent border-transparent shadow-none',
                          'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:border-black/20 dark:hover:border-white/20',
                          'focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/40',
                          entry.isInEmployment
                            ? ''
                            : 'bg-slate-200/50 dark:bg-black/50 border-black/15 dark:border-white/10 border-dashed opacity-70 saturate-0'
                        )}
                      >
                        <CurrencyInput
                          value={entry.targetNet}
                          onValueChange={val => handleSalaryChange(entry, val)}
                          disabled={!entry.isInEmployment}
                          className={cn(
                            'bg-transparent border-transparent focus:ring-0 focus:border-transparent p-0 shadow-none',
                            'text-slate-900 dark:text-white font-mono font-bold tabular-nums w-full',
                            !entry.isInEmployment && 'opacity-70'
                          )}
                        />
                      </div>
                      {!entry.isInEmployment && (
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">
                          Fora do contrato
                        </span>
                      )}
                      {!compactMode &&
                        entry.isInEmployment &&
                        entry.proRataFactor > 0 &&
                        entry.proRataFactor < 1 && (
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-mono tabular-nums">
                            Pró-rata {entry.daysWorked}/30:{' '}
                            {formatCurrency(entry.targetNetProrated)}
                          </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-center gap-1 text-slate-600 dark:text-slate-500">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          if (actionsMenuMonth === entry.month) closeActionsMenu();
                          else openActionsMenu(entry.month, e.currentTarget);
                        }}
                        className={cn(
                          'p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed',
                          'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        )}
                        title="Mais acoes"
                        aria-haspopup="menu"
                        aria-expanded={actionsMenuMonth === entry.month}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      <button
                        onClick={() => toggleVacation(entry.month)}
                        disabled={!entry.isInEmployment}
                        className={cn(
                          'p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed',
                          !entry.isInEmployment && 'opacity-50 cursor-not-allowed',
                          entry.isVacation
                            ? 'bg-orange-500/15 text-orange-200 border border-orange-500/25'
                            : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-orange-700 dark:hover:text-orange-200'
                        )}
                        title={entry.isVacation ? 'Remover Férias' : 'Marcar Férias (+1/3)'}
                      >
                        <span className="font-bold text-xs">F</span>
                      </button>
                      {entry.month === 11 && (
                        <button
                          onClick={() => toggle13th(entry.month, 1)}
                          disabled={!entry.isInEmployment}
                          className={cn(
                            'p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed',
                            !entry.isInEmployment && 'opacity-50 cursor-not-allowed',
                            entry.is13th1st
                              ? 'bg-primary/15 text-primary border border-primary/25'
                              : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-primary'
                          )}
                          title="Pagar 1ª Parcela 13º"
                        >
                          <span className="font-bold text-xs">13.1</span>
                        </button>
                      )}
                      {entry.month === 12 && (
                        <button
                          onClick={() => toggle13th(entry.month, 2)}
                          disabled={!entry.isInEmployment}
                          className={cn(
                            'p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-light dark:focus-visible:ring-offset-background-dark disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed',
                            !entry.isInEmployment && 'opacity-50 cursor-not-allowed',
                            entry.is13th2nd
                              ? 'bg-primary/15 text-primary border border-primary/25'
                              : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-primary'
                          )}
                          title="Pagar 2ª Parcela 13º"
                        >
                          <span className="font-bold text-xs">13.2</span>
                        </button>
                      )}
                    </div>

                    <div className="col-span-2 text-right font-mono tabular-nums text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatCurrency(entry.grossSalary)}
                    </div>
                    <div className="col-span-2 text-right font-mono tabular-nums text-sm text-accent whitespace-nowrap">
                      {formatCurrency(employeeTaxes)}
                    </div>
                    <div className="col-span-1 text-right font-mono tabular-nums text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {viewMode === 'caixa'
                        ? formatCurrency(entry.dae)
                        : formatCurrency(entry.provisions)}
                    </div>
                    <div className="col-span-2 text-right font-mono tabular-nums whitespace-nowrap text-slate-900 dark:text-white font-bold text-sm tracking-tight">
                      {formatCurrency(entry.toPay)}
                    </div>
                    <div className="col-span-2 text-right font-mono tabular-nums whitespace-nowrap text-secondary font-bold text-sm tracking-tight">
                      {formatCurrency(entry.runningBalance)}
                    </div>
                  </div>

                  <AnimatedCollapse open={isExpanded} durationMs={260}>
                    <div className="glass-panel border-t-0 rounded-b-lg p-6 mt-[-5px] pt-8 grid grid-cols-1 gap-6 relative z-10 bg-white/60 dark:bg-black/60 data-stream-bg border-b-2 border-b-primary/30">
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 shadow-[0_0_10px_#8b5cf6]" />
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                        Detalhamento Financeiro
                      </h4>
                      <AuditPanel
                        entry={entry}
                        viewMode={viewMode}
                        dependents={employee.dependents}
                      />
                    </div>
                  </AnimatedCollapse>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {actionsMenuMonth != null &&
        createPortal(
          <div
            ref={actionsMenuRef}
            role="menu"
            className={cn(
              'fixed z-50 min-w-[220px] rounded-lg glass-panel border border-black/10 dark:border-white/10 bg-white/85 dark:bg-black/60 backdrop-blur-md',
              'shadow-xl shadow-black/10 dark:shadow-black/40',
              !actionsMenuPos && 'opacity-0 pointer-events-none'
            )}
            style={
              actionsMenuPos
                ? { top: actionsMenuPos.top, left: actionsMenuPos.left }
                : { top: 0, left: 0 }
            }
          >
            <div className="p-1">
              <button
                type="button"
                role="menuitem"
                disabled={actionsMenuDisabled}
                onClick={() => {
                  if (actionsMenuDisabled) return;
                  setEditingExtrasMonth(actionsMenuMonth);
                  closeActionsMenu();
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-sm transition-colors text-left',
                  actionsMenuDisabled
                    ? 'opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-300'
                    : 'text-slate-800 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10'
                )}
              >
                <span className="font-medium">Extras/Descontos</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">...</span>
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={actionsMenuDisabled}
                onClick={() => {
                  if (actionsMenuDisabled) return;
                  toggleHoliday(actionsMenuMonth!);
                  closeActionsMenu();
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-sm transition-colors text-left',
                  actionsMenuDisabled
                    ? 'opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-300'
                    : cn(
                        'hover:bg-black/5 dark:hover:bg-white/10',
                        actionsMenuEntry?.workedHoliday
                          ? 'text-purple-700 dark:text-purple-200'
                          : 'text-slate-800 dark:text-slate-100'
                      )
                )}
              >
                <span className="font-medium">Feriado Trabalhado</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center h-6 px-2 rounded border text-[10px] font-bold select-none whitespace-nowrap',
                    actionsMenuEntry?.workedHoliday
                      ? 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-200'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 text-slate-700 dark:text-slate-200'
                  )}
                >
                  H
                </span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
