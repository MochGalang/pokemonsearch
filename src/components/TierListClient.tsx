'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import styles from './TierListClient.module.css';

interface MinimalPokemon {
  id: number;
  name: string;
}

interface Tier {
  id: string;
  name: string;
  color: string;
  pokemonIds: number[];
}

const DEFAULT_TIERS: Tier[] = [
  { id: 'S', name: 'S', color: '#ff7f7f', pokemonIds: [] },
  { id: 'A', name: 'A', color: '#ffbf7f', pokemonIds: [] },
  { id: 'B', name: 'B', color: '#ffff7f', pokemonIds: [] },
  { id: 'C', name: 'C', color: '#7fff7f', pokemonIds: [] },
  { id: 'D', name: 'D', color: '#7fbfff', pokemonIds: [] },
];

interface TierListClientProps {
  initialPokemonList: MinimalPokemon[];
}

export default function TierListClient({ initialPokemonList }: TierListClientProps) {
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const tiersWrapperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('pokemon_tierlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTiers(parsed);
        }
      } catch (e) {
        console.error('Failed to load tierlist', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pokemon_tierlist', JSON.stringify(tiers));
    }
  }, [tiers, isLoaded]);

  // Determine which Pokemon are unranked
  const rankedIds = useMemo(() => {
    const ids = new Set<number>();
    tiers.forEach(t => t.pokemonIds.forEach(id => ids.add(id)));
    return ids;
  }, [tiers]);

  const unrankedPool = useMemo(() => {
    let pool = initialPokemonList.filter(p => !rankedIds.has(p.id));
    if (searchQuery) {
      pool = pool.filter(p => p.name.includes(searchQuery.toLowerCase()));
    }
    return pool;
  }, [initialPokemonList, rankedIds, searchQuery]);

  // Map ID to Name for tooltips
  const pokemonMap = useMemo(() => {
    const map = new Map<number, string>();
    initialPokemonList.forEach(p => map.set(p.id, p.name));
    return map;
  }, [initialPokemonList]);

  // Drag and Drop Handler
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const pokemonId = parseInt(draggableId, 10);

    // If dropped in the same droppable
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'unranked') return; // We don't reorder unranked

      const newTiers = [...tiers];
      const targetIndex = newTiers.findIndex(t => t.id === source.droppableId);
      const newIds = Array.from(newTiers[targetIndex].pokemonIds);
      const [removed] = newIds.splice(source.index, 1);
      newIds.splice(destination.index, 0, removed);
      newTiers[targetIndex].pokemonIds = newIds;
      setTiers(newTiers);
      return;
    }

    // Moving between tiers or from/to unranked
    const newTiers = tiers.map(t => ({
      ...t,
      pokemonIds: t.pokemonIds.filter(id => id !== pokemonId)
    }));

    if (destination.droppableId !== 'unranked') {
      const targetIndex = newTiers.findIndex(t => t.id === destination.droppableId);
      if (targetIndex !== -1) {
        newTiers[targetIndex].pokemonIds.splice(destination.index, 0, pokemonId);
      }
    }

    setTiers(newTiers);
  };

  const movePokemonToTier = (pokemonId: number, targetTierId: string) => {
    const newTiers = tiers.map(t => ({
      ...t,
      pokemonIds: t.pokemonIds.filter(id => id !== pokemonId)
    }));

    if (targetTierId !== 'unranked') {
      const targetIndex = newTiers.findIndex(t => t.id === targetTierId);
      if (targetIndex !== -1) {
        newTiers[targetIndex].pokemonIds.push(pokemonId);
      }
    }

    setTiers(newTiers);
  };

  const handlePokemonClick = (id: number) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const handleTierClick = (targetTierId: string) => {
    if (selectedId !== null) {
      movePokemonToTier(selectedId, targetTierId);
      setSelectedId(null);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your tier list? All Pokémon will be returned to the pool.')) {
      setTiers(DEFAULT_TIERS);
      setSearchQuery('');
    }
  };

  const handleUpdateTier = (id: string, field: 'name' | 'color', value: string) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAddTier = () => {
    const defaultColors = ['#ff7f7f', '#ffbf7f', '#ffff7f', '#7fff7f', '#7fbfff', '#bf7fff', '#ff7fbf'];
    const newTier: Tier = {
      id: `tier-${Date.now()}`,
      name: 'New Tier',
      color: defaultColors[tiers.length % defaultColors.length],
      pokemonIds: []
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (id: string) => {
    if (confirm('Are you sure you want to delete this tier? Any Pokémon in it will be returned to the Unranked Pool.')) {
      setTiers(tiers.filter(t => t.id !== id));
    }
  };

  const handleExportPNG = async () => {
    if (tiersWrapperRef.current === null) return;
    try {
      setIsExporting(true);
      
      // Temporarily remove some interactive styles for the screenshot if needed
      // but html-to-image is usually good at capturing exactly what is shown
      const dataUrl = await toPng(tiersWrapperRef.current, {
        cacheBust: true,
        backgroundColor: '#121212', // Assuming dark mode surface background
        pixelRatio: 2,
        style: {
          padding: '24px',
          borderRadius: '16px',
        }
      });
      
      const link = document.createElement('a');
      link.download = 'my-pokemon-tier-list.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG', err);
      alert('Failed to generate image. Ensure all images have loaded.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderPokemonItem = (id: number, index: number, isRanked: boolean = false) => {
    const name = pokemonMap.get(id) || `Pokemon ${id}`;
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const isSelected = selectedId === id;

    return (
      <Draggable key={id.toString()} draggableId={id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.pokemonItem} ${isSelected ? styles.pokemonItemSelected : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePokemonClick(id);
            }}
            style={{
              ...provided.draggableProps.style,
              boxShadow: isSelected 
                ? '0 0 0 4px var(--primary, #3b4cca)' 
                : snapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : undefined,
              zIndex: isSelected || snapshot.isDragging ? 10 : undefined,
              transform: isSelected && !snapshot.isDragging ? 'scale(1.1)' : provided.draggableProps.style?.transform,
            }}
            title={name.charAt(0).toUpperCase() + name.slice(1)}
          >
            {isRanked && (
              <button
                className={styles.removePokemonBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  movePokemonToTier(id, 'unranked');
                }}
                title="Remove from tier"
              >
                ×
              </button>
            )}
            <Image
              src={spriteUrl}
              alt={name}
              width={64}
              height={64}
              className={styles.pokemonItemImage}
              loading="lazy"
              unoptimized
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('official-artwork')) {
                  target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
                } else {
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.display = 'none';
                  }
                }
              }}
            />
          </div>
        )}
      </Draggable>
    );
  };

  if (!isLoaded) return <div>Loading Tier List...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.container} onClick={() => setSelectedId(null)}>
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn} 
            style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }} 
            onClick={handleExportPNG}
            disabled={isExporting}
          >
            {isExporting ? 'Generating...' : 'Export PNG'}
          </button>
          <button className={`${styles.actionBtn} ${styles.resetBtn}`} onClick={handleReset}>
            Reset All
          </button>
        </div>

        <div className={styles.tiersWrapper} ref={tiersWrapperRef}>
          {tiers.map((tier) => (
            <Droppable key={tier.id} droppableId={tier.id} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  className={`${styles.tierRow} ${snapshot.isDraggingOver ? styles.tierRowDragOver : ''} ${selectedId !== null ? styles.tierRowClickable : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTierClick && handleTierClick(tier.id);
                  }}
                  style={{ cursor: selectedId !== null ? 'pointer' : undefined }}
                >
                  <div className={styles.tierLabelWrapper} style={{ backgroundColor: tier.color }}>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleUpdateTier(tier.id, 'name', e.currentTarget.textContent || 'NEW TIER')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      className={styles.tierLabelInput}
                      onClick={(e) => e.stopPropagation()}
                      title="Click to edit"
                    >
                      {tier.name}
                    </span>
                    <div className={styles.tierControls}>
                      <input
                        type="color"
                        value={tier.color}
                        onChange={(e) => handleUpdateTier(tier.id, 'color', e.target.value)}
                        className={styles.colorInput}
                        title="Change Tier Color"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className={styles.deleteTierBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTier(tier.id);
                        }}
                        title="Delete Tier"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div 
                    className={styles.tierContent}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {tier.pokemonIds.map((id, index) => renderPokemonItem(id, index, true))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
          <button
            className={styles.actionBtn}
            style={{ backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', marginTop: '8px', padding: '12px' }}
            onClick={handleAddTier}
          >
            + Add Tier
          </button>
        </div>

        <Droppable droppableId="unranked" direction="horizontal" isDropDisabled={false}>
          {(provided, snapshot) => (
            <div
              className={`${styles.poolSection} ${snapshot.isDraggingOver ? styles.tierRowDragOver : ''}`}
            >
              <div className={styles.poolHeader}>
                <h2 className={styles.poolTitle}>Unranked Pool</h2>
                <div className={styles.searchWrapper}>
                  <span className={styles.searchIcon}>
                    <Image src="/image/search (1).png" alt="Search" width={20} height={20} style={{ opacity: 0.7 }} />
                  </span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search Pokémon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div 
                className={styles.poolContent}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {unrankedPool.slice(0, 50).map((p, index) => renderPokemonItem(p.id, index, false))}
                {provided.placeholder}
                {unrankedPool.length === 0 && (
                  <p style={{ color: 'var(--on-surface-variant)', padding: '16px', width: '100%' }}>
                    {searchQuery ? 'No Pokémon found matching your search.' : 'All Pokémon have been ranked!'}
                  </p>
                )}
                {unrankedPool.length > 50 && (
                  <p style={{ color: 'var(--on-surface-variant)', padding: '16px', width: '100%', textAlign: 'center', fontSize: '14px', fontStyle: 'italic' }}>
                    Showing 50 of {unrankedPool.length} unranked Pokémon. Use the search bar to find specific ones!
                  </p>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
