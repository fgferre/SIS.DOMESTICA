import { useEffect, useState } from 'react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { EmployerService } from '@/services/EmployerService';
import { LedgerTable } from '@/components/features/LedgerTable';
import { SummaryCards } from '@/components/features/SummaryCards';
import {
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Building2,
  LogOut,
} from 'lucide-react';
import { EmployeeSettingsModal } from '@/components/features/EmployeeSettingsModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { LobbyScreen } from '@/components/lobby/LobbyScreen';
import { LandingScreen } from '@/components/LandingScreen';
import { Employee } from '@/services/EmployerService';

import { ToastProvider } from '@/components/ui/Toast';
import { ConfettiOverlay } from '@/components/ui/ConfettiOverlay';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAutoSave } from '@/hooks/useAutoSave';

function App() {
  const {
    initializeYear,
    setActiveYear,
    activeYear,
    lastCelebration,
    clearCelebration,
    importData,
    resetData,
  } = usePayrollStore();
  const { user, signOut } = useAuth();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Invite state
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [processingInvite, setProcessingInvite] = useState(false);

  // Check for invite token on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      // Remove token from URL for cleaner look
      window.history.replaceState({}, '', window.location.pathname);

      // Load invite info
      EmployerService.getInviteByToken(token)
        .then(data => {
          setInviteInfo(data);
          setShowInviteModal(true);
        })
        .catch(err => {
          console.error('Convite inválido:', err);
          // Opcional: mostrar toast de erro
        });
    }
  }, []);

  const handleAcceptInvite = async () => {
    if (!inviteToken) return;

    if (!user) {
      setAuthMode('signup');
      setIsAuthModalOpen(true);
      return;
    }

    setProcessingInvite(true);
    try {
      await EmployerService.acceptInvite(inviteToken);
      // Reload page/state to refreshing list will happen automatically in Lobby
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erro ao aceitar convite');
    } finally {
      setProcessingInvite(false);
      setShowInviteModal(false);
    }
  };

  // Se o usuário logar enquanto o modal de convite estiver aberto (vindo do fluxo de cadastro)
  useEffect(() => {
    if (user && inviteToken && showInviteModal && !processingInvite) {
      handleAcceptInvite();
    }
  }, [user]);

  // Auto-save to cloud when payroll data changes
  const { status: syncStatus, hasPendingChanges } = useAutoSave(selectedEmployee?.id ?? null);

  useEffect(() => {
    // Ensure initial year is ready
    const currentYear = new Date().getFullYear();
    setActiveYear(currentYear);
    initializeYear(currentYear);
  }, [initializeYear, setActiveYear]);

  // Handle Logout
  const handleSignOut = async () => {
    // Block logout if there are pending changes
    if (hasPendingChanges) {
      const confirmLogout = window.confirm(
        'Você tem alterações não salvas. Deseja sair mesmo assim?'
      );
      if (!confirmLogout) return;
    }
    await signOut();
    setSelectedEmployee(null);
    resetData(); // Security: Wipe local data
  };

  // Handle Employee Selection from Lobby
  const handleSelectEmployee = (emp: Employee) => {
    console.log('[App] handleSelectEmployee called:', emp.name);
    // 1. Set context FIRST to prevent flicker back to Lobby
    setSelectedEmployee(emp);
    console.log('[App] selectedEmployee set to:', emp.name);

    // 2. Load their data if exists (skip reset to avoid navigation bug)
    if (emp.payroll_data && Object.keys(emp.payroll_data).length > 0) {
      console.log('[App] Importing payroll_data...');
      importData(JSON.stringify(emp.payroll_data));
    }
    // Note: For fresh employees, we just start with default store state
    console.log('[App] handleSelectEmployee done');
  };

  const handleYearChange = (delta: number) => {
    const newYear = activeYear + delta;
    if (newYear >= 2020 && newYear <= 2030) {
      setActiveYear(newYear);
      initializeYear(newYear);
    }
  };

  // RENDER LOGIC

  // 1. Not Logged In? Show Landing Page.
  if (!user) {
    return (
      <>
        <LandingScreen
          onLogin={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          onSignup={() => {
            setAuthMode('signup');
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      </>
    );
  }

  // 2. Logged In but no employee selected? Show Lobby.
  if (!selectedEmployee) {
    return <LobbyScreen onSelectEmployee={handleSelectEmployee} onLogout={handleSignOut} />;
  }

  // 3. Normal Dashboard (Logged In & Selected)
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

      {/* Global Animated Background */}
      <AuroraBackground />

      {/* Invite Acceptance Modal */}
      {showInviteModal && inviteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Convite para Família</h3>
            <p className="text-gray-600 mb-6">
              Você foi convidado para gerenciar a família{' '}
              <strong>{inviteInfo.employers?.name}</strong>.
            </p>

            {user ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAcceptInvite}
                  disabled={processingInvite}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {processingInvite ? 'Aceitando...' : 'Aceitar Convite'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  Faça login ou crie uma conta para aceitar este convite.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAcceptInvite}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Entrar / Cadastrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative min-h-screen font-sans text-gray-900 bg-transparent">
        {/* Header - Glass Effect */}
        <header className="sticky top-0 z-20 glass border-b-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
                <Wallet size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">SIS.DOMÉSTICA</h1>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                    Gestão Inteligente
                  </p>
                  {user && selectedEmployee && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold border border-indigo-200">
                      {selectedEmployee.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Back to Lobby Button */}
              {user && (
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="hidden md:flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Building2 size={14} />
                  Trocar
                </button>
              )}

              {/* Sync Status Indicator */}
              {user && selectedEmployee && (
                <SyncStatusIndicator status={syncStatus} hasPendingChanges={hasPendingChanges} />
              )}

              <button
                onClick={() => (user ? handleSignOut() : setIsAuthModalOpen(true))}
                className={`p-2 rounded-full transition-colors ${
                  user
                    ? 'text-red-400 hover:bg-red-400/10'
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={user ? `Sair de ${user.email}` : 'Login / Salvar na Nuvem'}
              >
                {user ? <LogOut size={20} /> : <UserCog size={20} />}
              </button>

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
                <Settings size={20} />
              </button>

              {/* Botão Reset Movido para menu de 'perigo' se necessário, ou mantido aqui */}
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
