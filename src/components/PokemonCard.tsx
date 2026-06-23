'use client';

import Image from 'next/image';
import Link from 'next/link';
import TypeBadge from './TypeBadge';
import styles from './PokemonCard.module.css';
import type { PokemonCardData } from '@/types/pokemon';
import { capitalize, getPokemonOfficialArtwork } from '@/lib/api';

interface PokemonCardProps {
  pokemon: PokemonCardData;
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const { id, name, types, sprite } = pokemon;
  const primaryType = types[0] ?? 'normal';
  const imgSrc = sprite ?? getPokemonOfficialArtwork(id);

  const handleMouseEnter = () => {
    const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);
    audio.volume = 0.3; // 30% volume to keep it subtle
    audio.play().catch(() => {}); // Ignore if autoplay blocked or user moves mouse too fast
  };

  return (
    <Link 
      href={`/pokemon/${id}`} 
      className={styles.card} 
      aria-label={`View ${capitalize(name)}`}
      onMouseEnter={handleMouseEnter}
    >
      <div className={`${styles.imgWrapper} ${styles[`bg-${primaryType}`]}`}>
        <div className={styles.pokeball} aria-hidden="true" />
        <Image
          src={imgSrc}
          alt={capitalize(name)}
          width={130}
          height={130}
          className={styles.img}
          priority={id <= 20}
        />
      </div>
      <div className={styles.body}>
        <span className={styles.id}>#{String(id).padStart(3, '0')}</span>
        <h3 className={styles.name}>{capitalize(name)}</h3>
        <div className={styles.types}>
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>
    </Link>
  );
}
