'use client';

import { useState } from 'react';
import { Music, Loader2, Play, Pause } from 'lucide-react';
import { MUSIC_MODELS } from '@/lib/ai/models';

export default function MusicPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('suno-v5');
  const [mode, setMode] = useState<'generate' | 'cover' | 'extend'>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateMusic = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-neon-yellow/10 border border-neon-yellow/30">
          <Music className="w-5 h-5 text-neon-yellow" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Geração de Música</h1>
          <p className="text-sm text-text-muted">Crie músicas, covers e extensões com Suno</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            {(['generate', 'cover', 'extend'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                  mode === m
                    ? 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30'
                    : 'bg-cyber-card border-cyber-border text-text-muted hover:text-text-secondary'
                }`}
              >
                {m === 'generate' ? '🎵 Gerar' : m === 'cover' ? '🎤 Cover' : '🔄 Estender'}
              </button>
            ))}
          </div>

          <div>
            <label className="label-cyber">Modelo</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="select-cyber text-sm"
            >
              {MUSIC_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-cyber">Prompt Musical</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o estilo, letra ou música desejada..."
              rows={4}
              className="input-cyber text-sm resize-none"
            />
          </div>

          <button
            onClick={generateMusic}
            disabled={!prompt.trim() || isLoading}
            className="w-full py-3 rounded-lg font-medium transition-all bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30 hover:bg-neon-yellow/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
            ) : (
              <><Music className="w-4 h-4" /> Gerar Música</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
