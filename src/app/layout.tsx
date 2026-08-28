import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AnjosDevOS — AI Operating System',
  description: 'Sistema Operacional de IA baseado em navegador',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AnjosDevOS',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'AnjosDevOS — AI Operating System',
    description: 'Sistema Operacional de IA baseado em navegador',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased h-full overflow-hidden bg-cyber-bg">
        {children}
      </body>
    </html>
  );
}
