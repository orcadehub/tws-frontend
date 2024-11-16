import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config"; // Import config to get base URLs

const Signup = () => {
  const [username, setUsername] = useState("");
  const [referralId, setReferralId] = useState("");
  const { referralid } = useParams(); // Capture referral ID from the URL
  const navigate = useNavigate();

  useEffect(() => {
    if (referralid) {
      setReferralId(referralid); // Set referral ID if provided in URL
    }
  }, [referralid]);

  // Determine base URL based on environment (development or production)
  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL
      : config.BASE_URL;

  const handleSignup = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Signing Up...",
      text: "Please wait while we create your account.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(
        `${baseURL}authenticate`,
        {
          username,
          referralId, // Include referral ID if available
        }
      );

      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      await Swal.fire({
        icon: "success",
        title: "Signup Successful",
        text: "Your account has been created!",
      });

      navigate("/home"); // Redirect to home after successful signup
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while signing up. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: errorMessage,
      });
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSignup}>
        <h2 style={styles.heading}>Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Sign Up
        </button>
        {referralId && (
          <p style={styles.referralMessage}>
            Signing up with referral ID: <strong>{referralId}</strong>
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#000",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
  form: {
    width: "100%",
    maxWidth: "400px",
    padding: "20px",
    backgroundColor: "#333",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
  },
  heading: { fontSize: "24px", marginBottom: "20px", textAlign: "center" },
  input: {
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    width: "100%",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#FF6347",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  referralMessage: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#ffae42",
    textAlign: "center",
  },
};

export default Signup;
