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

  it('should produce identical results with partial recalculation vs full recalculation', () => {
    const store = usePayrollStore.getState();
    store.resetData();
    store.initializeYear(2025);

    // Scenario A: Incremental updates (uses optimized partial recalc)
    act(() => {
      store.setTargetNet(1, 3000);
      store.setTargetNet(6, 4000);
    });

    const partialLedger = JSON.parse(JSON.stringify(usePayrollStore.getState().years[2025].ledger));
    const resultingEvents = usePayrollStore.getState().salaryEvents;

    // Scenario B: Full recalculation from scratch
    act(() => {
      store.resetData();
      usePayrollStore.setState({ salaryEvents: resultingEvents });
      store.initializeYear(2025);
    });

    const fullLedger = usePayrollStore.getState().years[2025].ledger;

    expect(partialLedger.length).toBe(12);
    expect(fullLedger.length).toBe(12);

    for (let i = 0; i < 12; i++) {
      expect(partialLedger[i].targetNet).toBe(fullLedger[i].targetNet);
      expect(partialLedger[i].grossSalary).toBe(fullLedger[i].grossSalary);
      expect(partialLedger[i].netSalary).toBe(fullLedger[i].netSalary);
      expect(partialLedger[i].monthlyBonus).toBe(fullLedger[i].monthlyBonus);
      expect(partialLedger[i].provisions).toBe(fullLedger[i].provisions);
      expect(partialLedger[i].runningBalance).toBe(fullLedger[i].runningBalance);
    }
  });
});
