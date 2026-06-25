import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Ganti URL ini dengan domain asli Anda saat deploy (misalnya https://pokemonsearch.com)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pokemonsearch-one.vercel.app';

  const routes = [
    '',
    '/types',
    '/regions',
    '/compare',
    '/team',
    '/tierlist',
    '/quiz',
    '/tcg',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
