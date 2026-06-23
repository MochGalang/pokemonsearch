'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import styles from './QuizClient.module.css';

interface MinimalPokemon {
  id: number;
  name: string;
}

interface QuizClientProps {
  pokemonList: MinimalPokemon[];
}

export default function QuizClient({ pokemonList }: QuizClientProps) {
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [currentPokemon, setCurrentPokemon] = useState<MinimalPokemon | null>(null);
  const [choices, setChoices] = useState<MinimalPokemon[]>([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const generateQuestion = useCallback(() => {
    if (pokemonList.length < 4) return;
    
    // Pick 4 random unique pokemon
    const shuffled = [...pokemonList].sort(() => 0.5 - Math.random());
    const selectedChoices = shuffled.slice(0, 4);
    
    // Pick one of them as the correct answer
    const correct = selectedChoices[Math.floor(Math.random() * selectedChoices.length)];
    
    setCurrentPokemon(correct);
    setChoices(selectedChoices);
    setHasGuessed(false);
    setSelectedChoiceId(null);
  }, [pokemonList]);

  // Initial load
  useEffect(() => {
    generateQuestion();
    
    // Load stats
    const savedStats = localStorage.getItem('pokemon_quiz_stats');
    if (savedStats) {
      try {
        const { bestScore: savedScore, bestStreak: savedStreak } = JSON.parse(savedStats);
        setBestScore(savedScore || 0);
        setBestStreak(savedStreak || 0);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, [generateQuestion]);

  // Save stats
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pokemon_quiz_stats', JSON.stringify({ bestScore, bestStreak }));
    }
  }, [bestScore, bestStreak, isLoaded]);

  const handleGuess = (id: number) => {
    if (hasGuessed || !currentPokemon) return;
    
    setHasGuessed(true);
    setSelectedChoiceId(id);
    
    if (id === currentPokemon.id) {
      // Correct guess: shoot confetti and play sound
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4caf50', '#81c784', '#c8e6c9']
      });

      const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentPokemon.id}.ogg`);
      audio.volume = 0.5;
      audio.play().catch(() => {}); // Ignore if autoplay is blocked

      setScore(prev => {
        const newCorrect = prev.correct + 1;
        if (newCorrect > bestScore) setBestScore(newCorrect);
        return { ...prev, correct: newCorrect };
      });
      setCurrentStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setCurrentStreak(0);
    }
  };

  const handleRestart = () => {
    if (confirm('Are you sure you want to restart the quiz? Your current score and streak will be reset.')) {
      setScore({ correct: 0, incorrect: 0 });
      setCurrentStreak(0);
      generateQuestion();
    }
  };

  const getButtonClass = (id: number) => {
    if (!hasGuessed || !currentPokemon) return styles.choiceBtn;
    
    if (id === currentPokemon.id) {
      return `${styles.choiceBtn} ${styles.correct}`;
    }
    if (id === selectedChoiceId && id !== currentPokemon.id) {
      return `${styles.choiceBtn} ${styles.incorrect}`;
    }
    return `${styles.choiceBtn} ${styles.disabled}`;
  };

  if (!currentPokemon) {
    return <div className={styles.loading}>Loading Quiz...</div>;
  }

  // Use official artwork
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentPokemon.id}.png`;

  return (
    <div className={styles.quizWrapper}>
      <div className={styles.statsContainer}>
        <div className={styles.scoreBoard}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Correct:</span>
            <span className={styles.scoreValueCorrect}>{score.correct}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Incorrect:</span>
            <span className={styles.scoreValueIncorrect}>{score.incorrect}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Streak:</span>
            <span className={styles.scoreValueStreak}>{currentStreak}🔥</span>
          </div>
        </div>
        
        {isLoaded && (
          <div className={styles.bestStatsBoard}>
            <div className={styles.bestStatItem}>Best: <strong>{bestScore}</strong></div>
            <div className={styles.bestStatItem}>Highest Streak: <strong>{bestStreak}</strong></div>
            <button className={styles.restartBtn} onClick={handleRestart}>Restart</button>
          </div>
        )}
      </div>

      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt="Who's that Pokemon?"
          width={300}
          height={300}
          className={`${styles.pokemonImage} ${!hasGuessed ? styles.silhouette : ''}`}
          priority
          unoptimized
        />
      </div>

      <div className={styles.choicesContainer}>
        {choices.map(choice => (
          <button
            key={choice.id}
            className={getButtonClass(choice.id)}
            onClick={() => handleGuess(choice.id)}
            disabled={hasGuessed}
          >
            {choice.name.charAt(0).toUpperCase() + choice.name.slice(1).replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {hasGuessed && (
        <div className={styles.nextSection}>
          <button className={styles.nextBtn} onClick={generateQuestion}>
            Next Pokémon ➔
          </button>
        </div>
      )}
    </div>
  );
}
