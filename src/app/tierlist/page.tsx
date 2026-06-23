import Navbar from '@/components/Navbar';
import { getAllPokemonNames, getPokemonIdFromUrl } from '@/lib/api';
import TierListClient from '@/components/TierListClient';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function TierListPage() {
  const allNamesRes = await getAllPokemonNames();
  
  // Create a minimal list with id and name for all pokemon
  // This helps us generate the pixel sprite URL instantly without fetching full details
  const initialPokemonList = allNamesRes.results.map((p) => ({
    id: getPokemonIdFromUrl(p.url),
    name: p.name,
  }));

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Pokémon Tier List Maker</h1>
          <p className={styles.subtitle}>Drag and drop your favorite Pokémon into tiers. Automatically loaded with all generations!</p>
        </div>

        <div className={styles.content}>
          <TierListClient initialPokemonList={initialPokemonList} />
        </div>
      </div>
    </main>
  );
}
