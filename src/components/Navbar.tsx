'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Navbar.module.css';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/', label: 'Pokédex' },
  { href: '/types', label: 'Types' },
  { href: '/regions', label: 'Regions' },
  { href: '/compare', label: 'Compare' },
  { href: '/team', label: 'Team Builder' },
  { href: '/tierlist', label: 'Tier List' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/tcg', label: 'TCG Cards' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="PokemonSearch home">
            <Image
              src="/image/pokemonlogo.png"
              alt="PokemonSearch Logo"
              width={160}
              height={40}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>

          <ul className={styles.links} role="list">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${pathname === href ? styles.linkActive : ''}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <button
              className={styles.menuBtn}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={`${styles.menuIcon} ${menuOpen ? styles.menuIconOpen : ''}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={styles.mobileMenu}>
            <ul role="list">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${styles.mobileLink} ${pathname === href ? styles.mobileLinkActive : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
