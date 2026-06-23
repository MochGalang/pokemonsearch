import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import PokemonCard from '@/components/PokemonCard';
import { getRegion, getGeneration, getPokemon, getPokemonIdFromUrl, getPokemonOfficialArtwork, capitalize } from '@/lib/api';
import styles from './page.module.css';

export const revalidate = 3600;

async function RegionGrid({ regionName, page }: { regionName: string; page: number }) {
  const ITEMS_PER_PAGE = 24;
  
  let regionDetail;
  try {
    regionDetail = await getRegion(regionName);
  } catch {
    import('next/navigation').then((m) => m.notFound());
    return null;
  }
  
  if (!regionDetail.main_generation) {
    return (
      <div className={styles.stats}>
        <p>No Pokémon data available for the <strong>{capitalize(regionName)}</strong> region yet.</p>
      </div>
    );
  }

  const generationDetail = await getGeneration(regionDetail.main_generation.name);
  const allPokemon = generationDetail.pokemon_species;
  
  // Sort them by ID (species ID matches pokedex order within generation generally)
  allPokemon.sort((a, b) => {
    return getPokemonIdFromUrl(a.url) - getPokemonIdFromUrl(b.url);
  });

  const total = allPokemon.length;
  
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const paginated = allPokemon.slice(offset, offset + ITEMS_PER_PAGE);
  
  const cards = await Promise.all(
    paginated.map(async (species) => {
      const id = getPokemonIdFromUrl(species.url);
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
          name: species.name,
          types: ['normal'], // Fallback if pokemon form fetch fails
          sprite: getPokemonOfficialArtwork(id),
        };
      }
    })
  );

  return (
    <>
      <div className={styles.stats}>
        <p>Found <strong>{total}</strong> Pokémon originally discovered in the <strong>{capitalize(regionName)}</strong> region</p>
      </div>
      <div className={styles.grid}>
        {cards.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
      {total > ITEMS_PER_PAGE && (
        <Suspense fallback={<div>Loading pagination...</div>}>
          <Pagination totalItems={total} itemsPerPage={ITEMS_PER_PAGE} />
        </Suspense>
      )}
    </>
  );
}

export default async function RegionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ region: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { region } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;

  return (
    <main className={styles.main}>
      <Navbar />
      <div className="container">
        <section className={styles.header}>
          <span className={styles.badge}>Region</span>
          <h1 className={styles.title}>{capitalize(region)}</h1>
        </section>

        <section className={styles.content}>
          <Suspense fallback={<div className={styles.loading}>Loading {capitalize(region)} Pokémon...</div>}>
            <RegionGrid regionName={region} page={page} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
