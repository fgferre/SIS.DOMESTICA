import { LedgerEntry } from '@/types/payroll';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/utils';
import { getTaxTableForDate } from '@/core/taxTables';
import { getINSSBreakdown, getIRRFBreakdown } from '@/core/payroll';

interface AuditPanelProps {
  entry: LedgerEntry;
  viewMode: 'caixa' | 'competencia';
  dependents: number;
}

export function AuditPanel({ entry, viewMode, dependents }: AuditPanelProps) {
  const breakdown = entry.bonusBreakdown;
  const date = new Date(entry.year, entry.month - 1, 1);
  const table = getTaxTableForDate(date);
  const provisionsBase = entry.grossSalary / 12 + entry.grossSalary / 3 / 12 + entry.grossSalary / 12;
  const employerChargesRate =
    table.employerCharges.inssPatronal +
    table.employerCharges.fgtsDeposit +
    table.employerCharges.fgtsFine +
    table.employerCharges.sat;

  const provisionsCharges = {
    inssPatronal: Number((provisionsBase * table.employerCharges.inssPatronal).toFixed(2)),
    sat: Number((provisionsBase * table.employerCharges.sat).toFixed(2)),
    fgtsDeposit: Number((provisionsBase * table.employerCharges.fgtsDeposit).toFixed(2)),
    fgtsFine: Number((provisionsBase * table.employerCharges.fgtsFine).toFixed(2)),
  };
  const provisionsChargesTotal = Number(
    (
      provisionsCharges.inssPatronal +
      provisionsCharges.sat +
      provisionsCharges.fgtsDeposit +
      provisionsCharges.fgtsFine
    ).toFixed(2)
  );
  const provisionsTotalCalculated = Number((provisionsBase + provisionsChargesTotal).toFixed(2));

  const splitBaseSafe =
    breakdown && Number.isFinite(breakdown.splitBase)
      ? breakdown.splitBase
      : breakdown
        ? breakdown.inssPatronal + breakdown.sat + breakdown.inssEmployee + breakdown.irrfEmployee
        : 0;

  const bonusDueDate =
    entry.scheduledBonusPayout > 0
      ? entry.month === 7
        ? new Date(entry.year, 6, 1, 12, 0, 0)
        : entry.month === 12
          ? new Date(entry.year, 11, 31, 12, 0, 0)
          : undefined
      : undefined;

  if (viewMode === 'caixa') {
    const inssDetail = entry.grossSalary > 0 ? getINSSBreakdown(entry.grossSalary, date) : undefined;
    const irrfDetail =
      entry.grossSalary > 0
        ? getIRRFBreakdown(entry.grossSalary, entry.inssEmployee, dependents, date)
        : undefined;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coluna 1: Raio-X da Guia DAE */}
        <Card className="bg-purple-50 border-l-4 border-l-purple-500">
          <CardContent className="pt-4 space-y-2 text-sm">
            <h4 className="font-bold text-purple-800 border-b border-purple-200 pb-1 mb-2">
              Raio-X da Guia DAE (Boleto)
            </h4>
            <p className="text-[10px] text-purple-600 mb-2">
              Composição exata do valor a pagar no eSocial
            </p>
            {breakdown ? (
              <>
                <div className="flex justify-between text-purple-700">
                  <span>(+) INSS Patronal (8%):</span>
                  <span>{formatCurrency(breakdown.inssPatronal)}</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span>(+) FGTS Depósito (8%):</span>
                  <span>{formatCurrency(breakdown.fgtsDeposit)}</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span>(+) FGTS Multa (3.2%):</span>
                  <span>{formatCurrency(breakdown.fgtsFineRef)}</span>
                </div>
                <div className="flex justify-between text-purple-700">
                  <span>(+) Seguro SAT (0.8%):</span>
                  <span>{formatCurrency(breakdown.sat)}</span>
                </div>
                <div className="my-1 border-t border-dashed border-purple-200"></div>
                <div className="flex justify-between text-red-600">
                  <span>(+) INSS Empregado (Retido):</span>
                  <span>{formatCurrency(entry.inssEmployee)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>(+) IRRF Empregado (Retido):</span>
                  <span>{formatCurrency(entry.irrfEmployee)}</span>
                </div>

                {inssDetail && inssDetail.items.length > 0 && (
                  <details className="mt-2" open>
                    <summary className="cursor-pointer text-[10px] text-purple-700">
                      Detalhe INSS (por faixa)
                    </summary>
                    <div className="mt-2 space-y-1 text-[10px] text-purple-700">
                      {inssDetail.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {formatCurrency(it.base)} @ {(it.rate * 100).toFixed(1)}%
                          </span>
                          <span>{formatCurrency(it.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {irrfDetail && (
                  <details className="mt-2" open>
                    <summary className="cursor-pointer text-[10px] text-purple-700">
                      Detalhe IRRF ({irrfDetail.method === 'simplified' ? 'simplificado' : 'legal'})
                    </summary>
                    <div className="mt-2 space-y-1 text-[10px] text-purple-700">
                      <div className="flex justify-between">
                        <span>Base legal:</span>
                        <span>{formatCurrency(irrfDetail.legalBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base simplificada:</span>
                        <span>{formatCurrency(irrfDetail.simplifiedBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base escolhida:</span>
                        <span>{formatCurrency(irrfDetail.chosenBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alíquota:</span>
                        <span>{(irrfDetail.rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parcela a deduzir:</span>
                        <span>{formatCurrency(irrfDetail.deduction)}</span>
                      </div>
                    </div>
                  </details>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-purple-200 mt-2 bg-purple-100 p-1 rounded">
                  <span>= Valor Total da Guia:</span>
                  <span>{formatCurrency(entry.dae)}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-xs">Insira um salário para calcular</p>
            )}
          </CardContent>
        </Card>

        {/* Coluna 2: Composição do Pagamento */}
        <Card className="bg-slate-50 border-l-4 border-l-slate-500">
          <CardContent className="pt-4 space-y-2 text-sm">
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Composição do Pagamento
            </h4>
            <div className="flex justify-between">
              <span>Líquido Base:</span>
              <span className="font-bold">{formatCurrency(entry.targetNet)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bruto Calculado:</span>
              <span>{formatCurrency(entry.grossSalary)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>(-) INSS + IRRF:</span>
              <span>{formatCurrency(entry.inssEmployee + entry.irrfEmployee)}</span>
            </div>
            {entry.bonusPayout > 0 && (
              <>
                {bonusDueDate && (
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Venc. bônus:</span>
                    <span>{bonusDueDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span>Salário/Extras:</span>
                  <span>{formatCurrency(entry.toPayBase)}</span>
                </div>
                {(entry.bonusCarryDue > 0 ||
                  entry.scheduledBonusPayout > 0 ||
                  (entry.anticipatedBonus || 0) > 0 ||
                  entry.terminationPayout > 0) && (
                  <div className="mt-1 space-y-0.5 text-[10px] text-gray-500">
                    {entry.bonusCarryDue > 0 && (
                      <div className="flex justify-between">
                        <span>Bônus vencido (carry):</span>
                        <span>{formatCurrency(entry.bonusCarryDue)}</span>
                      </div>
                    )}
                    {entry.scheduledBonusPayout > 0 && (
                      <div className="flex justify-between">
                        <span>Parcela agendada:</span>
                        <span>{formatCurrency(entry.scheduledBonusPayout)}</span>
                      </div>
                    )}
                    {(entry.anticipatedBonus || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Antecipação:</span>
                        <span>{formatCurrency(entry.anticipatedBonus || 0)}</span>
                      </div>
                    )}
                    {entry.terminationPayout > 0 && (
                      <div className="flex justify-between">
                        <span>Quitação rescisão (pote):</span>
                        <span>{formatCurrency(entry.terminationPayout)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-blue-700 font-medium">
                  <span>(+) Bônus+FGTS (pote):</span>
                  <span>{formatCurrency(entry.bonusPayout)}</span>
                </div>
              </>
            )}
            {entry.terminationFine > 0 && (
              <div className="flex justify-between text-red-700 font-medium">
                <span>(+) Multa FGTS 40% (rescisão):</span>
                <span>{formatCurrency(entry.terminationFine)}</span>
              </div>
            )}
            {entry.terminationEntitlementsNet > 0 && (
              <div className="mt-1 space-y-0.5 text-[10px] text-red-700">
                <div className="flex justify-between font-medium">
                  <span>(+) Verbas Proporcionais (rescisão):</span>
                  <span>{formatCurrency(entry.terminationEntitlementsNet)}</span>
                </div>
                {entry.terminationEntitlements && (
                  <div className="pl-2 space-y-0.5 text-[10px] text-gray-600">
                    <div className="flex justify-between">
                      <span>Férias prop.:</span>
                      <span>{formatCurrency(entry.terminationEntitlements.vacationNet)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1/3 prop.:</span>
                      <span>{formatCurrency(entry.terminationEntitlements.oneThirdNet)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>13º prop.:</span>
                      <span>{formatCurrency(entry.terminationEntitlements.thirteenthNet)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-200 pt-2 mt-2">
              <span>A Pagar:</span>
              <span>{formatCurrency(entry.toPay)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 3: Memória do Bônus */}
        <Card className="bg-emerald-50 border-l-4 border-l-emerald-500">
          <CardContent className="pt-4 space-y-2 text-sm">
            <h4 className="font-bold text-emerald-800 border-b border-emerald-200 pb-1 mb-2">
              Memória do Bônus
            </h4>
            {breakdown ? (
              <>
                <div className="flex justify-between text-emerald-700 font-medium border-b border-emerald-100 pb-1 mb-1">
                  <span>1. FGTS Depósito (100%):</span>
                  <span className="font-bold">{formatCurrency(breakdown.fgtsDeposit)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>FGTS Multa legal (ref DAE):</span>
                  <span>{formatCurrency(breakdown.fgtsFineRef)}</span>
                </div>

                <div className="text-xs text-gray-500 mt-2 mb-1">2. Economia (Governo) e Split</div>
                <div className="pl-2 text-xs space-y-1 text-emerald-600 border-l-2 border-emerald-100">
                  <div className="flex justify-between">
                    <span>Economia Empregador (INSS+SAT):</span>
                    <span>{formatCurrency(breakdown.inssPatronal + breakdown.sat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economia Empregado (INSS+IRRF):</span>
                    <span>{formatCurrency(breakdown.inssEmployee + breakdown.irrfEmployee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economia Total (Governo):</span>
                    <span>{formatCurrency(splitBaseSafe)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Bônus sobre Economia (50%):</span>
                    <span>+ {formatCurrency(breakdown.taxSplit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economia Retida Empregador:</span>
                    <span>{formatCurrency(splitBaseSafe - breakdown.taxSplit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FGTS (Depósito - entra no bônus):</span>
                    <span>{formatCurrency(breakdown.fgtsDeposit)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Benefício Empregada (Bônus+FGTS):</span>
                    <span>{formatCurrency(breakdown.fgtsDeposit + breakdown.taxSplit)}</span>
                  </div>

                  <details className="mt-2" open>
                    <summary className="cursor-pointer text-[10px] text-emerald-700">
                      Impostos/FGTS (linha a linha)
                    </summary>
                    <div className="mt-2 space-y-1 text-[10px] text-emerald-700">
                      <div className="flex justify-between">
                        <span>INSS Patronal:</span>
                        <span>{formatCurrency(breakdown.inssPatronal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SAT:</span>
                        <span>{formatCurrency(breakdown.sat)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>INSS Empregado:</span>
                        <span>{formatCurrency(breakdown.inssEmployee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IRRF Empregado:</span>
                        <span>{formatCurrency(breakdown.irrfEmployee)}</span>
                      </div>
                      <div className="my-1 border-t border-dashed border-emerald-200"></div>
                      <div className="flex justify-between">
                        <span>FGTS Depósito:</span>
                        <span>{formatCurrency(breakdown.fgtsDeposit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FGTS Multa:</span>
                        <span>{formatCurrency(breakdown.fgtsFineRef)}</span>
                      </div>
                      <div className="my-1 border-t border-dashed border-emerald-200"></div>
                      <div className="flex justify-between">
                        <span>Provisões (informativo):</span>
                        <span>{formatCurrency(breakdown.provisionsTotal)}</span>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="flex justify-between font-bold text-emerald-800 bg-emerald-100 p-1 rounded mt-2 text-sm border border-emerald-200">
                  <span>Total Pote (1 + 2):</span>
                  <span>{formatCurrency(entry.monthlyBonus)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-emerald-900 border-t border-emerald-200 pt-2 mt-2">
                  <span>Acumulado:</span>
                  <span>{formatCurrency(entry.runningBalance)}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-xs">Insira um salário para calcular</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Visão Competência
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Coluna 1: Provisões */}
      <Card className="bg-orange-50 border-l-4 border-l-orange-500">
        <CardContent className="pt-4 space-y-2 text-sm">
          <h4 className="font-bold text-orange-800 border-b border-orange-200 pb-1 mb-2">
            Detalhe das Provisões
          </h4>
          <p className="text-[10px] text-orange-600 mb-2">
            Valores mensais "invisíveis" (Passivo Trabalhista)
          </p>
          <div className="flex justify-between text-orange-700">
            <span>(+) Férias (1/12):</span>
            <span>{formatCurrency(entry.grossSalary / 12)}</span>
          </div>
          <div className="flex justify-between text-orange-700">
            <span>(+) 1/3 Férias (1/12):</span>
            <span>{formatCurrency(entry.grossSalary / 3 / 12)}</span>
          </div>
          <div className="flex justify-between text-orange-700">
            <span>(+) 13º Salário (1/12):</span>
            <span>{formatCurrency(entry.grossSalary / 12)}</span>
          </div>
          <details className="mt-2" open>
            <summary className="cursor-pointer text-[10px] text-purple-700">
              Encargos s/ Provisões (detalhado)
            </summary>
            <div className="mt-2 space-y-1 text-[10px] text-purple-700">
              <div className="flex justify-between">
                <span>Base provisões:</span>
                <span>{formatCurrency(provisionsBase)}</span>
              </div>
              <div className="flex justify-between">
                <span>(+) INSS Patronal:</span>
                <span>{formatCurrency(provisionsCharges.inssPatronal)}</span>
              </div>
              <div className="flex justify-between">
                <span>(+) SAT:</span>
                <span>{formatCurrency(provisionsCharges.sat)}</span>
              </div>
              <div className="flex justify-between">
                <span>(+) FGTS Depósito:</span>
                <span>{formatCurrency(provisionsCharges.fgtsDeposit)}</span>
              </div>
              <div className="flex justify-between">
                <span>(+) FGTS Multa:</span>
                <span>{formatCurrency(provisionsCharges.fgtsFine)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total encargos:</span>
                <span>{formatCurrency(provisionsChargesTotal)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-purple-200 pt-1 mt-1">
                <span>Alíquota efetiva:</span>
                <span>{(employerChargesRate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </details>
          <div className="flex justify-between font-bold pt-2 border-t border-orange-200 mt-2 bg-orange-100 p-1 rounded">
            <span>= Custo Oculto Mensal:</span>
            <span>{formatCurrency(entry.provisions)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-orange-700">
            <span>Total (recalculado UI):</span>
            <span>{formatCurrency(provisionsTotalCalculated)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-orange-700">
            <span>Diferença:</span>
            <span>{formatCurrency(Number((entry.provisions - provisionsTotalCalculated).toFixed(2)))}</span>
          </div>
        </CardContent>
      </Card>

      {/* Coluna 2: Custo Total */}
      <Card className="bg-slate-50 border-l-4 border-l-slate-500">
        <CardContent className="pt-4 space-y-2 text-sm">
          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">
            Custo Empresa Total
          </h4>
          <div className="flex justify-between">
            <span>Salário Bruto:</span>
            <span>{formatCurrency(entry.grossSalary)}</span>
          </div>
            {breakdown && (
              <div className="flex justify-between">
                <span>Encargos Imediatos (DAE):</span>
                <span>
                {formatCurrency(
                  breakdown.inssPatronal + breakdown.sat + breakdown.fgtsDeposit + breakdown.fgtsFineRef
                )}
                </span>
              </div>
            )}
          <div className="flex justify-between text-orange-600 font-bold">
            <span>Provisões Futuras:</span>
            <span>{formatCurrency(entry.provisions)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-200 pt-2 mt-2">
            <span>Total Competência:</span>
              <span>
                {formatCurrency(
                  entry.grossSalary +
                  (breakdown
                    ? breakdown.inssPatronal + breakdown.sat + breakdown.fgtsDeposit + breakdown.fgtsFineRef
                    : 0) +
                  entry.provisions
                )}
              </span>
            </div>
        </CardContent>
      </Card>

      {/* Coluna 3: Bônus */}
      <Card className="bg-emerald-50 border-l-4 border-l-emerald-500">
        <CardContent className="pt-4 space-y-2 text-sm">
          <h4 className="font-bold text-emerald-800 border-b border-emerald-200 pb-1 mb-2">
            Memória do Bônus
          </h4>
            {breakdown ? (
              <>
                <div className="flex justify-between text-xs border-b pb-1 mb-1 font-bold text-emerald-700">
                <span>1. FGTS Depósito (8%):</span>
                <span>{formatCurrency(breakdown.fgtsDeposit)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>FGTS Multa legal (ref DAE):</span>
                  <span>{formatCurrency(breakdown.fgtsFineRef)}</span>
                </div>

              <div className="text-xs text-gray-500 mt-2 mb-1 border-t pt-1">
                2. Economia (Governo) e Split:
              </div>
              <div className="pl-2 space-y-1 text-[10px] text-emerald-600 border-l border-emerald-200">
                <div className="flex justify-between">
                  <span>Economia Empregador (INSS+SAT):</span>
                  <span>{formatCurrency(breakdown.inssPatronal + breakdown.sat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Economia Empregado (INSS+IRRF):</span>
                  <span>{formatCurrency(breakdown.inssEmployee + breakdown.irrfEmployee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Economia Total (Governo):</span>
                  <span>{formatCurrency(splitBaseSafe)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Bônus sobre Economia (50%):</span>
                  <span>+ {formatCurrency(breakdown.taxSplit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Economia Retida Empregador:</span>
                  <span>{formatCurrency(splitBaseSafe - breakdown.taxSplit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>FGTS (Depósito - entra no bônus):</span>
                  <span>{formatCurrency(breakdown.fgtsDeposit)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Benefício Empregada (Bônus+FGTS):</span>
                  <span>{formatCurrency(breakdown.fgtsDeposit + breakdown.taxSplit)}</span>
                </div>

                <details className="mt-2" open>
                  <summary className="cursor-pointer text-[10px] text-emerald-700">
                    Impostos/FGTS (linha a linha)
                  </summary>
                  <div className="mt-2 space-y-1 text-[10px] text-emerald-700">
                    <div className="flex justify-between">
                      <span>INSS Patronal:</span>
                      <span>{formatCurrency(breakdown.inssPatronal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SAT:</span>
                      <span>{formatCurrency(breakdown.sat)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INSS Empregado:</span>
                      <span>{formatCurrency(breakdown.inssEmployee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IRRF Empregado:</span>
                      <span>{formatCurrency(breakdown.irrfEmployee)}</span>
                    </div>
                    <div className="my-1 border-t border-dashed border-emerald-200"></div>
                    <div className="flex justify-between">
                      <span>FGTS Depósito:</span>
                      <span>{formatCurrency(breakdown.fgtsDeposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FGTS Multa:</span>
                      <span>{formatCurrency(breakdown.fgtsFineRef)}</span>
                    </div>
                    <div className="my-1 border-t border-dashed border-emerald-200"></div>
                    <div className="flex justify-between">
                      <span>Provisões (informativo):</span>
                      <span>{formatCurrency(breakdown.provisionsTotal)}</span>
                    </div>
                  </div>
                </details>
              </div>

              <div className="flex justify-between font-bold text-emerald-800 bg-emerald-100 p-1 rounded mt-2 text-sm border border-emerald-200">
                <span>Total Pote (1 + 2):</span>
                <span>{formatCurrency(entry.monthlyBonus)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-xs">Insira um salário para calcular</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
