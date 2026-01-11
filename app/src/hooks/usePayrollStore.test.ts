import { act } from '@testing-library/react';
import { usePayrollStore } from './usePayrollStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('usePayrollStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = usePayrollStore.getState();
    store.setActiveYear(2025);
    store.initializeYear(2025);
  });

  it('should initialize with correct default state', () => {
    const store = usePayrollStore.getState();
    expect(store.activeYear).toBe(2025);
    expect(store.years[2025]).toBeDefined();
    expect(store.years[2025].ledger).toHaveLength(12);
  });

  it('should calculate payroll when target net is set', () => {
    const store = usePayrollStore.getState();

    act(() => {
      store.setTargetNet(1, 3000); // Jan 2025, Net 3000
    });

    const updatedStore = usePayrollStore.getState();
    const janEntry = updatedStore.years[2025].ledger[0];

    expect(janEntry.month).toBe(1);
    expect(janEntry.targetNet).toBe(3000);
    expect(janEntry.grossSalary).toBeGreaterThan(3000); // Should be Gross > Net
    expect(janEntry.monthlyBonus).toBeGreaterThan(0); // Should have monthly bonus value
  });

  it('should accumulate balance', () => {
    const store = usePayrollStore.getState();

    act(() => {
      store.setTargetNet(1, 3000);
      store.setTargetNet(2, 3000);
    });

    const updatedStore = usePayrollStore.getState();
    const jan = updatedStore.years[2025].ledger[0];
    const feb = updatedStore.years[2025].ledger[1];

    // Running balance should accumulate
    // Jan Balance = Jan monthlyBonus
    // Feb Balance = Jan monthlyBonus + Feb monthlyBonus
    expect(feb.runningBalance).toBeCloseTo(jan.monthlyBonus + feb.monthlyBonus, 1);
  });
});
