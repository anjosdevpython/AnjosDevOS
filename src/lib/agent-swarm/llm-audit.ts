import { chatCompletion } from '@/lib/ai/api-client';
import { analyzeCodeQuality } from './collaboration-protocols';
import { SWARM_SPECIALISTS } from './agent-specialists';

export interface LLMAuditIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  line?: number;
  title: string;
  description: string;
  suggestion: string;
  fixedCode?: string;
  category?: string;
}

export interface LLMAuditResult {
  score: number;
  summary: string;
  issues: LLMAuditIssue[];
  securityAnalysis: {
    owaspCategory: string;
    riskLevel: 'Mínimo' | 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
    recommendations: string[];
  };
  durationMs: number;
  source: 'llm' | 'heuristic';
}

export async function llmAudit(params: {
  code: string;
  fileName?: string;
  model?: string;
}): Promise<LLMAuditResult> {
  const startTime = Date.now();
  const reviewer =
    SWARM_SPECIALISTS.find((s) => s.id === 'anjos-reviewer') || SWARM_SPECIALISTS[2];
  const fileName = params.fileName || 'source.ts';

  const systemPrompt = `${reviewer.systemPrompt}
Sua resposta DEVE ser estritamente um JSON no seguinte formato:
{
  "score": 85,
  "summary": "Resumo conciso da auditoria de segurança e qualidade",
  "issues": [
    {
      "severity": "high",
      "line": 12,
      "title": "Possível injeção de comando ou SQL",
      "description": "Explicação do risco de segurança",
      "suggestion": "Como corrigir",
      "fixedCode": "código corrigido para a linha ou bloco",
      "category": "OWASP A03: Injection"
    }
  ],
  "securityAnalysis": {
    "owaspCategory": "OWASP Top 10 (2025)",
    "riskLevel": "Médio",
    "recommendations": ["Adicionar sanitização", "Remover segredos"]
  }
}`;

  const userPrompt = `Realize a auditoria estática rigorosa de segurança (OWASP), tipagem TypeScript e performance no arquivo "${fileName}":\n\n\`\`\`typescript\n${params.code}\n\`\`\``;

  try {
    const response = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: params.model || 'gpt-4o',
      temperature: 0.2,
      max_tokens: 2500,
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';
    // Extrair bloco JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 80,
        summary: parsed.summary || 'Auditoria concluída com sucesso.',
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        securityAnalysis: parsed.securityAnalysis || {
          owaspCategory: 'OWASP Top 10',
          riskLevel: 'Baixo',
          recommendations: ['Manter boas práticas de tipagem'],
        },
        durationMs: Date.now() - startTime,
        source: 'llm',
      };
    }
  } catch (err) {
    console.warn('⚠️ Chamada LLM direta falhou, utilizando auditor estático heurístico:', err);
  }

  // Fallback heurístico em caso de falha de conexão/API key
  const staticAudit = analyzeCodeQuality(params.code, fileName);
  const issues: LLMAuditIssue[] = staticAudit.issues.map((f) => ({
    severity: (f.severity === 'info' ? 'low' : f.severity) as 'critical' | 'high' | 'medium' | 'low',
    line: f.line,
    title: f.title,
    description: f.description,
    suggestion: f.suggestion,
    fixedCode: f.fixedCode || params.code.replace(/any/g, 'unknown').replace(/console\.log\(.*?\);?/g, '// log removed'),
    category: f.severity === 'critical' ? 'Segurança' : 'Qualidade de Código',
  }));

  return {
    score: staticAudit.score,
    summary: `Auditoria estática executada com ${staticAudit.issues.length} achados identificados.`,
    issues,
    securityAnalysis: {
      owaspCategory: 'OWASP Top 10 Heurístico',
      riskLevel: staticAudit.score < 50 ? 'Crítico' : staticAudit.score < 80 ? 'Médio' : 'Baixo',
      recommendations: ['Evitar tipos any', 'Sanitizar inputs', 'Remover logs em produção'],
    },
    durationMs: Date.now() - startTime,
    source: 'heuristic',
  };
}
