import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Import config for environment URLs
import "./Friends.css";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import image from "../assets/slide1.jpg";
import { useLoading } from "../components/LoadingContext";
const Friends = () => {
  const { setIsLoading } = useLoading();
  const [referrals, setReferrals] = useState([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("users"));
  const referralId = user?.referralId;
  const shareLink = `https://t.me/thewhiteshark_bot?start=${referralId}`;

  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("tokens"),
    },
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    return num.toLocaleString();
  };

  useEffect(() => {
    if (!user) {
      navigate("/error");
      return;
    }

    const fetchReferralData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}/profile/referrals`,
          CONFIG_OBJ
        );
        console.log("Referral Data:", response.data);
        setReferrals(response.data.referrals);
        setTotalReferrals(response.data.totalReferrals);
      } catch (error) {
        console.error("Error fetching referral data:", error);
        navigate("/authenticate");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchReferralData();
  }, [navigate, baseURL]);

  const handleShare = () => {
    const shareText = `${user.username} invites you to join and earn rewards! Use this referral link: `;
    const telegramShareLink = `https://t.me/share/url?url=${encodeURIComponent(
      shareLink
    )}&text=${encodeURIComponent(shareText)}`;

    window.open(telegramShareLink, "_blank");
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
        <title>Invite Friends and Earn Rewards</title>
        <meta
          name="description"
          content="Invite your friends to join The White Shark Bot and start earning rewards together!"
        />
        <meta
          property="og:title"
          content={`${user.username} invites you to join The White Shark Bot!`}
        />
        <meta
          property="og:description"
          content="Earn rewards when your friends join. Get 1000 points as a bonus, and help your inviter earn up to 50,000 points!"
        />
        <meta
          property="og:image"
          content="https://coffee-geographical-ape-289.mypinata.cloud/ipfs/QmcSxjgDfcU2qX9FAHJZvSkgenUWvPepAw9JiNk2nJmeM3"
        />
        <meta property="og:url" content={shareLink} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="The White Shark Bot" />
      </Helmet>
      <div className="content">
        <h3 style={{ color: "white" }}>
          Invite friends <i className="fa-solid fa-handshake"></i> and get
          rewards
        </h3>
        <p style={{ color: "white" }}>Earn 10% of Sharks from your friends!</p>
      </div>
      <div className="col">
        <div className="friends">
          <p>Friends invited</p>
          <i className="fa-solid fa-handshake"></i> X {totalReferrals}
        </div>
        <div className="friends1">
          <p>Sharks earned</p>
          <i className="fa-solid fa-sack-dollar"></i> X{" "}
          {formatNumber(user.referralAmount || 0)}
        </div>
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
