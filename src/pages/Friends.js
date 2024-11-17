import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Import config for environment URLs
import "./Friends.css";

const Friends = () => {
  const [referrals, setReferrals] = useState([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const referralId = user?.referralId;
  const shareLink = `${config.BASE_URL}/signup/${referralId}`;

  // Get the base URL depending on the environment
  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  };

  useEffect(() => {
    if (!user) {
      navigate("/authenticate");
      return;
    }

    const fetchReferralData = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/profile/referrals`, // Use dynamic baseURL
          CONFIG_OBJ
        );
        setReferrals(response.data.referrals);
        setTotalReferrals(response.data.totalReferrals);
      } catch (error) {
        console.error("Error fetching referral data:", error);
        navigate("/authenticate");
      }
    };

    fetchReferralData();
  }, [user, navigate, baseURL]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Join me on this platform!",
          text: "Invite friends and earn rewards! Use my referral link to sign up.",
          url: shareLink,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported on this device.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        alert("Referral link copied to clipboard!");
      })
      .catch((error) => console.error("Error copying link:", error));
  };

  return (
    <div className="mobile">
      <div className="content">
        <h3>Invite friends 🤝 and get rewards</h3>
        <p>Earn up to 50,000 points from your friends!</p>
      </div>

      <div className="col">
        <div className="friends">
          <p>Friends invited</p>
          <h4>🤝 X {totalReferrals}</h4>
        </div>
        <div className="friends1">
          <p>Coins earned</p>
          <h4>💰 X {totalReferrals * 150}</h4>
        </div>
      </div>

      <div className="col2">
        <ul>
          <li>
            You could earn <span className="span">10%</span> of all points
            earned by players you have invited, capped at{" "}
            <span className="span">50,000</span> points.
          </li>
          <li>
            Invited friends will receive a gift of{" "}
            <span className="span">1000</span> points.
          </li>
        </ul>
      </div>

      <div className="name">
        <h4>
          <span className="span2">No.</span> Friend's name
        </h4>
      </div>

      <div className="ol">
        <ol>
          {referrals.map((referral, index) => (
            <li key={index}>
              <span className="span3"></span> {referral.username}
            </li>
          ))}
        </ol>
      </div>

      <div className="display">
        <p>
          Displaying the most recent {Math.min(referrals.length, 300)} records
          only
        </p>
      </div>

      <div className="button">
        <div className="btn">
          <button onClick={handleShare}>Invite Friends!</button>
        </div>
        <div className="btn2" onClick={handleCopyLink}>
          <h1>
            <i className="bx bxs-copy"></i>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Friends;
