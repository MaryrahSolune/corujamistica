
import type { Metadata } from 'next';
import { Inter as FontSans, Uncial_Antiqua as FontCeltic } from 'next/font/google'; // Using Inter as a clean sans-serif
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontCeltic = FontCeltic({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-celtic',
});


export const metadata: Metadata = {
  title: {
    default: 'Mystic Insights | Interpretação de Tarô, Cartas e Sonhos',
    template: '%s | Mystic Insights',
  },
  description: 'Desvende o significado das suas cartas de tarô e dos seus sonhos. Obtenha interpretação de leituras de Tarot, Baralho Cigano e mais, com a ajuda de inteligência artificial.',
  keywords: ['tarot', 'tarô', 'interpretação de tarot', 'significado dos sonhos', 'leitura de cartas', 'baralho cigano', 'cartomancia', 'oráculo', 'sonhos', 'cartas', 'significado', 'interpretação'],
  openGraph: {
    title: 'Mystic Insights | Interpretação de Tarô, Cartas e Sonhos',
    description: 'Desvende o significado das suas cartas de tarô e dos seus sonhos.',
    siteName: 'Mystic Insights',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontCeltic.variable
        )}
      >
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
