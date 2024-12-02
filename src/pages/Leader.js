import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Import config for environment URLs
import "./Leader.css";

const Leader = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [userData, setUserData] = useState(null); // Store user's up-to-date data
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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

    const fetchLeaderboard = async () => {
      try {
        // Fetch leaderboard data from the API
        const leaderboardResponse = await axios.get(
          `${baseURL}/leaderboard`, // Use dynamic baseURL
          CONFIG_OBJ
        );

        setLeaderboard(leaderboardResponse.data.leaderboard);
        setUserRank(leaderboardResponse.data.userRank);
        setTotalUsers(leaderboardResponse.data.totalUsers);

        // Fetch up-to-date profile data
        const profileResponse = await axios.get(
          `${baseURL}/profile`, // Use dynamic baseURL
          CONFIG_OBJ
        );

        setUserData(profileResponse.data.user); // Update user data with the latest info
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        navigate("/authenticate");
      }
    };

    fetchLeaderboard();
  }, [navigate]); // Add baseURL to dependency array

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    // if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <div className="whole">
      <div className="lead">
        <h1 style={{color:'white'}}>Ranking</h1>
      </div>

      <div className="circle">
        <div className="items">
          <div className="profile">
            <span className="profileInitial">
              {userData?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="pin" id="user">
            <h5>{userData?.username || "UserLead"}</h5>
            <p>{formatNumber(userData?.walletAmount || "0")} SHARKS</p>
          </div>
        </div>
        <div className="end">
          <h5>#{userRank || "N/A"}</h5> {/* Display user rank */}
        </div>
      </div>

      <div className="hold">
        <h2>{formatNumber(totalUsers || "0")} holders</h2>{" "}
        {/* Display total users */}
      </div>

      {/* Display top 100 leaderboard */}
      {leaderboard.slice(0, 100).map((leader, index) => (
        <div className="board" key={index}>
          <div className="items">
            <div className="profile">
              <span className="profileInitial">
                {leader?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="user">
              <h6>{leader.username}</h6>
              <p>{formatNumber(leader.walletAmount)} SHARKS</p>
            </div>
          </div>
          <div className="end">
            <h5>#{index + 1}</h5>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leader;
