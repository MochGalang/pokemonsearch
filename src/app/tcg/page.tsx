import Navbar from '@/components/Navbar';
import TcgGalleryClient from '@/components/TcgGalleryClient';
import { getPokemonTcgCards } from '@/lib/api';

export const metadata = {
  title: 'TCG Cards Database | PokemonSearch',
  description: 'Explore and search for official Pokemon Trading Card Game cards.',
};

export default async function TcgPage() {
  // Fetch initial data on the server
  const initialData = await getPokemonTcgCards('', 1, 20);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--headline-font)', fontSize: '32px', marginBottom: '8px' }}>
            TCG Card Database
          </h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>
            Search and explore thousands of official Pokémon Trading Cards.
          </p>
        </div>
        
        <TcgGalleryClient initialCards={initialData.data} initialTotal={initialData.totalCount} />
      </div>
    </main>
  );
}
