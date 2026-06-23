import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getAllRegions, capitalize } from '@/lib/api';
import styles from './page.module.css';

export const revalidate = 3600;

export default async function RegionsPage() {
  const regionsData = await getAllRegions();
  
  // Format region ids
  const regions = regionsData.results.map((r) => {
    const parts = r.url.split('/').filter(Boolean);
    const id = parseInt(parts[parts.length - 1], 10);
    return { name: r.name, id };
  });

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className="container">
        <section className={styles.header}>
          <h1 className={styles.title}>Pokémon Regions</h1>
          <p className={styles.subtitle}>
            Discover the various regions where Pokémon games take place, from Kanto to Paldea.
          </p>
        </section>

        <section className={styles.grid}>
          {regions.map((region) => (
            <Link href={`/regions/${region.name}`} key={region.id} className={styles.card}>
              <div className={styles.cardContent}>
                <span className={styles.id}>Region #{String(region.id).padStart(2, '0')}</span>
                <span className={styles.name}>{capitalize(region.name)}</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
