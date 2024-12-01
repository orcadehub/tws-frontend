import React, { useEffect, useState } from "react";
import "./Landing.css";
import Log from "../assets/rocket.mp4"; // Video file for the rocket
import Intro from '../assets/intro.mp4'; // Intro video

const Landing = () => {
  const [position, setPosition] = useState(50); // Initial position (in percentage)
  const [coins, setCoins] = useState([]); // Array of coins (asteroids)
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // Timer for 30 seconds
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [isIntroDone, setIsIntroDone] = useState(false); // State to control intro video
  const [gameStarted, setGameStarted] = useState(false); // State to control when the game actually starts

  // Handle device orientation for horizontal movement
  useEffect(() => {
    if (isIntroDone && gameStarted) {
      const handleOrientation = (event) => {
        const { gamma } = event; // Gamma represents left-right tilt
        if (gamma) {
          const newPosition = Math.min(Math.max(position + gamma / 2, 0), 100); // Limit position between 0 and 100
          setPosition(newPosition);
        }
      };

      window.addEventListener("deviceorientation", handleOrientation);

      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, [position, isIntroDone, gameStarted]);

  // Generate coins (asteroids)
  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        if (!gameOver && timeLeft > 3) {
          const randomCoin = {
            id: Date.now(),
            left: Math.random() * 100,
            top: 0,
            value: Math.floor(Math.random() * 50) + 10, // Random value between 10 and 50
            size: "small", // Default to small
          };
          setCoins((prevCoins) => [...prevCoins, randomCoin]);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameOver, gameStarted, timeLeft]);

  // Move coins downward
  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        if (!gameOver) {
          setCoins((prevCoins) =>
            prevCoins
              .map((coin) => ({ ...coin, top: coin.top + 5 })) // Move down
              .filter((coin) => coin.top <= 100) // Remove off-screen coins
          );
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [gameOver, gameStarted]);

  // Check for collisions between the rocket and coins
  const checkCollision = () => {
    coins.forEach((coin) => {
      if (
        coin.top > 90 && // Near the bottom
        Math.abs(coin.left - position) < 10 // Close to rocket horizontally
      ) {
        setScore((prevScore) => prevScore + coin.value); // Add coin value to score
        setCoins((prevCoins) => prevCoins.filter((c) => c.id !== coin.id)); // Remove coin
      }
    });
  };

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        if (!gameOver) checkCollision();
      }, 100);
      return () => clearInterval(interval);
    }
  }, [coins, position, gameOver, gameStarted]);

  // Timer countdown
  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft((prevTime) => prevTime - 1);
        } else {
          setGameOver(true); // End game when time is up
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, gameStarted]);

  // Add big coins at specific seconds
  useEffect(() => {
    if (gameStarted && (timeLeft === 18 || timeLeft === 4)) {
      const bigCoin = {
        id: `big-${Date.now()}`,
        left: Math.random() * 100,
        top: 0,
        value: timeLeft === 18 ? 1000 : 2500, // Value for big coins
        size: "big", // Set size to big
      };
      setCoins((prevCoins) => [...prevCoins, bigCoin]);
    }
  }, [timeLeft, gameStarted]);

  // Handle intro video completion
  const handleIntroEnd = () => {
    setIsIntroDone(true); // Set intro as done
    setGameStarted(true); // Start the game after intro finishes
  };

  return (
    <div className="game-container">
      {!isIntroDone ? (
        <div className="intro-video-container">
          {/* Intro video */}
          <video
            className="intro-video"
            src={Intro}
            autoPlay
            onEnded={handleIntroEnd} // Trigger game start when video ends
            muted
          />
        </div>
      ) : (
        <>
          <h1>Space Rocket Game</h1>
          <p>Score: {score}</p>
          <p>Time Left: {timeLeft}s</p>
          {/* Rocket as Video */}
          <video
            className="rocket"
            style={{ left: `${position}%` }}
            src={Log}
            autoPlay
            loop
            muted
          ></video>
          {/* Coins */}
          {coins.map((coin) => (
            <div
              key={coin.id}
              className={`coin ${coin.size}`}
              style={{
                left: `${coin.left}%`,
                top: `${coin.top}%`,
              }}
            >
              {coin.value}
            </div>
          ))}
        </>
      )}

      {gameOver && (
        <div className="game-over">
          <h1>Game Over!</h1>
          <p>Your Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default Landing;
