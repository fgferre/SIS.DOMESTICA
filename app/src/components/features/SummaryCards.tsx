import { formatCurrency } from '@/utils/utils';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { TiltCard } from '@/components/ui/TiltCard';

export function SummaryCards() {
  const { years, activeYear } = usePayrollStore();
  const currentYearData = years[activeYear];

  if (!currentYearData) return null;

  // Calculate Aggregates
  const totalCost = currentYearData.ledger.reduce((acc, entry) => {
    // Cost to Employer = Gross + DAE - Employee Deductions (because they are paid to Gov via DAE, but withheld from Net)
    // Actually, Employer Cost = Gross + EmployerCharges.
    // DAE = EmployerCharges + EmployeeTaxes.
    // Net = Gross - EmployeeTaxes.
    // So Cost = Net + DAE.
    return acc + (entry.netSalary + entry.dae);
  }, 0);

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

  return (
    <div className="relative grid gap-4 md:grid-cols-4 p-1">
      <TiltCard className="glass-panel">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-gray-600">Custo CLT (Simulado)</span>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
            {formatCurrency(totalCost)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Líquido + DAE (para auditoria)</p>
        </div>
      </TiltCard>

      <TiltCard gradient="bg-gradient-to-br from-blue-400/20 to-indigo-400/20">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <span className="text-sm font-medium text-gray-700">Pote de Bônus (Saldo)</span>
          <PiggyBank className="h-4 w-4 text-blue-600" />
        </div>
        <div className="relative z-10">
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(bonusBalance)}</div>
          <p className="text-xs text-muted-foreground mt-1">FGTS (100%) + impostos (50%)</p>
        </div>
      </TiltCard>

      <TiltCard className="glass-panel">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-gray-600">Média Salário Líquido</span>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            {formatCurrency(currentYearData.ledger.reduce((a, b) => a + b.netSalary, 0) / 12)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Média mensal paga no bolso</p>
        </div>
      </TiltCard>

      <TiltCard className="glass-panel border-l-4 border-l-blue-400">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Fluxo do Pote</span>
          <PiggyBank className="h-4 w-4 text-blue-600" />
        </div>
        <div className="text-xs space-y-1.5 text-gray-600">
          <div className="flex justify-between">
            <span>Gerado (Ano):</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(totalBonusGenerated)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Devido (Ano):</span>
            <span className="font-semibold text-gray-800">{formatCurrency(totalBonusDue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pago (Ano):</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(totalBonusPaid)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200/50 pt-1.5 mt-1">
            <span>Agendado (Jul/Dez):</span>
            <span className="font-mono text-gray-700">
              {formatCurrency(julScheduled + decScheduled)}
            </span>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
