import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployerService } from './EmployerService';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => {
  const selectMock = vi.fn();
  const deleteMock = vi.fn();
  const insertMock = vi.fn();
  const eqMock = vi.fn();
  const fromMock = vi.fn();

  // Chaining setup
  fromMock.mockReturnValue({
    select: selectMock,
    delete: deleteMock,
    insert: insertMock,
  });

  selectMock.mockReturnValue({
    eq: eqMock,
  });

  deleteMock.mockReturnValue({
    eq: eqMock,
  });

  // Default response
  eqMock.mockImplementation(() => Promise.resolve({ data: [], error: null, count: 0 }));

  return {
    supabase: {
      from: fromMock,
    },
  };
});

describe('EmployerService Performance Optimization', () => {
  const mockEmployerId = 'employer-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use optimized count query to check for existence', async () => {
    // Setup mock for having employees (count > 0)
    // The select implementation should return count: 2

    const eqMock = vi.fn().mockResolvedValue({ data: null, error: null, count: 2 });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = vi.mocked(supabase.from);

    // Reset the mock implementation for this specific test
    fromMock.mockImplementation((table: string) => {
      if (table === 'employees') {
        return {
          select: selectMock,
        } as any;
      }
      return {
        delete: vi.fn().mockReturnValue({ eq: vi.fn() }),
      } as any;
    });

    // Execute
    try {
      await EmployerService.deleteEmployer(mockEmployerId);
    } catch (e) {
      // Expected to fail because count > 0
    }

    // Verify "Good" Behavior (using count)
    expect(fromMock).toHaveBeenCalledWith('employees');
    // Expect select('*', { count: 'exact', head: true })
    expect(selectMock).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(eqMock).toHaveBeenCalledWith('employer_id', mockEmployerId);
  });

  it('should proceed to delete employer if count is 0', async () => {
     // Setup mock for NO employees (count: 0)
     const eqMockSelect = vi.fn().mockResolvedValue({ data: null, error: null, count: 0 });
     const selectMock = vi.fn().mockReturnValue({ eq: eqMockSelect });

     const eqMockDelete = vi.fn().mockResolvedValue({ error: null });
     const deleteMock = vi.fn().mockReturnValue({ eq: eqMockDelete });

     const fromMock = vi.mocked(supabase.from);

     fromMock.mockImplementation((table: string) => {
       if (table === 'employees') {
         return { select: selectMock } as any;
       }
       if (table === 'employers') {
         return { delete: deleteMock } as any;
       }
       return {} as any;
     });

     // Execute
     await EmployerService.deleteEmployer(mockEmployerId);

     // Verify
     expect(selectMock).toHaveBeenCalledWith('*', { count: 'exact', head: true });
     expect(deleteMock).toHaveBeenCalled();
     expect(eqMockDelete).toHaveBeenCalledWith('id', mockEmployerId);
  });
});
