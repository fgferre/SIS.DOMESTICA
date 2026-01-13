import { useMemo } from 'react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { formatCurrency } from '@/utils/utils';
import { TiltCard } from '@/components/ui/TiltCard';
import { Icon } from '@/components/ui/Icon';

export function SummaryCards() {
  const { years, activeYear } = usePayrollStore();
  const currentYearData = years[activeYear];

  const aggregates = useMemo(() => {
    if (!currentYearData) return null;

    const totalCost = currentYearData.ledger.reduce((acc, entry) => acc + (entry.netSalary + entry.dae), 0);
    const bonusBalance = currentYearData.ledger[currentYearData.ledger.length - 1].runningBalance;
    const totalBonusGenerated = currentYearData.ledger.reduce(
      (acc, e) => acc + e.monthlyBonus + (e.payment13th?.totalBonus || 0),
      0
    );
    const totalBonusDue = currentYearData.ledger.reduce((acc, e) => acc + (e.bonusPayout || 0), 0);
    const totalBonusPaid = currentYearData.ledger.reduce((acc, e) => {
      const payments = e.payments ?? [];
      const paid = payments
        .filter(p => p.kind === 'bonus')
        .reduce((a, p) => a + (Number(p.amount) || 0), 0);
      const legacyAdvance = payments.some(p => p.kind === 'bonus') ? 0 : e.anticipatedBonus || 0;
      return acc + paid + legacyAdvance;
    }, 0);
    const julScheduled = currentYearData.ledger[6]?.scheduledBonusPayout || 0;
    const decScheduled = currentYearData.ledger[11]?.scheduledBonusPayout || 0;

    return {
      totalCost,
      bonusBalance,
      totalBonusGenerated,
      totalBonusDue,
      totalBonusPaid,
      scheduled: julScheduled + decScheduled,
    };
  }, [currentYearData]);

  if (!currentYearData || !aggregates) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TiltCard
        surfaceClassName="glass-panel rounded-xl clip-corner border-l-4 border-l-accent relative group transition-all duration-300 hover:-translate-y-1 hover:bg-white/5"
        contentClassName="p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3 text-accent opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">
          <Icon name="trending_down" size={18} />
        </div>
        <h3 className="text-slate-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          Custo CLT (Simulado)
        </h3>
        <div className="text-3xl font-display font-black text-slate-900 dark:text-white group-hover:text-accent dark:group-hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.45)] transition-all">
          {formatCurrency(aggregates.totalCost)}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-2 uppercase tracking-wider">
          Líquido + DAE (auditoria)
        </p>
      </TiltCard>

      <TiltCard
        surfaceClassName="glass-panel rounded-xl clip-corner border-l-4 border-l-secondary relative group transition-all duration-300 hover:-translate-y-1 hover:bg-white/5"
        contentClassName="p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3 text-secondary opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">
          <Icon name="savings" size={18} />
        </div>
        <h3 className="text-slate-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          Pote de Bônus (Saldo)
        </h3>
        <div className="text-3xl font-display font-black text-slate-900 dark:text-white group-hover:text-secondary dark:group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.45)] transition-all">
          {formatCurrency(aggregates.bonusBalance)}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-2 uppercase tracking-wider">
          FGTS (100%) + impostos (50%)
        </p>
      </TiltCard>

      <TiltCard
        surfaceClassName="glass-panel rounded-xl clip-corner border-l-4 border-l-success relative group transition-all duration-300 hover:-translate-y-1 hover:bg-white/5"
        contentClassName="p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3 text-success opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">
          <Icon name="trending_up" size={18} />
        </div>
        <h3 className="text-slate-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          Média Salário Líquido
        </h3>
        <div className="text-3xl font-display font-black text-slate-900 dark:text-white group-hover:text-success dark:group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.45)] transition-all">
          {formatCurrency(currentYearData.ledger.reduce((a, b) => a + b.netSalary, 0) / 12)}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-2 uppercase tracking-wider">Média mensal no bolso</p>
      </TiltCard>

      <TiltCard
        surfaceClassName="glass-panel rounded-xl clip-corner border-l-4 border-l-primary relative group transition-all duration-300 hover:-translate-y-1 hover:bg-white/5"
        contentClassName="p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3 text-primary opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">
          <Icon name="pie_chart" size={18} />
        </div>
        <h3 className="text-slate-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          Fluxo do Pote
        </h3>
        <div className="space-y-1 mt-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-gray-500">Gerado (Ano):</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">
              {formatCurrency(aggregates.totalBonusGenerated)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-gray-500">Devido (Ano):</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">
              {formatCurrency(aggregates.totalBonusDue)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 dark:text-gray-500">Pago (Ano):</span>
            <span className="font-mono text-success font-bold">{formatCurrency(aggregates.totalBonusPaid)}</span>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-black/10 dark:border-white/10 mt-2">
            <span className="text-slate-700 dark:text-gray-400">Agendado (Jul/Dez):</span>
            <span className="font-mono text-primary font-bold bg-primary/10 px-1 rounded shadow-neon-purple">
              {formatCurrency(aggregates.scheduled)}
            </span>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
