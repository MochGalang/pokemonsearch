import { useState, useMemo } from 'react';
import { capitalize, getPokemon } from '@/lib/api';
import type { Pokemon } from '@/types/pokemon';
import styles from './PokemonSearchModal.module.css';

interface PokemonSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: string[];
  onSelect: (pokemon: Pokemon) => void;
  currentTeamNames: string[];
}

export default function PokemonSearchModal({
  isOpen,
  onClose,
  pokemonList,
  onSelect,
  currentTeamNames,
}: PokemonSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loadingName, setLoadingName] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    if (!query) return pokemonList.slice(0, 50); // show first 50 when empty
    return pokemonList
      .filter((name) => name.includes(query.toLowerCase()))
      .slice(0, 50);
  }, [query, pokemonList]);

  if (!isOpen) return null;

  const handleSelect = async (name: string) => {
    try {
      setLoadingName(name);
      const poke = await getPokemon(name);
      onSelect(poke);
      setQuery('');
    } catch (e) {
      console.error('Failed to fetch pokemon details:', e);
    } finally {
      setLoadingName(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select a Pokémon</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.body}>
          <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                placeholder="Search by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <ul className={styles.list}>
            {filteredList.map((name) => {
              const isAlreadyInTeam = currentTeamNames.includes(name);
              const isLoading = loadingName === name;
              
              return (
                <li key={name} className={styles.listItem}>
                  <button
                    className={styles.listButton}
                    onClick={() => handleSelect(name)}
                    disabled={isAlreadyInTeam || isLoading || loadingName !== null}
                  >
                    <span>{capitalize(name)}</span>
                    {isAlreadyInTeam && <span className={styles.disabledText}>Already in team</span>}
                    {isLoading && <span className={styles.disabledText} style={{ color: 'var(--primary)', background: 'transparent' }}>Loading...</span>}
                  </button>
                </li>
              );
            })}
            {filteredList.length === 0 && (
              <div className={styles.loadingState}>No Pokémon found.</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
