import { describe, it, expect } from 'vitest';
import { PROVIDERS, getAllModels, getModelsByCategory } from '@/lib/ai/providers';
import { SKILL_DEFINITIONS } from '@/lib/tools/skills-executor';
import { DevToolRunner } from '@/lib/tools/devtool-runner';

describe('AI Providers Registry (v1.2)', () => {
  it('should include all 11 providers including OpenRouter and Cohere', () => {
    const providerIds = Object.keys(PROVIDERS);
    expect(providerIds).toContain('openai');
    expect(providerIds).toContain('anthropic');
    expect(providerIds).toContain('google');
    expect(providerIds).toContain('deepseek');
    expect(providerIds).toContain('xai');
    expect(providerIds).toContain('mistral');
    expect(providerIds).toContain('groq');
    expect(providerIds).toContain('together');
    expect(providerIds).toContain('openrouter');
    expect(providerIds).toContain('cohere');
    expect(providerIds).toContain('networktools');
  });

  it('should have updated model versions across providers', () => {
    const models = getAllModels();
    const modelIds = models.map((m) => m.id);

    expect(modelIds).toContain('claude-opus-4-20250514');
    expect(modelIds).toContain('grok-4-0709');
    expect(modelIds).toContain('deepseek-coder-v2');
    expect(modelIds).toContain('command-r-plus-08-2024');
    expect(modelIds).toContain('gpt-5.6');
  });

  it('should have 21 executable skills across GSD and AI Hero categories', () => {
    expect(SKILL_DEFINITIONS.length).toBe(21);
    const gsdSkills = SKILL_DEFINITIONS.filter((s) => s.category === 'gsd');
    const aiHeroSkills = SKILL_DEFINITIONS.filter((s) => s.category === 'ai-hero');

    expect(gsdSkills.length).toBe(8);
    expect(aiHeroSkills.length).toBe(13);

    // Verify key skill IDs
    const ids = SKILL_DEFINITIONS.map((s) => s.id);
    expect(ids).toContain('grill-with-docs');
    expect(ids).toContain('to-spec');
    expect(ids).toContain('to-tickets');
    expect(ids).toContain('wayfinder');
    expect(ids).toContain('tdd');
    expect(ids).toContain('code-review');
    expect(ids).toContain('security');
  });

  it('should generate launch commands for Continue, Aider, Cline, OpenClaw', () => {
    expect(DevToolRunner.getInstallCommand('continue')).toContain('Continue.continue');
    expect(DevToolRunner.getInstallCommand('aider')).toContain('pip install');
    expect(DevToolRunner.getInstallCommand('cline')).toContain('claude-dev');
    expect(DevToolRunner.getInstallCommand('openclaw')).toContain('@openclaw/cli');
  });
});