import Image from 'next/image';
import Navbar from '@/components/Navbar';
import CompareSelector from '@/components/CompareSelector';
import TypeBadge from '@/components/TypeBadge';
import { getAllPokemonNames, getPokemon, getPokemonOfficialArtwork, capitalize, formatStatName, getPokemonWeaknesses } from '@/lib/api';
import styles from './page.module.css';
import unifiedStyles from './unified-stats.module.css';
import type { Pokemon } from '@/types/pokemon';

export const dynamic = 'force-dynamic';

interface ComparePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const p1Query = typeof params.p1 === 'string' ? params.p1 : '';
  const p2Query = typeof params.p2 === 'string' ? params.p2 : '';

  // Fetch all names for autocomplete
  const allNamesRes = await getAllPokemonNames();
  const pokemonList = allNamesRes.results.map((p) => p.name);

  let p1Data: Pokemon | null = null;
  let p2Data: Pokemon | null = null;
  let p1Weaknesses: Record<string, number> = {};
  let p2Weaknesses: Record<string, number> = {};

  if (p1Query) {
    try {
      p1Data = await getPokemon(p1Query.toLowerCase());
      p1Weaknesses = await getPokemonWeaknesses(p1Data.types.map(t => t.type.name));
    } catch (e) {
      console.error(`Failed to fetch ${p1Query}`, e);
    }
  }

  if (p2Query) {
    try {
      p2Data = await getPokemon(p2Query.toLowerCase());
      p2Weaknesses = await getPokemonWeaknesses(p2Data.types.map(t => t.type.name));
    } catch (e) {
      console.error(`Failed to fetch ${p2Query}`, e);
    }
  }

  // Helper to get stat color based on value
  const getStatColor = (value: number) => {
    if (value >= 120) return '#3b4cca'; // High - Blue
    if (value >= 90) return '#7AC74C';  // Good - Green
    if (value >= 60) return '#F7D02C';  // Average - Yellow
    return '#EE8130';                   // Low - Orange
  };

  const renderPokemonCard = (pokemon: Pokemon | null, otherPokemon: Pokemon | null, weaknesses: Record<string, number>) => {
    if (!pokemon) return null;

    const primaryType = pokemon.types[0]?.type.name ?? 'normal';
    const imgSrc =
      pokemon.sprites.other['official-artwork'].front_default ??
      getPokemonOfficialArtwork(pokemon.id);

    return (
      <div className={styles.card}>
        <div className={`${styles.headerGlow} ${styles[`bg-${primaryType}`]}`} />
        
        <div className={styles.imageWrapper}>
          <Image
            src={imgSrc}
            alt={capitalize(pokemon.name)}
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <h2 className={styles.pokemonName}>{capitalize(pokemon.name)}</h2>
        <span className={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</span>

        <div className={styles.types}>
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} size="md" />
          ))}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Base Stats</h3>
          <div className={styles.statsList}>
            {pokemon.stats.map((s, index) => {
              const otherStat = otherPokemon?.stats[index]?.base_stat ?? 0;
              const isWinner = otherPokemon && s.base_stat > otherStat;
              
              return (
                <div key={s.stat.name} className={styles.statRow}>
                  <span className={styles.statLabel}>{formatStatName(s.stat.name)}</span>
                  <span className={styles.statValue}>{s.base_stat}</span>
                  <div className={styles.statBarContainer}>
                    <div
                      className={`${styles.statBarFill} ${isWinner ? styles.statBarWinner : ''}`}
                      style={{
                        width: `${Math.min((s.base_stat / 255) * 100, 100)}%`,
                        backgroundColor: getStatColor(s.base_stat),
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className={styles.statRow} style={{ marginTop: '8px' }}>
              <span className={styles.statLabel}>Total</span>
              <span className={styles.statValue}>
                {pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0)}
              </span>
              <div className={styles.statBarContainer} style={{ background: 'transparent' }} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Abilities</h3>
          <div className={styles.abilitiesList}>
            {pokemon.abilities.map((a) => (
               <div key={a.ability.name} className={styles.abilityItem}>
                 <span>{capitalize(a.ability.name)}</span>
                 {a.is_hidden && <span className={styles.hiddenTag}>Hidden</span>}
               </div>
            ))}
          </div>
        </div>
        
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Physical</h3>
          <div className={styles.abilitiesList}>
             <div className={styles.abilityItem}>
               <span>Height</span>
               <span>{pokemon.height / 10} m</span>
             </div>
             <div className={styles.abilityItem}>
               <span>Weight</span>
               <span>{pokemon.weight / 10} kg</span>
             </div>
          </div>
        </div>
        
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Weaknesses</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(weaknesses).sort((a, b) => b[1] - a[1]).length > 0 ? (
              Object.entries(weaknesses).sort((a, b) => b[1] - a[1]).map(([type, multiplier]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TypeBadge type={type} size="sm" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                    x{multiplier}
                  </span>
                </div>
              ))
            ) : (
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>No specific weaknesses</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Compare Pokémon</h1>
          <p className={styles.subtitle}>Select two Pokémon to analyze their stats and abilities.</p>
        </div>

        <CompareSelector pokemonList={pokemonList} />

        {(!p1Data && !p2Data) && (
           <div className={styles.emptyState}>
             <div className={styles.emptyStateIcon}>⚖️</div>
             <h2>Ready to Compare</h2>
             <p>Use the search bars above to select Pokémon to compare.</p>
           </div>
        )}

        {(p1Data || p2Data) && (
          <div className={styles.compareGrid}>
            {p1Data ? renderPokemonCard(p1Data, p2Data, p1Weaknesses) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🔍</div>
                <p>Waiting for Pokémon 1...</p>
              </div>
            )}
            
            {p2Data ? renderPokemonCard(p2Data, p1Data, p2Weaknesses) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🔍</div>
                <p>Waiting for Pokémon 2...</p>
              </div>
            )}
          </div>
        )}

        {(p1Data && p2Data) && (
          <div className={unifiedStyles.unifiedStatsCard}>
            <h3 className={unifiedStyles.unifiedStatsTitle}>Stat Comparison</h3>
            <div className={unifiedStyles.unifiedStatsList}>
              {p1Data.stats.map((s, i) => {
                const p1Stat = s.base_stat;
                const p2Stat = p2Data!.stats[i].base_stat;
                const total = p1Stat + p2Stat;
                const p1Percent = (p1Stat / total) * 100;
                const p2Percent = (p2Stat / total) * 100;
                
                const p1Type = p1Data!.types[0]?.type.name ?? 'normal';
                const p2Type = p2Data!.types[0]?.type.name ?? 'normal';

                return (
                  <div key={s.stat.name} className={unifiedStyles.unifiedStatRow}>
                    <div className={unifiedStyles.unifiedStatLabels}>
                      <span className={unifiedStyles.unifiedStatValue} style={{ color: `var(--type-${p1Type})` }}>
                        {p1Stat}
                      </span>
                      <span className={unifiedStyles.unifiedStatName}>{formatStatName(s.stat.name)}</span>
                      <span className={unifiedStyles.unifiedStatValue} style={{ color: `var(--type-${p2Type})` }}>
                        {p2Stat}
                      </span>
                    </div>
                    <div className={unifiedStyles.unifiedBarContainer}>
                      <div 
                        className={unifiedStyles.unifiedBarP1} 
                        style={{ width: `${p1Percent}%`, backgroundColor: `var(--type-${p1Type})` }} 
                      />
                      <div 
                        className={unifiedStyles.unifiedBarP2} 
                        style={{ width: `${p2Percent}%`, backgroundColor: `var(--type-${p2Type})` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
