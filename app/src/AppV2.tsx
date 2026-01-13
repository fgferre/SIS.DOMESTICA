import { useEffect, useState } from 'react';
import { usePayrollStore } from '@/hooks/usePayrollStore';
import { EmployerService } from '@/services/EmployerService';
import { LedgerTable } from '@/components/features/LedgerTableV2';
import { SummaryCards } from '@/components/features/SummaryCardsV2';
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';
import { Icon } from '@/components/ui/Icon';
import { EmployeeSettingsModal } from '@/components/features/EmployeeSettingsModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { SyncStatusIndicator } from '@/components/ui/SyncStatusIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { LobbyScreen } from '@/components/lobby/LobbyScreen';
import { LandingPage } from '@/components/landing/LandingPage';
import type { Employee } from '@/services/EmployerService';

import { ToastProvider } from '@/components/ui/Toast';
import { ConfettiOverlay } from '@/components/ui/ConfettiOverlay';
import { SystemBackground } from '@/components/ui/SystemBackground';
import { useAutoSave } from '@/hooks/useAutoSave';

export default function App() {
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
    if (!token) return;

    setInviteToken(token);
    window.history.replaceState({}, '', window.location.pathname);

    EmployerService.getInviteByToken(token)
      .then(data => {
        setInviteInfo(data);
        setShowInviteModal(true);
      })
      .catch(err => {
        console.error('Convite inválido:', err);
      });
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
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erro ao aceitar convite');
    } finally {
      setProcessingInvite(false);
      setShowInviteModal(false);
    }
  };

  // If the user logs in while the invite modal is open.
  useEffect(() => {
    if (user && inviteToken && showInviteModal && !processingInvite) {
      handleAcceptInvite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const { status: syncStatus, hasPendingChanges } = useAutoSave(selectedEmployee?.id ?? null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setActiveYear(currentYear);
    initializeYear(currentYear);
  }, [initializeYear, setActiveYear]);

  const handleSignOut = async () => {
    if (hasPendingChanges) {
      const confirmLogout = window.confirm(
        'Você tem alterações não salvas. Deseja sair mesmo assim?'
      );
      if (!confirmLogout) return;
    }
    await signOut();
    setSelectedEmployee(null);
    resetData();
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    if (emp.payroll_data && Object.keys(emp.payroll_data).length > 0) {
      importData(JSON.stringify(emp.payroll_data));
    }
  };

  const handleYearChange = (delta: number) => {
    const newYear = activeYear + delta;
    if (newYear >= 2020 && newYear <= 2030) {
      setActiveYear(newYear);
      initializeYear(newYear);
    }
  };

  // 1) Not logged in -> Landing
  if (!user) {
    return (
      <>
        <LandingPage
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

  // 2) Logged in but no employee selected -> Lobby
  if (!selectedEmployee) {
    return <LobbyScreen onSelectEmployee={handleSelectEmployee} onLogout={handleSignOut} />;
  }

  // 3) Dashboard
  return (
    <ToastProvider>
      <EmployeeSettingsModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} />

      <ConfettiOverlay triggerId={lastCelebration?.id} durationMs={1400} onDone={clearCelebration} />

      <SystemBackground mode="app" />

      {showInviteModal && inviteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass-panel rounded-xl border border-black/10 dark:border-white/10 shadow-2xl max-w-md w-full p-6 text-center clip-corner bg-white/80 dark:bg-glass-bg">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 shadow-neon-purple">
              <Icon name="domain" size={24} className="text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
              Convite para família
            </h3>
            <p className="text-slate-700 dark:text-gray-300 mb-6">
              Você foi convidado para gerenciar a família{' '}
              <strong className="text-slate-900 dark:text-white">{inviteInfo.employers?.name}</strong>.
            </p>

            {user ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg transition-all text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/15"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAcceptInvite}
                  disabled={processingInvite}
                  className="flex-1 px-4 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors disabled:opacity-50 shadow-neon-purple border border-primary/30"
                >
                  {processingInvite ? 'Aceitando...' : 'Aceitar convite'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-yellow-200 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
                  Faça login ou crie uma conta para aceitar este convite.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-all text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/15"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAcceptInvite}
                    className="flex-1 px-4 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors shadow-neon-purple border border-primary/30"
                  >
                    Entrar / Cadastrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative min-h-screen font-sans text-slate-900 dark:text-white bg-transparent">
        <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="group cursor-default flex items-center gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-primary/80 to-blue-600/80 rounded-lg flex items-center justify-center shadow-neon-purple clip-corner relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]">
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Icon name="grid_view" size={22} className="text-white relative z-10" />
                </div>
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-bold tracking-wider text-slate-900 dark:text-white uppercase dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.35)]">
                    SIS<span className="text-primary">.DOMÉSTICA</span>
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-success rounded-full animate-pulse" />
                    <p className="text-[10px] text-primary tracking-[0.3em] font-semibold uppercase">
                      Gestão inteligente
                    </p>
                    <span className="text-[10px] border border-black/10 dark:border-white/10 px-2 py-0.5 rounded bg-white/60 dark:bg-black/20 font-bold text-slate-700 dark:text-gray-200">
                      {selectedEmployee.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <SyncStatusIndicator status={syncStatus} hasPendingChanges={hasPendingChanges} />
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg glass-panel text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:border-primary hover:shadow-neon-purple transition-all duration-300"
                title="Trocar família/funcionário"
              >
                <Icon name="domain" size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Trocar</span>
              </button>

              <div className="flex items-center gap-2 bg-white/60 dark:bg-glass-bg rounded-lg p-1.5 border border-black/10 dark:border-white/10 backdrop-blur-md shadow-lg">
                <button
                  onClick={() => handleYearChange(-1)}
                  className="w-9 h-9 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent hover:border-black/10 dark:hover:border-white/5"
                  title="Ano anterior"
                >
                  <Icon name="chevron_left" size={18} />
                </button>
                <span className="font-display text-lg font-bold text-secondary px-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] min-w-[64px] text-center">
                  {activeYear}
                </span>
                <button
                  onClick={() => handleYearChange(1)}
                  className="w-9 h-9 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent hover:border-black/10 dark:hover:border-white/5"
                  title="Próximo ano"
                >
                  <Icon name="chevron_right" size={18} />
                </button>
              </div>

              <ThemeToggleButton className="hidden sm:flex" />

              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-primary hover:shadow-neon-purple transition-all duration-300"
                title="Cadastro e Eventos"
              >
                <Icon name="settings" size={20} />
              </button>

              <button
                onClick={() => handleSignOut()}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-accent hover:shadow-neon-red transition-all duration-300"
                title={`Sair de ${user.email}`}
              >
                <Icon name="logout" size={20} />
              </button>
            </div>
          </div>
          <div className="relative h-px w-full">
            <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-primary via-secondary to-transparent" />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <section>
            <SummaryCards />
          </section>
          <section>
            <LedgerTable />
          </section>
        </main>
      </div>
    </ToastProvider>
  );
}
