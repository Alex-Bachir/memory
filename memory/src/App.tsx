import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

type CardType = {
  id: number;
  emoji: string;
};

const emojiList = ['🐶', '🐱', '🦊', '🐼', '🐸', '🐵', '🐷', '🐰', '🦁', '🐯', '🐨', '🦄'];

function App() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedIndexes, setMatchedIndexes] = useState<number[]>([]);
  const [cardCount, setCardCount] = useState<number>(12);

  const [timer, setTimer] = useState<number>(0);
  const [isTiming, setIsTiming] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateShuffledCards = (count: number): CardType[] => {
    const pairsNeeded = count / 2;
    const selectedEmojis = emojiList.slice(0, pairsNeeded);
    const duplicated = [...selectedEmojis, ...selectedEmojis];
    const shuffled = duplicated
      .map((emoji) => ({ emoji, id: Math.random() }))
      .sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const resetGame = useCallback(() => {
    setCards(generateShuffledCards(cardCount));
    setFlippedIndexes([]);
    setMatchedIndexes([]);
    setTimer(0);
    setIsTiming(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [cardCount]);

  // FIX: Retirez resetGame des dépendances
  useEffect(() => {
    resetGame();
  }, [cardCount]); // Seulement cardCount

  useEffect(() => {
    if (isTiming && matchedIndexes.length === cards.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTiming(false);
    }
  }, [matchedIndexes, cards.length, isTiming]);

  useEffect(() => {
    if (flippedIndexes.length === 2) {
      const [firstIndex, secondIndex] = flippedIndexes;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.emoji === secondCard.emoji) {
        setMatchedIndexes((prev) => [...prev, firstIndex, secondIndex]);
        setFlippedIndexes([]);
      } else {
        setTimeout(() => {
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  }, [flippedIndexes, cards]);

  const handleCardClick = (index: number) => {
    if (
      flippedIndexes.includes(index) ||
      matchedIndexes.includes(index) ||
      flippedIndexes.length === 2
    ) {
      return;
    }

    if (!isTiming) {
      setIsTiming(true);
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    setFlippedIndexes((prev) => [...prev, index]);
  };

  return (
    <div className="app">
      <h1>Jeu Memory 🧠</h1>

      <div className="info-bar">
        <label>⏱️ Temps : {timer} sec</label>
        <div className="difficulty-selector">
          <label>Difficulté : </label>
          <select value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))}>
            <option value={12}>Normal (12 cartes)</option>
            <option value={24}>Difficile (24 cartes)</option>
          </select>
          <button onClick={resetGame} className="replay-button">🔄 Rejouer</button>
        </div>
      </div>

      <div className="grid">
        {cards.map((card, index) => {
          const isFlipped = flippedIndexes.includes(index) || matchedIndexes.includes(index);
          return (
            <div
              key={index}
              className={`card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              {isFlipped ? card.emoji : '❓'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;