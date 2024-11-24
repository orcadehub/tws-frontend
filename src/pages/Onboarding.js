import React, { useState, useEffect} from "react";
import "./Onboarding.css"; // Include the styles
// import Video from "../assets/shark.mp4"; // Import the video file
// import Slide1 from "../assets/slide1.jpg";
import ProfileImage1 from "../assets/home.jpg"; // Profile image for slide 1
import ProfileImage2 from "../assets/home.jpg"; // Profile image for slide 2
import ProfileImage3 from "../assets/home.jpg"; // Profile image for slide 3
import ProfileImage4 from "../assets/home.jpg"; // Profile image for slide 4
import Lottie from "lottie-react";
import ConfettiAnimation from "../assets/confetti.json";

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedDays, setAnimatedDays] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // const videoRef = useRef(null);

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
    },
    {
      progress: 75,
      daysOnTelegram: daysOnTelegram,
      bonusCoins: bonusCoins,
      profileImage: ProfileImage1,
      profileImage2: ProfileImage2,
      profileImage3: ProfileImage3,
      profileImage4: ProfileImage4,
    },
    {
      // title: "Telegram OG ERA",
      description: "You are a loyal telegram user",
      days: 10,
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Trigger celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000); // Hide confetti after 4 seconds
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

  // useEffect(() => {
  //   const video = videoRef.current;

  //   if (currentSlide === 2 || video) {
  //     video.currentTime = 0; // Reset video to the start
  //     // Only play if the video isn't already playing
  //     if (video.paused || video.ended) {
  //       video.play().catch((error) => {
  //         console.error("Error playing video:", error); // Catch any play errors
  //       });
  //     }
  //     // Set timeout to pause after the video has played for 2 seconds
  //     const timeout = setTimeout(() => {
  //       if (!video.paused && !video.ended) {
  //         video.pause();
  //       }
  //     }, 2000);

  //     return () => {
  //       clearTimeout(timeout);
  //       if (!video.paused && !video.ended) {
  //         video.pause(); // Ensure the video is paused when the component unmounts or slide changes
  //       }
  //     };
  //   }
  // }, [currentSlide]);

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
          }, 2000); // Matches the 2s duration of the CSS transition
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
      {/* <video
        ref={videoRef}
        className="video-background"
        src={Video}
        muted
        playsInline
        loop={false}
      /> */}
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
            {/* <img src={slide.image} alt="image" style={{height:'300px'}}/>  */}
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
                    <img src={slide.profileImage} alt="Profile" />
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
                    <img src={slide.profileImage} alt="Profile" />
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
                    <img src={slide.profileImage} alt="Profile" />
                  </div>
                  <div className="bonus-coins">
                    <h4>Calculating Coins</h4>
                  </div>
                </div>
                <div className="progress-1">
                  <div className="fill"></div>
                </div>
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

            {slide.days && (
              <div className="coins-earned" style={{ display: "flex" }}>
                <p>Days on Telegram: {slide.days}</p>
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

export default Onboarding;