/**
 * Application Configuration
 * Central configuration for AnjosDevOS
 */

export const APP_CONFIG = {
  name: 'AnjosDevOS',
  version: '1.0.0',
  description: 'AI Operating System - Sistema Operacional de IA',
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://yellowfire.ru/v1',
    timeout: 30000,
  },

  // Storage Keys
  storage: {
    providerSettings: 'anjosdev_provider_settings',
    theme: 'anjosdev_theme',
    language: 'anjosdev_language',
    lastOpenApps: 'anjosdev_last_open_apps',
  },

  // UI Configuration
  ui: {
    taskbarHeight: 48,
    windowMinWidth: 400,
    windowMinHeight: 350,
    animationDuration: 200,
  },

  // Feature Flags
  features: {
    enableMCP: true,
    enableGSD: true,
    enableDeepSeekHarness: true,
    enableOpenHands: true,
    enableTheiaIDE: true,
    enableDevToolsHub: true,
    enableMobile: true,
  },

  // Supported Providers
  providers: {
    openai: { name: 'OpenAI', enabled: true },
    anthropic: { name: 'Anthropic', enabled: true },
    google: { name: 'Google AI', enabled: true },
    deepseek: { name: 'DeepSeek', enabled: true },
    xai: { name: 'xAI', enabled: true },
    mistral: { name: 'Mistral AI', enabled: true },
    groq: { name: 'Groq', enabled: true },
    together: { name: 'Together AI', enabled: true },
    networktools: { name: 'NetworkTools', enabled: true },
  },

  // Default Models
  defaults: {
    provider: 'networktools',
    model: 'gpt-4o',
    temperature: 0.7,
    theme: 'dark' as const,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
