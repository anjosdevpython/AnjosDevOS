'use client';

import { useState } from 'react';
import { Video, Loader2, Film, Clock, Volume2 } from 'lucide-react';

export default function VideoPage() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('5');
  const [withAudio, setWithAudio] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    // Would call real API
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-neon-red/10 border border-neon-red/30">
          <Video className="w-5 h-5 text-neon-red" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Geração de Vídeo</h1>
          <p className="text-sm text-text-muted">Gere vídeos com IA usando Kling 3</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="space-y-4">
          <div>
            <label className="label-cyber">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o vídeo que deseja gerar..."
              rows={4}
              className="input-cyber text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-cyber flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duração
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="select-cyber text-sm"
              >
                <option value="5">5 segundos</option>
                <option value="10">10 segundos</option>
              </select>
            </div>

            <div>
              <label className="label-cyber flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Áudio
              </label>
              <button
                onClick={() => setWithAudio(!withAudio)}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                  withAudio
                    ? 'bg-neon-green/10 text-neon-green border-neon-green/30'
                    : 'bg-cyber-bg text-text-muted border-cyber-border'
                }`}
              >
                {withAudio ? '✓ Com Áudio' : '✗ Sem Áudio'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-cyber-bg border border-cyber-border">
            <Film className="w-4 h-4 text-neon-red" />
            <span className="text-xs text-text-muted">Modelo: <span className="text-text-secondary font-mono">Kling 3</span></span>
          </div>

          <button
            onClick={generateVideo}
            disabled={!prompt.trim() || isLoading}
            className="w-full py-3 rounded-lg font-medium transition-all bg-neon-red/10 text-neon-red border border-neon-red/30 hover:bg-neon-red/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Gerando vídeo...</>
            ) : (
              <><Video className="w-4 h-4" /> Gerar Vídeo</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
