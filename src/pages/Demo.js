import React, { useState, useEffect, useCallback } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import axios from "axios"; // To make API calls
import config from "../config";

const Demo = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Track wallet connection status

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  };

  // Determine base URL based on environment (development or production)
  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  // Use useCallback to avoid re-creating the update function on each render
  const updateWalletAddress = useCallback(async (address) => {
    // Get the chatid from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const chatid = user ? user.chatid : null;

    if (!chatid) {
      console.error("Chat ID not found in localStorage");
      return;
    }

    try {
      const response = await axios.put(
        `${baseURL}/update-wallet`,
        {
          chatid,
          walletAddress: address, // Update the wallet address or set null
        },
        CONFIG_OBJ
      );

      if (response.status === 200) {
        console.log("Wallet address updated successfully");
      }
    } catch (error) {
      console.error("Error updating wallet address:", error);
    }
  }, []);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("ton-connect-storage_bridge-connection")
    );

    if (data && data.connectEvent) {
      const rawHexAddress = data.connectEvent.payload.items[0].address;

      try {
        setWalletAddress(rawHexAddress);
        setIsConnected(true); // Set connection state
        updateWalletAddress(rawHexAddress); // Call the API to update wallet address
      } catch (error) {
        console.error("Error parsing address:", error);
      }
    } else {
      // Wallet is disconnected, set null and call API
      setWalletAddress(null);
      setIsConnected(false);
      updateWalletAddress(null); // Update wallet address to null
    }
  }, [isConnected, updateWalletAddress]);

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <TonConnectButton />
    </div>
  );
};

export default Demo;
