import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
  error?: string;
}

export function CurrencyInput({
  value,
  onValueChange,
  label,
  error,
  className,
  disabled,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  useEffect(() => {
    // Format initial value
    if (value !== undefined) {
      setDisplayValue(formatValue(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Remove non-digits
    const digits = inputValue.replace(/\D/g, '');

    // Convert to number (cents)
    const realValue = Number(digits) / 100;

    onValueChange(realValue);
    setDisplayValue(formatValue(realValue));
  };

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-gray-200">{label}</label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary',
          'bg-white/70 dark:bg-black/30 text-slate-900 dark:text-white border border-black/10 dark:border-white/10',
          'placeholder:text-slate-500 dark:placeholder:text-slate-500',
          'disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-300',
          'disabled:bg-slate-200/50 dark:disabled:bg-black/50 disabled:border-dashed disabled:opacity-85',
          error && 'border-danger focus:ring-danger focus:border-danger',
          'text-right font-mono tabular-nums',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
