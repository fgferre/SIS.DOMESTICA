import { useState } from 'react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { EmployerService } from '@/services/EmployerService';
import { Cloud, Download, Upload, Loader2, Check } from 'lucide-react';

interface CloudSyncProps {
  employeeId?: string;
}

export function CloudSyncControl({ employeeId }: CloudSyncProps) {
  const state = usePayrollStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!employeeId) return null; // Only show if an employee is selected

  const handleSave = async () => {
    setLoading(true);
    try {
      const json = state.exportData();
      const content = JSON.parse(json);

      await EmployerService.saveEmployeeData(employeeId, content);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!confirm('Deseja recarregar a versão da nuvem? Isso substituirá o que está na tela.'))
      return;

    setLoading(true);
    try {
      const data = await EmployerService.loadEmployeeData(employeeId);

      if (data) {
        state.importData(JSON.stringify(data));
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
      <div className="px-3 text-xs text-zinc-400 flex items-center gap-2 border-r border-white/10">
        <Cloud className="h-3 w-3" />
        <span className="hidden sm:inline">Cloud Sync</span>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="p-1.5 rounded-md hover:bg-white/10 text-emerald-400 disabled:opacity-50"
        title="Salvar na Nuvem"
      >
        {status === 'success' ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      </button>

      <button
        onClick={handleLoad}
        disabled={loading}
        className="p-1.5 rounded-md hover:bg-white/10 text-orange-400 disabled:opacity-50"
        title="Baixar da Nuvem"
      >
        <Download className="h-4 w-4" />
      </button>

      {loading && <Loader2 className="h-3 w-3 animate-spin text-zinc-500 mr-1" />}
    </div>
  );
}
