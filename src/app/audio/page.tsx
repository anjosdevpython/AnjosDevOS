'use client';

import { useState } from 'react';
import { AudioLines, Loader2, Play } from 'lucide-react';

export default function AudioPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('10');
  const [isLoading, setIsLoading] = useState(false);

  const generateAudio = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-orange-400/10 border border-orange-400/30">
          <AudioLines className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Efeitos Sonoros</h1>
          <p className="text-sm text-text-muted">Gere efeitos de áudio com Stable Audio</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="space-y-4">
          <div>
            <label className="label-cyber">Duração</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="select-cyber text-sm"
            >
              <option value="5">5 segundos</option>
              <option value="10">10 segundos</option>
              <option value="30">30 segundos</option>
              <option value="60">60 segundos</option>
            </select>
          </div>

          <div>
            <label className="label-cyber">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o efeito sonoro desejado..."
              rows={4}
              className="input-cyber text-sm resize-none"
            />
          </div>

          <button
            onClick={generateAudio}
            disabled={!prompt.trim() || isLoading}
            className="w-full py-3 rounded-lg font-medium transition-all bg-orange-400/10 text-orange-400 border border-orange-400/30 hover:bg-orange-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
            ) : (
              <><Play className="w-4 h-4" /> Gerar Efeito Sonoro</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
