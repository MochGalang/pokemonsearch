'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './CompareSelector.module.css';

interface CompareSelectorProps {
  pokemonList: string[];
}

export default function CompareSelector({ pokemonList }: CompareSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialP1 = searchParams.get('p1') ?? '';
  const initialP2 = searchParams.get('p2') ?? '';

  const [p1, setP1] = useState(initialP1);
  const [p2, setP2] = useState(initialP2);

  const [p1Query, setP1Query] = useState(initialP1);
  const [p2Query, setP2Query] = useState(initialP2);

  const [showP1Dropdown, setShowP1Dropdown] = useState(false);
  const [showP2Dropdown, setShowP2Dropdown] = useState(false);

  const p1Ref = useRef<HTMLDivElement>(null);
  const p2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (p1Ref.current && !p1Ref.current.contains(event.target as Node)) {
        setShowP1Dropdown(false);
      }
      if (p2Ref.current && !p2Ref.current.contains(event.target as Node)) {
        setShowP2Dropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slot: 1 | 2, name: string) => {
    let newP1 = p1;
    let newP2 = p2;
    if (slot === 1) {
      setP1(name);
      setP1Query(name);
      setShowP1Dropdown(false);
      newP1 = name;
    } else {
      setP2(name);
      setP2Query(name);
      setShowP2Dropdown(false);
      newP2 = name;
    }
    
    // Update URL if both are selected or we just want to update params
    const params = new URLSearchParams(searchParams.toString());
    if (newP1) params.set('p1', newP1);
    if (newP2) params.set('p2', newP2);
    
    router.push(`/compare?${params.toString()}`);
  };

  const filteredP1 = pokemonList.filter(p => p.includes(p1Query.toLowerCase()) && p !== p1Query).slice(0, 10);
  const filteredP2 = pokemonList.filter(p => p.includes(p2Query.toLowerCase()) && p !== p2Query).slice(0, 10);

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup} ref={p1Ref}>
        <label className={styles.label}>Pokémon 1</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.input}
            placeholder="Select first Pokémon..."
            value={p1Query}
            onChange={(e) => {
              setP1Query(e.target.value);
              setShowP1Dropdown(true);
            }}
            onFocus={() => setShowP1Dropdown(true)}
          />
          {showP1Dropdown && filteredP1.length > 0 && (
            <div className={styles.dropdown}>
              {filteredP1.map(name => (
                <button
                  key={name}
                  className={styles.dropdownItem}
                  onClick={() => handleSelect(1, name)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.vsBadge}>VS</div>

      <div className={styles.inputGroup} ref={p2Ref}>
        <label className={styles.label}>Pokémon 2</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.input}
            placeholder="Select second Pokémon..."
            value={p2Query}
            onChange={(e) => {
              setP2Query(e.target.value);
              setShowP2Dropdown(true);
            }}
            onFocus={() => setShowP2Dropdown(true)}
          />
          {showP2Dropdown && filteredP2.length > 0 && (
            <div className={styles.dropdown}>
              {filteredP2.map(name => (
                <button
                  key={name}
                  className={styles.dropdownItem}
                  onClick={() => handleSelect(2, name)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
