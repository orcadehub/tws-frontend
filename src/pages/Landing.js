import React, { useEffect, useState } from "react";
import "./Landing.css";
import Log from "../assets/rocket.mp4";
import Intro from "../assets/intro.mp4";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import config from "../config";

const Landing = () => {
  const [position, setPosition] = useState(80);
  const [coins, setCoins] = useState([]);
  const [score, setScore] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
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

  useEffect(() => {
    if (isIntroDone && gameStarted) {
      const handleOrientation = (event) => {
        const { gamma } = event;
        if (gamma) {
          const screenWidth = Math.min(window.innerWidth, 400);
          const newLeft = Math.max(Math.min(position + gamma / 3, screenWidth), 0);
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
            value: Math.floor(Math.random() * 50) + 10,
            size: "small",
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
      };

      const screenWidth = Math.min(window.innerWidth, 400);
      bigCoin.left = (bigCoin.left * screenWidth) / 100;

      setCoins((prevCoins) => [...prevCoins, bigCoin]);
    }
  }, [timeLeft, gameStarted]);

  const checkCollision = () => {
    const rocketWidth = 90; // Assuming the rocket's width is around 50px
    setCoins((prevCoins) =>
      prevCoins.filter((coin) => {
        if (
          coin.top > 90 &&
          coin.left >= position - rocketWidth / 2 &&
          coin.left <= position + rocketWidth / 2
        ) {
          setScore((prevScore) => prevScore + coin.value);
          document.getElementById(coin.id)?.classList.add("coin-collapsed");
          return false; // Remove the coin
        }
        return true; // Keep the coin
      })
    );
  };
  

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        if (!gameOver) checkCollision();
      }, 100);
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

  const handleIntroEnd = () => {
    setIsIntroDone(true);
    setGameStarted(true);
  };

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
    <div className="game-container">
      {!isIntroDone ? (
        <div className="intro-video-container">
          <video
            className="intro-video"
            src={Intro}
            autoPlay
            onEnded={handleIntroEnd}
            muted
          />
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

          {coins.map((coin) => (
            <div
              id={coin.id}
              key={coin.id}
              className={`coin ${coin.size}`}
              style={{
                left: `${coin.left}px`,
                top: `${coin.top}%`,
                backgroundImage: "url(https://coffee-geographical-ape-289.mypinata.cloud/ipfs/QmcSxjgDfcU2qX9FAHJZvSkgenUWvPepAw9JiNk2nJmeM3)",
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
