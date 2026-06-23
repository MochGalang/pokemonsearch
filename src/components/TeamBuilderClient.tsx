'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Pokemon } from '@/types/pokemon';
import PokemonSearchModal from './PokemonSearchModal';
import TypeBadge from './TypeBadge';
import SynergyAnalyzer from './SynergyAnalyzer';
import { getPokemonOfficialArtwork, capitalize, getPokemon } from '@/lib/api';
import styles from './TeamBuilderClient.module.css';

interface TeamBuilderClientProps {
  pokemonList: string[];
}

export default function TeamBuilderClient({ pokemonList }: TeamBuilderClientProps) {
  const [team, setTeam] = useState<(Pokemon | null)[]>(Array(6).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoadingShared, setIsLoadingShared] = useState(false);

  // Load from LocalStorage or URL
  useEffect(() => {
    const loadSharedTeam = async (buildQuery: string) => {
      setIsLoadingShared(true);
      const names = buildQuery.split(',');
      const newTeam: (Pokemon | null)[] = Array(6).fill(null);
      
      try {
        await Promise.all(
          names.slice(0, 6).map(async (name, index) => {
            if (name && name !== 'empty') {
              try {
                const poke = await getPokemon(name);
                newTeam[index] = poke;
              } catch (err) {
                console.error(`Failed to fetch pokemon: ${name}`, err);
              }
            }
          })
        );
        setTeam(newTeam);
        // Clear the URL to avoid reloading it on refresh
        window.history.replaceState({}, '', window.location.pathname);
      } finally {
        setIsLoadingShared(false);
        setIsLoaded(true);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const buildParam = params.get('build');
    const saved = localStorage.getItem('pokemon_team');
    
    let hasValidSavedTeam = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6 && parsed.some(p => p !== null)) {
          hasValidSavedTeam = true;
        }
      } catch (e) {}
    }

    if (buildParam) {
      if (hasValidSavedTeam) {
        if (confirm('You are opening a shared team. Do you want to replace your current saved team?')) {
          loadSharedTeam(buildParam);
          return;
        } else {
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else {
        loadSharedTeam(buildParam);
        return;
      }
    }
    
    // Normal load from LocalStorage
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setTeam(parsed);
        }
      } catch (e) {
        console.error('Failed to parse team from localStorage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pokemon_team', JSON.stringify(team));
    }
  }, [team, isLoaded]);

  const handleAddClick = (index: number) => {
    setActiveSlot(index);
  };

  const handleRemove = (index: number) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  };

  const handleSelectPokemon = (pokemon: Pokemon) => {
    if (activeSlot !== null) {
      const newTeam = [...team];
      newTeam[activeSlot] = pokemon;
      setTeam(newTeam);
      setActiveSlot(null);
    }
  };

  const handleClearTeam = () => {
    if (confirm('Are you sure you want to clear your entire team?')) {
      setTeam(Array(6).fill(null));
    }
  };

  const handleShareTeam = async () => {
    setIsSharing(true);
    const buildNames = team.map(p => p ? p.name : 'empty').join(',');
    const shareUrl = `${window.location.origin}${window.location.pathname}?build=${buildNames}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Team link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
      prompt('Copy this link to share your team:', shareUrl);
    } finally {
      setIsSharing(false);
    }
  };

  const currentTeamNames = team.filter((p): p is Pokemon => p !== null).map((p) => p.name);
  const filledSlots = team.filter((p) => p !== null).length;

  if (!isLoaded || isLoadingShared) {
    return <div>Loading team...</div>;
  }

  return (
    <div>
      <div className={styles.actions} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          className={styles.shareBtn} 
          onClick={handleShareTeam}
          disabled={isSharing || filledSlots === 0}
          style={{ 
            opacity: filledSlots === 0 ? 0.5 : 1, 
            cursor: filledSlots === 0 ? 'not-allowed' : 'pointer',
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            padding: '8px 24px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontWeight: 600,
            fontSize: 'var(--label-lg-size)',
            fontFamily: 'inherit'
          }}
        >
          {isSharing ? 'Copying...' : 'Share Team'}
        </button>
        <button 
          className={styles.clearBtn} 

          onClick={handleClearTeam}
          disabled={filledSlots === 0}
          style={{ opacity: filledSlots === 0 ? 0.5 : 1, cursor: filledSlots === 0 ? 'not-allowed' : 'pointer' }}
        >
          Clear Team
        </button>
      </div>

      <div className={styles.grid}>
        {team.map((pokemon, index) => {
          if (!pokemon) {
            return (
              <div 
                key={`slot-${index}`} 
                className={`${styles.slot} ${styles.emptySlot}`}
                onClick={() => handleAddClick(index)}
              >
                <div className={styles.addIcon}>+</div>
                <div style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Add Pokémon</div>
              </div>
            );
          }

          const primaryType = pokemon.types[0]?.type.name || 'normal';
          const imgSrc = pokemon.sprites.other['official-artwork'].front_default ?? getPokemonOfficialArtwork(pokemon.id);

          return (
            <div key={`slot-${index}-${pokemon.id}`} className={`${styles.slot} ${styles.filledSlot} bg-${primaryType}`}>
              <div className={styles.glow} style={{ background: `radial-gradient(circle at center, var(--type-${primaryType}) 0%, transparent 70%)`, opacity: 0.2 }} />
              
              <button 
                className={styles.removeBtn} 
                onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                title="Remove from team"
              >
                &times;
              </button>
              
              <div className={styles.imageWrapper}>
                <Image
                  src={imgSrc}
                  alt={capitalize(pokemon.name)}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              
              <div className={styles.pokemonInfo}>
                <span className={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</span>
                <h3 className={styles.pokemonName}>{capitalize(pokemon.name)}</h3>
                <div className={styles.types}>
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PokemonSearchModal
        isOpen={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        pokemonList={pokemonList}
        onSelect={handleSelectPokemon}
        currentTeamNames={currentTeamNames}
      />

      {filledSlots > 0 && <SynergyAnalyzer team={team.filter((p): p is Pokemon => p !== null)} />}
    </div>
  );
}
