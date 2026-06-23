'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import styles from './TcgCardModal.module.css';

interface TcgCardModalProps {
  card: any;
  onClose: () => void;
}

const getRarityInfo = (rarity: string) => {
  if (!rarity) return null;
  const r = rarity.toLowerCase();
  if (r.includes('special art rare') || r.includes('special illustration rare')) return { abbr: 'SAR', color: 'linear-gradient(135deg, #FFD700, #FF8C00)', text: '#000' };
  if (r.includes('hyper rare')) return { abbr: 'UR', color: 'linear-gradient(135deg, #F9D423, #FF4E50)', text: '#fff' };
  if (r.includes('secret rare') || r.includes('rare secret')) return { abbr: 'SEC', color: 'linear-gradient(135deg, #FF0099, #493240)', text: '#fff' };
  if (r.includes('ultra rare')) return { abbr: 'SR', color: 'linear-gradient(135deg, #8A2387, #E94057, #F27121)', text: '#fff' };
  if (r.includes('double rare')) return { abbr: 'RR', color: 'linear-gradient(135deg, #FF416C, #FF4B2B)', text: '#fff' };
  if (r.includes('uncommon')) return { abbr: 'U', color: 'linear-gradient(135deg, #56CCF2, #2F80ED)', text: '#fff' };
  if (r.includes('common')) return { abbr: 'C', color: 'linear-gradient(135deg, #BBD2C5, #536976)', text: '#fff' };
  if (r.includes('rare')) return { abbr: 'R', color: 'linear-gradient(135deg, #4CB8C4, #3CD3AD)', text: '#fff' };
  return null;
};

const getEnergyColor = (type: string) => {
  const t = type.toLowerCase();
  if (t === 'fire') return 'linear-gradient(135deg, #ff4b1f, #ff9068)';
  if (t === 'water') return 'linear-gradient(135deg, #2193b0, #6dd5ed)';
  if (t === 'grass') return 'linear-gradient(135deg, #11998e, #38ef7d)';
  if (t === 'lightning') return 'linear-gradient(135deg, #F9D423, #FF4E50)';
  if (t === 'psychic') return 'linear-gradient(135deg, #8E2DE2, #4A00E0)';
  if (t === 'fighting') return 'linear-gradient(135deg, #cb2d3e, #ef473a)';
  if (t === 'darkness') return 'linear-gradient(135deg, #2C3E50, #000000)';
  if (t === 'metal') return 'linear-gradient(135deg, #bdc3c7, #2c3e50)';
  if (t === 'fairy') return 'linear-gradient(135deg, #ff9a9e, #fecfef)';
  if (t === 'dragon') return 'linear-gradient(135deg, #1A2980, #26D0CE)';
  return 'linear-gradient(135deg, #EAEAEA, #DBDBDB)'; // Colorless
};

export default function TcgCardModal({ card, onClose }: TcgCardModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className={styles.content}>
          {/* Left Side: Image */}
          <div className={styles.imageCol}>
            <Image
              src={card.images.large || card.images.small}
              alt={card.name}
              width={400}
              height={558}
              className={styles.cardImage}
              unoptimized
            />
            {card.tcgplayer?.url && (
              <a href={card.tcgplayer.url} target="_blank" rel="noopener noreferrer" className={styles.buyBtn}>
                View on TCGPlayer
              </a>
            )}
          </div>

          {/* Right Side: Details & Graph */}
          <div className={styles.detailsCol}>
            <div className={styles.header}>
              <div>
                <h2 className={styles.title}>{card.name}</h2>
                <div className={styles.subtitle}>
                  {card.supertype} - {card.subtypes?.join(', ')}
                </div>
              </div>
              {card.hp && (
                <div className={styles.hpBadge}>
                  HP {card.hp} {card.types?.[0]}
                </div>
              )}
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Set</span>
                <span className={styles.infoValue}>{card.set?.name}</span>
              </div>
              
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Rarity</span>
                <div className={styles.infoValue}>
                  {card.rarity ? (
                    <div className={styles.rarityContainer}>
                      {getRarityInfo(card.rarity) && (
                        <span 
                          className={styles.rarityBadge}
                          style={{ 
                            background: getRarityInfo(card.rarity)?.color,
                            color: getRarityInfo(card.rarity)?.text
                          }}
                        >
                          {getRarityInfo(card.rarity)?.abbr}
                        </span>
                      )}
                      <span className={styles.rarityText}>{card.rarity}</span>
                    </div>
                  ) : (
                    'Unknown'
                  )}
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Artist</span>
                <span className={styles.infoValue}>{card.artist || 'Unknown'}</span>
              </div>
            </div>

            <div className={styles.movesSection}>
              {card.abilities && card.abilities.map((ability: any, idx: number) => (
                <div key={idx} className={styles.moveBlock}>
                  <div className={styles.moveHeader}>
                    <span className={styles.abilityType}>{ability.type}</span>
                    <span className={styles.moveName}>{ability.name}</span>
                  </div>
                  <p className={styles.moveText}>{ability.text}</p>
                </div>
              ))}

              {card.attacks && card.attacks.map((attack: any, idx: number) => (
                <div key={idx} className={styles.moveBlock}>
                  <div className={styles.moveHeader}>
                    <div className={styles.costGrid}>
                      {attack.cost.map((c: string, i: number) => (
                        <div 
                          key={i} 
                          className={styles.energyCostWrapper}
                          style={{ background: getEnergyColor(c) }}
                        >
                          <span className={styles.energyCost}>{c.substring(0, 1)}</span>
                        </div>
                      ))}
                    </div>
                    <span className={styles.moveName}>{attack.name}</span>
                    <span className={styles.moveDamage}>{attack.damage}</span>
                  </div>
                  <p className={styles.moveText}>{attack.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
