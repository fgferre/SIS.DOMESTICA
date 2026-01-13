import { Users, Cpu, TrendingUp, Shield } from 'react-feather';

export function LandingFeatures() {
  return (
    <section id="funcionalidades" className="py-24 relative scroll-mt-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 reveal-hidden">
          <h2 className="font-display text-4xl text-white mb-4">
            Poder ilimitado no <span className="text-primary">Controle</span>
          </h2>
          <p className="font-sans text-gray-400 text-lg max-w-2xl mx-auto">
            Tudo o que você precisa para gerenciar sua equipe doméstica com a precisão de um sistema
            corporativo.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 (Span 2) */}
          <div className="lg:col-span-2 relative group reveal-hidden">
            <div className="h-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-[5px] hover:bg-white/[0.04] hover:border-primary/30 hover:shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-display tracking-widest bg-secondary/10 text-secondary border border-secondary/30 w-fit mb-4">
                MULTI-EMPREGADOR
              </span>

              <div className="w-[50px] h-[50px] rounded-xl flex items-center justify-center text-2xl mb-6 bg-primary/15 text-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Users size={24} />
              </div>

              <h3 className="font-display text-xl text-white mb-3">Gestão de Equipe Completa</h3>
              <p className="font-sans text-gray-400 leading-relaxed">
                Adicione múltiplos empregados e convide outros membros da família (cônjuge, filhos)
                para administrar o sistema. Controle de acesso granular para cada administrador.
              </p>

              <div className="absolute bottom-[-10px] right-[-10px] text-8xl font-black font-display text-white/[0.02] pointer-events-none leading-none">
                01
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group reveal-hidden">
            <div className="h-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-[5px] hover:bg-white/[0.04] hover:border-primary/30 hover:shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="w-[50px] h-[50px] rounded-xl flex items-center justify-center text-2xl mb-6 bg-secondary/15 text-secondary shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Cpu size={24} />
              </div>

              <h3 className="font-display text-xl text-white mb-3">Automação DAE/FGTS</h3>
              <p className="font-sans text-gray-400 leading-relaxed">
                Cálculos trabalhistas complexos processados em milissegundos. Gere guias de
                pagamento e mantenha-se em conformidade legal automaticamente.
              </p>

              <div className="absolute bottom-[-10px] right-[-10px] text-8xl font-black font-display text-white/[0.02] pointer-events-none leading-none">
                02
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group reveal-hidden">
            <div className="h-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-[5px] hover:bg-white/[0.04] hover:border-primary/30 hover:shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="w-[50px] h-[50px] rounded-xl flex items-center justify-center text-2xl mb-6 bg-success/15 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <TrendingUp size={24} />
              </div>

              <h3 className="font-display text-xl text-white mb-3">Pote de Bônus</h3>
              <p className="font-sans text-gray-400 leading-relaxed">
                Gamificação da economia. O sistema calcula otimizações fiscais e transforma a
                diferença em um bônus justo para o funcionário.
              </p>

              <div className="absolute bottom-[-10px] right-[-10px] text-8xl font-black font-display text-white/[0.02] pointer-events-none leading-none">
                03
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative group reveal-hidden">
            <div className="h-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-[5px] hover:bg-white/[0.04] hover:border-primary/30 hover:shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="w-[50px] h-[50px] rounded-xl flex items-center justify-center text-2xl mb-6 bg-accent/15 text-accent shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <Shield size={24} />
              </div>

              <h3 className="font-display text-xl text-white mb-3">Segurança RLS</h3>
              <p className="font-sans text-gray-400 leading-relaxed">
                Seus dados são blindados com Row Level Security. A proteção de um banco de dados
                corporativo aplicada à sua casa.
              </p>

              <div className="absolute bottom-[-10px] right-[-10px] text-8xl font-black font-display text-white/[0.02] pointer-events-none leading-none">
                04
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
