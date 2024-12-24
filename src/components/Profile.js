import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";
import Back from "../assets/pic.jpg";
import { toast } from "react-toastify";
import Pic from "../assets/pic.jpg";
import Ton from "../assets/ton.png";
import "react-toastify/dist/ReactToastify.css";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { useLoading } from ".//LoadingContext";
import './Profile.css'
const Profile = () => {
  const { setIsLoading } = useLoading();
  const [profileData, setProfileData] = useState(null);
  const [timer, setTimer] = useState(10);
  const [isFarming, setIsFarming] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimAvailable, setClaimAvailable] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for showing modal
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const navigate = useNavigate();
  const [currentCoins, setCurrentCoins] = useState();
  const totalCoins = 100;
  const farmingDurationInSeconds = 10800;

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
      setIsLoading(true);
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
        navigate("/error");
      } finally {
        setIsLoading(false);
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
      setTimer(10800); // Reset timer to 30 seconds for testing
      setClaimAvailable(false);
      toast.success("Mining started!");
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
      toast.success("Sharks claimed successfully!"); // Show toast on success
      // Swal.fire("Coins claimed successfully!", "", "success");
    } catch (error) {
      console.error("Error claiming Sharks:", error);
      // Swal.fire("Failed to claim coins. Please try again.", "", "error");
      toast.error("Failed to claim Sharks. Please try again.");
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
        { coinsToAdd: 550 },
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

  const progressPercentage = ((10800 - timer) / 10800) * 100;

  // JavaScript logic for updating styles dynamically
  const previousCoins = useRef(currentCoins);

  useEffect(() => {
    if (currentCoins !== previousCoins.current) {
      const coinElement = document.getElementById("rolling-coins");
      coinElement.style.transform = "translateY(-130%)";
      setTimeout(() => {
        previousCoins.current = currentCoins;
        coinElement.style.transition = "none";
        coinElement.style.transform = "translateY(120%)";
        setTimeout(() => {
          coinElement.style.transition = "transform 0.9s ease-out";
        }, 50);
      }, 900); // Match this to the animation duration
    }
  }, [currentCoins]);

  return (
    <div className="container">
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
              {formatNumber(profileData?.walletAmount || 0)}{" "}
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

          <div style={styles.box41}>
            <i
              class="fa-brands fa-telegram"
              style={{ marginRight: "0.5rem" }}
            ></i>
            <a
              href="https://t.me/ThewhiteShark_io"
              style={{
                textDecoration: "none",
                color: "white",
                fontWeight: "bolder",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join TG Announcement
            </a>
            {/* <i
              class="fa-solid fa-forward"
              style={{ marginLeft: "0.5rem" }}
            ></i> */}
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
                  justifyContent: "space-evenly",
                  alignSelf: "end",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    marginTop: "6px",
                    marginLeft: "-60px",
                    zIndex: "10",
                  }}
                >
                  <p style={{ color: "white", fontWeight: "bolder" }}>
                    <i class="fa-solid fa-person-digging me-1"></i>
                    <span className="me-1">Mining</span>
                    <span
                      style={(styles.coins, styles.coinNumber)}
                      id="rolling-coins"
                    >
                      {currentCoins} {/* Display coins with 3 decimals */}
                    </span>
                  </p>
                </div>
                <div style={{ position: "absolute", right: "2%", top: "28%" }}>
                  <p style={styles.timer}>
                    {Math.floor(timer / 3600)}h{" "}
                    {Math.floor((timer % 3600) / 60)}m {timer % 60}s
                  </p>
                </div>
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
              onClick={(e) => {
                // Close modal if clicked outside the modal dialog
                if (e.target.classList.contains("modal")) {
                  setShowModal(false);
                }
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div
                    className="modal-body"
                    style={{ backgroundColor: "#000" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        marginTop: "2rem",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          backgroundColor: "black",
                          padding: "1rem",
                          width: "45%",
                          borderRadius: "15px",
                          boxShadow:
                            "0px 4px 10px rgba(43, 43, 43,0.4),0px 0px 20px rgba(244, 246, 246, 0.6)",
                        }}
                      >
                        <img
                          src={Pic}
                          alt="Coin"
                          style={{ width: "90px", marginBottom: "0.5rem" }}
                        />
                        <h6 style={{ color: "#fff", marginBottom: "0.5rem" }}>
                          100 <i class="bx bxs-coin"></i>
                        </h6>
                        <button
                          type="button"
                          className="btn btn-light"
                          style={{
                            width: "100%",
                            border: "1px solid black",
                            color: "#000",
                            borderRadius: "15px",
                          }}
                          onClick={claimCoins}
                        >
                          Claim
                        </button>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          backgroundColor: "black",
                          padding: "1rem",
                          borderRadius: "15px",
                          width: "45%",
                          boxShadow:
                            "0px 4px 10px rgba(43, 43, 43,0.4),0px 0px 20px rgba(244, 246, 246, 0.6)",
                        }}
                      >
                        <img
                          src={Pic}
                          alt="Coin Stack"
                          style={{ width: "90px", marginBottom: "0.5rem" }}
                        />
                        <h6 style={{ color: "#fff", marginBottom: "0.5rem" }}>
                          500 <i class="fa-solid fa-coins"></i>
                        </h6>
                        <button
                          type="button"
                          className="btn btn-info"
                          style={{
                            width: "100%",
                            borderRadius: "15px",
                          }}
                          onClick={handleClaimBonus}
                        >
                          <img
                            src={Ton}
                            alt="ton"
                            style={{ height: "20px", margin: "-3px 5px 0 0" }}
                          />
                          Claim
                        </button>
                      </div>
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
  coins: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    display: "inline-block",
    overflow: "hidden",
    height: "20px", // Adjust to fit the font size
    position: "relative",
  },
  coinNumber: {
    position: "absolute",
    top: 6,
    transition: "transform 0.2s ease-in-out",
    willChange: "transform",
  },
  profileContainer: {
    textAlign: "left",
    width: "100%",
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
    fontSize: "25px",
    color: "#fff",
    marginBottom: "5px",
  },
  balanceAmount: {
    fontSize: "44px",
    color: "#fff",
    fontWeight: "bold",
    marginTop: "4rem",
  },
  box3: {
    backgroundColor: "#222",
    width: "80%",
    height: "auto",
    maxWidth: "400px",
    borderRadius: "8px",
    marginTop: "-4rem",
  },
  box4: {
    backgroundColor: "rgb(42,42,42)",
    width: "80%",
    maxWidth: "400px",
    borderRadius: "8px",
    margin: "40px 0",
    position: "absolute",
    height: "44px",
    bottom: "9%",
    overflow: "hidden",
  },
  box41: {
    backgroundColor: "rgb(42,42,42)",
    width: "80%",
    maxWidth: "400px",
    padding: "10px",
    textAlign: "center",
    borderRadius: "8px",
    margin: "40px 0",
    position: "absolute",
    bottom: "20%",
    overflow: "hidden",
    boxShadow:
      "0px 4px 10px rgba(43, 43, 43,0.4),0px 0px 20px rgba(244, 246, 246, 0.6)",
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
    backgroundColor: "white",
    color: "#000",
    fontWeight: "bolder",
    padding: "8px 20px 15px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    height: "50px",
    width: "100%",
  },
  timer: {
    color: "#fff",
    fontSize: "12px",
    position: "relative",
    zIndex: 1,
  },
  claimButton: {
    backgroundColor: "skyblue",
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
