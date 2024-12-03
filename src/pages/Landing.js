import React, { useEffect, useState } from "react";
import "./Landing.css";
import Log from "../assets/rocket.mp4";
import Intro from "../assets/intro.mp4";
import Tilt from '../assets/tilt.gif'
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import config from "../config";

const Landing = () => {
  const [position, setPosition] = useState(30);
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
      Authorization: "Bearer " + localStorage.getItem("token"),
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
    const screenWidth = Math.min(window.innerWidth, 400);
    const rocketWidth = 100; // Assuming rocket width is 100px
    setPosition((screenWidth - rocketWidth) / 2); // Center the rocket
  }, []); 


  useEffect(() => {
    if (isIntroDone && gameStarted) {
      const handleOrientation = (event) => {
        const { gamma } = event;
        if (gamma) {
          const screenWidth = Math.min(window.innerWidth, 400);
          const newLeft = Math.max(
            Math.min(position + gamma / 2, screenWidth),
            0
          );
          setPosition(newLeft);
        }
      };

      window.addEventListener("deviceorientation", handleOrientation);

      return () =>
        window.removeEventListener("deviceorientation", handleOrientation);
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
            collected:false,
          };

          const screenWidth = Math.min(window.innerWidth, 400);
          randomCoin.left = (randomCoin.left * screenWidth) / 100;

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

      const screenWidth = Math.min(window.innerWidth, 400);
      bigCoin.left = (bigCoin.left * screenWidth) / 100;

      setCoins((prevCoins) => [...prevCoins, bigCoin]);
    }
  }, [timeLeft, gameStarted]);

  const checkCollision = () => {
    const rocketWidth = 100; // Match CSS
    setCoins((prevCoins) =>
      prevCoins.filter((coin) => {
        const isCollision =
          !coin.collected &&
          coin.top > 90 &&
          coin.left >= position - rocketWidth / 2 &&
          coin.left <= position + rocketWidth / 2;
  
        if (isCollision) {
          // Increment score
          setScore((prevScore) => prevScore + coin.value);
  
          // Mark the coin as collected and hide it
          const coinElement = document.getElementById(coin.id);
          if (coinElement) {
            coinElement.classList.add("coin-hidden");
          }
  
          // Remove this coin from state
          return false; // Filter it out
        }
        return true; // Keep non-colliding coins
      })
    );
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
          // Remove the coin after 500ms (duration of explode animation)
          const timeoutId = setTimeout(() => {
            setCoins((prevCoins) => prevCoins.filter((c) => c.id !== coin.id));
          }, 0);
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
         <h1 style={{color:'white'}}>Welcome To the </h1>
         <h1 style={{color:'white'}}>White Sharks</h1>
         <button onClick={handleIntroEnd} style={{backgroundColor:'skyblue',width:'30%',borderRadius:'15px',height:'40px',}}>Next</button>
        </div>
      ) : showInstructions ? (
        <div className="instructions-overlay">
          <h1 style={{color:"white"}}>Welcome to the Space Rocket Game</h1>
          <p style={{color:"skyblue"}}>Rotate your device left and right to collect SHARKS!</p>
          <div>
            <img src={Tilt} alt="tilt" style={{height:'200px'}}/>
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
        <>
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
                  "url(https://coffee-geographical-ape-289.mypinata.cloud/ipfs/QmcSxjgDfcU2qX9FAHJZvSkgenUWvPepAw9JiNk2nJmeM3)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                width: coin.size === "large" ? "80px" : "40px",
                height: coin.size === "large" ? "80px" : "40px",
              }}
            >
              {coin.value}
            </div>
          ))}

        </>
      )}
    </div>
  );
};

export default Landing;
