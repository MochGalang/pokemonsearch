import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import PokemonCard from '@/components/PokemonCard';
import TypeBadge from '@/components/TypeBadge';
import { getType, getPokemon, getPokemonIdFromUrl, getPokemonOfficialArtwork, capitalize } from '@/lib/api';
import styles from './page.module.css';

export const revalidate = 3600;

async function TypeGrid({ typeName, page }: { typeName: string; page: number }) {
  const ITEMS_PER_PAGE = 24;
  
  let typeDetail;
  try {
    typeDetail = await getType(typeName);
  } catch {
    import('next/navigation').then((m) => m.notFound());
    return null;
  }
  
  const allPokemon = typeDetail.pokemon;
  const total = allPokemon.length;
  
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const paginated = allPokemon.slice(offset, offset + ITEMS_PER_PAGE);
  
  const cards = await Promise.all(
    paginated.map(async (p) => {
      const item = p.pokemon;
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
          types: [typeName],
          sprite: getPokemonOfficialArtwork(id),
        };
      }
    })
  );

  return (
    <>
      <div className={styles.stats}>
        <p>Found <strong>{total}</strong> Pokémon with <strong>{capitalize(typeName)}</strong> typing</p>
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

export default async function TypeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { type } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;

  return (
    <main className={styles.main}>
      <Navbar />
      <div className="container">
        <section className={styles.header}>
          <TypeBadge type={type} size="lg" />
          <h1 className={styles.title}>{capitalize(type)} Type Pokémon</h1>
        </section>

        <section className={styles.content}>
          <Suspense fallback={<div className={styles.loading}>Loading {capitalize(type)} Pokémon...</div>}>
            <TypeGrid typeName={type} page={page} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
