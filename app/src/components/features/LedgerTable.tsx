import React, { useEffect, useRef, useState } from 'react';
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
  const {
    years,
    activeYear,
    employee,
    setTargetNet,
    toggleVacation,
    toggleHoliday,
    toggle13th,
  } = usePayrollStore();
  const { showToast } = useToast();
  const yearData = years[activeYear];

  const [viewMode, setViewMode] = useState<'caixa' | 'competencia'>('caixa');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [editingExtrasMonth, setEditingExtrasMonth] = useState<number | null>(null);
  const [editingPaymentsMonth, setEditingPaymentsMonth] = useState<number | null>(null);
  const [compactMode, setCompactMode] = useState(true);
  const today = new Date();
  const hasInitializedExpansion = useRef(false);

  const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  const isPast = (due: Date) => dateOnly(today).getTime() > dateOnly(due).getTime();
  const terminationDate = employee.terminationDate
    ? new Date(`${employee.terminationDate}T12:00:00`)
    : undefined;

  const handleSalaryChange = (entry: LedgerEntry, val: number) => {
    const minWage = getTaxTableForDate(new Date(activeYear, entry.month - 1, 1)).minimumWage;
    if (val < minWage * 0.9) {
      // Em meses pro-rata, o líquido pode ficar baixo naturalmente.
      if (entry.proRataFactor >= 1) {
        showToast('Atenção: Valor abaixo do Salário Mínimo!', 'warning');
      }
    }
    setTargetNet(entry.month, val);
  };

  const allMonths = yearData?.ledger.map(e => e.month) ?? [];
  const allExpanded = expandedRows.length === allMonths.length;
  const toggleExpandAll = () => {
    setExpandedRows(allExpanded ? [] : allMonths);
  };

  useEffect(() => {
    if (hasInitializedExpansion.current) return;
    if (!yearData) return;
    setExpandedRows(allMonths);
    hasInitializedExpansion.current = true;
  }, [allMonths, yearData]);

  if (!yearData) return <div>Carregando ano...</div>;

  const toggleExpand = (month: number) => {
    setExpandedRows(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const getMonthName = (month: number) => {
    return new Date(2025, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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

      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-semibold text-gray-700">Demonstrativo Financeiro {activeYear}</h2>
        <div className="flex space-x-2 text-sm items-center">
          <button
            onClick={toggleExpandAll}
            className="px-3 py-1 rounded transition-colors border border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            {allExpanded ? 'Recolher Tudo' : 'Expandir Tudo'}
          </button>
          <button
            onClick={() => setCompactMode(v => !v)}
            className={cn(
              'px-3 py-1 rounded transition-colors border',
              compactMode
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100'
                : 'border-gray-200 text-gray-600 hover:bg-gray-100'
            )}
            title="Alterna entre modo compacto e detalhado"
          >
            {compactMode ? 'Compacto' : 'Detalhado'}
          </button>
          <button
            onClick={() => setViewMode('caixa')}
            className={cn(
              'px-3 py-1 rounded transition-colors',
              viewMode === 'caixa'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            Visão Caixa
          </button>
          <button
            onClick={() => setViewMode('competencia')}
            className={cn(
              'px-3 py-1 rounded transition-colors',
              viewMode === 'competencia'
                ? 'bg-orange-100 text-orange-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            Visão Competência
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 font-medium border-b">
            <tr>
              <th className="p-3 w-8"></th>
              <th className="p-3">Mês</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Líquido Acordado</th>
              <th className="p-3 text-center w-[140px]">Ações</th>
              <th className="p-3 text-right hidden md:table-cell">Bruto Calc.</th>
              <th className="p-3 text-right hidden sm:table-cell text-red-600">INSS+IRRF (Desc)</th>
              <th className="p-3 text-right hidden md:table-cell">
                {viewMode === 'caixa' ? 'Guia DAE' : 'Provisão Total'}
              </th>
              <th className="p-3 text-right">A Pagar</th>
              <th className="p-3 text-right font-bold text-blue-600">Acúmulo Pote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
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
              const isOverdueSalary =
                salaryDueDate && !isSalaryPaid && isPast(salaryDueDate);
              const isOverdueBonus =
                hasCarryOverdue || (bonusDueDate && !isBonusPaid && isPast(bonusDueDate));
              const isOverdue13th =
                thirteenthDueDate && !is13thPaid && isPast(thirteenthDueDate);

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
                  'inline-flex items-center justify-center w-6 h-6 rounded border text-[10px] font-bold select-none';
                const cls =
                  state === 'overdue'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : state === 'late'
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : state === 'due'
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-500';

                const Icon =
                  kind === 'salary' ? CalendarDays : kind === 'bonus' ? PiggyBank : Gift;

                return (
                  <span title={title} className={cn(base, cls)}>
                    <Icon size={12} />
                  </span>
                );
              };

              return (
                <React.Fragment key={entry.month}>
                  <tr
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      isExpanded && 'bg-blue-50/30',
                      (isOverdueSalary || isOverdueBonus || isOverdue13th) &&
                        (compactMode ? 'border-l-4 border-red-300 bg-red-50/10' : 'bg-red-50/40')
                    )}
                  >
                    <td
                      className="p-3 text-center cursor-pointer"
                      onClick={() => toggleExpand(entry.month)}
                    >
                      <ChevronRight
                        size={16}
                        className={cn('transition-transform duration-200', isExpanded && 'rotate-90')}
                      />
                    </td>
                    <td className="p-3 font-medium capitalize text-gray-700">
                      <div className="flex items-center gap-2">
                        {getMonthName(entry.month)}
                        {!compactMode && entry.isInEmployment && entry.proRataFactor > 0 && entry.proRataFactor < 1 && (
                          <span
                            className="text-[10px] bg-gray-100 text-gray-600 px-1.5 rounded-full font-bold"
                            title={`Pró-rata ${entry.daysWorked}/30: ${formatCurrency(entry.targetNetProrated)}`}
                          >
                            PR {entry.daysWorked}/30
                          </span>
                        )}
                        {entry.variations && entry.variations.length > 0 && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full font-bold">
                            {entry.variations.length}
                          </span>
                        )}
                        {entry.isVacation && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded-full font-bold">
                            Férias
                          </span>
                        )}
                        {entry.is13th1st && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded-full font-bold">
                            13º-1
                          </span>
                        )}
                        {entry.is13th2nd && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded-full font-bold">
                            13º-2
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setEditingPaymentsMonth(entry.month)}
                        className={cn(
                          'text-xs font-bold px-2 py-1 rounded-full border transition-all w-24',
                          entry.status === 'paid'
                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-50'
                            : entry.status === 'partial'
                              ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                        )}
                      >
                        {!entry.isInEmployment
                          ? 'FORA'
                          : entry.status === 'paid'
                            ? 'PAGO'
                            : entry.status === 'partial'
                              ? 'PARCIAL'
                              : 'PENDENTE'}
                      </button>
                      {compactMode && (
                        <div className="mt-1 flex items-center gap-1">
                          {(isOverdueSalary || isOverdueBonus || isOverdue13th) && (
                            <span className="text-[10px] text-red-600 font-bold mr-1">!</span>
                          )}
                          {entry.isInEmployment &&
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
                              `Salário: ${isSalaryPaid ? 'pago' : 'pendente'} · Vence ${salaryDueDate.toLocaleDateString('pt-BR')}`
                            )}
                          {dueBadge(
                            'bonus',
                            isOverdueBonus
                              ? 'overdue'
                              : isBonusLatePaid
                                ? 'late'
                                : isBonusPaid
                                  ? 'ok'
                                  : 'due',
                            bonusDueDate
                              ? `Bônus: ${isBonusPaid ? 'pago' : 'pendente'} · Vence ${bonusDueDate.toLocaleDateString('pt-BR')}`
                              : `Bônus: ${isBonusPaid ? 'pago' : 'pendente'}`
                          )}
                          {entry.payment13th &&
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
                                ? `13º: ${is13thPaid ? 'pago' : 'pendente'} · Vence ${thirteenthDueDate.toLocaleDateString('pt-BR')}`
                                : `13º: ${is13thPaid ? 'pago' : 'pendente'}`
                            )}
                          {entry.bonusCarryDue > 0 && (
                            <span
                              className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 ml-1"
                              title={`Carry vencido: ${formatCurrency(entry.bonusCarryDue)}`}
                            >
                              CARRY
                            </span>
                          )}
                        </div>
                      )}
                      {!compactMode && (
                        <>
                      {(isOverdueSalary || isOverdueBonus || isOverdue13th) && (
                        <div className="text-[10px] text-red-600 mt-1 font-bold">ATRASADO</div>
                      )}
                      {salaryDueDate && !isSalaryPaid && !isOverdueSalary && (
                        <div className="text-[10px] text-blue-600 mt-1">
                          Salário vence {salaryDueDate.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {salaryDueDate && isOverdueSalary && (
                        <div className="text-[10px] text-red-600 mt-1">
                          Salário venceu {salaryDueDate.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {isSalaryLatePaid && (
                        <div className="text-[10px] text-orange-700 mt-1 font-bold">
                          Salário pago em atraso
                        </div>
                      )}
                      {isBonusLatePaid && (
                        <div className="text-[10px] text-orange-700 mt-1 font-bold">
                          B“nus pago em atraso
                        </div>
                      )}
                      {is13thLatePaid && (
                        <div className="text-[10px] text-orange-700 mt-1 font-bold">
                          13§ pago em atraso
                        </div>
                      )}
                      {hasCarryOverdue && (
                        <div className="text-[10px] text-red-600 mt-1">
                          Bônus vencido (carry): {formatCurrency(entry.bonusCarryDue)}
                        </div>
                      )}
                      {!isOverdueBonus && bonusDueDate && !isBonusPaid && (
                        <div className="text-[10px] text-blue-600 mt-1">
                          Bônus vence {bonusDueDate.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {isOverdueBonus && bonusDueDate && (
                        <div className="text-[10px] text-red-600 mt-1">
                          Bônus venceu {bonusDueDate.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {!isOverdue13th && thirteenthDueDate && !is13thPaid && (
                        <div className="text-[10px] text-blue-600 mt-1">
                          13º vence {thirteenthDueDate.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {isOverdue13th && thirteenthDueDate && (
                        <div className="text-[10px] text-red-600 mt-1">
                          13º venceu {thirteenthDueDate.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                        </>
                      )}
                      {lastPaymentDate && (
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(`${lastPaymentDate}T12:00:00`).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center justify-end gap-2">
                          <CurrencyInput
                            value={entry.targetNet}
                            onValueChange={val => handleSalaryChange(entry, val)}
                            disabled={!entry.isInEmployment}
                            className="bg-white border-blue-200 focus:border-blue-500 max-w-[100px] text-sm py-1"
                          />
                        </div>
                        {!compactMode && entry.isInEmployment && entry.proRataFactor > 0 && entry.proRataFactor < 1 && (
                          <div className="text-[10px] text-gray-500 font-mono tabular-nums">
                            Pró-rata {entry.daysWorked}/30: {formatCurrency(entry.targetNetProrated)}
                          </div>
                        )}
                        {!entry.isInEmployment && (
                          <div className="text-[10px] text-gray-400">Fora do contrato</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingExtrasMonth(entry.month)}
                          disabled={!entry.isInEmployment}
                          className={cn(
                            'p-1 rounded transition-colors',
                            entry.isInEmployment
                              ? 'hover:bg-gray-200 text-gray-400 hover:text-blue-600'
                              : 'opacity-50 cursor-not-allowed text-gray-300'
                          )}
                          title="Gerenciar Extras/Descontos"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        <button
                          onClick={() => toggleVacation(entry.month)}
                          disabled={!entry.isInEmployment}
                          className={cn(
                            'p-1 rounded transition-colors',
                            !entry.isInEmployment && 'opacity-50 cursor-not-allowed',
                            entry.isVacation
                              ? 'bg-orange-100 text-orange-600'
                              : 'hover:bg-gray-200 text-gray-400 hover:text-orange-500'
                          )}
                          title={entry.isVacation ? 'Remover Férias' : 'Marcar Férias (+1/3)'}
                        >
                          <span className="font-bold text-xs">F</span>
                        </button>
                        <button
                          onClick={() => toggleHoliday(entry.month)}
                          disabled={!entry.isInEmployment}
                          className={cn(
                            'p-1 rounded transition-colors',
                            !entry.isInEmployment && 'opacity-50 cursor-not-allowed',
                            entry.workedHoliday
                              ? 'bg-purple-100 text-purple-600'
                              : 'hover:bg-gray-200 text-gray-400 hover:text-purple-500'
                          )}
                          title={entry.workedHoliday ? 'Remover Feriado' : 'Feriado Trabalhado (+1 Dia)'}
                        >
                          <span className="font-bold text-xs">H</span>
                        </button>
                        {entry.month === 11 && (
                          <button
                            onClick={() => toggle13th(entry.month, 1)}
                            disabled={!entry.isInEmployment}
                            className={cn(
                              'p-1 rounded transition-colors',
                              !entry.isInEmployment && 'opacity-50 cursor-not-allowed',
                              entry.is13th1st
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'hover:bg-gray-200 text-gray-400 hover:text-indigo-500'
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
                              'p-1 rounded transition-colors',
                              !entry.isInEmployment && 'opacity-50 cursor-not-allowed',
                              entry.is13th2nd
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'hover:bg-gray-200 text-gray-400 hover:text-indigo-500'
                            )}
                            title="Pagar 2ª Parcela 13º"
                          >
                            <span className="font-bold text-xs">13.2</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right text-gray-500 hidden md:table-cell">
                      <span className="font-mono tabular-nums">{formatCurrency(entry.grossSalary)}</span>
                    </td>
                    <td className="p-3 text-right text-red-500 hidden sm:table-cell">
                      <span className="font-mono tabular-nums">{formatCurrency(employeeTaxes)}</span>
                    </td>
                    <td className="p-3 text-right hidden md:table-cell text-gray-600">
                      {viewMode === 'caixa'
                        ? <span className="font-mono tabular-nums">{formatCurrency(entry.dae)}</span>
                        : <span className="font-mono tabular-nums">{formatCurrency(entry.provisions)}</span>}
                    </td>
                    <td className="p-3 text-right font-bold text-gray-800">
                      <span className="font-mono tabular-nums">{formatCurrency(entry.toPay)}</span>
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      <span className="font-mono tabular-nums">{formatCurrency(entry.runningBalance)}</span>
                    </td>
                  </tr>

                  <tr aria-hidden={!isExpanded}>
                    <td colSpan={10} className="p-0">
                      <AnimatedCollapse open={isExpanded} durationMs={260}>
                        <div className="p-4 bg-gray-50/50 border-b-2 border-primary/10">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Detalhamento Financeiro
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <AuditPanel
                              entry={entry}
                              viewMode={viewMode}
                              dependents={employee.dependents}
                            />
                          </div>
                        </div>
                      </AnimatedCollapse>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
