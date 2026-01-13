import { useState } from 'react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { Modal } from '@/components/ui/Modal';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { VARIATION_META, VariationType } from '@/types/adjustments';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/utils';

interface ExtrasManagerProps {
  month: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ExtrasManager({ month, isOpen, onClose }: ExtrasManagerProps) {
  const { years, activeYear, addVariation, removeVariation } = usePayrollStore();
  const { showToast } = useToast();
  const currentEntry = years[activeYear]?.ledger.find(l => l.month === month);

  const [type, setType] = useState<VariationType>('he_50');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState(0);

  if (!currentEntry) return null;

  /* const handleSaveAnticipated = () => {
    if (anticipated < 0) {
      showToast('A antecipação não pode ser negativa.', 'error');
      return;
    }
    const available = (currentEntry.runningBalance || 0) + (currentEntry.anticipatedBonus || 0);
    if (anticipated > available) {
      showToast(`Valor acima do saldo do pote (${formatCurrency(available)}).`, 'error');
      return;
    }
    setAnticipatedBonus(month, anticipated);
    showToast(anticipated > 0 ? 'Antecipação salva.' : 'Antecipação removida.', 'success');
  };

  */

  const handleAdd = () => {
    if (value <= 0) {
      showToast('O valor deve ser maior que zero.', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Adicione uma descrição.', 'error');
      return;
    }

    // VALIDATIONS
    const meta = VARIATION_META[type];

    // 1. Negative Net Check
    if (meta.impact === 'gross_deduct' || meta.impact === 'net_deduct') {
      // Estimate impact
      // If Gross Deduct, it reduces Net by approx (Value * (1 - TaxRate)).
      // Conservative: reduces net by Value.
      if (currentEntry.toPayBase - value < 0) {
        showToast('Este desconto resultaria em salário negativo.', 'error');
        return;
      }
    }

    addVariation(month, {
      id: crypto.randomUUID(),
      type,
      description,
      value,
      date: new Date(),
    });

    showToast('Lançamento adicionado com sucesso!', 'success');
    setValue(0);
    setDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar Extras/Descontos - Mês ${month}`}>
      <div className="space-y-6">
        {/* BONUS ANTICIPATION (desativado): usar "Pagamentos" na tabela
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-900 mb-2">Antecipação de Bônus (desconta do pote)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <CurrencyInput label="Valor (R$)" value={anticipated} onValueChange={setAnticipated} />
            <div className="text-xs text-blue-700">
              Saldo atual do pote: <span className="font-mono">{formatCurrency(currentEntry.runningBalance)}</span>
            </div>
            <button
              onClick={handleSaveAnticipated}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>

        */}

        {/* FORM */}
        <div className="grid grid-cols-1 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as VariationType)}
              className="w-full rounded-md border border-white/10 bg-black/30 text-white p-2 text-sm focus:ring-primary/60 focus:border-primary"
            >
              {Object.entries(VARIATION_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
            <p className={`text-xs mt-1 ${VARIATION_META[type].color}`}>
              Impacto:{' '}
              {VARIATION_META[type].impact === 'gross_add'
                ? 'Aumenta Bruto (Incide Impostos)'
                : VARIATION_META[type].impact === 'net_add'
                  ? 'Aumenta Líquido (Sem Impostos)'
                  : VARIATION_META[type].impact === 'gross_deduct'
                    ? 'Reduz Bruto (Reduz Impostos)'
                    : 'Reduz Líquido Direto'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Descrição</label>
            <input
              type="text"
              className="w-full rounded-md border border-white/10 bg-black/30 text-white p-2 text-sm"
              placeholder="Ex: 2 horas extras dia 15"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <CurrencyInput label="Valor (R$)" value={value} onValueChange={setValue} />
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar Lançamento
          </button>
        </div>

        {/* LIST */}
        <div>
          <h4 className="font-medium text-gray-100 mb-3">Lançamentos do Mês</h4>
          {currentEntry.variations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4 bg-white/5 rounded-lg border border-dashed border-white/10">
              Nenhum lançamento extra neste mês.
            </p>
          ) : (
            <ul className="space-y-2">
              {currentEntry.variations.map(v => (
                <li
                  key={v.id}
                  className="flex items-center justify-between p-3 bg-black/20 border border-white/10 rounded-lg shadow-sm"
                >
                  <div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full bg-gray-100 ${VARIATION_META[v.type].color}`}
                    >
                      {VARIATION_META[v.type].label}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{v.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium">{formatCurrency(v.value)}</span>
                    <button
                      onClick={() => removeVariation(month, v.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
