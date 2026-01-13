// Import screenshots
import dashboardDark from '../../assets/screenshots/dashboard-dark.jpg';
import dashboardLight from '../../assets/screenshots/dashboard-light.jpg';
import detail from '../../assets/screenshots/detail.jpg';
import lobby from '../../assets/screenshots/lobby.jpg';

export function LandingDemo() {
  const screenshots = [
    { src: dashboardDark, label: 'Dashboard Dark Mode', alt: 'Dashboard com tema escuro' },
    { src: dashboardLight, label: 'Dashboard Light Mode', alt: 'Dashboard com tema claro' },
    { src: detail, label: 'Detalhamento Financeiro', alt: 'Vista detalhada de cálculos' },
    { src: lobby, label: 'Gestão de Equipe', alt: 'Seleção de funcionários' },
  ];

  return (
    <section
      id="demo"
      className="py-24 relative overflow-hidden bg-[#020203] border-y border-white/5 scroll-mt-24"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 hud-grid opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 reveal-hidden">
          <span className="block text-secondary font-sans font-semibold tracking-[0.2em] uppercase text-sm mb-4">
            Demonstração Interativa
          </span>
          <h2 className="font-display text-4xl text-white mb-4">O Núcleo do Sistema</h2>
          <p className="text-gray-400 font-sans max-w-2xl mx-auto">
            Interface profissional com suporte a tema escuro e claro. Veja seu controle financeiro
            doméstico com a clareza de um sistema enterprise.
          </p>
        </div>

        {/* Screenshot Gallery */}
        <div className="demo-gallery reveal-hidden">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className="demo-screenshot group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img src={screenshot.src} alt={screenshot.alt} loading="lazy" />
              <span className="label">{screenshot.label}</span>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlights below gallery */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 reveal-hidden">
          {[
            {
              title: 'Dual Theme',
              desc: 'Modo escuro e claro para seu conforto visual',
              color: 'text-primary',
            },
            {
              title: 'Cálculos em Tempo Real',
              desc: 'FGTS, INSS e DAE calculados automaticamente',
              color: 'text-secondary',
            },
            {
              title: 'Pote de Bônus',
              desc: 'Gamificação da economia tributária',
              color: 'text-success',
            },
          ].map((feature, i) => (
            <div key={i} className="text-center">
              <h3 className={`font-display text-lg ${feature.color} mb-2`}>{feature.title}</h3>
              <p className="text-gray-500 font-sans text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
