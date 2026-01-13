class AppFeatures extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@400;600;700&display=swap');
                .features-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                    scroll-margin-top: 100px;
                }
.section-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .section-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.5rem;
                    color: white;
                    margin-bottom: 1rem;
                }

                .section-desc {
                    font-family: 'Rajdhani', sans-serif;
                    color: #9ca3af;
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .bento-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }

                @media (min-width: 768px) {
                    .bento-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .bento-grid {
                        grid-template-columns: repeat(3, 1fr);
                        grid-template-rows: auto auto;
                    }
                    .span-2 {
                        grid-column: span 2;
                    }
                }

                .bento-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    backdrop-filter: blur(10px);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .bento-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                }

                .bento-card:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(139, 92, 246, 0.3);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                }

                .card-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                    font-size: 1.5rem;
                }

                .icon-violet { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; box-shadow: 0 0 15px rgba(139, 92, 246, 0.2); }
                .icon-cyan { background: rgba(6, 182, 212, 0.15); color: #06B6D4; box-shadow: 0 0 15px rgba(6, 182, 212, 0.2); }
                .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #10B981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
                .icon-rose { background: rgba(244, 63, 94, 0.15); color: #F43F5E; box-shadow: 0 0 15px rgba(244, 63, 94, 0.2); }

                .card-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.25rem;
                    color: white;
                    margin-bottom: 0.75rem;
                }

                .card-text {
                    font-family: 'Rajdhani', sans-serif;
                    color: #9ca3af;
                    line-height: 1.6;
                    font-weight: 400;
                }

                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    font-family: 'Orbitron', sans-serif;
                    margin-bottom: 1rem;
                }
                
                .badge-rls {
                    background: rgba(6, 182, 212, 0.1);
                    color: #06B6D4;
                    border: 1px solid rgba(6, 182, 212, 0.3);
                }

                .decorative-number {
                    position: absolute;
                    bottom: -10px;
                    right: -10px;
                    font-size: 6rem;
                    font-weight: 900;
                    color: rgba(255, 255, 255, 0.02);
                    font-family: 'Orbitron', sans-serif;
                    pointer-events: none;
                    line-height: 1;
                }
            </style>
            
            <div class="features-container" id="funcionalidades">
                <div class="section-header reveal-hidden">
                    <h2 class="section-title">Poder ilimitado no <span style="color: #8B5CF6">Controle</span></h2>
                    <p class="section-desc">Tudo o que você precisa para gerenciar sua equipe doméstica com a precisão de um sistema corporativo.</p>
                </div>

                <div class="bento-grid">
                    <div class="bento-card reveal-hidden span-2">
                        <span class="badge badge-rls">MULTI-EMPREGADOR</span>
                        <div class="card-icon icon-violet">
                            <i data-feather="users"></i>
                        </div>
                        <h3 class="card-title">Gestão de Equipe Completa</h3>
                        <p class="card-text">
                            Adicione múltiplos empregados e convide outros membros da família (cônjuge, filhos) para administrar o sistema. Controle de acesso granular para cada administrador.
                        </p>
                        <div class="decorative-number">01</div>
                    </div>

                    <div class="bento-card reveal-hidden">
                        <div class="card-icon icon-cyan">
                            <i data-feather="cpu"></i>
                        </div>
                        <h3 class="card-title">Automação DAE/FGTS</h3>
                        <p class="card-text">
                            Cálculos trabalhistas complexos processados em milissegundos. Gere guias de pagamento e mantenha-se em conformidade legal automaticamente.
                        </p>
                        <div class="decorative-number">02</div>
                    </div>

                    <div class="bento-card reveal-hidden">
                        <div class="card-icon icon-emerald">
                            <i data-feather="trending-up"></i>
                        </div>
                        <h3 class="card-title">Pote de Bônus</h3>
                        <p class="card-text">
                            Gamificação da economia. O sistema calcula otimizações fiscais e transforma a diferença em um bônus justo para o funcionário.
                        </p>
                        <div class="decorative-number">03</div>
                    </div>

                    <div class="bento-card reveal-hidden">
                        <div class="card-icon icon-rose">
                            <i data-feather="shield"></i>
                        </div>
                        <h3 class="card-title">Segurança RLS</h3>
                        <p class="card-text">
                            Seus dados são blindados com Row Level Security. A proteção de um banco de banco de dados corporativo aplicada à sua casa.
                        </p>
                        <div class="decorative-number">04</div>
                    </div>
                </div>
            </div>
        `;
        if (window.feather) {
            window.feather.replace();
        }
    }
}

customElements.define('app-features', AppFeatures);