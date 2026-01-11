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

  useEffect(() => {
    // Format initial value
    if (value !== undefined) {
      setDisplayValue(formatValue(value));
    }
  }, [value]);

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

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
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:bg-gray-100',
          error ? 'border-danger focus:ring-danger' : 'border-gray-300',
          'text-right font-mono',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
