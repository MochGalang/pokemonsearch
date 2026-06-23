'use client';

import { useState, useEffect } from 'react';
import type { Pokemon } from '@/types/pokemon';
import TypeBadge from './TypeBadge';
import { formatStatName, getPokemonTypeEffectiveness } from '@/lib/api';
import styles from './SynergyAnalyzer.module.css';

interface SynergyAnalyzerProps {
  team: Pokemon[];
}

const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

export default function SynergyAnalyzer({ team }: SynergyAnalyzerProps) {
  const [weaknessesList, setWeaknessesList] = useState<Record<string, number>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function loadWeaknesses() {
      setLoading(true);
      try {
        const promises = team.map(p => getPokemonTypeEffectiveness(p.types.map(t => t.type.name)));
        const results = await Promise.all(promises);
        if (isMounted) {
          setWeaknessesList(results);
        }
      } catch (e) {
        console.error('Failed to load weaknesses', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (team.length > 0) {
      loadWeaknesses();
    } else {
      setWeaknessesList([]);
    }

    return () => { isMounted = false; };
  }, [team]);

  // Calculate Average Stats
  const avgStats = ALL_TYPES.reduce((acc, _) => acc, [] as { name: string; value: number }[]);
  
  const statsMap: Record<string, number> = {};
  team.forEach(p => {
    p.stats.forEach(s => {
      statsMap[s.stat.name] = (statsMap[s.stat.name] || 0) + s.base_stat;
    });
  });

  const averageStats = Object.keys(statsMap).map(name => ({
    name,
    value: Math.round(statsMap[name] / team.length)
  }));

  const getStatColor = (value: number) => {
    if (value >= 120) return '#3b4cca';
    if (value >= 90) return '#7AC74C';
    if (value >= 60) return '#F7D02C';
    return '#EE8130';
  };

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>📊</span> Average Team Stats
        </h2>
        
        <div className={styles.statsList}>
          {averageStats.map((s) => (
            <div key={s.name} className={styles.statRow}>
              <span className={styles.statLabel}>{formatStatName(s.name)}</span>
              <span className={styles.statValue}>{s.value}</span>
              <div className={styles.statBarContainer}>
                <div
                  className={styles.statBarFill}
                  style={{
                    width: `${Math.min((s.value / 255) * 100, 100)}%`,
                    backgroundColor: getStatColor(s.value),
                  }}
                />
              </div>
            </div>
          ))}
          <div className={styles.statRow} style={{ marginTop: '8px' }}>
            <span className={styles.statLabel}>Total Avg</span>
            <span className={styles.statValue}>
              {averageStats.reduce((acc, s) => acc + s.value, 0)}
            </span>
            <div className={styles.statBarContainer} style={{ background: 'transparent' }} />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🛡️</span> Type Coverage Heatmap
        </h2>
        
        {loading ? (
          <div className={styles.loading}>Analyzing team synergy...</div>
        ) : (
          <>
            <div className={styles.heatmapGrid}>
              {ALL_TYPES.map(type => {
                let weak = 0;
                let neutral = 0;
                let resist = 0;
                let immune = 0;

                weaknessesList.forEach(wMap => {
                  const multiplier = wMap[type] !== undefined ? wMap[type] : 1;
                  if (multiplier > 1) weak++;
                  else if (multiplier === 1) neutral++;
                  else if (multiplier > 0) resist++;
                  else immune++;
                });

                const total = team.length;
                const weakPct = (weak / total) * 100;
                const neutralPct = (neutral / total) * 100;
                const resistPct = (resist / total) * 100;
                const immunePct = (immune / total) * 100;

                return (
                  <div key={type} className={styles.heatmapItem}>
                    <div className={styles.heatmapHeader}>
                      <TypeBadge type={type} size="sm" />
                    </div>
                    
                    <div className={styles.heatmapBars}>
                      <div className={styles.barWeak} style={{ width: `${weakPct}%` }} title={`${weak} Weak`} />
                      <div className={styles.barNeutral} style={{ width: `${neutralPct}%` }} title={`${neutral} Neutral`} />
                      <div className={styles.barResist} style={{ width: `${resistPct}%` }} title={`${resist} Resist`} />
                      <div className={styles.barImmune} style={{ width: `${immunePct}%` }} title={`${immune} Immune`} />
                    </div>
                    
                    <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {weak > 0 && <span style={{ color: 'var(--error, #e74c3c)' }}><strong>{weak}</strong> Weak</span>}
                      {resist > 0 && <span style={{ color: '#2ecc71' }}><strong>{resist}</strong> Resist</span>}
                      {immune > 0 && <span style={{ color: '#3498db' }}><strong>{immune}</strong> Immune</span>}
                      {weak === 0 && resist === 0 && immune === 0 && <span><strong>{neutral}</strong> Neutral</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.heatmapLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#e74c3c' }} />
                <span>Weak (takes 2x or 4x damage)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#95a5a6' }} />
                <span>Neutral (1x damage)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#2ecc71' }} />
                <span>Resist (takes 0.5x or 0.25x damage)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#3498db' }} />
                <span>Immune (takes 0 damage)</span>
              </div>
            </div>
          </>
        )}
      </section>

      {!loading && weaknessesList.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.title}>
            <span className={styles.titleIcon}>📋</span> Team Summary
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(() => {
              const majorWeaknesses: string[] = [];
              const majorStrengths: string[] = [];

              ALL_TYPES.forEach(type => {
                let weak = 0;
                let resistOrImmune = 0;

                weaknessesList.forEach(wMap => {
                  const m = wMap[type] !== undefined ? wMap[type] : 1;
                  if (m > 1) weak++;
                  if (m < 1) resistOrImmune++;
                });

                if (weak >= 2) majorWeaknesses.push(type);
                if (resistOrImmune >= 2) majorStrengths.push(type);
              });

              return (
                <>
                  <div>
                    <h3 style={{ fontSize: '16px', color: 'var(--error, #e74c3c)', marginBottom: '8px' }}>Major Weaknesses</h3>
                    {majorWeaknesses.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {majorWeaknesses.map(t => <TypeBadge key={`weak-${t}`} type={t} size="sm" />)}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--on-surface-variant)' }}>Your team has excellent coverage with no major shared weaknesses!</p>
                    )}
                    <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                      (Types that 2 or more of your Pokémon are weak against)
                    </p>
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '16px', color: '#2ecc71', marginBottom: '8px' }}>Major Strengths</h3>
                    {majorStrengths.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {majorStrengths.map(t => <TypeBadge key={`strong-${t}`} type={t} size="sm" />)}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--on-surface-variant)' }}>Consider adding Pokémon with diverse typings to build defensive strengths.</p>
                    )}
                    <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                      (Types that 2 or more of your Pokémon resist or are immune to)
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      )}
    </div>
  );
}
