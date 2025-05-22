import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

type CardType = {
  id: number;
  image: string;
  name: string; // Pour l'attribut alt
};

// Remplacez par vos propres images
const imageList = [
  { src: 'Canyon sauvage.jpg', name: 'Canyon' },
  { src: 'cyberpunk crepuscule .jpg', name: 'Cyber' },
  { src: 'dark paysage.jpg', name: 'dark' },
  { src: 'Désert mystique.jpg', name: 'desert' },
  { src: 'Forêt enchantée.jpg', name: 'foret' },
  { src: 'Océan profond.jpg', name: 'ocean' },
  { src: 'paysage pixel.jpg', name: 'pixel' },
  { src: 'Plage paradisiaque.jpg', name: 'plage' },
  { src: 'Toundra gelée.jpg', name: 'toundra' },
  { src: 'Village japonais au printemps.jpg', name: 'japon' },
  { src: 'Ville futuriste flottante.jpg', name: 'ville' },
  { src: 'Volcan en activité.jpg', name: 'Volcan' }
];

function App() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedIndexes, setMatchedIndexes] = useState<number[]>([]);
  const [cardCount, setCardCount] = useState<number>(12);

  const [timer, setTimer] = useState<number>(0);
  const [isTiming, setIsTiming] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [finalTime, setFinalTime] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateShuffledCards = (count: number): CardType[] => {
    const pairsNeeded = count / 2;
    const selectedImages = imageList.slice(0, pairsNeeded);
    const duplicated = [...selectedImages, ...selectedImages];
    const shuffled = duplicated
      .map((imageData) => ({ 
        image: imageData.src, 
        name: imageData.name,
        id: Math.random() 
      }))
      .sort(() => Math.random() - 0.5);
    return shuffled;
  };

  const resetGame = useCallback(() => {
    setCards(generateShuffledCards(cardCount));
    setFlippedIndexes([]);
    setMatchedIndexes([]);
    setTimer(0);
    setIsTiming(false);
    setGameWon(false);
    setFinalTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [cardCount]);

  useEffect(() => {
    resetGame();
  }, [cardCount]);

  useEffect(() => {
    if (isTiming && matchedIndexes.length === cards.length && cards.length > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTiming(false);
      setGameWon(true);
      setFinalTime(timer);
    }
  }, [matchedIndexes, cards.length, isTiming, timer]);

  useEffect(() => {
    if (flippedIndexes.length === 2) {
      const [firstIndex, secondIndex] = flippedIndexes;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.image === secondCard.image) {
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

      {/* Message de victoire */}
      {gameWon && (
        <div className="victory-overlay">
          <div className="victory-message">
            🎉 Bravo ! Vous avez gagné en {finalTime} seconde{finalTime > 1 ? 's' : ''} ! 🎉
            <button onClick={resetGame} className="new-game-button">
              Nouvelle partie
            </button>
          </div>
        </div>
      )}

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
              {isFlipped ? (
                <img 
                  src={card.image} 
                  alt={card.name}
                  className="card-image"
                />
              ) : (
                <div className="card-back">❓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;