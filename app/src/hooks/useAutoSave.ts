import { useEffect, useRef, useCallback, useState } from 'react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { EmployerService } from '@/services/EmployerService';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface AutoSaveResult {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  hasPendingChanges: boolean;
}

/**
 * Auto-saves payroll data to the cloud whenever the store changes.
 * Uses a debounce of 2 seconds to avoid excessive API calls.
 * Returns sync status for UI display.
 */
export function useAutoSave(employeeId: string | null): AutoSaveResult {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const isFirstRender = useRef(true);

  const saveToCloud = useCallback(
    async (data: string) => {
      if (!employeeId) return;

      // Check if online
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      try {
        setStatus('syncing');
        const payrollData = JSON.parse(data);
        await EmployerService.saveEmployeeData(employeeId, payrollData);
        lastSavedRef.current = data;
        setLastSyncedAt(new Date());
        setHasPendingChanges(false);
        setStatus('synced');
        console.log('[AutoSave] Saved successfully!');
      } catch (error) {
        console.error('[AutoSave] Failed to save:', error);
        setStatus('error');
      }
    },
    [employeeId]
  );

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (hasPendingChanges && employeeId) {
        const currentData = usePayrollStore.getState().exportData();
        saveToCloud(currentData);
      }
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasPendingChanges, employeeId, saveToCloud]);

  // Subscribe to store changes
  useEffect(() => {
    if (!employeeId) return;

    const unsubscribe = usePayrollStore.subscribe(() => {
      // Skip first render
      if (isFirstRender.current) {
        isFirstRender.current = false;
        lastSavedRef.current = usePayrollStore.getState().exportData();
        return;
      }

      // Get current data
      const currentData = usePayrollStore.getState().exportData();

      // Skip if unchanged
      if (currentData === lastSavedRef.current) return;

      // Mark as pending
      setHasPendingChanges(true);

      // Clear previous debounce
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce save
      saveTimeoutRef.current = setTimeout(() => {
        saveToCloud(currentData);
      }, 2000);
    });

    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [employeeId, saveToCloud]);

  // Handle page unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges]);

  return { status, lastSyncedAt, hasPendingChanges };
}
