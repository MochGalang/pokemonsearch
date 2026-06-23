import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import PokemonCard from '@/components/PokemonCard';
import Pagination from '@/components/Pagination';
import { getPokemonCardData, getAllPokemonNames } from '@/lib/api';
import styles from './page.module.css';

export const revalidate = 3600;

async function PokemonGrid({ page, query }: { page: number; query: string }) {
  const ITEMS_PER_PAGE = 24;
  
  if (query) {
    // Client-side search simulation by fetching all minimal data then filtering
    const all = await getAllPokemonNames();
    const filtered = all.results.filter(p => p.name.includes(query.toLowerCase()));
    
    // Manual pagination of filtered results
    const total = filtered.length;
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(offset, offset + ITEMS_PER_PAGE);
    
    // Fetch details for the paginated subset
    // Wait, getPokemonCardData takes limit and offset, but we want specific URLs.
    // Let's implement a workaround here for search
    const { getPokemon, getPokemonIdFromUrl, getPokemonOfficialArtwork } = await import('@/lib/api');
    
    const cards = await Promise.all(
      paginated.map(async (item) => {
        const id = getPokemonIdFromUrl(item.url);
        try {
          const poke = await getPokemon(id);
          return {
            id: poke.id,
            name: poke.name,
            types: poke.types.map((t) => t.type.name),
            sprite:
              poke.sprites.other['official-artwork'].front_default ??
              poke.sprites.front_default,
          };
        } catch {
          return {
            id,
            name: item.name,
            types: [],
            sprite: getPokemonOfficialArtwork(id),
          };
        }
      })
    );

    return (
      <>
        <div className={styles.stats}>
          <p>Found <strong>{total}</strong> Pokémon matching "{query}"</p>
        </div>
        <div className={styles.grid}>
          {cards.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
        <Suspense fallback={<div>Loading pagination...</div>}>
          <Pagination totalItems={total} itemsPerPage={ITEMS_PER_PAGE} />
        </Suspense>
      </>
    );
  }

  // Normal listing
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const { cards, total } = await getPokemonCardData(ITEMS_PER_PAGE, offset);

  return (
    <>
      <div className={styles.stats}>
        <p>Showing <strong>{cards.length}</strong> of <strong>{total}</strong> Pokémon</p>
      </div>
      <div className={styles.grid}>
        {cards.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
      <Suspense fallback={<div>Loading pagination...</div>}>
        <Pagination totalItems={total} itemsPerPage={ITEMS_PER_PAGE} />
      </Suspense>
    </>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className="container">
        <section className={styles.hero}>
          <h1 className={styles.title}>The Most Advanced Pokémon Database</h1>
          <p className={styles.subtitle}>
            Access detailed statistics, evolution chains, and move-sets for over 1,000 species. Built for trainers, researchers, and completionists.
          </p>
          <div className={styles.searchWrapper}>
          <Suspense fallback={<div className={styles.loading}>Loading search...</div>}>
            <SearchBar initialValue={query} />
          </Suspense>
        </div>
      </section>

      <section className={styles.content}>
        <Suspense fallback={<div className={styles.loading}>Loading Pokémon data...</div>}>
          <PokemonGrid page={page} query={query} />
        </Suspense>
        </section>
      </div>
    </main>
  );
}
