import { bench, describe } from 'vitest';
import { usePayrollStore } from '../hooks/usePayrollStore';

// setup store
const store = usePayrollStore.getState();
store.setActiveYear(2025);
store.initializeYear(2025);

describe('setTargetNet performance', () => {
  bench('setTargetNet (month 1) - full recalc', () => {
    store.setTargetNet(1, 3000);
  });

  bench('setTargetNet (month 6) - partial recalc', () => {
    store.setTargetNet(6, 3000);
  });

  bench('setTargetNet (month 12) - minimal recalc', () => {
    store.setTargetNet(12, 3000);
  });
});
