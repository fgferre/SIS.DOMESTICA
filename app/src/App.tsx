import { useEffect, useState } from 'react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { LedgerTable } from '@/components/features/LedgerTable';
import { SummaryCards } from '@/components/features/SummaryCards';
import { Wallet, Settings, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';
import { EmployeeSettingsModal } from '@/components/features/EmployeeSettingsModal';

import { ToastProvider } from '@/components/ui/Toast';
import { ConfettiOverlay } from '@/components/ui/ConfettiOverlay';

function App() {
  const { initializeYear, setActiveYear, activeYear, lastCelebration, clearCelebration } =
    usePayrollStore();
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  useEffect(() => {
    // Ensure initial year is ready
    const currentYear = new Date().getFullYear();
    setActiveYear(currentYear);
    initializeYear(currentYear);
  }, [initializeYear, setActiveYear]);

  const handleYearChange = (delta: number) => {
    const newYear = activeYear + delta;
    if (newYear >= 2020 && newYear <= 2030) {
      setActiveYear(newYear);
      initializeYear(newYear);
    }
  };

  return (
    <ToastProvider>
      <EmployeeSettingsModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      />
      <ConfettiOverlay
        triggerId={lastCelebration?.id}
        durationMs={1400}
        onDone={clearCelebration}
      />
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
                <Wallet size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">SIS.DOMÉSTICA</h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  Gestão Inteligente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Seletor de Ano */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                <button
                  onClick={() => handleYearChange(-1)}
                  className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-gray-700 transition-colors"
                  title="Ano anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-3 py-1 font-mono font-bold text-blue-600 min-w-[60px] text-center">
                  {activeYear}
                </span>
                <button
                  onClick={() => handleYearChange(1)}
                  className="p-1.5 hover:bg-white rounded text-gray-500 hover:text-gray-700 transition-colors"
                  title="Próximo ano"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Cadastro e Eventos"
              >
                <UserCog size={20} />
              </button>

              <button
                onClick={() => {
                  if (
                    confirm('Tem certeza? Isso apagará todos os dados locais e reiniciará o app.')
                  ) {
                    usePayrollStore.getState().resetData();
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Resetar (Apagar Dados)"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* KPI Section */}
          <section>
            <SummaryCards />
          </section>

          {/* Ledger */}
          <section>
            <LedgerTable />
          </section>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
