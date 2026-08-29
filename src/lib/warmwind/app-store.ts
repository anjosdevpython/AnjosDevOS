/**
 * Warmwind-style App Store
 * Loja de integrações para conectar ferramentas aos funcionários IA
 */

import type { AppIntegration } from './types';

export const APP_INTEGRATIONS: AppIntegration[] = [
  // Email
  { id: 'gmail', name: 'Gmail', icon: '📧', category: 'email', description: 'Gerenciar e-mails automaticamente', connected: false, features: ['Enviar', 'Receber', 'Filtrar', 'Responder'], setupDifficulty: 'easy', popular: true },
  { id: 'outlook', name: 'Outlook', icon: '📮', category: 'email', description: 'E-mails e calendário corporativo', connected: false, features: ['E-mail', 'Calendário', 'Contatos'], setupDifficulty: 'easy', popular: true },

  // CRM
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', category: 'crm', description: 'CRM e marketing automation', connected: false, features: ['Leads', 'Deals', 'Contatos', 'E-mails'], setupDifficulty: 'medium', popular: true },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'crm', description: 'CRM enterprise', connected: false, features: ['Accounts', 'Opportunities', 'Reports'], setupDifficulty: 'hard', popular: false },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🔵', category: 'crm', description: 'CRM para vendas', connected: false, features: ['Pipeline', 'Deals', 'Activities'], setupDifficulty: 'medium', popular: false },

  // Social
  { id: 'instagram', name: 'Instagram', icon: '📸', category: 'social', description: 'Posts, stories e engajamento', connected: false, features: ['Postar', 'Stories', 'Comentar', 'Analisar'], setupDifficulty: 'easy', popular: true },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', category: 'social', description: 'Networking e conteúdo profissional', connected: false, features: ['Postar', 'Conectar', 'Mensagens', 'Jobs'], setupDifficulty: 'medium', popular: true },
  { id: 'twitter', name: 'X / Twitter', icon: '🐦', category: 'social', description: 'Tweets e engajamento', connected: false, features: ['Tuitar', 'Reply', 'Retweet', 'Analytics'], setupDifficulty: 'easy', popular: false },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', category: 'social', description: 'Vídeos curtos e trends', connected: false, features: ['Postar', 'Comentar', 'Analytics'], setupDifficulty: 'medium', popular: false },

  // E-commerce
  { id: 'shopify', name: 'Shopify', icon: '🛒', category: 'ecommerce', description: 'Loja online completa', connected: false, features: ['Produtos', 'Pedidos', 'Clientes', 'Relatórios'], setupDifficulty: 'medium', popular: true },
  { id: 'mercadolivre', name: 'Mercado Livre', icon: '🟡', category: 'ecommerce', description: 'Marketplace brasileiro', connected: false, features: ['Anúncios', 'Pedidos', 'Mensagens'], setupDifficulty: 'medium', popular: true },
  { id: 'magalu', name: 'Magazine Luiza', icon: '🔵', category: 'ecommerce', description: 'Marketplace Magalu', connected: false, features: ['Produtos', 'Pedidos', 'Estoque'], setupDifficulty: 'hard', popular: false },

  // Produtividade
  { id: 'sheets', name: 'Google Sheets', icon: '📊', category: 'productivity', description: 'Planilhas colaborativas', connected: false, features: ['Ler', 'Escrever', 'Fórmulas', 'Gráficos'], setupDifficulty: 'easy', popular: true },
  { id: 'notion', name: 'Notion', icon: '📝', category: 'productivity', description: 'Wiki e gestão de projetos', connected: false, features: ['Páginas', 'Databases', 'Templates'], setupDifficulty: 'easy', popular: true },
  { id: 'slack', name: 'Slack', icon: '💬', category: 'communication', description: 'Comunicação em equipe', connected: false, features: ['Mensagens', 'Canais', 'Integrações'], setupDifficulty: 'easy', popular: true },
  { id: 'whatsapp', name: 'WhatsApp Business', icon: '📱', category: 'communication', description: 'Atendimento via WhatsApp', connected: false, features: ['Mensagens', 'Catálogo', 'Respostas'], setupDifficulty: 'medium', popular: true },

  // ERP
  { id: 'bling', name: 'Bling', icon: '📦', category: 'erp', description: 'ERP para pequenas empresas', connected: false, features: ['Estoque', 'Fiscal', 'Financeiro'], setupDifficulty: 'medium', popular: true },
  { id: 'tiny', name: 'Tiny ERP', icon: '🏭', category: 'erp', description: 'Gestão empresarial', connected: false, features: ['Pedidos', 'Estoque', 'Fiscal'], setupDifficulty: 'medium', popular: false },

  // Analytics
  { id: 'ga4', name: 'Google Analytics', icon: '📈', category: 'analytics', description: 'Métricas de website', connected: false, features: ['Visitas', 'Conversões', 'Relatórios'], setupDifficulty: 'easy', popular: true },
  { id: 'meta-ads', name: 'Meta Ads', icon: '🎯', category: 'analytics', description: 'Anúncios Facebook/Instagram', connected: false, features: ['Campanhas', 'Métricas', 'ROI'], setupDifficulty: 'medium', popular: true },
];

class AppStoreManager {
  private integrations: Map<string, AppIntegration> = new Map();

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('warmwind_connected_apps') : null;
    const connectedIds: string[] = saved ? JSON.parse(saved) : [];

    APP_INTEGRATIONS.forEach(app => {
      this.integrations.set(app.id, {
        ...app,
        connected: connectedIds.includes(app.id),
      });
    });
  }

  getAll(): AppIntegration[] {
    return Array.from(this.integrations.values());
  }

  getByCategory(category: AppIntegration['category']): AppIntegration[] {
    return this.getAll().filter(a => a.category === category);
  }

  getConnected(): AppIntegration[] {
    return this.getAll().filter(a => a.connected);
  }

  getPopular(): AppIntegration[] {
    return this.getAll().filter(a => a.popular);
  }

  search(query: string): AppIntegration[] {
    const q = query.toLowerCase();
    return this.getAll().filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.category.includes(q)
    );
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      const connectedIds = this.getConnected().map(a => a.id);
      localStorage.setItem('warmwind_connected_apps', JSON.stringify(connectedIds));
    }
  }

  connect(appId: string): boolean {
    const app = this.integrations.get(appId);
    if (app) {
      app.connected = true;
      this.integrations.set(appId, app);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  disconnect(appId: string): boolean {
    const app = this.integrations.get(appId);
    if (app) {
      app.connected = false;
      this.integrations.set(appId, app);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getStats(): {
    total: number;
    connected: number;
    categories: Record<string, number>;
  } {
    const all = this.getAll();
    const connected = this.getConnected();
    const categories: Record<string, number> = {};
    all.forEach(a => {
      categories[a.category] = (categories[a.category] || 0) + 1;
    });

    return {
      total: all.length,
      connected: connected.length,
      categories,
    };
  }
}

let instance: AppStoreManager | null = null;

export function getAppStore(): AppStoreManager {
  if (!instance) instance = new AppStoreManager();
  return instance;
}

export { AppStoreManager };
