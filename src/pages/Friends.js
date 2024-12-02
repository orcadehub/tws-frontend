import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Import config for environment URLs
import "./Friends.css";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import image from "../assets/slide1.jpg";

const Friends = () => {
  const [referrals, setReferrals] = useState([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const referralId = user?.referralId;
  const shareLink = `https://t.me/thewhiteshark_bot?start=${referralId}`;

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

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    return num.toLocaleString();
  };

  useEffect(() => {
    if (!user) {
      navigate("/authenticate");
      return;
    }

    const fetchReferralData = async () => {
      try {
        const response = await axios.get(`${baseURL}/profile/referrals`, CONFIG_OBJ);
        console.log("Referral Data:", response.data);
        setReferrals(response.data.referrals);
        setTotalReferrals(response.data.totalReferrals);
      } catch (error) {
        console.error("Error fetching referral data:", error);
        navigate("/authenticate");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [navigate, baseURL]);

  const handleShare = () => {
    const shareText = `${user.username} invites you to join and earn rewards! Use this referral link: ${shareLink}`;
    if (navigator.share) {
      navigator
        .share({
          title: "Invite Friends!",
          text: shareText,
          url: shareLink,
        })
        .then(() => console.log("Referral link shared successfully"))
        .catch((error) => console.error("Error sharing referral link:", error));
    } else {
      // Fallback for unsupported devices
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success("Referral link copied to clipboard!");
      })
      .catch((error) => console.error("Error copying link:", error));
  };

  return (
    <div className="mobile">
      <Helmet>
        <meta
          property="og:title"
          content="Join the Rewards Program with The White Shark Bot!"
        />
        <meta
          property="og:description"
          content="Sign up with this link to start earning rewards. Get 1000 points as a bonus, and help your inviter earn up to 50,000 points!"
        />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={shareLink} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="content">
        <h3>
          Invite friends <i className="fa-solid fa-handshake"></i> and get rewards
        </h3>
        <p>Earn 10% of Sharks from your friends!</p>
      </div>
      <div className="col">
        <div className="friends">
          <p>Friends invited</p>
          <i className="fa-solid fa-handshake"></i> X {totalReferrals}
        </div>
        <div className="friends1">
          <p>Sharks earned</p>
          <i className="fa-solid fa-sack-dollar"></i> X {formatNumber(user.referralAmount || 0)}
        </div>
      </div>
      <div className="col2">
        <ul>
          <li>
            You could earn <span className="span">10%</span> of all Sharks
            earned by players you have invited.
          </li>
          <li>
            Invited friends will receive a gift of up to{" "}
            <span className="span">5000</span> Sharks.
          </li>
        </ul>
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
      <table className="referrals-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Sharks Earned</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3">Loading...</td>
            </tr>
          ) : referrals.length > 0 ? (
            referrals.map((referral, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{referral.username}</td>
                <td>{(referral.walletAmount * 0.1).toFixed(3)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No referrals yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="display">
        <p>
          Displaying the most recent {Math.min(referrals.length, 300)} records
          only
        </p>
      </div>
    </div>
  );
};

export default Friends;
