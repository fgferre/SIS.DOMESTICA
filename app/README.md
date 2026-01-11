# SIS.DOMÉSTICA - Gestão Inteligente de Empregados Domésticos

Uma aplicação web robusta desenvolvida para simplificar e otimizar a gestão financeira de empregados domésticos no Brasil, com foco em transparência, conformidade com a PEC das Domésticas e estratégias de economia legal ("O Acordo").

## 🚀 Funcionalidades Principais

- **Motor de Cálculo Reverso:** Defina quanto quer pagar no bolso (Líquido Acordado) e o sistema calcula automaticamente o salário bruto necessário.
- **Gestão de Extras & Descontos:** Interface intuitiva para lançar horas extras (50%, 100%), adicional noturno, faltas e reembolsos. O sistema aplica automaticamente a incidência correta de impostos (INSS, IRRF, FGTS).
- **Visão Antagônica (Caixa vs. Competência):**
  - **Visão Caixa:** O que efetivamente sai do bolso no mês (Guia DAE).
  - **Visão Competência:** O custo real incorrido, incluindo provisões de Férias, 1/3 e 13º Salário.
- **Pote de Bônus (Running Balance):** Rastreamento automático de economias geradas (FGTS não depositado + economia de impostos patronais) para formação de reserva ou pagamento de bônus.
- **Multi-Ano:** Navegação fluida entre anos (2025, 2026, etc.) com persistência de dados local.
- **Validações de Compliance:** Proteção contra salário abaixo do mínimo, cálculo de férias excedentes e descontos ilegais.

## 🛠️ Stack Tecnológica

- **Frontend:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS (Arquitetura Utilitária), Lucide React (Ícones)
- **Estado & Persistência:** Zustand (Global Store) + Middleware de Persistência (LocalStorage)
- **Testes:** Vitest + React Testing Library (Cobertura de cálculos fiscais e UI)

## 🏃‍♂️ Como Executar

1.  **Instale as dependências:**

    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

3.  **Execute os testes (Opcional):**

    ```bash
    npm run test
    ```

    Ou para rodar com interface gráfica:

    ```bash
    npx vitest --ui
    ```

4.  **Build para Produção:**
    ```bash
    npm run build
    ```
    Os arquivos estáticos serão gerados na pasta `dist/`, prontos para deploy na Vercel, Netlify ou qualquer servidor estático.

## ⚖️ Aviso Legal

Esta ferramenta é um auxiliar de cálculo e não substitui a contabilidade oficial. As alíquotas de INSS e IRRF utilizam as tabelas vigentes (Base 2024/2025). Sempre consulte um contador para homologações oficiais.
