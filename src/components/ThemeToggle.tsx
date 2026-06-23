'use client';

import Image from 'next/image';
import { useTheme } from './ThemeProvider';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Return a placeholder or empty button during hydration to avoid mismatch
  if (theme === null) {
    return <button className={styles.toggleBtn} aria-label="Toggle theme" disabled></button>;
  }

  return (
    <button
      className={`${styles.toggleBtn} ${theme === 'dark' ? styles.dark : ''}`}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className={styles.iconContainer}>
        <Image 
          src="/image/day-and-night.png" 
          alt="Day and Night" 
          width={36} 
          height={36} 
          className={styles.iconImage}
          priority
          unoptimized
        />
      </div>
    </button>
  );
}
