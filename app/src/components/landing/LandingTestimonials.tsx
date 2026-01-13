import { MessageSquare } from 'react-feather';

export function LandingTestimonials() {
  return (
    <section id="depoimentos" className="py-24 px-6 relative scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal-hidden">
          <h2 className="font-display text-4xl text-white">
            Quem usa, <span className="text-secondary">Aprova</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: 'Carlos Mendes',
              role: 'Arquiteto',
              img: 'https://i.pravatar.cc/150?u=carlos',
              text: 'Eu achava que controlar a empregada doméstica era uma burocracia infinita. O SIS.DOMÉSTICA transformou isso em algo que levo 5 minutos por mês. O visual é outro nível.',
            },
            {
              name: 'Fernanda Costa',
              role: 'Empresária',
              img: 'https://i.pravatar.cc/150?u=fernanda',
              text: "O recurso do 'Pote de Bônus' é genial. Minha babá ficou muito mais motivada e eu consegui economizar no final do ano. Segurança total para meus dados.",
            },
            {
              name: 'Roberto Lima',
              role: 'Advogado',
              img: 'https://i.pravatar.cc/150?u=roberto',
              text: 'Interface de jogo, seriedade jurídica. O cálculo automático do FGTS me salvou de uma dor de cabeça gigante com a fiscalização. Recomendo demais.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-panel p-8 rounded-2xl relative group hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 reveal-hidden"
            >
              <MessageSquare className="absolute top-6 right-6 text-white/10 w-6 h-6" />

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-[50px] h-[50px] rounded-full border-2 border-primary object-cover"
                />
                <div>
                  <h4 className="font-display text-white font-bold">{item.name}</h4>
                  <span className="font-sans text-secondary text-sm">{item.role}</span>
                </div>
              </div>

              <p className="font-sans text-gray-300 leading-relaxed text-lg opacity-90">
                "{item.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
