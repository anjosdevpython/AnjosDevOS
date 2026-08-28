'use client';

import { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, Sparkles, RefreshCw } from 'lucide-react';
import { IMAGE_MODELS, ASPECT_RATIOS, PROVIDER_COLORS } from '@/lib/ai/models';

export default function ImagesPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; model: string; prompt: string }[]>([]);
  const [error, setError] = useState('');

  const sizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '16:9': '1792x1024',
    '9:16': '1024x1792',
    '4:3': '1024x768',
    '3:4': '768x1024',
  };

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt.trim(),
          size: sizeMap[aspectRatio] || '1024x1024',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao gerar imagem');
      }

      const data = await res.json();
      const newImages = (data.data || []).map((img: { url?: string; b64_json?: string }) => ({
        url: img.url || `data:image/png;base64,${img.b64_json}`,
        model: selectedModel,
        prompt: prompt.trim(),
      }));

      setImages((prev) => [...newImages, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
          <ImageIcon className="w-5 h-5 text-neon-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Geração de Imagens</h1>
          <p className="text-sm text-text-muted">Crie imagens com 8 modelos de IA diferentes</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Model */}
          <div>
            <label className="label-cyber">Modelo</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="select-cyber text-sm"
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="label-cyber">Proporção</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="select-cyber text-sm"
            >
              {ASPECT_RATIOS.map((ar) => (
                <option key={ar.id} value={ar.id}>
                  {ar.name}
                </option>
              ))}
            </select>
          </div>

          {/* Provider badge */}
          <div className="flex items-end">
            <div className="flex items-center gap-2 px-3 py-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    PROVIDER_COLORS[
                      IMAGE_MODELS.find((m) => m.id === selectedModel)?.provider || ''
                    ] || '#6b7280',
                }}
              />
              <span className="text-xs text-text-muted font-mono">
                {IMAGE_MODELS.find((m) => m.id === selectedModel)?.provider}
              </span>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <label className="label-cyber">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a imagem que deseja gerar..."
            rows={3}
            className="input-cyber text-sm resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateImage}
          disabled={!prompt.trim() || isLoading}
          className="neon-button-blue w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Gerar Imagem
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-xs text-neon-red">{error}</p>
        )}
      </div>

      {/* Gallery */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Imagens Geradas ({images.length})
            </h2>
            <button
              onClick={() => setImages([])}
              className="text-xs text-text-muted hover:text-neon-red flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Limpar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="glass-card overflow-hidden group">
                <div className="relative aspect-square">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={img.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neon-button text-xs"
                    >
                      <Download className="w-3 h-3 inline mr-1" />
                      Download
                    </a>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-text-muted truncate">{img.prompt}</p>
                  <p className="text-[10px] text-text-muted font-mono mt-1">{img.model}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
