'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { getPokemonTcgCards } from '@/lib/api';
import TcgCardModal from './TcgCardModal';
import styles from './TcgGalleryClient.module.css';

interface TcgGalleryClientProps {
  initialCards: any[];
  initialTotal: number;
}

export default function TcgGalleryClient({ initialCards, initialTotal }: TcgGalleryClientProps) {
  const [cards, setCards] = useState<any[]>(initialCards);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCards.length < initialTotal);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPage(1);
    
    try {
      const res = await getPokemonTcgCards(query, 1, 20);
      setCards(res.data);
      setHasMore(res.data.length < res.totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    
    try {
      const res = await getPokemonTcgCards(query, nextPage, 20);
      setCards(prev => [...prev, ...res.data]);
      setPage(nextPage);
      setHasMore(cards.length + res.data.length < res.totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards by Pokémon name..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn} disabled={isLoading}>
            Search
          </button>
        </div>
      </form>

      {isLoading && page === 1 ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Searching TCG...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className={styles.noResults}>No cards found. Try a different search!</div>
      ) : (
        <>
          <div className={styles.grid}>
            {cards.map((card) => (
              <div 
                key={card.id} 
                className={styles.cardWrapper}
                onClick={() => setSelectedCard(card)}
              >
                <Image
                  src={card.images.small}
                  alt={card.name}
                  width={240}
                  height={334}
                  className={styles.cardImage}
                  unoptimized
                />
                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>{card.name}</div>
                  <div className={styles.cardSet}>{card.set?.name}</div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className={styles.loadMoreWrapper}>
              <button 
                onClick={loadMore} 
                className={styles.loadMoreBtn}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Cards'}
              </button>
            </div>
          )}
        </>
      )}

      {selectedCard && (
        <TcgCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
