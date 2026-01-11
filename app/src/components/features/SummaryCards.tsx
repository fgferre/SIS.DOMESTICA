import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/utils';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { AmbientWebGL2 } from '@/components/ui/AmbientWebGL2';
import { useState } from 'react';
import type { MouseEvent } from 'react';

export function SummaryCards() {
  const { years, activeYear } = usePayrollStore();
  const currentYearData = years[activeYear];
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  if (!currentYearData) return null;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    setMouse({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

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
    const legacyAdvance = payments.some(p => p.kind === 'bonus') ? 0 : (e.anticipatedBonus || 0);
    return acc + paid + legacyAdvance;
  }, 0);
  const julScheduled = currentYearData.ledger[6]?.scheduledBonusPayout || 0;
  const decScheduled = currentYearData.ledger[11]?.scheduledBonusPayout || 0;

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      onMouseMove={onMove}
      onMouseLeave={() => setMouse({ x: 0.5, y: 0.5 })}
    >
      <AmbientWebGL2 opacity={0.12} mouse={mouse} />
      <div className="relative grid gap-4 md:grid-cols-4 p-1">
      <Card className="transition-transform will-change-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo CLT (Simulado)</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          <p className="text-xs text-muted-foreground">Líquido + DAE (para auditoria)</p>
        </CardContent>
      </Card>

      <Card className="transition-transform will-change-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pote de Bônus (Saldo)</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(bonusBalance)}</div>
          <p className="text-xs text-muted-foreground">FGTS (100%) + impostos economizados (50%)</p>
        </CardContent>
      </Card>

      <Card className="transition-transform will-change-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média Salário Líquido</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(currentYearData.ledger.reduce((a, b) => a + b.netSalary, 0) / 12)}
          </div>
          <p className="text-xs text-muted-foreground">Média mensal paga no bolso</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 transition-transform will-change-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos do Pote</CardTitle>
          <PiggyBank className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xs space-y-0.5 text-gray-600">
            <div className="flex justify-between">
              <span>Gerado (Ano):</span>
              <span>{formatCurrency(totalBonusGenerated)}</span>
            </div>
            <div className="flex justify-between">
              <span>Devido (Ano):</span>
              <span>{formatCurrency(totalBonusDue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pago (Ano):</span>
              <span>{formatCurrency(totalBonusPaid)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span>Agendado (01/jul):</span>
              <span>{formatCurrency(julScheduled)}</span>
            </div>
            <div className="flex justify-between">
              <span>Agendado (31/dez):</span>
              <span>{formatCurrency(decScheduled)}</span>
            </div>
          </div>
          <div className="text-xl font-bold text-blue-900 border-t pt-2">{formatCurrency(bonusBalance)}</div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
