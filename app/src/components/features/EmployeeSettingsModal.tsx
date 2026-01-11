import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { formatCurrency } from '@/utils/utils';
import { Plus, Trash2 } from 'lucide-react';
import type { SalaryEvent, TerminationType } from '@/types/payroll';

interface EmployeeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const toMonthInput = (isoMonth: string) => isoMonth.slice(0, 7); // YYYY-MM
const fromMonthInput = (month: string) => `${month}-01`;

export function EmployeeSettingsModal({ isOpen, onClose }: EmployeeSettingsModalProps) {
  const { employee, updateEmployee, salaryEvents, addSalaryEvent, removeSalaryEvent } =
    usePayrollStore();

  const newId = () =>
    (globalThis.crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  const sortedEvents = useMemo(
    () => [...salaryEvents].sort((a, b) => a.effectiveMonth.localeCompare(b.effectiveMonth)),
    [salaryEvents]
  );

  const [newEventMonth, setNewEventMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newEventNet, setNewEventNet] = useState(0);

  const onSetTerminationType = (t: TerminationType) => {
    updateEmployee({ terminationType: t });
  };

  const onToggleTermination = (enabled: boolean) => {
    if (!enabled) {
      updateEmployee({ terminationDate: undefined, terminationType: undefined });
      return;
    }
    updateEmployee({ terminationDate: new Date().toISOString().slice(0, 10), terminationType: 'employer' });
  };

  const canAdd = /^\d{4}-\d{2}$/.test(newEventMonth) && Number.isFinite(newEventNet) && newEventNet > 0;

  const handleAddEvent = () => {
    if (!canAdd) return;
    const effectiveMonth = fromMonthInput(newEventMonth);
    const existing = sortedEvents.find(e => e.effectiveMonth === effectiveMonth);
    if (existing) {
      removeSalaryEvent(existing.id);
    }
    const event: SalaryEvent = {
      id: newId(),
      effectiveMonth,
      targetNet: Number(newEventNet.toFixed(2)),
    };
    addSalaryEvent(event);
    setNewEventNet(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastro e Eventos">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Admissão</label>
            <input
              type="date"
              value={employee.admissionDate || ''}
              onChange={e => updateEmployee({ admissionDate: e.target.value })}
              className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-gray-300 font-mono"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Dependentes (IRRF)</label>
            <input
              type="number"
              min={0}
              value={employee.dependents ?? 0}
              onChange={e => updateEmployee({ dependents: Math.max(0, Number(e.target.value || 0)) })}
              className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-gray-300 font-mono text-right"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Desligamento</div>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={!!employee.terminationDate}
                onChange={e => onToggleTermination(e.target.checked)}
              />
              Ativar
            </label>
          </div>

          {employee.terminationDate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  value={employee.terminationDate}
                  onChange={e => updateEmployee({ terminationDate: e.target.value })}
                  className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-gray-300 font-mono"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <select
                  value={employee.terminationType || 'employer'}
                  onChange={e => onSetTerminationType(e.target.value as TerminationType)}
                  className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-gray-300"
                >
                  <option value="employer">Demissão pelo empregador</option>
                  <option value="employee">Pedido do empregado</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">Aumentos (Líquido)</div>
              <div className="text-xs text-gray-500">
                Eventos valem a partir do mês (mês fechado).
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-2">Mês</th>
                  <th className="text-right p-2">Líquido</th>
                  <th className="w-10 p-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedEvents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-3 text-xs text-gray-500">
                      Sem eventos. Edite um mês na tabela ou adicione abaixo.
                    </td>
                  </tr>
                )}
                {sortedEvents.map(ev => (
                  <tr key={ev.id}>
                    <td className="p-2 font-mono">{toMonthInput(ev.effectiveMonth)}</td>
                    <td className="p-2 text-right font-mono tabular-nums">
                      {formatCurrency(ev.targetNet)}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => removeSalaryEvent(ev.id)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">Mês (início)</label>
              <input
                type="month"
                value={newEventMonth}
                onChange={e => setNewEventMonth(e.target.value)}
                className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-gray-300 font-mono"
              />
            </div>
            <CurrencyInput
              value={newEventNet}
              onValueChange={setNewEventNet}
              label="Novo líquido mensal"
            />
          </div>

          <button
            onClick={handleAddEvent}
            disabled={!canAdd}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Adicionar evento
          </button>
        </div>
      </div>
    </Modal>
  );
}
