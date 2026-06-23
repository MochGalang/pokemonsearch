import Navbar from '@/components/Navbar';
import { getAllPokemonNames, getPokemonIdFromUrl } from '@/lib/api';
import QuizClient from '@/components/QuizClient';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function QuizPage() {
  const allNamesRes = await getAllPokemonNames();
  
  const pokemonList = allNamesRes.results.map((p) => ({
    id: getPokemonIdFromUrl(p.url),
    name: p.name,
  }));

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Who&apos;s that Pokémon?</h1>
          <p className={styles.subtitle}>Test your knowledge! Guess the Pokémon from its silhouette.</p>
        </div>

        <div className={styles.content}>
          <QuizClient pokemonList={pokemonList} />
        </div>
      </div>
    </main>
  );
}
