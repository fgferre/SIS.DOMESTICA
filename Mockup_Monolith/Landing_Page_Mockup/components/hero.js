class AppHero extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');

                .hero-section {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8rem 1.5rem 4rem;
                    overflow: hidden;
                }

                .hero-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 4rem;
                    align-items: center;
                    position: relative;
                    z-index: 10;
                }

                @media (min-width: 1024px) {
                    .hero-container {
                        grid-template-columns: 1.2fr 1fr;
                    }
                }

                .hero-content h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.5rem;
                    line-height: 1.1;
                    font-weight: 900;
                    color: white;
                    margin-bottom: 1.5rem;
                    text-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
                }

                @media (min-width: 768px) {
                    .hero-content h1 {
                        font-size: 3.5rem;
                    }
                }

                .gradient-text {
                    background: linear-gradient(135deg, #fff 0%, #8B5CF6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-subtitle {
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 1.25rem;
                    color: #9ca3af;
                    margin-bottom: 2.5rem;
                    line-height: 1.6;
                    max-width: 600px;
                    font-weight: 400;
                }

                .cta-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                @media (min-width: 640px) {
                    .cta-group {
                        flex-direction: row;
                    }
                }

                .btn-primary {
                    background: #8B5CF6;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    text-decoration: none;
                    text-align: center;
                    border: 1px solid #8B5CF6;
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
                    transition: all 0.3s ease;
                    letter-spacing: 1px;
                }

                .btn-primary:hover {
                    background: #7c3aed;
                    box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    text-decoration: none;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(4px);
                    transition: all 0.3s ease;
                    letter-spacing: 1px;
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #06B6D4;
                    color: #06B6D4;
                }

                .hero-visual {
                    position: relative;
                    height: 400px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    perspective: 1000px;
                }

                .ledger-card {
                    position: absolute;
                    background: rgba(15, 15, 22, 0.6);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    width: 280px;
                    transition: transform 0.3s ease;
                }

                .ledger-card.main {
                    z-index: 2;
                    transform: rotateY(-10deg) rotateX(5deg);
                    border-top: 2px solid #8B5CF6;
                }

                .ledger-card.back-1 {
                    z-index: 1;
                    top: 20%;
                    right: 10%;
                    transform: scale(0.9) translateZ(-50px);
                    border-color: rgba(6, 182, 212, 0.3);
                    opacity: 0.6;
                }

                .ledger-card.back-2 {
                    z-index: 0;
                    bottom: 10%;
                    left: 5%;
                    transform: scale(0.8) translateZ(-100px);
                    border-color: rgba(16, 185, 129, 0.3);
                    opacity: 0.4;
                }

                .card-row {
                    height: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    margin-bottom: 12px;
                }

                .card-row.short { width: 40%; }
                .card-row.medium { width: 70%; }
                .card-row.full { width: 100%; }

                .floating-icon {
                    position: absolute;
                    background: rgba(5, 5, 8, 0.8);
                    border: 1px solid #06B6D4;
                    padding: 10px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
                }
0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }

            </style>
            <section class="hero-section">
                <div class="hero-container">
                    <div class="hero-content reveal-hidden">
                        <h1 class="font-display font-bold">
                            Gestão Profissional para sua Família <br>
                            <span class="gradient-text">Performance de Enterprise.</span>
                        </h1>
                        <p class="hero-subtitle">
                            Controle empregados domésticos, automatize cálculos de DAE/FGTS e gerencie o "Pote de Bônus" em uma interface que você vai querer usar.
                        </p>
                        <div class="cta-group">
                            <a href="#" class="btn-primary">CRIAR CONTA</a>
                            <a href="#" class="btn-secondary">FAZER LOGIN</a>
                        </div>
                    </div>

                    <div class="hero-visual reveal-hidden">
                        <div class="ledger-card main parallax-element animate-float">
                            <div style="display:flex; justify-content:space-between; margin-bottom:1rem; align-items:center;">
                                <span style="color:#8B5CF6; font-weight:bold; font-family:'Orbitron'">LEDGER.MASTER</span>
                                <i data-feather="shield" style="width:16px; color:#10B981;"></i>
                            </div>
                            <div class="card-row full"></div>
                            <div class="card-row medium"></div>
                            <div class="card-row short"></div>
                            <div style="margin-top:1.5rem; display:flex; justify-content:space-between;">
                                <div style="font-family:'Rajdhani'; color:#06B6D4; font-weight:700;">R$ 4.250,00</div>
                                <div style="font-family:'Rajdhani'; color:#10B981; font-size:0.8rem;">+12% ROI</div>
                            </div>
                        </div>
<div class="ledger-card back-1 parallax-element animate-float-delayed">
                             <div class="card-row medium"></div>
                             <div class="card-row full"></div>
                        </div>
                        <div class="ledger-card back-2 parallax-element animate-float">
                             <div class="card-row short"></div>
                             <div class="card-row short"></div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        if (window.feather) {
            window.feather.replace();
        }
    }
}

customElements.define('app-hero', AppHero);