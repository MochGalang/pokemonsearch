'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  initialValue = '',
  placeholder = 'Search Pokémon by name or number...',
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(searchParams.get('q') ?? initialValue);
  }, [searchParams, initialValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(v);
        } else {
          const params = new URLSearchParams(searchParams.toString());
          if (v) {
            params.set('q', v);
          } else {
            params.delete('q');
          }
          params.delete('page');
          router.push(`/?${params.toString()}`);
        }
      }, 350);
    },
    [router, searchParams, onSearch]
  );

  const handleClear = () => {
    setValue('');
    if (onSearch) onSearch('');
    else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      params.delete('page');
      router.push(`/?${params.toString()}`);
    }
    inputRef.current?.focus();
  };

  return (
    <div className={styles.wrapper}>
      <label htmlFor="pokemon-search" className="sr-only">Search Pokémon</label>
      <span className={styles.icon} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <input
        id="pokemon-search"
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        autoComplete="off"
        aria-label="Search Pokémon"
      />
      {value && (
        <button className={styles.clear} onClick={handleClear} aria-label="Clear search" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
