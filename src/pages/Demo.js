import React, { useState, useEffect } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

const Demo = () => {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false); // Fetch the raw address

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Update connection state based on the presence of a wallet address
    setIsConnected(!!userFriendlyAddress);
    console.log(rawAddress)
    console.log(userFriendlyAddress)
  }, [userFriendlyAddress]);

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

  const handleSubscribe = async () => {
    try {
      if (!rawAddress) {
        alert("Wallet not connected. Please connect the wallet first.");
        return;
      }

      const transaction = {
        validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        messages: [
          {
            address: "0:8d4592883c74e135c66145b030e93febc668a7334fb099fc68d59d9798f2d47f", 
            amount: "100000000",
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      alert("Transaction successful!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  // Format address to show first 4 and last 4 characters
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}....${address.slice(-4)}`;
  };

  return (
    <div>
      <button onClick={handleWalletClick}>
        {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      {isConnected && (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>User-Friendly Address:</strong> {formatAddress(userFriendlyAddress)}
          </p>
          <button style={{ marginTop: "10px" }} onClick={handleSubscribe}>
            Subscribe
          </button>
        </div>
      )}
    </div>
  );
};

export default Demo;
