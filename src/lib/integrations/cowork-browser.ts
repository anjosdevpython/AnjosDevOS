/**
 * CoWork Browser Workbench Integration
 * In-app browser for web testing, automation, and screenshots
 * Based on CoWork-OS Browser V2 architecture
 */

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
  isLoading: boolean;
  viewport: ViewportSize;
  screenshots: BrowserScreenshot[];
  consoleLogs: ConsoleLog[];
  networkRequests: NetworkRequest[];
}

export type ViewportSize = 'desktop' | 'tablet' | 'mobile' | 'custom';

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  userAgent?: string;
}

export const VIEWPORTS: Record<ViewportSize, ViewportConfig> = {
  desktop: { name: 'Desktop', width: 1920, height: 1080 },
  tablet: { name: 'Tablet', width: 768, height: 1024 },
  mobile: { name: 'Mobile', width: 375, height: 812 },
  custom: { name: 'Custom', width: 1280, height: 720 },
};

export interface BrowserScreenshot {
  id: string;
  url: string;
  timestamp: Date;
  viewport: ViewportSize;
  annotation?: string;
}

export interface ConsoleLog {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
  source?: string;
}

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
  size?: number;
}

export interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'screenshot' | 'resize' | 'evaluate';
  selector?: string;
  value?: string;
  url?: string;
  script?: string;
}

export interface BrowserProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  viewport: ViewportSize;
  userAgent?: string;
  enableConsoleCapture: boolean;
  enableNetworkCapture: boolean;
  autoScreenshot: boolean;
}

export const BROWSER_PROFILES: BrowserProfile[] = [
  {
    id: 'qa-testing',
    name: 'QA Testing',
    description: 'Configuração para testes de qualidade',
    icon: '🔍',
    color: '#3b82f6',
    viewport: 'desktop',
    enableConsoleCapture: true,
    enableNetworkCapture: true,
    autoScreenshot: true,
  },
  {
    id: 'responsive-check',
    name: 'Responsive Check',
    description: 'Teste de responsividade em múltiplos viewports',
    icon: '📱',
    color: '#8b5cf6',
    viewport: 'desktop',
    enableConsoleCapture: true,
    enableNetworkCapture: false,
    autoScreenshot: true,
  },
  {
    id: 'performance',
    name: 'Performance Audit',
    description: 'Auditoria de performance e rede',
    icon: '⚡',
    color: '#f59e0b',
    viewport: 'desktop',
    enableConsoleCapture: true,
    enableNetworkCapture: true,
    autoScreenshot: false,
  },
  {
    id: 'accessibility',
    name: 'Accessibility Check',
    description: 'Verificação de acessibilidade',
    icon: '♿',
    color: '#10b981',
    viewport: 'desktop',
    enableConsoleCapture: true,
    enableNetworkCapture: false,
    autoScreenshot: true,
  },
  {
    id: 'stealth',
    name: 'Stealth Mode',
    description: 'Navegação com anti-detecção',
    icon: '🥷',
    color: '#6b7280',
    viewport: 'desktop',
    enableConsoleCapture: false,
    enableNetworkCapture: false,
    autoScreenshot: false,
  },
];

export interface BrowserWorkspace {
  id: string;
  name: string;
  tabs: BrowserTab[];
  profile: BrowserProfile;
  createdAt: Date;
  lastActivity: Date;
}

export function createBrowserTab(url: string = 'about:blank'): BrowserTab {
  return {
    id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url,
    title: 'New Tab',
    isActive: true,
    isLoading: false,
    viewport: 'desktop',
    screenshots: [],
    consoleLogs: [],
    networkRequests: [],
  };
}

export function createBrowserWorkspace(name: string, profileId: string = 'qa-testing'): BrowserWorkspace {
  const profile = BROWSER_PROFILES.find(p => p.id === profileId) || BROWSER_PROFILES[0];
  return {
    id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    tabs: [createBrowserTab()],
    profile,
    createdAt: new Date(),
    lastActivity: new Date(),
  };
}

export function generateBrowserReport(workspace: BrowserWorkspace): string {
  const errors = workspace.tabs.flatMap(t => t.consoleLogs.filter(l => l.level === 'error'));
  const warnings = workspace.tabs.flatMap(t => t.consoleLogs.filter(l => l.level === 'warn'));
  const failedRequests = workspace.tabs.flatMap(t => t.networkRequests.filter(r => r.status >= 400));
  const slowRequests = workspace.tabs.flatMap(t => t.networkRequests.filter(r => r.duration > 3000));

  return `# Browser Report - ${workspace.name}

## Summary
- Tabs: ${workspace.tabs.length}
- Screenshots: ${workspace.tabs.reduce((sum, t) => sum + t.screenshots.length, 0)}
- Console Errors: ${errors.length}
- Console Warnings: ${warnings.length}
- Failed Requests: ${failedRequests.length}
- Slow Requests (>3s): ${slowRequests.length}

## Console Errors
${errors.length > 0 ? errors.map(e => `- [${e.source}] ${e.message}`).join('\n') : 'No errors found'}

## Failed Requests
${failedRequests.length > 0 ? failedRequests.map(r => `- ${r.method} ${r.url} (${r.status})`).join('\n') : 'All requests successful'}

## Performance
${slowRequests.length > 0 ? slowRequests.map(r => `- ${r.method} ${r.url} (${r.duration}ms)`).join('\n') : 'No slow requests detected'}
`;
}
