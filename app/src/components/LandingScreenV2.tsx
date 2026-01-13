import { SystemBackground } from '@/components/ui/SystemBackground';
import { Icon } from '@/components/ui/Icon';

interface LandingScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingScreen({ onLogin, onSignup }: LandingScreenProps) {
  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white font-sans overflow-hidden">
      <SystemBackground mode="hero" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/20 text-[10px] uppercase tracking-[0.3em] text-slate-700 dark:text-gray-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-success shadow-neon-green" />
            Sistema pronto para uso
          </div>

          <h1 className="mt-6 font-display text-5xl md:text-6xl font-black tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
            SIS<span className="text-primary">.DOMÉSTICA</span>
          </h1>

          <p className="mt-5 text-xl md:text-2xl text-slate-700 dark:text-gray-300 font-medium">
            Gestão profissional para sua família — com visual de alta performance.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onLogin}
              className="px-8 py-3 rounded-lg font-bold uppercase tracking-wider glass-panel clip-corner border border-black/10 dark:border-white/15 hover:border-secondary/50 hover:shadow-neon-cyan transition-all"
            >
              <span className="inline-flex items-center gap-2">
                <Icon name="login" size={20} />
                Entrar
              </span>
            </button>
            <button
              onClick={onSignup}
              className="px-8 py-3 rounded-lg font-bold uppercase tracking-wider bg-primary/80 text-white clip-corner border border-primary/30 hover:bg-primary hover:shadow-neon-purple transition-all"
            >
              <span className="inline-flex items-center gap-2">
                <Icon name="person_add" size={20} />
                Criar Conta
              </span>
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="glass-panel clip-corner p-4 border border-black/10 dark:border-white/10">
              <div className="text-primary font-bold uppercase tracking-widest text-[10px]">
                Ledger
              </div>
              <div className="text-slate-700 dark:text-gray-300 text-sm mt-1">Visão mensal clara, sem perder detalhes.</div>
            </div>
            <div className="glass-panel clip-corner p-4 border border-black/10 dark:border-white/10">
              <div className="text-secondary font-bold uppercase tracking-widest text-[10px]">
                Automação
              </div>
              <div className="text-slate-700 dark:text-gray-300 text-sm mt-1">Auto-save e status de sincronização.</div>
            </div>
            <div className="glass-panel clip-corner p-4 border border-black/10 dark:border-white/10">
              <div className="text-success font-bold uppercase tracking-widest text-[10px]">
                Segurança
              </div>
              <div className="text-slate-700 dark:text-gray-300 text-sm mt-1">Sem regressão de dados ou ações.</div>
            </div>
          </div>

          <p className="mt-8 text-xs text-slate-600 dark:text-gray-500 uppercase tracking-[0.3em]">
            Desktop-first • Animações com fallback
          </p>
        </div>
      </div>
    </div>
  );
}
