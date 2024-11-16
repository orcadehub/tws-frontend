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
      ? config.LOCAL_BASE_URL
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
  }, [user, navigate, baseURL]); // Add baseURL to dependency array

  return (
    <div className="whole">
      <div className="lead">
        <h1>Leader Board</h1>
      </div>

      <div className="circle">
        <div className="items">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="70"
            height="70"
            fill="currentColor"
            className="bi bi-circle-fill"
            viewBox="0 0 16 16"
          >
            <circle cx="8" cy="8" r="8" />
          </svg>
          <div className="pin" id="user">
            <h4>{userData?.username || "UserLead"}</h4>
            <p>{userData?.walletAmount || "0"} COINS</p>
          </div>
        </div>
        <div className="end">
          <h5>#{userRank || "N/A"}</h5> {/* Display user rank */}
        </div>
      </div>

      <div className="hold">
        <h2>{totalUsers || "0"} holders</h2> {/* Display total users */}
      </div>

      {/* Display top 100 leaderboard */}
      {leaderboard.slice(0, 100).map((leader, index) => (
        <div className="board" key={index}>
          <div className="items">
            <div className="align">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="currentColor"
                className="bi bi-circle-fill"
                viewBox="0 0 16 16"
              >
                <circle cx="8" cy="8" r="8" />
              </svg>
            </div>
            <div className="user">
              <h5>{leader.username}</h5>
              <p>{leader.walletAmount} COINS</p>
            </div>
          </div>
          <div className="end">
            <h4>#{index + 1}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leader;
