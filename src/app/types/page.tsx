import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TypeBadge from '@/components/TypeBadge';
import { getAllTypes, capitalize } from '@/lib/api';
import styles from './page.module.css';

export const revalidate = 3600;

export default async function TypesPage() {
  const typesData = await getAllTypes();
  
  // Filter out some "unknown" or "shadow" types that don't have standard colors or are obscure
  const validTypes = typesData.results.filter(
    (t) => t.name !== 'unknown' && t.name !== 'shadow'
  );

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className="container">
        <section className={styles.header}>
          <h1 className={styles.title}>Pokémon Types</h1>
          <p className={styles.subtitle}>
            Explore the different elemental types that shape the Pokémon universe.
          </p>
        </section>

        <section className={styles.grid}>
          {validTypes.map((type) => (
            <Link href={`/types/${type.name}`} key={type.name} className={`${styles.card} ${styles[`bg-${type.name}`]}`}>
              <div className={styles.cardContent}>
                <TypeBadge type={type.name} size="lg" />
                <span className={styles.name}>{capitalize(type.name)} Type</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
