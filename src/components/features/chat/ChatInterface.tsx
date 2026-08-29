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
    <div className="flex-1 flex flex-col min-h-0 w-full bg-[#07090e]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 animate-pulse-slow">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5 font-sans">Comece uma conversa</h2>
            <p className="text-xs text-slate-400 mb-6 max-w-md">
              Selecione um provedor e modelo, e comece a conversar em tempo real.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left text-xs p-3.5 rounded-xl bg-[#0e121d]/80 border border-white/10 hover:border-cyan-500/40 hover:bg-[#141a29] text-slate-300 hover:text-white transition-all duration-200 shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-4xl mx-auto space-y-4 w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-slide-in',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 group relative shadow-md leading-relaxed',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white font-sans'
                      : 'bg-[#0f1422] border border-white/10 text-slate-100'
                  )}
                >
                  {message.model && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-1">
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
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all bg-black/40"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area (Full-width, 100% responsive) */}
      <div className="border-t border-white/10 bg-[#0c101d]/90 backdrop-blur-md px-4 py-3 flex-shrink-0 w-full">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-2.5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
            {/* Model Selector */}
            <div className="relative" ref={modelSelectRef}>
              <button
                onClick={() => setShowModelSelect(!showModelSelect)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141a29] border border-white/10 hover:border-cyan-500/40 text-xs text-slate-200 transition-all font-sans font-medium"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: currentModelInfo?.providerColor || PROVIDERS[selectedProvider]?.color || '#06b6d4',
                  }}
                />
                <span className="font-mono text-[11px] truncate max-w-[200px]">
                  {currentModelInfo?.name || selectedModel}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showModelSelect && (
                <div className="absolute bottom-full left-0 mb-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-[#121624] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-1">
                  {Object.keys(groupedModels).length === 0 ? (
                    <div className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">
                        Nenhum provedor configurado
                      </p>
                      <a
                        href="/settings"
                        className="text-xs text-cyan-400 hover:underline mt-1 inline-block"
                      >
                        Configurar provedores
                      </a>
                    </div>
                  ) : (
                    Object.entries(groupedModels).map(([providerId, group]) => (
                      <div key={providerId} className="mb-1">
                        <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-black/40 rounded-lg sticky top-0 flex items-center gap-2">
                          <span>{group.providerIcon}</span>
                          <span className="font-bold">{group.providerName}</span>
                          <span className="ml-auto text-slate-500">
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
                              'w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2',
                              selectedModel === model.id
                                ? 'text-cyan-400 bg-cyan-500/10 font-medium'
                                : 'text-slate-300'
                            )}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: group.providerColor }}
                            />
                            <span className="truncate">{model.name}</span>
                            {model.category !== 'chat' && (
                              <span className="ml-auto text-[10px] text-slate-500 capitalize">
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

            {/* Temperature & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
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
                  className="w-24 accent-cyan-400"
                />
                <span className="font-mono text-[11px] w-6">{temperature}</span>
              </div>

              {/* Clear Button */}
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Full-width Responsive Input Textarea + Send */}
          <div className="flex items-end gap-2.5 w-full">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem... (Shift+Enter para quebra de linha)"
              rows={1}
              className="w-full flex-1 resize-none text-sm min-h-[46px] max-h-[180px] px-4 py-3 rounded-xl bg-[#070a12] border border-white/15 focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/70 text-white placeholder:text-slate-500 outline-none transition-all font-sans leading-relaxed shadow-inner"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={cn(
                'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200',
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 cursor-pointer font-bold'
                  : 'bg-white/5 text-slate-600 border border-white/10 cursor-not-allowed'
              )}
              title="Enviar Mensagem (Enter)"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
