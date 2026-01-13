import { useEffect, useRef } from 'react';
import { ArrowRight } from 'react-feather';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingDemo } from './LandingDemo';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingFooter } from './LandingFooter';
import './landing.css';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll Reveal Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.reveal-hidden');
    hiddenElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Parallax Effect
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = e.clientX * -0.01;
      const moveY = e.clientY * -0.01;

      const floatingElements = document.querySelectorAll('.parallax-element');
      floatingElements.forEach((el, index) => {
        // Cast to HTMLElement to access style
        const element = el as HTMLElement;
        // Index-based speed calculation matching mockup
        const speed = (index + 1) * 0.5;
        element.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-[#050508] min-h-screen text-gray-200 font-body antialiased overflow-x-hidden selection:bg-primary selection:text-white landing-scroll scroll-smooth"
    >
      {/* Background Noise & Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <LandingNavbar onLogin={onLogin} />

      <main className="relative z-10">
        <LandingHero onSignup={onSignup} onLogin={onLogin} />

        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20 pointer-events-none" />
          <LandingFeatures />
        </div>

        <LandingDemo />

        <LandingTestimonials />

        {/* Final CTA Section */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10 reveal-hidden">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-wide">
              Pronto para a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                Próxima Era?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 font-light max-w-2xl mx-auto font-sans">
              Junte-se às famílias que transformaram a gestão doméstica em uma experiência
              estratégica e sem dores de cabeça.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={onSignup}
                className="px-8 py-4 bg-primary hover:bg-[#7c3aed] text-white font-display font-bold tracking-wider rounded shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
              >
                CRIAR CONTA AGORA{' '}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
