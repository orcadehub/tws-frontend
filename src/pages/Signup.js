import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config"; // Import config to get base URLs
import { useLoading } from "../components/LoadingContext";
import { toast } from "react-toastify";
const Signup = () => {
  const { setIsLoading } = useLoading();
  const { chatid } = useParams(); // Capture chat ID from the URL
  const navigate = useNavigate();

  // Determine base URL based on environment (development or production)
  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    const verifyUser = async () => {
      if (!chatid) {
        Swal.fire({
          icon: "error",
          title: "Invalid Access",
          text: "No Chat ID provided in the URL.",
        });
        return navigate("/error"); // Redirect to an error page or another route
      }

      setIsLoading(true);

      try {
        // toast.info(`${baseURL}/verify-chatid/${chatid}`)
        localStorage.clear();
        const response = await axios.get(`${baseURL}/verify-chatid/${chatid}`);
        const { user, token, isNewUser } = response.data;
        // toast.success(user)
        
        // Store user data and token in localStorage
        localStorage.setItem("users", JSON.stringify(user));
        localStorage.setItem("tokens", token);
        if (isNewUser) {
          // Navigate to onboarding slides for new users
          // toast.success("entered onboarding page");
          navigate("/onboarding");
        } else {
          // Navigate directly to home for existing users
          // toast.success("entered home page");
          navigate("/home");
        }
      } catch (error) {
        const errorMessage =
        error.response?.data?.message ||
        "Unable to verify user details. Please try again.";
      toast.error(errorMessage);

      // Add default user data to localStorage
      const defaultUser = {
        username: "Guest",
        walletAmount: 0.0,
        referralAmount: 0.0,
        lastWalletAmount: 0,
        totalReferrals: 0,
        referralId: `guest-${Math.random().toString(36).substring(2, 8)}`,
        referredBy: null,
        dateJoined: new Date().toISOString(),
        isActive: true,
        profilePictureUrl: null,
        lastLogin: new Date().toISOString(),
        farmingStartTime: null,
        farmingDuration: 10800 * 1000,
        completedTasks: [],
        role: "user",
        isNewUser: true,
        chatid: `guest-${Math.random().toString(36).substring(2, 8)}`,
        walletAddress: null,
        isWalletConnected: false,
        isTonTrans: false,
        isReffered: false,
      };

      const randomToken = Math.random().toString(36).substring(2, 15);

      localStorage.setItem("users", JSON.stringify(defaultUser));
      localStorage.setItem("tokens", randomToken);

      // Navigate to home
      navigate("/home");
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [chatid, navigate, baseURL]);

  return (
    <div style={styles.container}>
      <h2 style={styles.message}>Processing your account details...</h2>
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
    flexDirection: "column",
  },
  message: {
    fontSize: "18px",
    textAlign: "center",
  },
};

export default Signup;
