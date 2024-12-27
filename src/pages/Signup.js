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
        toast.info(chatid)
        const response = await axios.get(`${baseURL}/verify-chatid/${chatid}`);

        const { user, token, isNewUser } = response.data;
        toast.success(user)
        localStorage.clear();
        // Store user data and token in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        if (isNewUser) {
          // Navigate to onboarding slides for new users
          toast.success("entered onboarding page");
          navigate("/onboarding");
        } else {
          // Navigate directly to home for existing users
          toast.success("entered home page");
          navigate("/home");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Unable to verify user details. Please try again.";
        toast.error(errorMessage);
        navigate("/error"); // Redirect to an error page
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
