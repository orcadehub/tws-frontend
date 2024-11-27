import React, { useState, useEffect } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import './Demo.css'
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

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}....${address.slice(-4)}`;
  };

  return (
    <div>
      <button onClick={handleWalletClick} className="buttonc">
        {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      {isConnected && (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Connected:</strong> {formatAddress(userFriendlyAddress)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Demo;
