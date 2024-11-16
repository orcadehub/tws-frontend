import React from 'react';
import { FaPaperPlane, FaWallet, FaHistory, FaStar } from 'react-icons/fa';
import './Airdrop.css';

const Airdrop = () => {
  const handleConnectWallet = () => {
    // Opens the TON Wallet bot within Telegram
    window.Telegram.WebApp.openTelegramLink("https://t.me/tonkeeper"); // Link to TON Wallet bot in Telegram
  };

  return (
    <div className="airdrop-container">
      <h2>Airdrop</h2>
      <button className="connect-wallet-btn" onClick={handleConnectWallet}>
        Connect Wallet
      </button>
      <div className="icon-container">
        <div className="icon-box">
          <FaPaperPlane className="icon" />
          <span>Send</span>
        </div>
        <div className="icon-box">
          <FaWallet className="icon" />
          <span>Receive</span>
        </div>
        <div className="icon-box">
          <FaHistory className="icon" />
          <span>History</span>
        </div>
        <div className="icon-box">
          <FaStar className="icon" />
          <span>Points</span>
        </div>
      </div>
    </div>
  );
};

export default Airdrop;
