import React, { useEffect, useState } from "react";
import "./Landing.css";

const Landing = () => {
  const [position, setPosition] = useState(50); // Initial position (in percentage)
  const [coins, setCoins] = useState([]); // Array of coins (asteroids)
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Function to handle device orientation
    const handleOrientation = (event) => {
      const { gamma } = event; // Gamma represents left-right tilt
      if (gamma) {
        const newPosition = Math.min(Math.max(position + gamma / 5, 0), 100); // Limit position between 0 and 100
        setPosition(newPosition);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [position]);

  useEffect(() => {
    // Generate coins (asteroids) at random positions
    const interval = setInterval(() => {
      const randomCoin = {
        id: Date.now(),
        left: Math.random() * 100, // Random horizontal position
        top: 0, // Start from the top
      };
      setCoins((prevCoins) => [...prevCoins, randomCoin]);
    }, 1000); // Generate a coin every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Move coins (asteroids) downward
    const interval = setInterval(() => {
      setCoins((prevCoins) =>
        prevCoins
          .map((coin) => ({ ...coin, top: coin.top + 5 })) // Move coin downward
          .filter((coin) => coin.top <= 100) // Remove coins that go off-screen
      );
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const checkCollision = () => {
    // Check if rocket collides with any coin
    coins.forEach((coin) => {
      if (
        coin.top > 90 && // Near the bottom of the screen
        Math.abs(coin.left - position) < 10 // Close to the rocket's position
      ) {
        setScore((prevScore) => prevScore + Math.floor(Math.random() * 100)); // Add random score
        setCoins((prevCoins) => prevCoins.filter((c) => c.id !== coin.id)); // Remove collected coin
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(checkCollision, 100);
    return () => clearInterval(interval);
  }, [coins, position]);

  return (
    <div className="game-container">
      <h1>Space Rocket Game</h1>
      <p>Score: {score}</p>
      <div
        className="rocket"
        style={{ left: `${position}%` }}
      ></div>
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="coin"
          style={{
            left: `${coin.left}%`,
            top: `${coin.top}%`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default Landing;
