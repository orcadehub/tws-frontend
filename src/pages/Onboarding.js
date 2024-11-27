import React, { useState, useEffect } from "react";
import "./Onboarding.css"; // Include the styles
// import Video from "../assets/shark.mp4"; // Import the video file
import Land1 from "../assets/land1.jpg";
import ProfileImage1 from "../assets/homeblack.jpg"; // Profile image for slide 1
import ProfileImage2 from "../assets/tg.png"; // Profile image for slide 2
import ProfileImage3 from "../assets/air.jpg"; // Profile image for slide 3
import ProfileImage4 from "../assets/coin.png"; // Profile image for slide 4
import Lottie from "lottie-react";
import ConfettiAnimation from "../assets/confetti.json";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import { toast } from "react-toastify";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedDays, setAnimatedDays] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

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
  debugger

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
  const bonusCoins = calculateBonusCoins(daysOnTelegram)+187;

  const slides = [
    {
      title: "Welcome to the White Sharks!",
      image: Land1,
    },
    {
      progress: 75,
      profileImage: ProfileImage1,
      profileImage2: ProfileImage2,
      profileImage3: ProfileImage3,
      profileImage4: ProfileImage4,
    },
    {
      // title: "Telegram OG ERA",
      title: "You are a loyal telegram user",
      days: daysOnTelegram,
      coins: bonusCoins,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      return;
    } else {
      // Trigger celebration animation
      setShowCelebration(true);
      setTimeout(async () => {
        setShowCelebration(false);
        try {
          const response = await axios.put(`${baseURL}/addAmount`,{ amount: bonusCoins }, CONFIG_OBJ);
          const { message } = response.data;
          toast.success(message)
          navigate("/home");
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            "Unable to verify user details. Please try again.";
          toast.error(errorMessage);
          navigate("/error"); // Redirect to an error page
        }
      }, 2000); // Hide confetti after 2 seconds
    }
  };

  useEffect(() => {
    if (currentSlide === 1) {
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

  useEffect(() => {
    if (currentSlide === 1) {
      const progressBars = document.querySelectorAll(".progress-1");
      let currentBar = 0;

      const animateBar = () => {
        if (currentBar < progressBars.length) {
          const progressBar = progressBars[currentBar];
          const fill = progressBar.querySelector(".fill");

          progressBar.style.visibility = "visible"; // Make the progress bar visible
          fill.style.width = "100%"; // Start the filling animation

          setTimeout(() => {
            currentBar += 1;
            animateBar(); // Proceed to the next bar
          }, 500); // Matches the 2s duration of the CSS transition
        }
      };

      animateBar();

      // Cleanup: Reset progress bars when the slide changes
      return () => {
        progressBars.forEach((bar) => {
          const fill = bar.querySelector(".fill");
          fill.style.width = "0%";
          bar.style.visibility = "hidden";
        });
      };
    }
  }, [currentSlide]);

  useEffect(() => {
    if (currentSlide === 1) {
      const headings = document.querySelectorAll("h4");
      const images = document.querySelectorAll(".profile-image");

      headings.forEach((heading, index) => {
        heading.classList.add("visible");
        heading.setAttribute("data-index", index + 1);
      });

      images.forEach((image, index) => {
        image.classList.add("visible");
        image.setAttribute("data-index", index + 1);
      });
    }
  }, [currentSlide]);

  return (
    <div className="carousel-container">
      {showCelebration && (
        <div className="confetti-overlay">
          <Lottie
            animationData={ConfettiAnimation}
            loop={false}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
        </div>
      )}
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentSlide * 400}px)`, // Move the track
          transition: "transform 0.5s ease-in-out",
        }}
      >
        {slides.map((slide, index) => (
          <div className="carousel-slide" key={index}>
            <h1 style={{ display: "flex" }}>{slide.title}</h1>
            <p style={{ display: "flex" }}>{slide.description}</p>
            <img src={slide.image} className="img" alt="" />
            {index === 1 && (
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
                <div className="progress-1">
                  <div className="fill"></div>
                </div>

                {/* Days on Telegram Section */}
                <div className="center-section">
                  <div className="profile-image">
                    <img src={slide.profileImage2} alt="Profile" />
                  </div>
                  <div className="days-on-telegram">
                    <h4>Calculating your TG days</h4>
                  </div>
                </div>
                <div className="progress-1">
                  <div className="fill"></div>
                </div>
                {/* MiniGame Section */}
                <div className="right-section">
                  <div className="profile-image">
                    <img src={slide.profileImage3} alt="Profile" />
                  </div>
                  <div className="bonus-coins">
                    <h4 className="text-start">Contribution to TG minigame </h4>
                  </div>
                </div>
                <div className="progress-1">
                  <div className="fill"></div>
                </div>
                {/* Bonus Coins Section */}
                <div className="right-section">
                  <div className="profile-image">
                    <img src={slide.profileImage4} alt="Profile" />
                  </div>
                  <div className="bonus-coins">
                    <h4>Calculating Sharks</h4>
                  </div>
                </div>
                <div className="progress-1">
                  <div className="fill"></div>
                </div>
              </div>
            )}

            {slide.days && (
              <div
                className="coins-earned"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <h5>
                  Days on Telegram:{" "}
                  <span style={{ color: "skyblue" }}>{slide.days}</span>
                </h5>
              </div>
            )}
            {index === 2 && (
              <div className="mt-5">
                <h2>Sharks Recieved</h2>
                <div style={{ fontSize: "50px" }}>
                  {slide.coins}
                  <span style={{ fontSize: "20px" }}>Sharks</span>
                </div>
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

export default Onboarding;
