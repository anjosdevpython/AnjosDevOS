/**
 * Skills Executor — Real LLM execution of GSD and AI Hero skills
 * Connects 21 developer skills to AI chat endpoints
 */

export interface SkillExecutionResult {
  skillId: string;
  skillName: string;
  userInput: string;
  output: string;
  model: string;
  tokensUsed: number;
  executedAt: Date;
  error?: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  category: 'gsd' | 'ai-hero' | 'devtools';
  description: string;
  systemPrompt: string;
  inputPlaceholder: string;
  icon: string;
  badgeColor: string;
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // ─── GSD Skills (8) ───
  {
    id: 'grill-with-docs',
    name: 'Grill with Docs',
    category: 'gsd',
    description: 'Interroga documentos para extrair insights, premissas ocultas e inconsistências arquiteturais.',
    systemPrompt: 'Você é um arquiteto crítico sênior. Analise o documento ou requisito fornecido e gere perguntas investigativas e pontuais para expor inconsistências, gaps técnicos e premissas não validadas.',
    inputPlaceholder: 'Cole aqui a documentação, PRD ou requisito...',
    icon: '🔥',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    id: 'to-spec',
    name: 'To Spec',
    category: 'gsd',
    description: 'Converte requisitos informais em especificação técnica precisa com escopo e critérios.',
    systemPrompt: 'Você é um engenheiro de software líder. Converta o texto fornecido em uma especificação técnica formal contendo: Visão Geral, Arquitetura Proposta, Critérios de Aceite, Riscos e Trade-offs.',
    inputPlaceholder: 'Descreva a funcionalidade ou necessidade...',
    icon: '📋',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'to-tickets',
    name: 'To Tickets',
    category: 'gsd',
    description: 'Quebra épicos e especificações em tarefas atômicas estimadas com dependências.',
    systemPrompt: 'Você é um Tech Lead especialista em quebra de tarefas. Divida o requisito fornecido em tickets atômicos e priorizados (com título, descrição, critérios de teste e estimativa de complexidade).',
    inputPlaceholder: 'Cole a especificação para quebrar em tickets...',
    icon: '🎫',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
  {
    id: 'wayfinder',
    name: 'Wayfinder',
    category: 'gsd',
    description: 'Navega por problemas complexos com raciocínio estruturado passo a passo e mitigação.',
    systemPrompt: 'Você é o Wayfinder. Guie a resolução de problemas complexos: 1) Diagnóstico da raiz, 2) Caminhos viáveis de solução, 3) Avaliação de impacto, 4) Plano de ação recomendado.',
    inputPlaceholder: 'Descreva o gargalo ou desafio arquitetural...',
    icon: '🧭',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    id: 'research',
    name: 'Research',
    category: 'gsd',
    description: 'Pesquisa técnica comparativa com benchmarks, prós/contras e recomendação final.',
    systemPrompt: 'Você é um pesquisador técnico. Forneça uma análise comparativa aprofundada sobre as tecnologias e abordagens solicitadas, incluindo benchmarks teóricos, prós, contras e recomendação com justificativa.',
    inputPlaceholder: 'Sobre quais tecnologias ou abordagens deseja pesquisar?',
    icon: '🔬',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'implement',
    name: 'Implement',
    category: 'gsd',
    description: 'Gera código de produção com padrões modernos, TypeScript estrito e tratamento de erros.',
    systemPrompt: 'Você é um desenvolvedor sênior fullstack. Escreva o código completo e pronto para produção com TypeScript estrito, tratamento robusto de erros e padrões de clean code.',
    inputPlaceholder: 'O que precisa ser implementado?',
    icon: '⚡',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  {
    id: 'prototype',
    name: 'Prototype',
    category: 'gsd',
    description: 'Desenvolve prova de conceito (PoC) rápida focada em validar o valor central.',
    systemPrompt: 'Você é um engenheiro de prototipagem rápida. Crie um MVP / PoC funcional e conciso para validar a hipótese ou ideia central com a menor quantidade de fricção possível.',
    inputPlaceholder: 'Qual hipótese ou ideia deseja prototipar?',
    icon: '🛠️',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'tdd',
    name: 'TDD',
    category: 'gsd',
    description: 'Cria testes unitários e de integração antes da implementação (Vitest / Playwright).',
    systemPrompt: 'Você é um especialista em Test-Driven Development. Escreva uma suíte abrangente de testes unitários (Vitest) e de integração cobrindo casos felizes, exceções e edge cases.',
    inputPlaceholder: 'Para qual funcionalidade deseja escrever os testes?',
    icon: '🧪',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },

  // ─── AI Hero Skills (13) ───
  {
    id: 'code-review',
    name: 'Code Review',
    category: 'ai-hero',
    description: 'Revisão minuciosa com foco em segurança OWASP, performance e boas práticas.',
    systemPrompt: 'Você é um revisor de código sênior de elite. Analise o código enviado apontando vulnerabilidades, code smells, oportunidades de otimização e sugestões de refatoração.',
    inputPlaceholder: 'Cole o código para revisão...',
    icon: '👀',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'refactor',
    name: 'Refactor',
    category: 'ai-hero',
    description: 'Refatora código legado preservando comportamento com arquitetura limpa.',
    systemPrompt: 'Você é um especialista em refatoração. Transforme o código fornecido em uma versão limpa, modular e altamente manutenível, mantendo a compatibilidade funcional.',
    inputPlaceholder: 'Cole o código que precisa de refatoração...',
    icon: '♻️',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  },
  {
    id: 'explain',
    name: 'Explain Code',
    category: 'ai-hero',
    description: 'Explica o funcionamento interno de trechos complexos em linguagem didática.',
    systemPrompt: 'Você é um instrutor técnico sênior. Explique passo a passo o que o código faz, o raciocínio por trás das estruturas e a complexidade algorítmica.',
    inputPlaceholder: 'Cole o código que deseja entender...',
    icon: '💡',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    id: 'debug',
    name: 'Debug Assistant',
    category: 'ai-hero',
    description: 'Diagnostica causa raiz de erros, stack traces e comportamento inesperado.',
    systemPrompt: 'Você é um detetive de bugs. Analise o stack trace ou descrição do problema, identifique a causa raiz e forneça a correção exata.',
    inputPlaceholder: 'Cole o erro, stack trace ou comportamento defeituoso...',
    icon: '🐛',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    id: 'docs',
    name: 'Write Docs',
    category: 'ai-hero',
    description: 'Gera documentação técnica Markdown completa para APIs, libs e projetos.',
    systemPrompt: 'Você é um Technical Writer. Escreva uma documentação impecável em Markdown: Visão Geral, Guia de Instalação, Exemplos de Uso, Referência de Métodos e Troubleshooting.',
    inputPlaceholder: 'Cole o código ou descreva a ferramenta a ser documentada...',
    icon: '📝',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  {
    id: 'optimize',
    name: 'Optimize',
    category: 'ai-hero',
    description: 'Otimiza latência, consumo de memória e complexidade ciclomática.',
    systemPrompt: 'Você é um engenheiro de performance. Otimize o algoritmo ou query enviada visando menor latência e consumo de recursos, justificando os ganhos de Big-O.',
    inputPlaceholder: 'Cole o trecho lento ou query a otimizar...',
    icon: '🚀',
    badgeColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  },
  {
    id: 'security',
    name: 'Security Audit',
    category: 'ai-hero',
    description: 'Auditoria de segurança contra injeção, XSS, CSRF, vazamento de credenciais e CVEs.',
    systemPrompt: 'Você é um auditor de segurança e ethical hacker. Analise o código contra OWASP Top 10 e práticas de hard coding de segredos, classificando severidades (Crítico, Alto, Médio, Baixo).',
    inputPlaceholder: 'Cole o código para auditoria de segurança...',
    icon: '🛡️',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  {
    id: 'api-design',
    name: 'API Design',
    category: 'ai-hero',
    description: 'Modela endpoints RESTful e contratos OpenAPI/Swagger com boas práticas.',
    systemPrompt: 'Você é um arquiteto de APIs. Projete contratos REST / GraphQL elegantes, consistentes, idempotentes e seguros com exemplos de requests e responses JSON.',
    inputPlaceholder: 'Descreva os recursos e casos de uso da API...',
    icon: '🌐',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'db-design',
    name: 'Database Design',
    category: 'ai-hero',
    description: 'Modela esquemas relacionais (PostgreSQL) e NoSQL com índices e integridade.',
    systemPrompt: 'Você é um Database Architect. Crie esquemas DDL SQL completos com chaves primárias, estrangeiras, constraints, índices otimizados e diagramação lógica.',
    inputPlaceholder: 'Descreva os dados e relacionamentos do seu sistema...',
    icon: '🗄️',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    category: 'ai-hero',
    description: 'Desenha arquiteturas de microserviços, event-driven e serverless resilientes.',
    systemPrompt: 'Você é um Enterprise Software Architect. Projete a arquitetura do sistema com padrões (CQRS, Event Sourcing, Circuit Breaker), diagramas conceituais e justificativas.',
    inputPlaceholder: 'Descreva o problema de escala ou sistema a ser arquitetado...',
    icon: '🏛️',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'ci-cd',
    name: 'CI/CD Pipeline',
    category: 'ai-hero',
    description: 'Cria workflows de automação para GitHub Actions, Docker e deployment.',
    systemPrompt: 'Você é um DevOps Engineer. Gere arquivos .github/workflows/ci.yml completos com cache, testes, linting, build multi-stage e deploy automatizado.',
    inputPlaceholder: 'Descreva a stack e requisitos do pipeline...',
    icon: '🔄',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  {
    id: 'migrate',
    name: 'Migration Plan',
    category: 'ai-hero',
    description: 'Planeja migração de tecnologias e banco de dados com zero downtime.',
    systemPrompt: 'Você é um especialista em migrações de sistemas. Elabore um plano passo a passo com estratégia blue-green / canary, scripts de compatibilidade e rollback plan.',
    inputPlaceholder: 'Qual sistema ou banco deseja migrar e para qual tecnologia?',
    icon: '📦',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  {
    id: 'cost-analysis',
    name: 'Cost Analysis',
    category: 'ai-hero',
    description: 'Analisa e reduz custos de infraestrutura em nuvem e consumo de tokens LLM.',
    systemPrompt: 'Você é um consultor de FinOps. Analise a arquitetura e consumo fornecidos e aponte oportunidades concretas de redução de custos em nuvem e IA sem perda de performance.',
    inputPlaceholder: 'Descreva sua infraestrutura e volume de uso atual...',
    icon: '💰',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
];

export class SkillsExecutor {
  static async execute(
    skillId: string,
    userInput: string,
    model: string = 'gpt-4o'
  ): Promise<SkillExecutionResult> {
    const skill = SKILL_DEFINITIONS.find((s) => s.id === skillId);
    if (!skill) throw new Error(`Skill '${skillId}' não encontrada`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: skill.systemPrompt },
            { role: 'user', content: userInput },
          ],
          model,
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };

      const output = data.choices?.[0]?.message?.content ?? 'Nenhuma resposta gerada.';
      const tokensUsed = data.usage?.total_tokens ?? 0;

      return {
        skillId,
        skillName: skill.name,
        userInput,
        output,
        model,
        tokensUsed,
        executedAt: new Date(),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido na execução';
      return {
        skillId,
        skillName: skill.name,
        userInput,
        output: '',
        model,
        tokensUsed: 0,
        executedAt: new Date(),
        error: msg,
      };
    }
  }
}