'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './HoopaMascot.module.css';

const QUOTES = [
  "Alihoopa!",
  "Were you surprised?",
  "Hoopa ring!",
  "I can summon anything!",
  "Let's play!",
  "Do you like my rings?",
  "Peek-a-boo!"
];

export default function HoopaMascot() {
  const [quote, setQuote] = useState('');
  const [actionClass, setActionClass] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const actionTimeout = useRef<NodeJS.Timeout | null>(null);
  const quoteTimeout = useRef<NodeJS.Timeout | null>(null);

  // Delay appearance so it doesn't instantly pop in on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (actionClass !== '') return; // currently animating
    
    // Clear previous timeouts if any
    if (actionTimeout.current) clearTimeout(actionTimeout.current);
    if (quoteTimeout.current) clearTimeout(quoteTimeout.current);

    // Pick random interaction
    const actions = [styles.spin, styles.bounce, styles.wobble, styles.teleport];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    setActionClass(randomAction);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    
    // Reset animation class after it finishes (durations vary, but 1.5s is safe for all)
    actionTimeout.current = setTimeout(() => {
      setActionClass('');
    }, 1500);
    
    quoteTimeout.current = setTimeout(() => {
      setQuote('');
    }, 4000);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.mascotContainer}>
      {quote && (
        <div className={styles.speechBubble}>
          {quote}
        </div>
      )}
      <div 
        className={`${styles.hoopaWrapper} ${actionClass || styles.float}`}
        onClick={handleClick}
        title="Click me!"
      >
        <Image
          src="https://play.pokemonshowdown.com/sprites/gen5ani/hoopa.gif"
          alt="Hoopa Mascot"
          width={80}
          height={80}
          unoptimized
          className={styles.hoopaImage}
        />
        <div className={styles.shadow}></div>
      </div>
    </div>
  );
}
