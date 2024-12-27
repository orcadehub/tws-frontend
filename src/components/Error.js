import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Error.css";
import ErrorImage from "../assets/error.jpg"; // Replace this with your error image path

const Error = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage =
    location.state?.errorMessage || "An unexpected error occurred 3.";

  const handleGoHome = () => {
    localStorage.clear();
    navigate("/home"); // Redirects to the home page
  };

  return (
    <div className="error-page-container">
      <img src={ErrorImage} alt="Error" className="error-image" />
      <h1>Oops! Something went wrong.</h1>
      <p>{errorMessage}</p>
      <button onClick={handleGoHome} className="go-home-button">
        Go to Home
      </button>
    </div>
  );
};

export default Error;