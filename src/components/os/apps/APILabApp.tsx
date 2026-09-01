'use client';

import React, { useState } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
  Clock,
  Code,
  LayoutTemplate,
  Layers,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface HeaderItem {
  key: string;
  value: string;
  enabled: boolean;
}

export function APILabApp() {
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [url, setUrl] = useState('http://localhost:3000/api/chat');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
  ]);
  const [activeSubTab, setActiveSubTab] = useState<'body' | 'headers'>('body');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        model: 'openai/gpt-5-5',
        provider: 'aimlapi',
        messages: [{ role: 'user', content: 'Explique a arquitetura do AnjosDevOS em 2 frases.' }],
        temperature: 0.7,
      },
      null,
      2
    )
  );

  const [responseStatus, setResponseStatus] = useState<number | null>(200);
  const [responseLatency, setResponseLatency] = useState<number | null>(124);
  const [responseBody, setResponseBody] = useState(
    JSON.stringify(
      {
        ok: true,
        provider: 'aimlapi',
        model: 'openai/gpt-5-5',
        content: 'O AnjosDevOS é um sistema operacional completo para desenvolvimento no navegador com múltiplos ambientes IDE e orquestração autônoma por IA.',
        usage: { tokensIn: 38, tokensOut: 45, latencyMs: 124 },
      },
      null,
      2
    )
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    const start = performance.now();

    try {
      const headerObj: Record<string, string> = {};
      headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          headerObj[h.key] = h.value;
        });

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);
      setResponseStatus(res.status);
      setResponseLatency(elapsed);

      const data = await res.json().catch(() => null);
      if (data) {
        setResponseBody(JSON.stringify(data, null, 2));
      } else {
        const text = await res.text();
        setResponseBody(text);
      }
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      setResponseStatus(500);
      setResponseLatency(elapsed);
      setResponseBody(
        JSON.stringify({ error: err instanceof Error ? err.message : 'Falha na requisição' }, null, 2)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methodColors: Record<HttpMethod, string> = {
    GET: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    POST: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    PUT: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    DELETE: 'text-red-400 bg-red-500/15 border-red-500/30',
    PATCH: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#080b12] text-slate-100 font-sans select-none">
      {/* Request Address Bar */}
      <div className="p-3.5 border-b border-white/10 bg-[#0d121f] flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Method Selector */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={cn(
              'px-3 py-2 rounded-xl text-xs font-mono font-bold border outline-none cursor-pointer',
              methodColors[method]
            )}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          {/* URL Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.exemplo.com/v1/resource"
              className="w-full pl-3 pr-4 py-2 text-xs font-mono bg-[#07090e] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Enviando...' : 'Enviar'}</span>
          </button>
        </div>

        {/* Sub Tabs: Request Body & Headers */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('body')}
            className={cn(
              'px-3 py-1 rounded-lg transition-colors font-semibold',
              activeSubTab === 'body' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            Corpo (JSON)
          </button>
          <button
            onClick={() => setActiveSubTab('headers')}
            className={cn(
              'px-3 py-1 rounded-lg transition-colors font-semibold',
              activeSubTab === 'headers' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            LayoutTemplate ({headers.length})
          </button>
        </div>
      </div>

      {/* Main Split: Request Config Upper, Response Output Lower */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Request Pane */}
        <div className="h-48 border-b border-white/10 flex flex-col min-h-0 bg-[#060912]">
          {activeSubTab === 'body' ? (
            <MonacoEditor
              height="100%"
              language="json"
              theme="vs-dark"
              value={requestBody}
              onChange={(val) => setRequestBody(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
                padding: { top: 8, bottom: 8 },
                lineNumbers: 'on',
              }}
            />
          ) : (
            <div className="p-3 overflow-y-auto space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[i].enabled = e.target.checked;
                      setHeaders(updated);
                    }}
                    className="accent-cyan-400"
                  />
                  <input
                    type="text"
                    value={h.key}
                    placeholder="Chave"
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[i].key = e.target.value;
                      setHeaders(updated);
                    }}
                    className="w-1/3 px-2 py-1 rounded bg-[#0b0e18] border border-white/10 text-white"
                  />
                  <input
                    type="text"
                    value={h.value}
                    placeholder="Valor"
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[i].value = e.target.value;
                      setHeaders(updated);
                    }}
                    className="flex-1 px-2 py-1 rounded bg-[#0b0e18] border border-white/10 text-white"
                  />
                </div>
              ))}
              <button
                onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
                className="text-xs text-cyan-400 hover:underline pt-1 flex items-center gap-1 font-mono"
              >
                <Plus className="w-3 h-3" /> Adicionar Header
              </button>
            </div>
          )}
        </div>

        {/* Response Pane */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#07090e]">
          {/* Response Status Bar */}
          <div className="h-9 px-4 bg-[#0c101d] border-b border-white/10 flex items-center justify-between text-xs font-mono flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Resposta:</span>
              {responseStatus && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full font-bold',
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  )}
                >
                  Status: {responseStatus}
                </span>
              )}
              {responseLatency !== null && (
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {responseLatency}ms
                </span>
              )}
            </div>

            <button
              onClick={copyResponse}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          {/* Response Monaco JSON View */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language="json"
              theme="vs-dark"
              value={responseBody}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
                padding: { top: 10, bottom: 10 },
                lineNumbers: 'on',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}