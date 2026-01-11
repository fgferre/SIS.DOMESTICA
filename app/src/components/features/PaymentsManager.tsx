import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import type { LedgerEntry, PaymentKind, PaymentMethod } from '@/types/payroll';
import { formatCurrency } from '@/utils/utils';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface PaymentsManagerProps {
  month: number;
  isOpen: boolean;
  onClose: () => void;
}

const KIND_LABEL: Record<PaymentKind, string> = {
  salary: 'Salário/Extras',
  thirteenth_1: '13º (1ª parcela)',
  thirteenth_2: '13º (2ª parcela)',
  bonus: 'Bônus/FGTS (Pote)',
  termination_fine: 'Multa FGTS 40% (Rescisão)',
  termination_entitlements: 'Verbas Proporcionais (Rescisão)',
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: 'PIX',
  transfer: 'Transferência',
  cash: 'Dinheiro',
  other: 'Outro',
};

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const parseISODateLocal = (iso?: string) => {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-').map(n => Number(n));
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, 12, 0, 0);
};

const computeDueByKind = (entry: LedgerEntry) => {
  const thirteenthNet = entry.payment13th?.net ?? 0;
  const salaryDue = Math.max(0, Number((entry.toPayBase - thirteenthNet).toFixed(2)));

  const thirteenth1Due =
    entry.payment13th?.type === 1 ? Math.max(0, Number(thirteenthNet.toFixed(2))) : 0;
  const thirteenth2Due =
    entry.payment13th?.type === 2 ? Math.max(0, Number(thirteenthNet.toFixed(2))) : 0;

  const bonusDue = Math.max(0, Number((entry.bonusPayout || 0).toFixed(2)));

  const terminationFineDue = Math.max(0, Number((entry.terminationFine || 0).toFixed(2)));
  const terminationEntitlementsDue = Math.max(
    0,
    Number((entry.terminationEntitlementsNet || 0).toFixed(2))
  );

  return {
    salary: salaryDue,
    thirteenth_1: thirteenth1Due,
    thirteenth_2: thirteenth2Due,
    bonus: bonusDue,
    termination_fine: terminationFineDue,
    termination_entitlements: terminationEntitlementsDue,
  } satisfies Record<PaymentKind, number>;
};

const sumPaidByKind = (entry: LedgerEntry) => {
  const byKind: Record<PaymentKind, number> = {
    salary: 0,
    thirteenth_1: 0,
    thirteenth_2: 0,
    bonus: 0,
    termination_fine: 0,
    termination_entitlements: 0,
  };

  for (const p of entry.payments ?? []) {
    if (!byKind[p.kind]) byKind[p.kind] = 0;
    byKind[p.kind] = Number((byKind[p.kind] + (Number(p.amount) || 0)).toFixed(2));
  }
  return byKind;
};

export function PaymentsManager({ month, isOpen, onClose }: PaymentsManagerProps) {
  const { years, activeYear, employee, addPayment, removePayment } = usePayrollStore();
  const { showToast } = useToast();
  const entry = years[activeYear]?.ledger.find(l => l.month === month);

  const [kind, setKind] = useState<PaymentKind>('salary');
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [paidAt, setPaidAt] = useState<string>(toISODate(new Date()));
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');

  const due = useMemo(() => (entry ? computeDueByKind(entry) : null), [entry]);
  const paid = useMemo(() => (entry ? sumPaidByKind(entry) : null), [entry]);

  const terminationDate = employee.terminationDate
    ? parseISODateLocal(employee.terminationDate)
    : undefined;
  const isTerminationMonth =
    Boolean(terminationDate) &&
    terminationDate!.getFullYear() === activeYear &&
    terminationDate!.getMonth() + 1 === month;

  const dueDateLabel = (k: PaymentKind) => {
    if (!entry) return undefined;
    if (k === 'salary') {
      const y = activeYear;
      const m = month;
      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;
      return `${nextYear}-${String(nextMonth).padStart(2, '0')}-05`;
    }
    if (k === 'bonus') {
      if (isTerminationMonth && terminationDate) return toISODate(terminationDate);
      if (entry.month === 7) return `${activeYear}-07-01`;
      if (entry.month === 12) return `${activeYear}-12-31`;
      if (entry.bonusCarryDue > 0) return 'vencido';
      return undefined;
    }
    if (k === 'thirteenth_1') return `${activeYear}-11-30`;
    if (k === 'thirteenth_2') return `${activeYear}-12-20`;
    if (k === 'termination_fine' || k === 'termination_entitlements') {
      if (isTerminationMonth && terminationDate) return toISODate(terminationDate);
      return undefined;
    }
    return undefined;
  };

  if (!entry) return null;

  const handlePrefill = (k: PaymentKind) => {
    setKind(k);
    const remaining = Math.max(0, (due?.[k] ?? 0) - (paid?.[k] ?? 0));
    setAmount(remaining);
  };

  const handleAdd = () => {
    if (!paidAt) {
      showToast('Informe a data do pagamento.', 'error');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Informe um valor válido (> 0).', 'error');
      return;
    }
    addPayment(month, {
      kind,
      amount: Number(amount.toFixed(2)),
      paidAt,
      method,
      note: note.trim() || undefined,
    });
    showToast('Pagamento lançado.', 'success');
    setAmount(0);
    setNote('');
  };

  const sortedPayments = [...(entry.payments ?? [])].sort((a, b) => {
    const ka = a.paidAt || '';
    const kb = b.paidAt || '';
    const c = ka.localeCompare(kb);
    return c !== 0 ? c : (a.kind || '').localeCompare(b.kind || '');
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pagamentos Realizados - ${activeYear}/${month}`}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Verbas (devido vs. pago)</h4>
          <div className="space-y-2">
            {(Object.keys(KIND_LABEL) as PaymentKind[]).map(k => {
              const dueK = due?.[k] ?? 0;
              const paidK = paid?.[k] ?? 0;
              const remaining = Math.max(0, Number((dueK - paidK).toFixed(2)));
              const show = dueK > 0 || paidK > 0;
              if (!show) return null;
              const dueLabel = dueDateLabel(k);
              return (
                <div
                  key={k}
                  className="p-3 rounded-md border bg-gray-50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800">{KIND_LABEL[k]}</div>
                    <div className="text-xs text-gray-500 font-mono tabular-nums">
                      Devido: {formatCurrency(dueK)} · Pago: {formatCurrency(paidK)} · Falta:{' '}
                      {formatCurrency(remaining)}
                      {dueLabel && (
                        <>
                          {' '}
                          · Venc.:{' '}
                          <span className={dueLabel === 'vencido' ? 'text-red-600 font-bold' : ''}>
                            {dueLabel === 'vencido'
                              ? 'vencido'
                              : new Date(`${dueLabel}T12:00:00`).toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePrefill(k)}
                    className="px-3 py-1 text-xs font-bold rounded border bg-white hover:bg-gray-100"
                    title="Preencher pagamento"
                  >
                    Lançar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border rounded-md bg-white space-y-3">
          <h4 className="font-medium text-gray-800">Novo pagamento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verba</label>
              <select
                value={kind}
                onChange={e => setKind(e.target.value as PaymentKind)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                {(Object.keys(KIND_LABEL) as PaymentKind[]).map(k => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                {(Object.keys(METHOD_LABEL) as PaymentMethod[]).map(m => (
                  <option key={m} value={m}>
                    {METHOD_LABEL[m]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={paidAt}
                onChange={e => setPaidAt(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>
            <CurrencyInput label="Valor (R$)" value={amount} onValueChange={setAmount} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex: pago em 2 partes, ajuste, etc."
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-md transition-colors"
          >
            Adicionar pagamento
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Pagamentos lançados</h4>
          {sortedPayments.length === 0 ? (
            <div className="text-sm text-gray-400">Nenhum pagamento lançado neste mês.</div>
          ) : (
            <div className="space-y-2">
              {sortedPayments.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border bg-gray-50"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">
                      {KIND_LABEL[p.kind]} · {METHOD_LABEL[p.method]}
                    </div>
                    <div className="text-xs text-gray-500 font-mono tabular-nums">
                      {new Date(`${p.paidAt}T12:00:00`).toLocaleDateString('pt-BR')} ·{' '}
                      {formatCurrency(p.amount)}
                      {p.note ? ` · ${p.note}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => removePayment(month, p.id)}
                    className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                    title="Remover pagamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
