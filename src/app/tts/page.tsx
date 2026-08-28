'use client';

import { useState } from 'react';
import { Mic, Loader2, Play, Download } from 'lucide-react';

export default function TtsPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [speed, setSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);

  const voices = [
    { id: 'alloy', name: 'Alloy' },
    { id: 'echo', name: 'Echo' },
    { id: 'fable', name: 'Fable' },
    { id: 'onyx', name: 'Onyx' },
    { id: 'nova', name: 'Nova' },
    { id: 'shimmer', name: 'Shimmer' },
  ];

  const generateSpeech = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30">
          <Mic className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Text-to-Speech</h1>
          <p className="text-sm text-text-muted">Converta texto em fala natural com IA</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-cyber">Voz</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="select-cyber text-sm"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-cyber">Velocidade: {speed}x</label>
              <input
                type="range"
                min="0.25"
                max="4.0"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 mt-2"
              />
            </div>
          </div>

          <div>
            <label className="label-cyber">Texto</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o texto para ser convertido em fala..."
              rows={6}
              className="input-cyber text-sm resize-none"
            />
            <p className="text-xs text-text-muted mt-1">{text.length} caracteres</p>
          </div>

          <button
            onClick={generateSpeech}
            disabled={!text.trim() || isLoading}
            className="w-full py-3 rounded-lg font-medium transition-all bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando áudio...</>
            ) : (
              <><Play className="w-4 h-4" /> Gerar Fala</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
