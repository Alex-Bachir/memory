import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

type CardType = {
  id: number;
  image: string;
  name: string; 
};


const imageList = [
  { src: "Canyon sauvage.jpg", name: "Canyon" },
  { src: "cyberpunk crepuscule .jpg", name: "Cyber" },
  { src: "dark paysage.jpg", name: "dark" },
  { src: "Désert mystique.jpg", name: "desert" },
  { src: "Forêt enchantée.jpg", name: "foret" },
  { src: "Océan profond.jpg", name: "ocean" },
  { src: "paysage pixel.jpg", name: "pixel" },
  { src: "Plage paradisiaque.jpg", name: "plage" },
  { src: "Toundra gelée.jpg", name: "toundra" },
  { src: "Village japonais au printemps.jpg", name: "japon" },
  { src: "Ville futuriste flottante.jpg", name: "ville" },
  { src: "Volcan en activité.jpg", name: "Volcan" },
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

  const [leaderboard, setLeaderboard] = useState< { name: string; time: number; difficulty: number }[]>(() => {
    const saved = localStorage.getItem ('memory-leaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  const generateShuffledCards = (count: number): CardType[] => {
    const pairsNeeded = count / 2;
    const selectedImages = imageList.slice(0, pairsNeeded);
    const duplicated = [...selectedImages, ...selectedImages];
    const shuffled = duplicated
      .map((imageData) => ({
        image: imageData.src,
        name: imageData.name,
        id: Math.random(),
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
  }, [cardCount, resetGame]);

  useEffect(() => {
    if (
      isTiming &&
      matchedIndexes.length === cards.length &&
      cards.length > 0
    ) {
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

  useEffect(() => {
  localStorage.setItem('memory-leaderboard', JSON.stringify(leaderboard));
}, [leaderboard]);


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
            🎉 Bravo ! Vous avez gagné en {finalTime} seconde
            {finalTime > 1 ? "s" : ""} ! 🎉
            <div>
              <label>Souhaitez-vous enregistrer votre score ?</label>
              <input
                type="text"
                placeholder="Entrez votre nom"
                id="player-name"
                className="player-input"
              />
              <div>
                <button
                  onClick={() => {
                    const input = document.getElementById(
                      "player-name"
                    ) as HTMLInputElement;
                    if (input.value.trim()) {
                      setLeaderboard((prev) => [
                        ...prev,
                        {
                          name: input.value.trim(),
                          time: finalTime,
                          difficulty: cardCount,
                        },
                      ]);
                      resetGame();
                    }
                  }}
                  className="save-score-button"
                >
                  ✅ Enregistrer
                </button>
                <button onClick={resetGame} className="new-game-button">
                  ❌ Ignorer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      

      <div className="leaderboard">
  <h2>🏆 Classement</h2>

  <h3>🎯 Mode Normal (12 cartes)</h3>
{leaderboard.filter(entry => entry.difficulty === 12).length === 0 ? (
  <p>Aucun score enregistré.</p>
) : (
  <table>
    <thead>
      <tr>
        <th>Nom</th>
        <th>Temps (s)</th>
      </tr>
    </thead>
    <tbody>
      {leaderboard
        .filter(entry => entry.difficulty === 12)
        .sort((a, b) => a.time - b.time)
        .slice(0, 5)  // 👈 Limite à 5
        .map((entry, idx) => (
          <tr key={`normal-${idx}`}>
            <td>{entry.name}</td>
            <td>{entry.time}</td>
          </tr>
        ))}
    </tbody>
  </table>
)}

<h3>💀 Mode Difficile (24 cartes)</h3>
{leaderboard.filter(entry => entry.difficulty === 24).length === 0 ? (
  <p>Aucun score enregistré.</p>
) : (
  <table>
    <thead>
      <tr>
        <th>Nom</th>
        <th>Temps (s)</th>
      </tr>
    </thead>
    <tbody>
      {leaderboard
        .filter(entry => entry.difficulty === 24)
        .sort((a, b) => a.time - b.time)
        .slice(0, 5)  // 👈 Limite à 5
        .map((entry, idx) => (
          <tr key={`difficile-${idx}`}>
            <td>{entry.name}</td>
            <td>{entry.time}</td>
          </tr>
        ))}
    </tbody>
  </table>
)}
</div>

<div className="info-bar">
        <label>⏱️ Temps : {timer} sec</label>
        <div className="difficulty-selector">
          <label>Difficulté : </label>
          <select
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
          >
            <option value={12}>Normal (12 cartes)</option>
            <option value={24}>Difficile (24 cartes)</option>
          </select>
          <button onClick={resetGame} className="replay-button">
            🔄 Rejouer
          </button>
        </div>
      </div>


      <div className="grid">
        {cards.map((card, index) => {
          const isFlipped =
            flippedIndexes.includes(index) || matchedIndexes.includes(index);
          return (
            <div
              key={index}
              className={`card ${isFlipped ? "flipped" : ""} ${
                matchedIndexes.includes(index) ? "matched" : ""
              }`}
              onClick={() => handleCardClick(index)}
            >
              {isFlipped ? (
                <img src={card.image} alt={card.name} className="card-image" />
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
