import { SyncStatus } from '@/hooks/useAutoSave';
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  hasPendingChanges: boolean;
}

export function SyncStatusIndicator({ status, hasPendingChanges }: SyncStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Salvando...',
          className: 'text-amber-400',
        };
      case 'synced':
        return {
          icon: <Check className="h-4 w-4" />,
          text: 'Salvo',
          className: 'text-emerald-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Erro ao salvar',
          className: 'text-red-400',
        };
      case 'offline':
        return {
          icon: <CloudOff className="h-4 w-4" />,
          text: 'Offline',
          className: 'text-slate-400',
        };
      default: // idle
        if (hasPendingChanges) {
          return {
            icon: <Cloud className="h-4 w-4" />,
            text: 'Pendente',
            className: 'text-amber-400',
          };
        }
        return {
          icon: <Cloud className="h-4 w-4" />,
          text: '',
          className: 'text-slate-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-1.5 text-sm ${config.className}`}>
      {config.icon}
      {config.text && <span className="hidden sm:inline">{config.text}</span>}
    </div>
  );
}
