'use client';

import { useState, useRef } from 'react';
import { Paintbrush, Upload, Eraser, ZoomIn, Wand2, Loader2 } from 'lucide-react';

export default function EditorPage() {
  const [mode, setMode] = useState<'remove_bg' | 'inpaint' | 'upscale'>('remove_bg');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modes = [
    { id: 'remove_bg' as const, label: 'Remover Fundo', icon: Eraser, color: 'neon-purple' },
    { id: 'inpaint' as const, label: 'Inpainting', icon: Wand2, color: 'neon-blue' },
    { id: 'upscale' as const, label: 'Upscale', icon: ZoomIn, color: 'neon-green' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const processImage = async () => {
    if (!imagePreview) return;
    setIsLoading(true);
    // Simulated — would call the real API endpoint
    setTimeout(() => {
      setResult(imagePreview); // Placeholder
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
          <Paintbrush className="w-5 h-5 text-neon-purple" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Editor de Imagens</h1>
          <p className="text-sm text-text-muted">Remova fundos, faça inpainting e upscale com IA</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m.id
                  ? `bg-${m.color}/10 text-${m.color} border border-${m.color}/30`
                  : 'bg-cyber-card border border-cyber-border text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Imagem Original</h2>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
              <button
                onClick={() => { setImagePreview(null); setResult(null); }}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-xs text-white hover:bg-black/70"
              >
                Remover
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-cyber-border rounded-lg flex flex-col items-center justify-center gap-3 hover:border-neon-purple/30 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-text-muted" />
              <span className="text-sm text-text-muted">Clique para fazer upload</span>
              <span className="text-xs text-text-muted">PNG, JPG, WEBP</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {mode === 'inpaint' && (
            <div className="mt-4">
              <label className="label-cyber">Prompt de Inpainting</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva a alteração desejada..."
                className="input-cyber text-sm"
              />
            </div>
          )}

          <button
            onClick={processImage}
            disabled={!imagePreview || isLoading}
            className="neon-button-purple w-full mt-4 flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Processar Imagem</>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Resultado</h2>
          {result ? (
            <img src={result} alt="Result" className="w-full rounded-lg" />
          ) : (
            <div className="w-full h-64 rounded-lg bg-cyber-bg border border-cyber-border flex items-center justify-center">
              <p className="text-sm text-text-muted">O resultado aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
