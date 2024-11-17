import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Welcome to Our App!",
      description: "Discover amazing features to enhance your experience.",
    },
    {
      title: "Stay Connected",
      description: "Connect with your friends and family easily.",
    },
    {
      title: "Achieve Your Goals",
      description: "Track your progress and stay motivated.",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate("/home"); // Navigate to the home page after the last slide
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    color: "#fff",
    textAlign: "center",
  },
  slide: {
    maxWidth: "400px",
    padding: "20px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  description: {
    fontSize: "16px",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#ff6347",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  buttonDisabled: {
    backgroundColor: "#888", // Disabled state color
    cursor: "not-allowed",
  },
};

  return (
    <div style={styles.container}>
      <div style={styles.slide}>
        <h2 style={styles.title}>{slides[currentSlide].title}</h2>
        <p style={styles.description}>{slides[currentSlide].description}</p>
        <div style={styles.buttonContainer}>
          <button
            style={{
              ...styles.button,
              ...(currentSlide === 0 ? styles.buttonDisabled : {}),
            }}
            onClick={handlePrev}
            disabled={currentSlide === 0}
          >
            Previous
          </button>
          <button style={styles.button} onClick={handleNext}>
            {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
