const fs = require('fs');
const path = require('path');

const content = `
import React from 'react';
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
          Gestão Profissional para sua Família.<br/>
          <span className="text-base text-slate-600 font-normal">Cálculos, recibos e histórico na nuvem.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
          <button 
            onClick={onLogin} 
            className="flex-1 bg-white/80 backdrop-blur-sm border border-white/50 text-slate-700 px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-white hover:scale-105 transition-all text-lg"
          >
            Entrar
          </button>
          <button 
            onClick={onSignup}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all text-lg"
          >
            Criar Conta
          </button>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/landing/LandingScreen.tsx', content.trim());
console.log('File written successfully');
