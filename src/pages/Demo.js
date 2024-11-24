import React, { useEffect, useState } from "react";
import { TonConnect, TonConnectButton } from "@tonconnect/ui-react";

// Initialize TonConnect with an optional manifest URL
const tonConnect = new TonConnect({ manifestUrl: "https://your-domain.com/tonconnect-manifest.json" });

const Demo = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // Log the initial wallet state for debugging
    console.log("Initial TonConnect Wallet Info:", tonConnect.wallet);

    // Check if the wallet is already connected on app load
    const walletInfo = tonConnect.wallet;
    if (walletInfo) {
      console.log("Wallet connected on load:", walletInfo);
      const address = walletInfo.account.address;
      setWalletAddress(address);
    } else {
      console.log("No wallet connected on load.");
    }

    // Define the handler for connection changes
    const handleConnectionChange = (walletInfo) => {
      if (walletInfo) {
        const address = walletInfo.account.address;
        console.log("Wallet connected:", walletInfo);
        setWalletAddress(address);
      } else {
        console.log("Wallet disconnected.");
        setWalletAddress(null);
      }
    };

    // Subscribe to connection state changes
    tonConnect.onStatusChange(handleConnectionChange);

    // Cleanup on component unmount
    return () => {
      tonConnect.offStatusChange(handleConnectionChange);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <TonConnectButton />
      {walletAddress ? (
        <div style={{ marginTop: "20px" }}>
          <h3>Connected Wallet Address:</h3>
          <p style={{ wordBreak: "break-word" }}>{walletAddress}</p>
        </div>
      ) : (
        <p style={{ marginTop: "20px", color: "red" }}>No wallet connected</p>
      )}
    </div>
  );
};

export default Demo;
