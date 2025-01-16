import React, { useEffect, useState } from "react";
import "./Landing.css";
import Log from "../assets/rocket.mp4";
import Intro from "../assets/sharkbg.jpg";
import Tilt from "../assets/tilt.gif";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import config from "../config";
import Coin from '../assets/coin.png'


const Landing = () => {
  const [position, setPosition] = useState(0);
  const [coins, setCoins] = useState([]);
  const [score, setScore] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false); // New state
  const navigate = useNavigate();

  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("tokens"),
    },
  };

  const handleIntroEnd = () => {
    setIsIntroDone(true);
    setShowInstructions(true); // Show instructions after intro ends
  };

  const startGame = () => {
    setShowInstructions(false); // Hide instructions
    setGameStarted(true); // Start the game
  };

useEffect(() => {
    if (isIntroDone && gameStarted) {
      const handleOrientation = (event) => {
        const { gamma } = event; // Device tilt angle
        if (gamma) {
          const screenWidth = window.innerWidth; // Mobile screen width
          const rocketElement = document.querySelector(".rocket");
          const rocketWidth = rocketElement?.offsetWidth || 100; // Default to 100px if not found
          const maxLeft = screenWidth - rocketWidth; // Maximum allowed left position
          const newLeft = position + gamma * 2; // Adjust position based on tilt

          // Keep the rocket within screen bounds
          setPosition(Math.max(0, Math.min(newLeft, maxLeft)));
        }
      };

      window.addEventListener("deviceorientation", handleOrientation);

      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, [position, isIntroDone, gameStarted]);

 useEffect(() => {
  if (gameStarted) {
    const interval = setInterval(() => {
      if (!gameOver && timeLeft > 3) {
        const randomCoin = {
          id: Date.now(),
          left: Math.random() * 100,
          top: 0,
          value: Math.floor(Math.random() * 100) + 10,
          size: "small",
          collected: false,
        };

        // Get screen width
        const screenWidth = window.innerWidth;

        // Coin width (for small and large coins)
        const coinWidth = randomCoin.size === "large" ? 80 : 40;

        // Ensure coin does not go beyond the right side of the screen
        randomCoin.left = Math.max(
          Math.min((randomCoin.left * screenWidth) / 100, screenWidth - coinWidth),
          0
        );

        setCoins((prevCoins) => [...prevCoins, randomCoin]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}, [gameOver, gameStarted, timeLeft]);

useEffect(() => {
  if (gameStarted) {
    const interval = setInterval(() => {
      if (!gameOver) {
        setCoins((prevCoins) =>
          prevCoins
            .map((coin) => ({ ...coin, top: coin.top + 5 }))
            .filter((coin) => coin.top <= 100)
        );
      }
    }, 200);

    return () => clearInterval(interval);
  }
}, [gameOver, gameStarted]);

useEffect(() => {
  if (gameStarted && (timeLeft === 18 || timeLeft === 5)) {
    const bigCoin = {
      id: `big-${Date.now()}`,
      left: Math.random() * 100,
      top: 0,
      value: timeLeft === 18 ? 1000 : 2500,
      size: "large",
      collected: false,
    };

    const screenWidth = window.innerWidth; // Full screen width
    const coinWidth = bigCoin.size === "large" ? 80 : 40; // Coin width

    // Ensure the big coin is within the screen width
    bigCoin.left = Math.max(
      Math.min((bigCoin.left * screenWidth) / 100, screenWidth - coinWidth),
      0
    );

    setCoins((prevCoins) => [...prevCoins, bigCoin]);
  }
}, [timeLeft, gameStarted]);


  const checkCollision = () => {
    const rocketWidth = 100;

    setCoins((prevCoins) =>
      prevCoins.filter((coin) => {
        const isCollision =
          !coin.collected &&
          coin.top > 77 &&
          coin.left + (coin.size === "large" ? 80 : 40) >=
            position - rocketWidth*0.4 &&
          coin.left <= position + rocketWidth*0.8;

        if (isCollision) {
          // Increment score
          setScore((prevScore) => prevScore + coin.value);

          // Trigger explosion
          triggerExplosion(coin.left, coin.top, coin.size);

          // Remove the coin
          return false;
        }
        return true;
      })
    );
  };

  const triggerExplosion = (left, top, size) => {
    const fragmentContainer = document.createElement("div");
    fragmentContainer.style.position = "absolute";
    fragmentContainer.style.left = `${left}px`;
    fragmentContainer.style.top = `${top}vh`; // Use vh since `coin.top` is in %
    fragmentContainer.style.pointerEvents = "none"; // Ignore pointer events
  
    // Create fragments
    for (let i = 0; i < 8; i++) {
      const fragment = document.createElement("div");
      fragment.className = "coin-fragment";
      fragment.style.setProperty("--dx", Math.cos((i * Math.PI) / 4)); // X direction
      fragment.style.setProperty("--dy", Math.sin((i * Math.PI) / 4)); // Y direction
      fragmentContainer.appendChild(fragment);
    }
  
    document.body.appendChild(fragmentContainer);
  
    // Remove fragments after animation
    setTimeout(() => {
      document.body.removeChild(fragmentContainer);
    }, 500); // Match animation duration
  };
  

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        if (!gameOver) checkCollision();
      }, 0.0001); // Faster interval for immediate response
      return () => clearInterval(interval);
    }
  }, [coins, position, gameOver, gameStarted]);

  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft((prevTime) => prevTime - 1);
        } else {
          setGameOver(true);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, gameStarted]);

  // Remove collected coins after animation
  useEffect(() => {
    const timeoutIds = [];

    coins.forEach((coin) => {
      if (coin.collected) {
        const timeoutId = setTimeout(() => {
          setCoins((prevCoins) => prevCoins.filter((c) => c.id !== coin.id));
        }, 0.0001);
        timeoutIds.push(timeoutId);
      }
    });

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [coins]);

  const claimCoins = async () => {
    if (claiming) return;
    try {
      setClaiming(true);
      const response = await axios.put(
        `${baseURL}/addAmount`,
        { amount: score },
        CONFIG_OBJ
      );
      const { message } = response.data;
      toast.success(message);
      navigate("/home");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to verify user details. Please try again.";
      toast.error(errorMessage);
      navigate("/error");
    }
  };

  return (
    <div className={`game-container ${showInstructions ? "blurred" : ""}`}>
      {!isIntroDone ? (
        <div className="intro-video-container">
          <img
            src={Intro}
            alt="shark"
            style={{ height: "100%", width: "100%" }}
          />
          <button
            onClick={handleIntroEnd}
            style={{
              backgroundColor: "skyblue",
              width: "30%",
              borderRadius: "15px",
              height: "40px",
              position: "absolute",
              bottom: "5%",
            }}
          >
            Next
          </button>
        </div>
      ) : showInstructions ? (
        <div className="instructions-overlay">
          <h1 style={{ color: "white", fontWeight: "bolder" }}>
            Welcome to the Space Rocket Game
          </h1>
          <p style={{ color: "skyblue" }}>
            Rotate your device left and right to collect SHARKS!
          </p>
          <div>
            <img
              src={Tilt}
              alt="tilt"
              style={{ height: "200px", background: "none" }}
            />
          </div>
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="game-over-screen">
          <h1 style={{ color: "white" }}>Game Over!</h1>
          <p style={{ color: "white" }}>Your Final Score: {score}</p>
          <button onClick={claimCoins} className="claim-coins-button">
            Claim Sharks
          </button>
        </div>
      ) : (
        <div className="game-box">
          <div className="text-center">
            <h1 style={{ color: "white" }}>Space Rocket Game</h1>
            <p style={{ color: "white" }}>Score: {score}</p>
            <p style={{ color: "white" }}>Time Left: {timeLeft}s</p>
            <video
              className="rocket"
              style={{ left: `${position}px` }}
              src={Log}
              autoPlay
              loop
              muted
            ></video>
          </div>

          {coins.map((coin) => (
            <div
              id={coin.id}
              key={coin.id}
              className={`coin ${coin.size} `}
              style={{
                left: `${coin.left}px`,
                top: `${coin.top}%`,
                backgroundImage:
                  `url(${Coin})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                width: coin.size === "large" ? "80px" : "40px",
                height: coin.size === "large" ? "80px" : "40px",
              }}
            >
              {/* {coin.value} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Landing;