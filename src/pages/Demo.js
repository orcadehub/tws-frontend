import React, { useState, useEffect } from "react";
import "./Demo.css"; // Include the styles
import Video from "../assets/shark.mp4"; // Import the video file
import Slide1 from "../assets/slide1.jpg";
import ProfileImage1 from "../assets/home.jpg"; // Profile image for slide 1
import ProfileImage2 from "../assets/home.jpg"; // Profile image for slide 2
import ProfileImage3 from "../assets/home.jpg"; // Profile image for slide 3

const Demo = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedDays, setAnimatedDays] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);

  const accountCreatedDate = new Date("2023-05-01"); // Replace with actual account creation date

  const calculateDaysOnTelegram = () => {
    const currentDate = new Date();
    const timeDifference = currentDate - accountCreatedDate; // Time difference in milliseconds
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24)); // Convert milliseconds to days
    return daysDifference;
  };

  const calculateBonusCoins = (days) => {
    if (days < 365) {
      return 100;
    } else if (days < 500) {
      return 200;
    } else {
      return 300;
    }
  };

  const daysOnTelegram = calculateDaysOnTelegram();
  const bonusCoins = calculateBonusCoins(daysOnTelegram);

  const slides = [
    {
      title: "Welcome to the White Sharks!",
      image: Slide1,
    },
    {
      title: "Telegram OG ERA",
      description: "You are a loyal telegram user",
      animation: Video,
      coins: 100,
    },
    {
      progress: 75,
      daysOnTelegram: daysOnTelegram,
      bonusCoins: bonusCoins,
      profileImage: ProfileImage1,
      profileImage2: ProfileImage2,
      profileImage3: ProfileImage3,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (currentSlide === 2) {
      let daysInterval, coinsInterval;

      // Animate days
      daysInterval = setInterval(() => {
        setAnimatedDays((prev) => {
          if (prev < daysOnTelegram) return prev + 1;
          clearInterval(daysInterval);
          return prev;
        });
      }, 1);

      // Animate coins
      coinsInterval = setInterval(() => {
        setAnimatedCoins((prev) => {
          if (prev < bonusCoins) return prev + 1;
          clearInterval(coinsInterval);
          return prev;
        });
      }, 1);

      return () => {
        clearInterval(daysInterval);
        clearInterval(coinsInterval);
      };
    }
  }, [currentSlide, daysOnTelegram, bonusCoins]);

  return (
    <div className="carousel-container">
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentSlide * 400}px)`, // Move the track
          transition: "transform 0.5s ease-in-out",
        }}
      >
        {slides.map((slide, index) => (
          <div className="carousel-slide" key={index}>
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
            {/* <img src={slide.image} alt="image" style={{height:'300px'}}/>  */}
            {index === 2 && (
              <div className="slide-content">
                {/* Rating Section */}
                <div className="left-section">
                  <div className="profile-image">
                    <img src={slide.profileImage} alt="Profile" />
                  </div>
                  <div className="rating">
                    <h4>Rating Your Username</h4>
                  </div>
                </div>
                <div className="progress-1"></div>

                {/* Days on Telegram Section */}
                <div className="center-section">
                  <div className="profile-image">
                    <img src={slide.profileImage} alt="Profile" />
                  </div>
                  <div className="days-on-telegram">
                    <h4>Days on Telegram: {animatedDays}</h4>
                  </div>
                </div>
                <div className="progress-1"></div>

                {/* Bonus Coins Section */}
                <div className="right-section">
                  <div className="profile-image">
                    <img src={slide.profileImage} alt="Profile" />
                  </div>
                  <div className="bonus-coins">
                    <h4>Coins Earned : {animatedCoins}</h4>
                  </div>
                </div>
                <div className="progress-1"></div>
              </div>
            )}

            {slide.animation && (
              <div className="animation-container">
                <video width="320" height="240" autoPlay loop muted>
                  <source src={slide.animation} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {slide.coins && (
              <div className="coins-earned">
                <p>Days on Telegram: {slide.coins}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={handleNext} style={{ backgroundColor: "skyblue" }}>
          {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
        </button>
      </div>
    </div>
  );
};

export default Demo;
