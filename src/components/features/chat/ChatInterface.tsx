'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Thermometer,
  Sparkles,
  ChevronDown,
  Settings,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROVIDERS, ProviderId, getAllModels, getModelInfo } from '@/lib/ai/providers';
import {
  loadProviderSettings,
  getAvailableModels,
  setSelectedProvider,
  setTemperature as saveTemperature,
} from '@/lib/ai/provider-config';
import { chatCompletionStream } from '@/lib/ai/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  provider?: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  'Explique como funciona a arquitetura de microserviços',
  'Crie um script Python para web scraping',
  'Qual a diferença entre REST e GraphQL?',
  'Escreva um componente React com TypeScript',
  'Como implementar autenticação JWT?',
  'Explique o conceito de Clean Architecture',
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModelState] = useState('gpt-4o');
  const [selectedProvider, setSelectedProviderState] = useState<ProviderId>('openai');
  const [temperature, setTemperature] = useState(0.7);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [showProviderInfo, setShowProviderInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectRef = useRef<HTMLDivElement>(null);

  // Load settings on mount
  useEffect(() => {
    const settings = loadProviderSettings();
    setSelectedModelState(settings.selectedModel);
    setSelectedProviderState(settings.selectedProvider);
    setTemperature(settings.temperature);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Close model dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modelSelectRef.current && !modelSelectRef.current.contains(e.target as Node)) {
        setShowModelSelect(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Get available models from enabled providers
  const availableModels = getAvailableModels();

  // Group models by provider
  const groupedModels = availableModels.reduce(
    (acc, model) => {
      if (!acc[model.providerId]) {
        acc[model.providerId] = {
          providerName: model.providerName,
          providerColor: model.providerColor,
          providerIcon: PROVIDERS[model.providerId]?.icon || '🤖',
          models: [],
        };
      }
      acc[model.providerId].models.push(model);
      return acc;
    },
    {} as Record<
      string,
      {
        providerName: string;
        providerColor: string;
        providerIcon: string;
        models: typeof availableModels;
      }
    >
  );

  const currentModelInfo = getModelInfo(selectedModel);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check if any provider is configured
    const settings = loadProviderSettings();
    const enabledProviders = Object.entries(settings.providers).filter(
      ([_, p]) => p.isEnabled && p.apiKey
    );

    if (enabledProviders.length === 0) {
      // Show error - no providers configured
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          '⚠️ Nenhum provedor de IA configurado. Vá em **Configurações** → **Provedores** para adicionar pelo menos uma API key.\n\nProvedores suportados: OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral, Groq, Together e NetworkTools.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    // Check if selected provider is enabled
    const providerConfig = settings.providers[selectedProvider];
    if (!providerConfig?.isEnabled || !providerConfig?.apiKey) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ O provedor **${PROVIDERS[selectedProvider]?.name || selectedProvider}** não está configurado. Vá em Configurações para adicionar a API key.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      model: selectedModel,
      provider: PROVIDERS[selectedProvider]?.name,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const stream = await chatCompletionStream({
        model: selectedModel,
        messages: chatHistory,
        temperature,
        provider: selectedProvider,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id ? { ...m, content: fullContent } : m
                  )
                );
              }
            } catch {
              // Skip invalid JSON chunks
            }
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: `❌ Erro: ${errorMsg}\n\nVerifique sua API key em Configurações.` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleModelSelect = (modelId: string, providerId: ProviderId) => {
    setSelectedModelState(modelId);
    setSelectedProviderState(providerId);
    setSelectedProvider(providerId, modelId);
    setShowModelSelect(false);
  };

  // Check if any provider is configured
  const settings = loadProviderSettings();
  const hasProviders = Object.values(settings.providers).some((p) => p.isEnabled && p.apiKey);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-4 animate-pulse-slow">
              <Sparkles className="w-8 h-8 text-neon-green" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Comece uma conversa</h2>
            <p className="text-sm text-text-muted mb-6 max-w-md">
              Selecione um provedor e modelo, e comece a conversar.
            </p>

            {!hasProviders && (
              <div className="mb-6 p-4 rounded-xl bg-neon-yellow/5 border border-neon-yellow/20 max-w-md">
                <div className="flex items-center gap-2 text-neon-yellow mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Nenhum provedor configurado</span>
                </div>
                <p className="text-xs text-text-muted">
                  Vá em{' '}
                  <a href="/settings" className="text-neon-blue hover:underline">
                    Configurações
                  </a>{' '}
                  para adicionar suas API keys.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left text-xs p-3 rounded-lg bg-cyber-card/60 border border-cyber-border hover:border-neon-green/30 hover:bg-cyber-hover text-text-muted hover:text-text-secondary transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-slide-in',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-neon-green" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-4 py-3 group relative',
                    message.role === 'user'
                      ? 'bg-neon-blue/10 border border-neon-blue/20 text-text-primary'
                      : 'bg-cyber-card border border-cyber-border text-text-primary'
                  )}
                >
                  {message.model && (
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            PROVIDERS[message.provider as ProviderId]?.color || '#6b7280',
                        }}
                      />
                      <span>{message.provider}</span>
                      <span>•</span>
                      <span>{message.model}</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap prose-cyber">
                    {message.content || (
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                  {message.content && (
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-secondary transition-all"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-neon-green" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-neon-blue" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-cyber-border bg-cyber-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {/* Controls */}
          <div className="flex items-center gap-3 mb-3">
            {/* Model Selector */}
            <div className="relative" ref={modelSelectRef}>
              <button
                onClick={() => setShowModelSelect(!showModelSelect)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-bg border border-cyber-border hover:border-neon-green/30 text-xs text-text-secondary transition-all"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: currentModelInfo?.providerColor || PROVIDERS[selectedProvider]?.color || '#6b7280',
                  }}
                />
                <span className="font-mono">
                  {currentModelInfo?.name || selectedModel}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showModelSelect && (
                <div className="absolute bottom-full left-0 mb-2 w-72 max-h-96 overflow-y-auto rounded-xl bg-cyber-card border border-cyber-border shadow-2xl z-50">
                  {Object.keys(groupedModels).length === 0 ? (
                    <div className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-text-muted mx-auto mb-2" />
                      <p className="text-xs text-text-muted">
                        Nenhum provedor configurado
                      </p>
                      <a
                        href="/settings"
                        className="text-xs text-neon-blue hover:underline mt-1 inline-block"
                      >
                        Configurar provedores
                      </a>
                    </div>
                  ) : (
                    Object.entries(groupedModels).map(([providerId, group]) => (
                      <div key={providerId}>
                        <div className="px-3 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wider bg-cyber-bg/50 sticky top-0 flex items-center gap-2">
                          <span>{group.providerIcon}</span>
                          <span>{group.providerName}</span>
                          <span className="ml-auto text-text-muted/50">
                            {group.models.length}
                          </span>
                        </div>
                        {group.models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() =>
                              handleModelSelect(model.id, model.providerId as ProviderId)
                            }
                            className={cn(
                              'w-full text-left px-3 py-2 text-xs hover:bg-cyber-hover transition-colors flex items-center gap-2',
                              selectedModel === model.id
                                ? 'text-neon-green bg-neon-green/5'
                                : 'text-text-secondary'
                            )}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: group.providerColor }}
                            />
                            <span className="truncate">{model.name}</span>
                            {model.category !== 'chat' && (
                              <span className="ml-auto text-[10px] text-text-muted capitalize">
                                {model.category}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Thermometer className="w-3 h-3" />
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTemperature(val);
                  saveTemperature(val);
                }}
                className="w-20 accent-neon-green"
              />
              <span className="font-mono w-6">{temperature}</span>
            </div>

            {/* Clear */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs text-text-muted hover:text-neon-red transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
              rows={1}
              className="input-cyber resize-none text-sm min-h-[44px] max-h-[200px]"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={cn(
                'flex-shrink-0 p-3 rounded-lg transition-all duration-200',
                input.trim() && !isLoading
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 hover:shadow-neon-green'
                  : 'bg-cyber-bg text-text-muted border border-cyber-border cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
