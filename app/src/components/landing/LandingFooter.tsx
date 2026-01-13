export function LandingFooter() {
  return (
    <footer className="bg-[#020203] border-t border-white/5 pt-16 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-16">
        {/* Brand Column */}
        <div>
          <h3 className="font-display text-2xl text-white font-bold mb-4 tracking-wider">
            SIS.<span className="text-primary">DOMÉSTICA</span>
          </h3>
          <p className="text-gray-500 mb-6 leading-relaxed max-w-[300px]">
            A plataforma definitiva para a gestão de empregados domésticos. Segurança, automação e
            controle financeiro.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded text-success text-sm font-bold">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_#10B981] animate-pulse" />
            SISTEMA OPERACIONAL
          </div>
        </div>

        {/* Links Columns */}
        {[
          { title: 'Produto', links: ['Funcionalidades', 'Preços', 'Segurança', 'Roadmap'] },
          { title: 'Legal', links: ['Termos de Uso', 'Privacidade', 'LGPD', 'Contato'] },
          { title: 'Social', links: ['Instagram', 'LinkedIn', 'Twitter'] },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="text-white font-bold mb-6 tracking-wide text-lg">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map(link => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} SIS.DOMÉSTICA Tecnologia Ltda. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
