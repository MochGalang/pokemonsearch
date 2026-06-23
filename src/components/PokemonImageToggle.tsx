'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './PokemonImageToggle.module.css';

interface PokemonImageToggleProps {
  normalSrc: string;
  shinySrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function PokemonImageToggle({
  normalSrc,
  shinySrc,
  alt,
  className,
  priority = false,
}: PokemonImageToggleProps) {
  const [isShiny, setIsShiny] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.imageWrapper}>
        <Image
          src={isShiny ? shinySrc : normalSrc}
          alt={`${alt} ${isShiny ? 'Shiny' : 'Normal'}`}
          width={300}
          height={300}
          className={className}
          priority={priority}
        />
      </div>
      <button
        type="button"
        className={`${styles.toggleBtn} ${isShiny ? styles.active : ''}`}
        onClick={() => setIsShiny(!isShiny)}
        title="Toggle Shiny"
      >
        <span className={styles.sparkle}>
          <Image src="/image/sparkling.png" alt="Sparkle" width={16} height={16} unoptimized />
        </span>
        <span className={styles.label}>{isShiny ? 'Shiny' : 'Normal'}</span>
      </button>
    </div>
  );
}
