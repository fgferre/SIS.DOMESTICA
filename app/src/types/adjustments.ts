export type VariationType =
  | 'he_50' // Hora Extra 50%
  | 'he_100' // Hora Extra 100%
  | 'night_shift' // Adicional Noturno
  | 'refund' // Reembolso (Net)
  | 'bonus' // Prêmio (Taxable)
  | 'absent' // Falta (Deduction Gross)
  | 'material' // Danos Materiais (Deduction Net)
  | 'advance'; // Vale (Deduction Net)

export interface Variation {
  id: string;
  type: VariationType;
  description: string;
  value: number; // For Hours type, this might need pre-calc? User said "Lançar Valor".
  date: Date;
}

export const VARIATION_META: Record<
  VariationType,
  {
    label: string;
    impact: 'gross_add' | 'gross_deduct' | 'net_add' | 'net_deduct';
    color: string;
  }
> = {
  he_50: { label: 'Hora Extra 50%', impact: 'gross_add', color: 'text-green-600' },
  he_100: { label: 'Hora Extra 100%', impact: 'gross_add', color: 'text-green-700' },
  night_shift: { label: 'Adicional Noturno', impact: 'gross_add', color: 'text-purple-600' },
  refund: { label: 'Reembolso', impact: 'net_add', color: 'text-blue-500' },
  bonus: { label: 'Prêmio/Gratificação', impact: 'gross_add', color: 'text-green-500' },
  absent: { label: 'Falta Injustificada', impact: 'gross_deduct', color: 'text-red-600' },
  material: { label: 'Danos Materiais', impact: 'net_deduct', color: 'text-red-500' },
  advance: { label: 'Vale Adiantado', impact: 'net_deduct', color: 'text-orange-600' },
};
