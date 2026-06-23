import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TypeBadge from '@/components/TypeBadge';
import StatBar from '@/components/StatBar';
import PokemonImageToggle from '@/components/PokemonImageToggle';
import PokemonMovesClient from '@/components/PokemonMovesClient';
import {
  getPokemon,
  getPokemonSpecies,
  getEvolutionChain,
  getPokemonOfficialArtwork,
  getPokemonOfficialArtworkShiny,
  capitalize,
  getEnglishFlavorText,
  flattenEvolutionChain,
  getEvolutionChainId,
  getPokemonWeaknesses,
  getMove,
} from '@/lib/api';
import styles from './page.module.css';

export const revalidate = 3600;

interface PokemonDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PokemonDetail({ params }: PokemonDetailProps) {
  const { id } = await params;

  try {
    const pokemon = await getPokemon(id);
    const species = await getPokemonSpecies(pokemon.species.name);

    // Fetch evolution chain
    const chainId = getEvolutionChainId(species);
    const evolutionChain = await getEvolutionChain(chainId);
    const flattenedChain = flattenEvolutionChain(evolutionChain);

    const primaryType = pokemon.types[0]?.type.name ?? 'normal';
    const imgSrc =
      pokemon.sprites.other['official-artwork'].front_default ??
      getPokemonOfficialArtwork(pokemon.id);

    const shinyImgSrc =
      pokemon.sprites.other['official-artwork'].front_shiny ??
      getPokemonOfficialArtworkShiny(pokemon.id);

    const flavorText = getEnglishFlavorText(species);

    // Fetch weaknesses
    const typeNames = pokemon.types.map((t) => t.type.name);
    const weaknesses = await getPokemonWeaknesses(typeNames);
    const weaknessEntries = Object.entries(weaknesses).sort((a, b) => b[1] - a[1]);

    // Fetch move types
    const movesWithTypes = await Promise.all(
      pokemon.moves.map(async (m) => {
        try {
          const moveDetail = await getMove(m.move.name);
          return {
            name: m.move.name,
            type: moveDetail.type.name,
          };
        } catch {
          return {
            name: m.move.name,
            type: 'normal',
          };
        }
      })
    );

    return (
      <main className={styles.main}>
        <Navbar />

        <div className={`container ${styles.container}`}>
          {/* Header Section */}
          <div className={`${styles.header} ${styles[`bg-${primaryType}`]}`}>
            <div className={styles.headerContent}>
              <Link href="/" className={styles.backBtn}>
                &larr; Back to Pokédex
              </Link>
              <div className={styles.titleArea}>
                <h1 className={styles.name}>{capitalize(pokemon.name)}</h1>
                <span className={styles.id}>#{String(pokemon.id).padStart(3, '0')}</span>
              </div>
              <div className={styles.types}>
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} size="lg" />
                ))}
              </div>
            </div>
            <div className={styles.imageContainer}>
              <div className={styles.glow} />
              <PokemonImageToggle
                normalSrc={imgSrc}
                shinySrc={shinyImgSrc}
                alt={capitalize(pokemon.name)}
                className={styles.image}
                priority
              />
            </div>
          </div>

          <div className={styles.grid}>
            {/* Left Column: Info & Stats */}
            <div className={styles.leftCol}>
              <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Pokédex Entry</h2>
                <p className={styles.flavorText}>{flavorText}</p>

                <div className={styles.infoGrid}>
                  <div className={styles.infoBox}>
                    <span className={styles.infoLabel}>Height</span>
                    <span className={styles.infoValue}>{pokemon.height / 10} m</span>
                  </div>
                  <div className={styles.infoBox}>
                    <span className={styles.infoLabel}>Weight</span>
                    <span className={styles.infoValue}>{pokemon.weight / 10} kg</span>
                  </div>
                </div>

                <div className={styles.abilities}>
                  <h3 className={styles.subTitle}>Abilities</h3>
                  <div className={styles.abilitiesList}>
                    {pokemon.abilities.map((a) => (
                      <div key={a.ability.name} className={styles.abilityItem}>
                        <span className={styles.abilityName}>
                          {capitalize(a.ability.name)}
                          {a.is_hidden && <span className={styles.hiddenTag}>(Hidden)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Base Stats</h2>
                <div className={styles.statsContainer}>
                  {pokemon.stats.map((s) => (
                    <StatBar
                      key={s.stat.name}
                      statName={s.stat.name}
                      value={s.base_stat}
                    />
                  ))}
                  <div className={styles.totalRow}>
                    <span>Total Base Stats:</span>
                    <strong>{pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0)}</strong>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Evolutions & Matchups */}
            <div className={styles.rightCol}>
              <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Weaknesses</h2>
                <div className={styles.weaknessGrid} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {weaknessEntries.length > 0 ? (
                    weaknessEntries.map(([type, multiplier]) => (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TypeBadge type={type} size="sm" />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                          x{multiplier}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--on-surface-variant)' }}>No specific weaknesses</p>
                  )}
                </div>
              </section>

              <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Evolution Chain</h2>
                <div className={styles.evolutionChain}>
                  {flattenedChain.map((evo, index) => (
                    <div key={evo.id} className={styles.evoWrapper}>
                      {index > 0 && (
                        <div className={styles.evoArrow}>
                          &darr;
                          {evo.minLevel && <span className={styles.evoLevel}>Lvl {evo.minLevel}</span>}
                        </div>
                      )}
                      <Link href={`/pokemon/${evo.id}`} className={styles.evoCard}>
                        <Image
                          src={getPokemonOfficialArtwork(evo.id)}
                          alt={capitalize(evo.name)}
                          width={80}
                          height={80}
                          className={styles.evoImage}
                        />
                        <div className={styles.evoInfo}>
                          <span className={styles.evoId}>#{String(evo.id).padStart(3, '0')}</span>
                          <span className={styles.evoName}>{capitalize(evo.name)}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Moves Section */}
            <section className={`${styles.card} ${styles.fullWidthCard}`}>
              <h2 className={styles.sectionTitle}>Move Pool</h2>
              <PokemonMovesClient moves={movesWithTypes} />
            </section>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
