import { useState, useEffect } from 'react';
import { Menu, X } from 'react-feather';

interface LandingNavbarProps {
  onLogin: () => void;
}

// Custom Layers SVG matching mockup logo
function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8B5CF6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  );
}

export function LandingNavbar({ onLogin }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-[#050508]/80 backdrop-blur-md border-white/5 py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 text-white no-underline group">
          <LayersIcon className="group-hover:scale-110 transition-transform" />
          <span className="font-display font-bold text-2xl tracking-widest">
            SIS.<span className="text-primary">DOMÉSTICA</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Funcionalidades', 'Demo', 'Clientes'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-400 font-sans font-semibold text-lg hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#06B6D4]" />
            </a>
          ))}
          <button
            onClick={onLogin}
            className="px-6 py-2 border border-white/20 rounded text-white font-semibold transition-all hover:border-secondary hover:bg-secondary/10 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            Entrar
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#050508] border-b border-white/10 p-6 flex flex-col gap-4">
          {['Funcionalidades', 'Demo', 'Clientes'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-300 font-sans font-semibold text-lg hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <button
            onClick={() => {
              onLogin();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-3 border border-white/20 rounded text-white font-semibold hover:border-secondary hover:bg-secondary/10"
          >
            Entrar
          </button>
        </div>
      )}
    </nav>
  );
}
