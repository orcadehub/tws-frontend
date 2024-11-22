import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import config from "../config";
import Back from "../assets/homeblack.jpg";
import Coin from '../assets/coin.png'
const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [timer, setTimer] = useState(30);
  const [isFarming, setIsFarming] = useState(false);
  const [claimAvailable, setClaimAvailable] = useState(false);
  const navigate = useNavigate();

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  };

  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${baseURL}/profile`, CONFIG_OBJ);
        const user = response.data.user;
        setProfileData(user);

        if (user.farmingStartTime) {
          const farmingStartTime = new Date(user.farmingStartTime).getTime();
          const now = Date.now();
          const elapsed = now - farmingStartTime;
          const remainingTime = Math.max(0, user.farmingDuration - elapsed);

          if (remainingTime > 0) {
            setTimer(Math.floor(remainingTime / 1000));
            setIsFarming(true);
          } else {
            setClaimAvailable(true);
          }
        } else {
          // Reset states if no farming session is active
          setClaimAvailable(false);
          setIsFarming(false);
        }
      } catch (error) {
        navigate("/authenticate");
      }
    };

    fetchProfileData();
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (isFarming && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer <= 0) {
      setClaimAvailable(true);
      setIsFarming(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isFarming, timer]);

  const startFarming = async () => {
    try {
      await axios.post(`${baseURL}/start-farming`, {}, CONFIG_OBJ);
      setIsFarming(true);
      setTimer(30); // Reset timer to 30 seconds for testing
      setClaimAvailable(false);
    } catch (error) {
      console.error("Error starting farming session:", error);
    }
  };

  const claimCoins = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/claim-coins`,
        { coinsToAdd: 100 },
        CONFIG_OBJ
      );

      setProfileData(response.data.user); // Update wallet balance and reset state
      setClaimAvailable(false);
      setIsFarming(false); // Reset farming state
      Swal.fire("Coins claimed successfully!", "", "success");
    } catch (error) {
      console.error("Error claiming coins:", error);
      Swal.fire("Failed to claim coins. Please try again.", "", "error");
    }
  };

  const progressPercentage = ((30 - timer) / 30) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.profileContainer}>
        <div style={styles.userInfo}>
          <div style={styles.profileIcon}>
            {profileData?.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                style={styles.profileImage}
              />
            ) : (
              <span style={styles.profileInitial}>
                {profileData?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
          <h2 style={styles.name}>{profileData?.username || "User Name"}</h2>
        </div>
        {profileData?.role === "admin" && (
          <div style={styles.taskButtons}>
            <button
              style={styles.taskButton}
              onClick={() => navigate("/addtask")}
            >
              Add Task
            </button>
            <button
              style={styles.taskButton}
              onClick={() => navigate("/tasks")}
            >
              Delete Task
            </button>
          </div>
        )}
        {profileData?.role === "user" && (
          <div style={styles.balanceBox}>
            {/* <h3 style={styles.balanceTitle}>Coin Balance</h3> */}
            <img src={Coin} alt="coin" style={{height:'50px'}}/>
            <p style={styles.balanceAmount}>
              {profileData?.walletAmount || "0.00"} Sharks
            </p>
          </div>
        )}
      </div>
      {profileData?.role === "user" && (
        <>
          <div style={styles.box3}>
           <img src={Back} alt="image" style={{height:'100%',width:'100%'}}/>
          </div>
          <div style={styles.box4}>
            <div
              style={{ ...styles.progressBar, width: `${progressPercentage}%` }}
            ></div>
            {!isFarming && !claimAvailable && (
              <button style={styles.startButton} onClick={startFarming}>
                Start Farming
              </button>
            )}
            {isFarming && (
              <p style={styles.timer}>
                {Math.floor(timer / 3600)}h {Math.floor((timer % 3600) / 60)}m{" "}
                {timer % 60}s
              </p>
            )}
            {claimAvailable && (
              <button style={styles.claimButton} onClick={claimCoins}>
                Claim Coins
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#000",
    color: "#fff",
    height: "83%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  profileContainer: {
    textAlign: "left",
    width: "80%",
    maxWidth: "400px",
    padding: "20px",
    marginBottom: "10px",
    borderRadius: "10px",
  },
  taskButtons: {
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
  },
  taskButton: {
    backgroundColor: "#CC6600",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    flex: 1,
    margin: "5px 2px",
  },
  userInfo: {
    textAlign: "left",
    marginBottom: "15px",
  },
  name: {
    fontSize: "18px",
    marginBottom: "5px",
    color: "#fff",
  },
  userId: {
    fontSize: "14px",
    color: "#bbb",
  },
  balanceBox: {
    width: "100%",
    padding: "10px",
    textAlign: "center",
    borderRadius: "5px",
    marginTop: "10px",
  },
  balanceTitle: {
    fontSize: "25px",
    color: "#fff",
    marginBottom: "5px",
  },
  balanceAmount: {
    fontSize: "40px",
    color: "#fff",
    fontWeight: "bold",
  },
  box3: {
    backgroundColor: "#222",
    width: "80%",
    height:'270px',
    maxWidth: "400px",
    borderRadius: "8px",
    margin: "-45px 0",
  },
  box4: {
    backgroundColor: "#000",
    width: "80%",
    border:'2px solid skyblue',
    maxWidth: "400px",
    padding: "15px",
    textAlign: "center",
    borderRadius: "8px",
    margin: "10px 0",
    position: "relative",
    bottom: "-10%",
    overflow: "hidden",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "skyblue", // Slightly transparent orange
    zIndex: 0,
  },
  startButton: {
    backgroundColor: "skyblue",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    zIndex: 1,
  },
  timer: {
    color: "#fff",
    fontSize: "18px",
    position: "relative",
    zIndex: 1,
  },
  claimButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    zIndex: 1,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  profileIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "10px",
    overflow: "hidden", // Ensures image fits within the circle
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  profileInitial: {
    color: "#000",
    fontWeight: "bold",
    fontSize: "20px",
  },
};

export default Profile;
