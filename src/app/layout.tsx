import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import HoopaMascot from '@/components/HoopaMascot';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pokemonsearch-one.vercel.app'),
  applicationName: 'PokemonSearch',
  title: {
    default: 'PokemonSearch – The Advanced Pokédex',
    template: '%s | PokemonSearch',
  },
  description:
    'Search, explore and analyze over 1,000 Pokémon species. Detailed stats, evolution chains, type matchups, moves, and more – powered by PokéAPI.',
  keywords: ['pokemon', 'pokedex', 'pokémon', 'pokeapi', 'stats', 'evolution'],
  authors: [{ name: 'PokemonSearch' }],
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'PokemonSearch – The Advanced Pokédex',
    description: 'The most advanced Pokémon database. Built for trainers, researchers, and completionists.',
    type: 'website',
    url: 'https://pokemonsearch-one.vercel.app',
    siteName: 'PokemonSearch',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'PokemonSearch Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'PokemonSearch – The Advanced Pokédex',
    description: 'Search, explore and analyze over 1,000 Pokémon species.',
    images: ['/icon.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <HoopaMascot />
        </ThemeProvider>
      </body>
    </html>
  );
}
