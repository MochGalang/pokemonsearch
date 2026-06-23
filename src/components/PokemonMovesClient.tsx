'use client';

import { useState } from 'react';
import { getMove } from '@/lib/api';
import type { MoveDetail } from '@/types/pokemon';
import TypeBadge from '@/components/TypeBadge';
import styles from './PokemonMovesClient.module.css';

interface PokemonMovesClientProps {
  moves: Array<{
    name: string;
    type: string;
  }>;
}

export default function PokemonMovesClient({ moves }: PokemonMovesClientProps) {
  const [selectedMove, setSelectedMove] = useState<MoveDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');

  const handleMoveClick = async (moveName: string) => {
    try {
      setLoading(true);
      setError('');
      const details = await getMove(moveName);
      setSelectedMove(details);
    } catch (err) {
      setError('Failed to load move details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedMove(null);

  // Get English flavor text
  const getEnglishFlavorText = (move: MoveDetail) => {
    const entry = move.flavor_text_entries.find(e => e.language.name === 'en');
    return entry ? entry.flavor_text.replace(/\n|\f/g, ' ') : 'No description available.';
  };

  return (
    <div className={styles.container}>
      <div className={styles.movesGrid}>
        {moves.map((m) => (
          <button 
            key={m.name} 
            className={styles.moveTag}
            onClick={() => handleMoveClick(m.name)}
          >
            <span className={styles.moveTagName}>{capitalize(m.name)}</span>
            <TypeBadge type={m.type} size="sm" />
          </button>
        ))}
      </div>

      {(loading || selectedMove || error) && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
            
            {loading && <div className={styles.loading}>Loading move details...</div>}
            
            {error && <div className={styles.error}>{error}</div>}
            
            {selectedMove && !loading && (
              <div className={styles.moveDetails}>
                <h3 className={styles.moveName}>{capitalize(selectedMove.name)}</h3>
                
                <div className={styles.badges}>
                  <TypeBadge type={selectedMove.type.name} size="md" />
                  <span className={`${styles.classBadge} ${styles[selectedMove.damage_class.name]}`}>
                    {capitalize(selectedMove.damage_class.name)}
                  </span>
                </div>

                <p className={styles.flavorText}>{getEnglishFlavorText(selectedMove)}</p>

                <div className={styles.statsGrid}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Power</span>
                    <span className={styles.statValue}>{selectedMove.power ?? '-'}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Accuracy</span>
                    <span className={styles.statValue}>{selectedMove.accuracy ? `${selectedMove.accuracy}%` : '-'}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>PP</span>
                    <span className={styles.statValue}>{selectedMove.pp ?? '-'}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Priority</span>
                    <span className={styles.statValue}>{selectedMove.priority}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
