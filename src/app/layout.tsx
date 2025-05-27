
import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from 'next/font/google'; // Temporarily commented out
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

/* // Temporarily commented out
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
*/

export const metadata: Metadata = {
  title: 'A Tarologa - Mystic Insights',
  description: 'Interpretações de Tarot e Baralho Cigano com IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning={true}>
      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> */}
      <body className="antialiased"> {/* Temporarily simplified className */}
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
