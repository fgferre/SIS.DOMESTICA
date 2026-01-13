class AppTestimonials extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@400;500;600&display=swap');
                .testimonials-section {
                    padding: 6rem 1.5rem;
                    max-width: 1280px;
                    margin: 0 auto;
                    scroll-margin-top: 100px;
                }
.section-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .section-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2rem;
                    color: white;
                    margin-bottom: 1rem;
                }

                .cards-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }

                @media (min-width: 768px) {
                    .cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .cards-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .review-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(12px);
                    padding: 2rem;
                    border-radius: 16px;
                    position: relative;
                    transition: transform 0.3s ease;
                }

                .review-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(139, 92, 246, 0.3);
                }

                .quote-icon {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    color: rgba(255, 255, 255, 0.1);
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #8B5CF6;
                }

                .user-details h4 {
                    font-family: 'Orbitron', sans-serif;
                    color: white;
                    font-size: 1rem;
                    margin-bottom: 0.2rem;
                }

                .user-details span {
                    font-family: 'Rajdhani', sans-serif;
                    color: #06B6D4;
                    font-size: 0.9rem;
                }

                .review-text {
                    font-family: 'Rajdhani', sans-serif;
                    color: #d1d5db;
                    line-height: 1.6;
                    font-size: 1.1rem;
                }
            </style>
            
            <section class="testimonials-section" id="depoimentos">
                <div class="section-header reveal-hidden">
                    <h2 class="section-title">Quem usa, <span style="color:#06B6D4">Aprova</span></h2>
                </div>

                <div class="cards-grid">
                    <div class="review-card reveal-hidden">
                        <i data-feather="message-square" class="quote-icon"></i>
                        <div class="user-info">
                            <img src="http://static.photos/people/200x200/12" alt="Avatar" class="avatar">
                            <div class="user-details">
                                <h4>Carlos Mendes</h4>
                                <span>Arquiteto</span>
                            </div>
                        </div>
                        <p class="review-text">
                            "Eu achava que controlar a empregada doméstica era uma burocracia infinita. O SIS.DOMÉSTICA transformou isso em algo que levo 5 minutos por mês. O visual é outro nível."
                        </p>
                    </div>

                    <div class="review-card reveal-hidden">
                        <i data-feather="message-square" class="quote-icon"></i>
                        <div class="user-info">
                            <img src="http://static.photos/people/200x200/25" alt="Avatar" class="avatar">
                            <div class="user-details">
                                <h4>Fernanda Costa</h4>
                                <span>Empresária</span>
                            </div>
                        </div>
                        <p class="review-text">
                            "O recurso do 'Pote de Bônus' é genial. Minha babá ficou muito mais motivada e eu consegui economizar no final do ano. Segurança total para meus dados."
                        </p>
                    </div>

                    <div class="review-card reveal-hidden">
                        <i data-feather="message-square" class="quote-icon"></i>
                        <div class="user-info">
                            <img src="http://static.photos/people/200x200/33" alt="Avatar" class="avatar">
                            <div class="user-details">
                                <h4>Roberto Lima</h4>
                                <span>Advogado</span>
                            </div>
                        </div>
                        <p class="review-text">
                            "Interface de jogo, seriedade jurídica. O cálculo automático do FGTS me salvou de uma dor de cabeça gigante com a fiscalização. Recomendo demais."
                        </p>
                    </div>
                </div>
            </section>
        `;
        if (window.feather) {
            window.feather.replace();
        }
    }
}

customElements.define('app-testimonials', AppTestimonials);