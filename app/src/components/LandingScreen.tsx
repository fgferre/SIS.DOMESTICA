import { AuroraBackground } from '@/components/ui/AuroraBackground';

interface LandingScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingScreen({ onLogin, onSignup }: LandingScreenProps) {
  return (
    <div className="relative min-h-screen text-slate-900 font-sans overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-4xl font-bold mb-6 text-slate-900 text-shadow-sm">SIS.DOMÉSTICA</h1>
        <p className="text-xl mb-8 text-slate-700 max-w-2xl mx-auto font-medium">
          Gestão Profissional para sua Família.
        </p>
        <div className="flex gap-4">
          <button onClick={onLogin} className="bg-white px-6 py-3 rounded-lg font-bold shadow-lg">
            Entrar
          </button>
          <button
            onClick={onSignup}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
          >
            Criar Conta
          </button>
        </div>
      </div>
    </div>
  );
}
