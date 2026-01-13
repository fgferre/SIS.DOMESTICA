class AppDemo extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@400;500;600&display=swap');
                .demo-section {
                    padding: 6rem 1.5rem;
                    background: #020203;
                    position: relative;
                    overflow: hidden;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    scroll-margin-top: 100px;
                }
.demo-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 2;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .section-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2rem;
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .section-badge {
                    color: #06B6D4;
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    font-size: 0.9rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .hud-wrapper {
                    background: rgba(15, 15, 22, 0.8);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: 0 0 50px rgba(0,0,0,0.5);
                    position: relative;
                }

                .hud-corner {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    border: 2px solid #06B6D4;
                    transition: all 0.3s ease;
                }
                .tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
                .tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
                .bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
                .br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

                .hud-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    font-family: 'Rajdhani', sans-serif;
                    color: #9ca3af;
                }

                .hud-table th {
                    text-align: left;
                    padding: 1rem;
                    font-weight: 600;
                    color: white;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    font-size: 1rem;
                    letter-spacing: 1px;
                }

                .hud-table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    transition: color 0.3s;
                }

                .hud-table tr:last-child td {
                    border-bottom: none;
                }

                .hud-table tr.scanner-row {
                    cursor: default;
                    transition: background 0.2s;
                }

                .hud-table tr.scanner-row:hover {
                    background: rgba(6, 182, 212, 0.05);
                    color: white;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-block;
                }
                
                .status-paid {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10B981;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }

                .status-pending {
                    background: rgba(244, 63, 94, 0.2);
                    color: #F43F5E;
                    border: 1px solid rgba(244, 63, 94, 0.3);
                }

                .amount {
                    font-family: 'Orbitron', sans-serif;
                    color: #06B6D4;
                }

                .scanline-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                    background-size: 100% 4px;
                    pointer-events: none;
                    z-index: 5;
                    opacity: 0.3;
                }

                @keyframes scan-bar {
                    0% { top: -10%; opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { top: 110%; opacity: 0; }
                }

                .scan-bar {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: #06B6D4;
                    box-shadow: 0 0 10px #06B6D4;
                    animation: scan-bar 4s linear infinite;
                    z-index: 6;
                    pointer-events: none;
                }

            </style>
            
            <section class="demo-section" id="demo">
                <div class="demo-container">
                    <div class="section-header reveal-hidden">
                        <span class="section-badge">Demonstração Interativa</span>
                        <h2 class="section-title">O Núcleo do Sistema</h2>
                    </div>

                    <div class="hud-wrapper reveal-hidden">
                        <div class="hud-corner tl"></div>
                        <div class="hud-corner tr"></div>
                        <div class="hud-corner bl"></div>
                        <div class="hud-corner br"></div>
                        
                        <div class="scanline-overlay"></div>
                        <div class="scan-bar"></div>

                        <table class="hud-table">
                            <thead>
                                <tr>
                                    <th>REFERÊNCIA</th>
                                    <th>DESCRIÇÃO</th>
                                    <th>FUNCIONÁRIO</th>
                                    <th>VALOR</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="scanner-row">
                                    <td>OUT/2023</td>
                                    <td>Salário Base + H.E</td>
                                    <td>Maria Silva</td>
                                    <td class="amount">R$ 2.450,00</td>
                                    <td><span class="status-badge status-paid">PAGO</span></td>
                                </tr>
                                <tr class="scanner-row">
                                    <td>OUT/2023</td>
                                    <td>FGTS Mensal</td>
                                    <td>Maria Silva</td>
                                    <td class="amount">R$ 196,00</td>
                                    <td><span class="status-badge status-paid">PAGO</span></td>
                                </tr>
                                <tr class="scanner-row">
                                    <td>OUT/2023</td>
                                    <td>DARF Rescisão</td>
                                    <td>João Santos</td>
                                    <td class="amount">R$ 124,50</td>
                                    <td><span class="status-badge status-pending">PENDENTE</span></td>
                                </tr>
                                <tr class="scanner-row">
                                    <td>NOV/2023</td>
                                    <td>13º Salário (1ª Parc.)</td>
                                    <td>Maria Silva</td>
                                    <td class="amount">R$ 1.225,00</td>
                                    <td><span class="status-badge status-pending">AGENDADO</span></td>
                                </tr>
                                <tr class="scanner-row">
                                    <td>NOV/2023</td>
                                    <td>Bônus Performance</td>
                                    <td>Maria Silva</td>
                                    <td class="amount text-emerald-400">R$ 150,00</td>
                                    <td><span class="status-badge status-paid">BÔNUS</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
        if (window.feather) {
            window.feather.replace();
        }
    }
}

customElements.define('app-demo', AppDemo);