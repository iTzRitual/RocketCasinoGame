import { useState, useEffect, useCallback } from "react";

function App() {
  const [rocketValue, setRocketValue] = useState(1000);
  const [position, setPosition] = useState({ x: 0, y: 200 });
  const [velocity, setVelocity] = useState({ x: 3, y: -3 });
  const [angle, setAngle] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stars, setStars] = useState([]);
  const [bombs, setBombs] = useState([]);
  const [cameraOffset, setCameraOffset] = useState(0);
  const [scoreList, setScoreList] = useState([]);

  const generateNewStars = useCallback(() => {
    if (Math.random() < 0.1) {
      let multiplier;

      if (Math.random() < 0.9) {
        multiplier = Math.random() < 0.5 ? 2 : 3;
      } else {
        multiplier = Math.floor(Math.random() * 11) + 5;
      }
      const newStar = {
        x: window.innerWidth + cameraOffset + Math.random() * 100,
        y: Math.random() * window.innerHeight,
        multiplier,
      };
      setStars((prevStars) => [...prevStars, newStar]);
    }
  }, [cameraOffset]);

  const generateNewBombs = useCallback(() => {
    if (Math.random() < 0.03) {
      const newBomb = {
        x: window.innerWidth + cameraOffset + Math.random() * 100,
        y: Math.random() * window.innerHeight,
      };
      setBombs((prevBombs) => [...prevBombs, newBomb]);
    }
  }, [cameraOffset]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const newY = prev.y + velocity.y;
        if (newY >= window.innerHeight - 20) {
          setIsPlaying(false);
          return { x: prev.x, y: window.innerHeight - 20 };
        }
        return {
          x: prev.x,
          y: newY,
        };
      });

      setVelocity((prev) => ({
        x: prev.x,
        y: prev.y + 0.1,
      }));

      setAngle((prev) => prev + 0.5);

      setCameraOffset((prev) => prev + velocity.x);

      stars.forEach((star, index) => {
        if (
          position.x + cameraOffset + 200 < star.x + 30 &&
          position.x + 50 + cameraOffset + 200 > star.x &&
          position.y < star.y + 30 &&
          position.y + 50 > star.y
        ) {
          setStars((prev) => prev.filter((_, i) => i !== index));
          setRocketValue((prevValue) => prevValue * star.multiplier);
          resetAttributes();
        }
      });

      bombs.forEach((bomb, index) => {
        if (
          position.x + cameraOffset + 200 < bomb.x + 30 &&
          position.x + 50 + cameraOffset + 200 > bomb.x &&
          position.y < bomb.y + 30 &&
          position.y + 50 > bomb.y
        ) {
          setBombs((prev) => prev.filter((_, i) => i !== index));
          setRocketValue((prevValue) => prevValue * 0.1);
          setVelocity((prev) => ({ x: prev.x * 0.5, y: prev.y * 0.5 }));
        }
      });

      setStars((prevStars) =>
        prevStars.filter((star) => star.x - cameraOffset > -20)
      );

      setBombs((prevBombs) =>
        prevBombs.filter((bomb) => bomb.x - cameraOffset > -20)
      );
    }, 5);

    const starInterval = setInterval(generateNewStars, 5);
    const bombInterval = setInterval(generateNewBombs, 5);

    return () => {
      clearInterval(interval);
      clearInterval(starInterval);
      clearInterval(bombInterval);
    };
  }, [
    isPlaying,
    velocity,
    position,
    stars,
    bombs,
    cameraOffset,
    generateNewStars,
    generateNewBombs,
  ]);

  const startGame = () => {
    setPosition({ x: 0, y: 200 });
    setVelocity({ x: 6, y: -4 });
    setAngle(45);
    setIsPlaying(true);
    generateStars();
    setCameraOffset(0);
  };

  const resetAttributes = () => {
    setVelocity({ x: 6, y: -4 });
    setAngle(45);
  };

  const generateStars = () => {
    let multiplier;
    if (Math.random() < 0.9) {
      multiplier = Math.random() < 0.5 ? 2 : 3;
    } else {
      multiplier = Math.floor(Math.random() * 11) + 5;
    }
    const newStars = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      multiplier: multiplier,
    }));
    setStars(newStars);
  };

  return (
    <>
      {/* Bg */}
      <div className="w-screen h-screen bg-slate-700 relative overflow-hidden">
        {!isPlaying && (
          <div className="w-full h-full bg-slate-500 flex items-center justify-center flex-col gap-3">
            <h1 className="text-white text-4xl font-bold">Rocket Game</h1>
            <h2>Your money: {rocketValue.toFixed(2)}$</h2>
            <button
              onClick={startGame}
              className="bg-blue-500 text-white p-2 rounded"
            >
              I&apos;m goin all in!
            </button>
            <button
              onClick={() => {
                setRocketValue(1000);
                setScoreList([...scoreList, rocketValue]);
              }}
              className="border p-2 rounded"
            >
              Save score & reset Game
            </button>
          </div>
        )}

        {/* Rocket */}
        <div
          className="block w-5 h-5 text-4xl absolute"
          style={{
            transform: `translate(200px, ${position.y}px) rotate(${angle}deg)`,
          }}
        >
          <div className="-rotate-45">🚀</div>
        </div>

        {/* Stars */}
        {stars.map((star, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center w-2.5 h-2.5 absolute"
            style={{
              transform: `translate(${star.x - cameraOffset}px, ${star.y}px)`,
            }}
          >
            <div className="text-2xl">⭐</div>
            <div className="text-white text-2xl font-bold leading-none">{`x${star.multiplier}`}</div>{" "}
          </div>
        ))}

        {/* Bombs */}
        {bombs.map((bomb, index) => (
          <div
            key={index}
            className="flex items-center justify-center w-3 h-3 absolute text-2xl"
            style={{
              transform: `translate(${bomb.x - cameraOffset}px, ${bomb.y}px)`,
            }}
          >
            💣
          </div>
        ))}

        {/* Value */}
        <div className="absolute top-2 right-2 text-white text-2xl">
          <div>Cash: {rocketValue.toFixed(2)}$</div>
          <div className="flex flex-col items-end">
            Score:
            {scoreList.length > 0
              ? scoreList
                  .slice()
                  .sort((a, b) => b - a)
                  .map((score, index) => (
                    <span key={index} className="ml-2">
                      {score.toFixed(2)}$
                    </span>
                  ))
              : "No scores yet"}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
