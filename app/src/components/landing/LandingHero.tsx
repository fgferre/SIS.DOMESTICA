// Import screenshots
import dashboardDark from '../../assets/screenshots/dashboard-dark.jpg';
import lobby from '../../assets/screenshots/lobby.jpg';
import detail from '../../assets/screenshots/detail.jpg';

interface LandingHeroProps {
  onSignup: () => void;
  onLogin: () => void;
}

export function LandingHero({ onSignup, onLogin }: LandingHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-16 px-6 overflow-hidden">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center relative z-10">
        {/* Text Content */}
        <div className="reveal-hidden">
          <h1 className="font-display font-bold text-[2.5rem] md:text-[3.5rem] text-white leading-tight mb-6 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            Gestão Profissional para sua Família <br />
            <span className="bg-[linear-gradient(135deg,#fff_0%,#8B5CF6_100%)] bg-clip-text text-transparent">
              Performance de Enterprise.
            </span>
          </h1>
          <p className="font-sans text-xl text-gray-400 mb-10 leading-relaxed max-w-xl font-normal">
            Controle empregados domésticos, automatize cálculos de DAE/FGTS e gerencie o "Pote de
            Bônus" em uma interface que você vai querer usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onSignup}
              className="px-8 py-4 bg-primary text-white rounded-lg font-display font-bold tracking-widest border border-primary shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:bg-[#7c3aed] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-0.5"
            >
              CRIAR CONTA
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-4 bg-white/5 text-white rounded-lg font-display font-bold tracking-widest border border-white/20 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-secondary hover:text-secondary"
            >
              FAZER LOGIN
            </button>
          </div>
        </div>

        {/* Visual Content - 3D Screenshot Gallery */}
        <div className="screenshot-gallery reveal-hidden h-[450px] flex items-center justify-center relative">
          {/* Main Screenshot - Dashboard Dark */}
          <div className="screenshot-card main animate-float parallax-element">
            <img src={dashboardDark} alt="Dashboard do SIS.DOMÉSTICA" />
          </div>

          {/* Back Left - Lobby */}
          <div className="screenshot-card back-left animate-float-delayed parallax-element">
            <img src={lobby} alt="Lobby - Seleção de Funcionários" />
          </div>

          {/* Back Right - Detail View */}
          <div className="screenshot-card back-right animate-float parallax-element">
            <img src={detail} alt="Detalhamento Financeiro" />
          </div>
        </div>
      </div>
    </section>
  );
}
