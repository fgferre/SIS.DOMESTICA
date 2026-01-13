class AppNav extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@500;600&display=swap');
                
                nav {
                    font-family: 'Rajdhani', sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 1000;
                    background: rgba(5, 5, 8, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }

                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    font-size: 1.5rem;
                    color: white;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    letter-spacing: 0.1em;
                }

                .logo span {
                    color: #8B5CF6;
                }

                .nav-links {
                    display: none;
                    gap: 2rem;
                    align-items: center;
                }

                .nav-link {
                    color: #9ca3af;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 1.1rem;
                    transition: color 0.3s ease;
                    position: relative;
                }

                .nav-link:hover {
                    color: #fff;
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: #06B6D4;
                    transition: width 0.3s ease;
                    box-shadow: 0 0 8px #06B6D4;
                }

                .nav-link:hover::after {
                    width: 100%;
                }

                .btn-login {
                    padding: 0.5rem 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    color: white;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .btn-login:hover {
                    border-color: #06B6D4;
                    background: rgba(6, 182, 212, 0.1);
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
                }

                .mobile-menu-btn {
                    display: block;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                }

                @media (min-width: 768px) {
                    .nav-links {
                        display: flex;
                    }
                    .mobile-menu-btn {
                        display: none;
                    }
                }
            </style>
            <nav>
                <div class="container">
                    <a href="#" class="logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                        SIS.<span>DOMÉSTICA</span>
                    </a>
                    
                    <div class="nav-links">
                        <a href="#funcionalidades" class="nav-link">Funcionalidades</a>
                        <a href="#demo" class="nav-link">Demo</a>
                        <a href="#depoimentos" class="nav-link">Clientes</a>
                        <a href="#" class="btn-login">Entrar</a>
                    </div>

                    <button class="mobile-menu-btn">
                        <i data-feather="menu"></i>
                    </button>
                </div>
            </nav>
        `;
        if (window.feather) {
            window.feather.replace();
        }
    }
}

customElements.define('app-nav', AppNav);