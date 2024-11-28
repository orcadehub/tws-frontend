import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";
import Back from "../assets/homeblack.jpg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [timer, setTimer] = useState(100);
  const [isFarming, setIsFarming] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimAvailable, setClaimAvailable] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for showing modal
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const navigate = useNavigate();
  const [currentCoins, setCurrentCoins] = useState(100);
  const totalCoins = 100;
  const farmingDurationInSeconds = 30;

  const [tonConnectUI] = useTonConnectUI(); // TON Connect UI hook
  // const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false); // Fetch the raw address

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

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    // if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
  };

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
        const elapsed = farmingDurationInSeconds - timer;
        setCurrentCoins(
          ((elapsed / farmingDurationInSeconds) * totalCoins).toFixed(3)
        );
      }, 1000);
    } else if (timer <= 0) {
      setClaimAvailable(true);
      setIsFarming(false);
      setCurrentCoins(totalCoins);
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
      toast.success("Farming started!");
    } catch (error) {
      console.error("Error starting farming session:", error);
    }
  };

  const claimCoins = async () => {
    if (isClaiming) return;
    try {
      setIsClaiming(true);
      const response = await axios.post(
        `${baseURL}/claim-coins`,
        { coinsToAdd: 100 },
        CONFIG_OBJ
      );

      setProfileData(response.data.user); // Update wallet balance and reset state
      setClaimAvailable(false);
      setShowModal(false);
      setIsFarming(false); // Reset farming state
      toast.success("Coins claimed successfully!"); // Show toast on success
      // Swal.fire("Coins claimed successfully!", "", "success");
    } catch (error) {
      console.error("Error claiming coins:", error);
      // Swal.fire("Failed to claim coins. Please try again.", "", "error");
      toast.error("Failed to claim coins. Please try again.");
    }
  };

  const handleClaimBonus = async () => {
    setShowModal(false);
    try {
      if (!rawAddress) {
        toast.error("Wallet not connected. Please connect the wallet first.");
        return;
      }

      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        messages: [
          {
            address:
              "0:8d4592883c74e135c66145b030e93febc668a7334fb099fc68d59d9798f2d47f", // Example address for bonus
            amount: "8000000", // 0.008 TON in nanoTON
          },
        ],
        fee: "0000000",
      };

      await tonConnectUI.sendTransaction(transaction);
      const response = await axios.post(
        `${baseURL}/claim-coins`,
        { coinsToAdd: 200 },
        CONFIG_OBJ
      );

      setProfileData(response.data.user); // Update wallet balance and reset state
      setClaimAvailable(false);

      setIsFarming(false); // Reset farming state
      setIsClaimingBonus(false); // Close modal after successful transaction
      setClaimAvailable(false); // Reset state

      toast.success("Bonus claimed successfully!");
      if (response.data.user && !profileData.isTonTrans) {
        const res = await axios.post(
          `${baseURL}/walCon`,
          { isWalletConnected: false, isTonTrans: true }, // Empty body if not required
          CONFIG_OBJ
        );
        const { message } = res.data;
        toast.success(message);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction failed. Please try again.");
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
            {/* <img src={Coin} alt="coin" style={{ height: "50px" }} /> */}
            <p style={styles.balanceAmount}>
              {formatNumber(profileData?.walletAmount || 0)}
              <span style={{ fontSize: "22px", fontFamily: "times-roman" }}>
                Sharks
              </span>
            </p>
          </div>
        )}
      </div>
      {profileData?.role === "user" && (
        <>
          <div style={styles.box3}>
            <img
              src={Back}
              alt="image"
              style={{ height: "130%", width: "100%" }}
            />
          </div>
          <div style={styles.box4}>
            <div
              style={{ ...styles.progressBar, width: `${progressPercentage}%` }}
            ></div>
            {!isFarming && !claimAvailable && (
              <button style={styles.startButton} onClick={startFarming}>
                Start Mining
              </button>
            )}
            {isFarming && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <p style={styles.timer}>
                  {Math.floor(timer / 3600)}h {Math.floor((timer % 3600) / 60)}m{" "}
                  {timer % 60}s
                </p>
                <p style={styles.coins}>
                  Sharks: {currentCoins} {/* Display coins with 3 decimals */}
                </p>
              </div>
            )}
            {claimAvailable && (
              <button
                style={styles.claimButton}
                onClick={() => setShowModal(true)}
              >
                Claim Sharks
              </button>
            )}
          </div>

          {showModal && (
            <div
              className="modal fade show"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
              tabIndex="-1"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h6
                      className="modal-title fs-5"
                      id="exampleModalLabel"
                      style={{ color: "black" }}
                    >
                      Claim Your Rewards
                    </h6>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <h6 style={{ color: "black" }}>
                      Select your preferred option to claim your rewards.
                    </h6>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        margin: "2rem 0",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={claimCoins}
                      >
                        Claim
                      </button>
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handleClaimBonus}
                      >
                        Claim Bonus (+100 sharks)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
  coins: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    zIndex: 1,
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
    marginTop: "-15px",
  },
  balanceTitle: {
    fontSize: "40px",
    color: "#fff",
    marginBottom: "5px",
  },
  balanceAmount: {
    fontSize: "60px",
    color: "#fff",
    fontWeight: "bold",
  },
  box3: {
    backgroundColor: "#222",
    width: "90%",
    height: "240px",
    maxWidth: "400px",
    borderRadius: "8px",
    margin: "-45px 0",
  },
  box4: {
    backgroundColor: "#000",
    width: "80%",
    // border: "2px solid skyblue",
    maxWidth: "400px",
    padding: "15px",
    textAlign: "center",
    borderRadius: "8px",
    margin: "40px 0",
    // position: "absolute",
    position: "relative",
    // bottom: "15%",
    // overflow: "hidden",
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
    height: "40px",
    width: "100%",
  },
  timer: {
    color: "#fff",
    fontSize: "18px",
    position: "relative",
    zIndex: 1,
  },
  claimButton: {
    backgroundColor: "green",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    zIndex: 1,
    width: "100%",
    // height:"55px"
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
    backgroundColor: "skyblue",
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
