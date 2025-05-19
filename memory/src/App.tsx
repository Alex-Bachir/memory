import React, { useState, useEffect } from 'react';
import './App.css';

type CardType = {
  id: number;
  emoji: string;
};

function App() {
  const emojiList = ['🐶', '🐱', '🦊', '🐼', '🐸', '🐵', '🐷', '🐰'];

  const generateShuffledCards = (): CardType[] => {
    const duplicated = [...emojiList, ...emojiList];
    const shuffled = duplicated
      .map((emoji) => ({ emoji, id: Math.random() }))
      .sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedIndexes, setMatchedIndexes] = useState<number[]>([]);

  useEffect(() => {
    setCards(generateShuffledCards());
  }, []);

  useEffect(() => {
    if (flippedIndexes.length === 2) {
      const [firstIndex, secondIndex] = flippedIndexes;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.emoji === secondCard.emoji) {
        // ✅ Paire trouvée
        setMatchedIndexes((prev) => [...prev, firstIndex, secondIndex]);
        setFlippedIndexes([]);
      } else {
        // ❌ Pas une paire ➜ cacher après 1 sec
        setTimeout(() => {
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  }, [flippedIndexes, cards]);

  const handleCardClick = (index: number) => {
    // Bloquer si déjà retournée ou si 2 cartes sont déjà retournées
    if (flippedIndexes.includes(index) || matchedIndexes.includes(index) || flippedIndexes.length === 2) {
      return;
    }
    setFlippedIndexes((prev) => [...prev, index]);
  };

  return (
    <div className="app">
      <h1>Jeu Memory 🧠</h1>
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


