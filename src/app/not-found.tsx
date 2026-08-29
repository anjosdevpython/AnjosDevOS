import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#07090e] text-slate-100 p-6 text-center">
      <div className="w-16 h-12 mb-4 flex items-center justify-center">
        <img src="/logo.png" alt="AnjosDevOS" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,210,255,0.7)]" />
      </div>
      <h1 className="text-4xl font-black gradient-text font-mono mb-2">404</h1>
      <p className="text-sm text-slate-400 mb-6 font-mono">Página não encontrada no AnjosDevOS</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:opacity-90 transition-opacity font-mono"
      >
        Retornar ao Desktop
      </Link>
    </div>
  );
}
