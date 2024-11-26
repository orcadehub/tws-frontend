import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Import config for environment URLs
import "./Friends.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet";
import image from "../assets/slide1.jpg";

const Friends = () => {
  const [referrals, setReferrals] = useState([]);
  // const [referralAmount, setReferralAmount] = useState([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const referralId = user?.referralId;
  const shareLink = `https://t.me/thewhiteshark_bot?start=${referralId}`;

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
        console.log("Referral Data:", response.data);
        setReferrals(response.data.referrals);
        // setReferralAmount(response.data.referralAmount);
        setTotalReferrals(response.data.totalReferrals);
      } catch (error) {
        console.error("Error fetching referral data:", error);
        navigate("/authenticate");
      } finally {
        setLoading(false); // Ensure loading is set to false once the request finishes
      }
    };

    fetchReferralData();
  }, [navigate, baseURL]);

  // const coinsEarned = Math.min(totalReferrals * 150, 50000);

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
      alert("Sharing is not supported on this device.");
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

  // const formatNumber = (num) => {
  //   if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  //   if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  //   // if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  //   return num.toLocaleString();
  // };

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
          Invite friends <i class="fa-solid fa-handshake"></i> and get rewards
        </h3>
        <p>Earn up to 50,000 Sharks from your friends!</p>
      </div>
      <div className="col">
        <div className="friends">
          <p>Friends invited</p>
          <i class="fa-solid fa-handshake"></i> X {totalReferrals}
          {/* <h4>🤝 X {totalReferrals}</h4> */}
        </div>
        <div className="friends1">
          <p>Sharks earned</p>
          <i class="fa-solid fa-sack-dollar"></i> X {user.referralAmount}
          {/* <h4>💰 X {totalRef}</h4> */}
        </div>
      </div>

      <div className="col2">
        <ul>
          <li>
            You could earn <span className="span">10%</span> of all Sharks
            earned by players you have invited, capped at{" "}
            <span className="span">50,000</span> Sharks.
          </li>
          <li>
            Invited friends will receive a gift of{" "}
            <span className="span">1000</span> Sharks.
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
      <div className="name" style={{display:'flex',justifyContent:'space-between',marginRight:'1.5rem'}}>
  
          <span className="span2">
            No.
          </span>
          <span>Friend's name</span>
          <span className="span2">
            Sharks Earned
          </span>

      </div>

      <div className="ol">
        <ol>
          {loading ? (
            <p>Loading...</p>
          ) : (
            referrals.map((referral, index) => (
              <li key={index}>
              <div style={{display:'flex',justifyContent:'space-around  '}}>
                
                <span>{referral.username}</span>
                <span className="span3" >
                  {(referral.walletAmount * 0.1).toFixed(3)}
                </span>
                </div>
              </li>
            ))
          )}
        </ol>
      </div>

      <div className="display">
        <p>
          Displaying the most recent {Math.min(referrals.length, 300)} records
          only
        </p>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
      />
    </div>
  );
};

export default Friends;
