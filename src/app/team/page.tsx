import Navbar from '@/components/Navbar';
import { getAllPokemonNames } from '@/lib/api';
import TeamBuilderClient from '@/components/TeamBuilderClient';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const allNamesRes = await getAllPokemonNames();
  const pokemonList = allNamesRes.results.map((p) => p.name);

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Team Builder</h1>
          <p className={styles.subtitle}>Build your ultimate team of 6 Pokémon and analyze their type synergies and overall stats.</p>
        </div>

        <div className={styles.content}>
          <TeamBuilderClient pokemonList={pokemonList} />
        </div>
      </div>
    </main>
  );
}
