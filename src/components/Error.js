import React from "react";
import { useNavigate } from "react-router-dom";
import "./Error.css";
import ErrorImage from "../assets/error.jpg"; // Replace this with your error image path

const Error = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home"); // Redirects to the home page
  };

  return (
    <div className="error-page-container">
      <img src={ErrorImage} alt="Error" className="error-image" />
      <h1>Oops! Something went wrong.</h1>
      <p>We couldn't process your request. Please try again later.</p>
      <button onClick={handleGoHome} className="go-home-button">
        Go to Home
      </button>
    </div>
  );
};

export default Error;
