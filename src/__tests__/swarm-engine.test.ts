import { describe, it, expect } from 'vitest';
import { getSwarmEngine, SWARM_SPECIALISTS } from '@/lib/agent-swarm';
import {
  analyzeCodeQuality,
  generateUnitTestsForCode,
} from '@/lib/agent-swarm/collaboration-protocols';

describe('Swarm Engine & Protocols', () => {
  it('deve inicializar com todos os 7 agentes especialistas cadastrados', () => {
    const engine = getSwarmEngine();
    const agents = engine.getAllAgents();
    expect(agents.length).toBe(7);
    expect(SWARM_SPECIALISTS.length).toBe(7);

    const roles = agents.map((a) => a.role);
    expect(roles).toContain('architect');
    expect(roles).toContain('coder');
    expect(roles).toContain('reviewer');
    expect(roles).toContain('debugger');
    expect(roles).toContain('autopilot');
    expect(roles).toContain('devops');
    expect(roles).toContain('docs');
  });

  it('deve analisar qualidade e detectar problemas estáticos OWASP', () => {
    const insecureCode = `
      function run(input: any) {
        eval(input);
        console.log("debug", input);
      }
    `;

    const audit = analyzeCodeQuality(insecureCode, 'test.ts');
    expect(audit.passed).toBe(false);
    expect(audit.score).toBeLessThan(80);
    expect(audit.issues.length).toBeGreaterThan(0);

    const rules = audit.issues.map((i) => i.title);
    expect(rules.some((r) => r.toLowerCase().includes('eval') || r.toLowerCase().includes('any') || r.toLowerCase().includes('inseguro') || r.toLowerCase().includes('console'))).toBe(true);
  });

  it('deve gerar suíte de testes unitários com base no código fornecido', () => {
    const code = `
      export function soma(a: number, b: number): number {
        return a + b;
      }
    `;

    const generatedTests = generateUnitTestsForCode(code, 'math.ts');
    expect(generatedTests).toContain('describe');
    expect(generatedTests).toContain('it(');
    expect(generatedTests).toContain('expect');
  });
});
