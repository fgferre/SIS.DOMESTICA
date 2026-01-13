class AppFooter extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@400;500;600&display=swap');

                footer {
                    background: #020203;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 4rem 1.5rem 2rem;
                    font-family: 'Rajdhani', sans-serif;
                }

                .footer-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 3rem;
                }

                @media (min-width: 768px) {
                    .footer-container {
                        grid-template-columns: 1.5fr 1fr 1fr 1fr;
                    }
                }

                .footer-brand h3 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.5rem;
                    color: white;
                    margin-bottom: 1rem;
                }

                .footer-brand span {
                    color: #8B5CF6;
                }

                .footer-desc {
                    color: #6b7280;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    max-width: 300px;
                }

                .footer-col h4 {
                    color: white;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    font-size: 1.1rem;
                    letter-spacing: 1px;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-links li {
                    margin-bottom: 0.8rem;
                }

                .footer-links a {
                    color: #9ca3af;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .footer-links a:hover {
                    color: #06B6D4;
                }

                .status-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 4px;
                    width: fit-content;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #10B981;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #10B981;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }

                .status-text {
                    color: #10B981;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .copyright {
                    text-align: center;
                    margin-top: 4rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    color: #4b5563;
                    font-size: 0.9rem;
                }
            </style>

            <footer>
                <div class="footer-container">
                    <div class="footer-brand">
                        <h3>SIS.<span>DOMÉSTICA</span></h3>
                        <p class="footer-desc">
                            A plataforma definitiva para a gestão de empregados domésticos. Segurança, automação e controle financeiro.
                        </p>
                        <div class="status-row">
                            <div class="status-dot"></div>
                            <span class="status-text">SISTEMA OPERACIONAL</span>
                        </div>
                    </div>

                    <div class="footer-col">
                        <h4>Produto</h4>
                        <ul class="footer-links">
                            <li><a href="#">Funcionalidades</a></li>
                            <li><a href="#">Preços</a></li>
                            <li><a href="#">Segurança</a></li>
                            <li><a href="#">Roadmap</a></li>
                        </ul>
                    </div>

                    <div class="footer-col">
                        <h4>Legal</h4>
                        <ul class="footer-links">
                            <li><a href="#">Termos de Uso</a></li>
                            <li><a href="#">Privacidade</a></li>
                            <li><a href="#">LGPD</a></li>
                            <li><a href="#">Contato</a></li>
                        </ul>
                    </div>

                    <div class="footer-col">
                        <h4>Social</h4>
                        <ul class="footer-links">
                            <li><a href="#">Instagram</a></li>
                            <li><a href="#">LinkedIn</a></li>
                            <li><a href="#">Twitter</a></li>
                        </ul>
                    </div>
                </div>
                <div class="copyright">
                    &copy; 2026 SIS.DOMÉSTICA Tecnologia Ltda. Todos os direitos reservados.
                </div>
            </footer>
        `;
        if (window.feather) {
            window.feather.replace();
        }
    }
}

customElements.define('app-footer', AppFooter);