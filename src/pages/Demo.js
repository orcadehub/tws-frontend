import React, { useState, useEffect } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import "./Demo.css";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../config";

const Demo = () => {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false); // Fetch the raw address
  const [isConnected, setIsConnected] = useState(false);

  const baseURL =
    process.env.NODE_ENV === "development"
      ? config.LOCAL_BASE_URL.replace(/\/$/, "")
      : config.BASE_URL.replace(/\/$/, "");

  const CONFIG_OBJ = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("tokens")}`,
    },
  };

  useEffect(() => {
    // Async function to verify wallet connection status on load
    const verifyWalletConnection = async () => {
      if (!userFriendlyAddress) return; // Skip if no wallet connected
      try {
        const response = await axios.post(
          `${baseURL}/walCon`,
          {isWalletConnected:true,isTonTrans:false}, // Empty body if not required
          CONFIG_OBJ
        );
        const { message } = response.data;
        toast.success(message);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Unable to verify user details. Please try again.";
        toast.error("msg",errorMessage);
      }
    };

    verifyWalletConnection();
    setIsConnected(!!userFriendlyAddress);
  }, [userFriendlyAddress, baseURL]);

  const handleWalletClick = async () => {
    if (isConnected) {
      // Disconnect the wallet
      await tonConnectUI.disconnect();
      setIsConnected(false);
    } else {
      // Open the connection modal
      tonConnectUI.openModal();
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}....${address.slice(-4)}`;
  };

  return (
    <div>
      <button onClick={handleWalletClick} className="buttonc">
      <i class="fa-solid fa-wallet me-2"></i>
        {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      {isConnected && (
        <div style={{ marginTop: "20px"}}>
          <div>
            <strong>Connected:</strong> <span  style={{fontWeight:'bolder'}}>{formatAddress(userFriendlyAddress)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo;
